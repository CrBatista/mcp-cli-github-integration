import dotenv from 'dotenv';

dotenv.config();

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable ${key}`);
  }
  return value;
};

export const config = {
  port: Number(process.env.PORT ?? 3000),
  databaseFile: process.env.DATABASE_FILE ?? './github-integration-hub.db',
  github: {
    clientId: requireEnv('GITHUB_CLIENT_ID'),
    clientSecret: requireEnv('GITHUB_CLIENT_SECRET'),
    authorizeUrl: requireEnv('GITHUB_OAUTH_AUTHORIZE_URL'),
    tokenUrl: requireEnv('GITHUB_OAUTH_TOKEN_URL'),
    apiBaseUrl: requireEnv('GITHUB_API_BASE_URL'),
    redirectUri: requireEnv('GITHUB_REDIRECT_URI')
  }
};
