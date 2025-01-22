import serverlessExpress from '@codegenie/serverless-express';
import type { Handler } from 'aws-lambda';

import { initApp } from './app';

let serverlessApp: Handler;

export const handler: Handler = async (event, context) => {
  if (!serverlessApp) {
    const app = await initApp();
    serverlessApp = serverlessExpress({ app });
  }
  return serverlessApp(event, context, () => {});
};
