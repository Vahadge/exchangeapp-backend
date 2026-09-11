import type { IncomingMessage, ServerResponse } from 'node:http';
import { createApp } from '../dist/create-app.js';

type ExpressHandler = (req: IncomingMessage, res: ServerResponse) => void;

let handlerPromise: Promise<ExpressHandler> | null = null;

async function getHandler(): Promise<ExpressHandler> {
  const app = await createApp();
  await app.init();
  return app.getHttpAdapter().getInstance();
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  handlerPromise ??= getHandler();
  const expressApp = await handlerPromise;
  expressApp(req, res);
}
