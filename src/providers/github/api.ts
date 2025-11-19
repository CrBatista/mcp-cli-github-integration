import axios from 'axios';
import { config } from '../../config/env';
import { GitHubIssue, GitHubRepo } from './types';

const authHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github+json',
  'User-Agent': 'github-integration-hub'
});

export const GitHubApi = {
  async listRepositories(accessToken: string): Promise<GitHubRepo[]> {
    const response = await axios.get<GitHubRepo[]>(`${config.github.apiBaseUrl}/user/repos`, {
      headers: authHeaders(accessToken)
    });
    return response.data.map((repo) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      private: repo.private,
      html_url: repo.html_url
    }));
  },

  async createIssue(
    accessToken: string,
    params: { owner: string; repo: string; title: string; body: string }
  ): Promise<GitHubIssue> {
    const response = await axios.post<GitHubIssue>(
      `${config.github.apiBaseUrl}/repos/${params.owner}/${params.repo}/issues`,
      { title: params.title, body: params.body },
      { headers: authHeaders(accessToken) }
    );
    return {
      id: response.data.id,
      number: response.data.number,
      title: response.data.title,
      html_url: response.data.html_url,
      state: response.data.state
    };
  }
};
