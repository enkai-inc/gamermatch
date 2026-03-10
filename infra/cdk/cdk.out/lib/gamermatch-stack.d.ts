import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
interface GamerMatchStackProps extends cdk.StackProps {
    stage: string;
    domainName?: string;
}
export declare class GamerMatchStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: GamerMatchStackProps);
}
export {};
