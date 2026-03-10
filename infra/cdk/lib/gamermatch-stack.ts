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

    // RDS PostgreSQL
    const dbCluster = new rds.DatabaseCluster(this, 'Database', {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_15_4,
      }),
      serverlessV2MinCapacity: 0.5,
      serverlessV2MaxCapacity: 2,
      writer: rds.ClusterInstance.serverlessV2('writer'),
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      defaultDatabaseName: 'gamermatch',
      removalPolicy: cdk.RemovalPolicy.SNAPSHOT,
    });

    // ECS Cluster
    const cluster = new ecs.Cluster(this, 'Cluster', {
      vpc,
      clusterName: `gamermatch-${stage}`,
      containerInsights: true,
    });

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
        },
        secrets: {
          DATABASE_URL: ecs.Secret.fromSecretsManager(dbCluster.secret!, 'host'),
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
    dbCluster.connections.allowDefaultPortFrom(fargateService.service, 'ECS to RDS');

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
  }
}
