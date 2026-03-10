import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

interface GamerMatchStackProps extends cdk.StackProps {
  stage: string;
  domainName?: string;
}

export class GamerMatchStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: GamerMatchStackProps) {
    super(scope, id, props);

    const { stage } = props;

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

    // Build DATABASE_URL from RDS secret components
    // The ECS task will construct the URL from individual secret fields
    const dbSecret = dbInstance.secret!;

    // Fargate Service with ALB
    const fargateService = new ecs_patterns.ApplicationLoadBalancedFargateService(this, 'Service', {
      cluster,
      serviceName: `gamermatch-${stage}`,
      taskImageOptions: {
        // Use public image as placeholder until first CodeBuild push replaces with app image
        image: ecs.ContainerImage.fromRegistry('public.ecr.aws/nginx/nginx:latest'),
        containerPort: 80,
        environment: {
          NODE_ENV: 'production',
          APP_URL: `https://${props.domainName || 'localhost'}`,
          NEXTAUTH_URL: `https://${props.domainName || 'localhost'}`,
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
      path: '/',
      healthyHttpCodes: '200',
      interval: cdk.Duration.seconds(30),
    });

    // Auto-scaling
    const scaling = fargateService.service.autoScaleTaskCount({
      minCapacity: 1,
      maxCapacity: 4,
    });
    scaling.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 70,
    });

    // Allow ECS to connect to RDS
    dbInstance.connections.allowDefaultPortFrom(fargateService.service, 'ECS to RDS');

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
  }
}
