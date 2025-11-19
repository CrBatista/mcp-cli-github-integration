import axios, { AxiosInstance } from 'axios';

export interface IntegrationHubClientOptions {
  baseUrl: string;
  apiKey?: string;
}

export interface RepoSummary {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
}

export interface IssueSummary {
  id: number;
  number: number;
  title: string;
  html_url: string;
  state: string;
}

export interface ConnectionSummary {
  id: number;
  userId: string;
  provider: string;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export class IntegrationHubClient {
  private http: AxiosInstance;

  constructor(options: IntegrationHubClientOptions) {
    this.http = axios.create({
      baseURL: options.baseUrl,
      headers: options.apiKey ? { Authorization: `Bearer ${options.apiKey}` } : undefined
    });
  }

  async listConnections(userId?: string): Promise<ConnectionSummary[]> {
    try {
      const { data } = await this.http.get<{ connections: ConnectionSummary[] }>('/connections', {
        params: userId ? { userId } : undefined
      });
      return data.connections;
    } catch (error: any) {
      throw this.normalizeError('Failed to list connections', error);
    }
  }

  async startGithubAuth(userId: string): Promise<{ authUrl: string }> {
    if (!userId) {
      throw new Error('userId is required');
    }
    try {
      const { data } = await this.http.post<{ authUrl: string }>('/auth/github/start', { userId });
      return data;
    } catch (error: any) {
      throw this.normalizeError('Failed to start GitHub auth', error);
    }
  }

  async listGithubRepos(userId: string): Promise<RepoSummary[]> {
    if (!userId) {
      throw new Error('userId is required');
    }
    try {
      const { data } = await this.http.post<{ repos: RepoSummary[] }>('/actions/github/list-repos', { userId });
      return data.repos;
    } catch (error: any) {
      throw this.normalizeError('Failed to list GitHub repos', error);
    }
  }

  async createGithubIssue(params: {
    userId: string;
    owner: string;
    repo: string;
    title: string;
    body: string;
  }): Promise<IssueSummary> {
    if (!params.userId || !params.owner || !params.repo || !params.title) {
      throw new Error('userId, owner, repo, and title are required');
    }
    try {
      const { data } = await this.http.post<{ issue: IssueSummary }>(
        '/actions/github/create-issue',
        params
      );
      return data.issue;
    } catch (error: any) {
      throw this.normalizeError('Failed to create GitHub issue', error);
    }
  }

  private normalizeError(context: string, error: any): Error {
    if (error?.response?.data?.error) {
      return new Error(`${context}: ${error.response.data.error}`);
    }
    return new Error(`${context}: ${error?.message ?? 'Unknown error'}`);
  }
}
