#!/usr/bin/env node
import 'source-map-support/register';
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
});
