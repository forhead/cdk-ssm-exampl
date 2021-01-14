import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as iam from '@aws-cdk/aws-iam';

export class SessionManagerEc2Stack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //create VPC 
    const sessionManagerVPC = new ec2.Vpc(this, 'serverlessWordpressVPC', {
      cidr: '10.0.0.0/16',
      subnetConfiguration: [
        {
          subnetType: ec2.SubnetType.PUBLIC,
          name: 'public',
          cidrMask: 24,
        },
        {
          cidrMask: 24,
          name: 'private',
          subnetType: ec2.SubnetType.PRIVATE,
        },
      ],
    });

    //create security group
    const sessionManagerEC2SG = new ec2.SecurityGroup(this, 'basicSecurity Group', {
      vpc: sessionManagerVPC,
      description: 'allow 22,80,443 inbound for ec2',
      allowAllOutbound: true,
    });
    sessionManagerEC2SG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'allow 22,80,443 inbound for ec2')
    sessionManagerEC2SG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'allow 22,80,443 inbound for ec2')
    sessionManagerEC2SG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(2443), 'allow 22,80,443 inbound for ec2')

    //create iam role for ssm access
    const policyDocument = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": [
                    "ssm:DescribeAssociation",
                    "ssm:GetDeployablePatchSnapshotForInstance",
                    "ssm:GetDocument",
                    "ssm:DescribeDocument",
                    "ssm:GetManifest",
                    "ssm:GetParameter",
                    "ssm:GetParameters",
                    "ssm:ListAssociations",
                    "ssm:ListInstanceAssociations",
                    "ssm:PutInventory",
                    "ssm:PutComplianceItems",
                    "ssm:PutConfigurePackageResult",
                    "ssm:UpdateAssociationStatus",
                    "ssm:UpdateInstanceAssociationStatus",
                    "ssm:UpdateInstanceInformation"
                ],
                "Resource": "*"
            },
            {
                "Effect": "Allow",
                "Action": [
                    "ssmmessages:CreateControlChannel",
                    "ssmmessages:CreateDataChannel",
                    "ssmmessages:OpenControlChannel",
                    "ssmmessages:OpenDataChannel"
                ],
                "Resource": "*"
            },
            {
                "Effect": "Allow",
                "Action": [
                    "ec2messages:AcknowledgeMessage",
                    "ec2messages:DeleteMessage",
                    "ec2messages:FailMessage",
                    "ec2messages:GetEndpoint",
                    "ec2messages:GetMessages",
                    "ec2messages:SendReply"
                ],
                "Resource": "*"
            }
        ]
    };
    
    const customPolicyDocument = iam.PolicyDocument.fromJson(policyDocument);
    const newManagedPolicy = new iam.ManagedPolicy(this, 'mySSMPolicy', {
      document: customPolicyDocument
    });

    const ec2SsmRole = new iam.Role(this, 'ec2SSMRole',{
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      inlinePolicies: {
        ["mySSMPolicy"]: customPolicyDocument
      }
    });

    // AMI ID
    const amznLinux = ec2.MachineImage.latestAmazonLinux({
      generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX,
      edition: ec2.AmazonLinuxEdition.STANDARD,
      virtualization: ec2.AmazonLinuxVirt.HVM,
      storage: ec2.AmazonLinuxStorage.GENERAL_PURPOSE,
    });
    const ec2EFS = new ec2.Instance(this,'efsInstance',{
      vpc: sessionManagerVPC,
      vpcSubnets: {subnetType:ec2.SubnetType.PRIVATE},
      machineImage : amznLinux,
      instanceType: new ec2.InstanceType('t2.micro'),
      securityGroup: sessionManagerEC2SG,
      role: ec2SsmRole
    });
  }
}
