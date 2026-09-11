export interface AppConfig {
  port: number;
  frontendUrl: string;
  freeCurrencyApiKey: string;
}

export interface RootConfig {
  app: AppConfig;
}

export default (): RootConfig => ({
  app: {
    port: Number(process.env.PORT) || 3000,
    frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    freeCurrencyApiKey: process.env.FREECURRENCY_API_KEY ?? '',
  },
});
