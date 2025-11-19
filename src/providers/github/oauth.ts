import axios from 'axios';
import { config } from '../../config/env';

export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
}

export const GitHubOAuth = {
  buildAuthorizationUrl(userId: string): string {
    const params = new URLSearchParams({
      client_id: config.github.clientId,
      redirect_uri: config.github.redirectUri,
      state: userId,
      scope: 'repo'
    });
    return `${config.github.authorizeUrl}?${params.toString()}`;
  },

  async exchangeCodeForToken(code: string): Promise<TokenResponse> {
    const response = await axios.post<TokenResponse>(
      config.github.tokenUrl,
      {
        client_id: config.github.clientId,
        client_secret: config.github.clientSecret,
        code,
        redirect_uri: config.github.redirectUri
      },
      {
        headers: {
          Accept: 'application/json'
        }
      }
    );
    return response.data;
  }
};
