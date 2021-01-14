#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { SessionManagerEc2Stack } from '../lib/session_manager_ec2-stack';

const app = new cdk.App();
new SessionManagerEc2Stack(app, 'SessionManagerEc2Stack');
