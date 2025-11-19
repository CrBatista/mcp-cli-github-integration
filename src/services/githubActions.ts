import { GitHubApi } from '../providers/github/api';
import { TokenManager } from './tokenManager';
import { GitHubIssue, GitHubRepo } from '../providers/github/types';

const PROVIDER = 'github';

export const GitHubActions = {
  async listRepositories(userId: string): Promise<GitHubRepo[]> {
    const connection = await TokenManager.ensureFreshToken(userId, PROVIDER);
    return GitHubApi.listRepositories(connection.access_token);
  },

  async createIssue(params: {
    userId: string;
    owner: string;
    repo: string;
    title: string;
    body: string;
  }): Promise<GitHubIssue> {
    const connection = await TokenManager.ensureFreshToken(params.userId, PROVIDER);
    return GitHubApi.createIssue(connection.access_token, {
      owner: params.owner,
      repo: params.repo,
      title: params.title,
      body: params.body
    });
  }
};
