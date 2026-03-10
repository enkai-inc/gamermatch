import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import { Construct } from 'constructs';

interface GamerMatchStackProps extends cdk.StackProps {
  stage: string;
  domainName?: string;
  githubConnectionArn?: string;
  githubOwner?: string;
  githubRepo?: string;
}

export class GamerMatchStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: GamerMatchStackProps) {
    super(scope, id, props);

    const { stage } = props;
    const githubOwner = props.githubOwner || 'enkai-inc';
    const githubRepo = props.githubRepo || 'gamermatch';

    // VPC
    const vpc = new ec2.Vpc(this, 'Vpc', {
      maxAzs: 2,
      natGateways: 1,
    });

    // ECR Repository
    const repository = new ecr.Repository(this, 'Repo', {
      repositoryName: `gamermatch-${stage}`,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      lifecycleRules: [{ maxImageCount: 10 }],
    });

    // App Secrets
    const appSecrets = new secretsmanager.Secret(this, 'AppSecrets', {
      secretName: `gamermatch/${stage}/app`,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          AUTH_SECRET: '',
          IGDB_CLIENT_ID: '',
          IGDB_CLIENT_SECRET: '',
          STEAM_API_KEY: '',
        }),
        generateStringKey: 'AUTH_SECRET',
      },
    });

    // RDS PostgreSQL (single instance for dev, cost-effective)
    const dbInstance = new rds.DatabaseInstance(this, 'Database', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_16,
      }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T4G, ec2.InstanceSize.MICRO),
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      databaseName: 'gamermatch',
      allocatedStorage: 20,
      maxAllocatedStorage: 50,
      removalPolicy: cdk.RemovalPolicy.SNAPSHOT,
      credentials: rds.Credentials.fromGeneratedSecret('gamermatch', {
        secretName: `gamermatch/${stage}/db`,
      }),
    });

    // ECS Cluster
    const cluster = new ecs.Cluster(this, 'Cluster', {
      vpc,
      clusterName: `gamermatch-${stage}`,
    });

    const dbSecret = dbInstance.secret!;

    // Fargate Service with ALB
    const fargateService = new ecs_patterns.ApplicationLoadBalancedFargateService(this, 'Service', {
      cluster,
      serviceName: `gamermatch-${stage}`,
      taskImageOptions: {
        image: ecs.ContainerImage.fromEcrRepository(repository, 'latest'),
        containerPort: 3000,
        environment: {
          NODE_ENV: 'production',
          APP_URL: `https://${props.domainName || 'localhost'}`,
          NEXTAUTH_URL: `https://${props.domainName || 'localhost'}`,
          AUTH_TRUST_HOST: 'true',
          DB_NAME: 'gamermatch',
        },
        secrets: {
          DB_HOST: ecs.Secret.fromSecretsManager(dbSecret, 'host'),
          DB_PORT: ecs.Secret.fromSecretsManager(dbSecret, 'port'),
          DB_USERNAME: ecs.Secret.fromSecretsManager(dbSecret, 'username'),
          DB_PASSWORD: ecs.Secret.fromSecretsManager(dbSecret, 'password'),
          AUTH_SECRET: ecs.Secret.fromSecretsManager(appSecrets, 'AUTH_SECRET'),
          IGDB_CLIENT_ID: ecs.Secret.fromSecretsManager(appSecrets, 'IGDB_CLIENT_ID'),
          IGDB_CLIENT_SECRET: ecs.Secret.fromSecretsManager(appSecrets, 'IGDB_CLIENT_SECRET'),
        },
        logDriver: ecs.LogDrivers.awsLogs({
          streamPrefix: 'gamermatch',
          logGroup: new logs.LogGroup(this, 'LogGroup', {
            logGroupName: `/ecs/gamermatch-${stage}`,
            retention: logs.RetentionDays.TWO_WEEKS,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
          }),
        }),
      },
      cpu: 512,
      memoryLimitMiB: 1024,
      desiredCount: 1,
      publicLoadBalancer: true,
      assignPublicIp: false,
    });

    // Health check
    fargateService.targetGroup.configureHealthCheck({
      path: '/api/health',
      healthyHttpCodes: '200',
      interval: cdk.Duration.seconds(30),
      healthyThresholdCount: 2,
      unhealthyThresholdCount: 5,
      timeout: cdk.Duration.seconds(10),
    });

    // Auto-scaling
    const scaling = fargateService.service.autoScaleTaskCount({
      minCapacity: 1,
      maxCapacity: 4,
    });
    scaling.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 70,
    });

    // Grant ECS task execution role permission to pull from ECR
    // (needed because placeholder image is public nginx, but pipeline swaps to private ECR)
    repository.grantPull(fargateService.taskDefinition.executionRole!);

    // Allow ECS to connect to RDS
    dbInstance.connections.allowDefaultPortFrom(fargateService.service, 'ECS to RDS');

    // ========================================
    // CodePipeline — auto-deploy on push to main
    // ========================================

    // CodeBuild project — builds Docker image and pushes to ECR
    const buildProject = new codebuild.PipelineProject(this, 'BuildProject', {
      projectName: `gamermatch-${stage}-build`,
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
        privileged: true, // Required for Docker builds
        computeType: codebuild.ComputeType.SMALL,
      },
      environmentVariables: {
        AWS_ACCOUNT_ID: { value: this.account },
        AWS_DEFAULT_REGION: { value: this.region },
        ECR_REPO_NAME: { value: `gamermatch-${stage}` },
        ECR_REPO_URI: { value: repository.repositoryUri },
        CONTAINER_NAME: { value: 'web' }, // Must match ECS container name from ALB pattern
      },
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          pre_build: {
            commands: [
              'echo Logging into ECR...',
              'aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com',
              'COMMIT_HASH=$(echo $CODEBUILD_RESOLVED_SOURCE_VERSION | cut -c 1-7)',
              'IMAGE_TAG=${COMMIT_HASH:-latest}',
            ],
          },
          build: {
            commands: [
              'echo Building Docker image...',
              'docker build -t $ECR_REPO_URI:$IMAGE_TAG .',
              'docker tag $ECR_REPO_URI:$IMAGE_TAG $ECR_REPO_URI:latest',
            ],
          },
          post_build: {
            commands: [
              'echo Pushing Docker image...',
              'docker push $ECR_REPO_URI:$IMAGE_TAG',
              'docker push $ECR_REPO_URI:latest',
              'echo Writing image definitions for ECS deploy...',
              'printf \'[{"name":"%s","imageUri":"%s"}]\' $CONTAINER_NAME $ECR_REPO_URI:$IMAGE_TAG > imagedefinitions.json',
              'cat imagedefinitions.json',
            ],
          },
        },
        artifacts: {
          files: ['imagedefinitions.json'],
        },
      }),
      timeout: cdk.Duration.minutes(30),
    });

    // Grant CodeBuild permissions to push to ECR
    repository.grantPullPush(buildProject);

    // Pipeline artifacts
    const sourceOutput = new codepipeline.Artifact('SourceOutput');
    const buildOutput = new codepipeline.Artifact('BuildOutput');

    // CodePipeline
    const pipeline = new codepipeline.Pipeline(this, 'Pipeline', {
      pipelineName: `gamermatch-${stage}`,
      restartExecutionOnUpdate: true,
    });

    // Source stage — GitHub via CodeStar Connection
    const connectionArn = props.githubConnectionArn
      || 'arn:aws:codeconnections:us-east-1:882384879235:connection/97a5d8e8-b3b6-4e5f-ba32-ab31909a10c9';

    pipeline.addStage({
      stageName: 'Source',
      actions: [
        new codepipeline_actions.CodeStarConnectionsSourceAction({
          actionName: 'GitHub',
          owner: githubOwner,
          repo: githubRepo,
          branch: 'main',
          connectionArn,
          output: sourceOutput,
          triggerOnPush: true,
        }),
      ],
    });

    // Build stage — Docker build + ECR push
    pipeline.addStage({
      stageName: 'Build',
      actions: [
        new codepipeline_actions.CodeBuildAction({
          actionName: 'DockerBuild',
          project: buildProject,
          input: sourceOutput,
          outputs: [buildOutput],
        }),
      ],
    });

    // Deploy stage — ECS rolling update
    pipeline.addStage({
      stageName: 'Deploy',
      actions: [
        new codepipeline_actions.EcsDeployAction({
          actionName: 'DeployToECS',
          service: fargateService.service,
          input: buildOutput,
        }),
      ],
    });

    // Outputs
    new cdk.CfnOutput(this, 'ServiceUrl', {
      value: `http://${fargateService.loadBalancer.loadBalancerDnsName}`,
    });
    new cdk.CfnOutput(this, 'EcrRepository', {
      value: repository.repositoryUri,
    });
    new cdk.CfnOutput(this, 'ClusterName', {
      value: cluster.clusterName,
    });
    new cdk.CfnOutput(this, 'DatabaseEndpoint', {
      value: dbInstance.instanceEndpoint.hostname,
    });
    new cdk.CfnOutput(this, 'PipelineName', {
      value: pipeline.pipelineName,
    });
  }
}
