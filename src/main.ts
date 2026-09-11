import { ConfigService } from '@nestjs/config';
import { createApp } from './create-app.js';
import type { RootConfig } from './config/configuration.js';

async function bootstrap() {
  const app = await createApp();
  const configService = app.get(ConfigService<RootConfig, true>);

  await app.listen(configService.get('app.port', { infer: true }));
}
await bootstrap();
