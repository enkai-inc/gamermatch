#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { GamerMatchStack } from '../lib/gamermatch-stack';

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
};

new GamerMatchStack(app, 'GamerMatchStack-dev', {
  env,
  stage: 'dev',
  domainName: 'gamermatch.digitaldevops.io',
  certificateArn: 'arn:aws:acm:us-east-1:882384879235:certificate/411f9b4a-bc8f-4342-b7e6-52f39251fa3a',
  hostedZoneId: 'Z3OKT7D3Q3TASV',
  hostedZoneName: 'digitaldevops.io',
});
