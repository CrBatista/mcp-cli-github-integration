import path from 'path';
import { z } from 'zod';
import { initDb } from '../db';
import { GitHubOAuth } from '../providers/github/oauth';
import { GitHubActions } from '../services/githubActions';
import { MissingConnectionError } from '../services/tokenManager';

const resolvedSdkPath = path.dirname(require.resolve('@modelcontextprotocol/sdk/package.json'));
const sdkRootPath = resolvedSdkPath.endsWith(path.join('dist', 'cjs'))
  ? path.resolve(resolvedSdkPath, '..', '..')
  : resolvedSdkPath;
const sdkCjsPath = path.join(sdkRootPath, 'dist', 'cjs');

const { McpServer } = require(path.join(sdkCjsPath, 'server', 'mcp.js')) as {
  McpServer: typeof import('@modelcontextprotocol/sdk/server/mcp').McpServer;
};
const { StdioServerTransport } = require(path.join(sdkCjsPath, 'server', 'stdio.js')) as {
  StdioServerTransport: typeof import('@modelcontextprotocol/sdk/server/stdio').StdioServerTransport;
};

initDb();

const server = new McpServer(
  {
    name: 'github-integration-hub',
    version: '0.1.0'
  },
  {
    capabilities: {
      tools: {}
    },
    instructions:
      'Use these tools to initiate GitHub OAuth and to run repo/issue actions against existing connections.'
  }
);

const textResult = (payload: unknown) => ({
  content: [
    {
      type: 'text' as const,
      text: typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2)
    }
  ]
});

const errorResult = (message: string) => ({
  ...textResult(message),
  isError: true
});

const startAuthArgs = {
  userId: z.string().min(1, 'userId is required')
};

const createIssueArgs = {
  userId: z.string().min(1, 'userId is required'),
  owner: z.string().min(1, 'owner is required'),
  repo: z.string().min(1, 'repo is required'),
  title: z.string().min(1, 'title is required'),
  body: z.string().optional()
};

server.registerTool(
  'github_start_auth',
  {
    description: 'Start GitHub OAuth flow and return the authorization URL.',
    inputSchema: startAuthArgs
  },
  async (args) => {
    const { userId } = args;
    const authUrl = GitHubOAuth.buildAuthorizationUrl(userId);
    return textResult({ authUrl });
  }
);

server.registerTool(
  'github_list_repos',
  {
    description: 'List GitHub repositories for a user with an existing GitHub connection.',
    inputSchema: startAuthArgs
  },
  async (args) => {
    try {
      const repos = await GitHubActions.listRepositories(args.userId);
      const simplified = repos.map((repo) => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        private: repo.private,
        htmlUrl: repo.html_url
      }));
      return textResult({ repos: simplified });
    } catch (error: any) {
      if (error instanceof MissingConnectionError) {
        return errorResult(error.message);
      }
      return errorResult(error?.message ?? 'Failed to list repositories');
    }
  }
);

server.registerTool(
  'github_create_issue',
  {
    description: 'Create a GitHub issue using a stored connection.',
    inputSchema: createIssueArgs
  },
  async (args) => {
    try {
      const issue = await GitHubActions.createIssue({
        userId: args.userId,
        owner: args.owner,
        repo: args.repo,
        title: args.title,
        body: args.body ?? ''
      });

      const simplified = {
        id: issue.id,
        number: issue.number,
        title: issue.title,
        htmlUrl: issue.html_url
      };

      return textResult({ issue: simplified });
    } catch (error: any) {
      if (error instanceof MissingConnectionError) {
        return errorResult(error.message);
      }
      return errorResult(error?.message ?? 'Failed to create issue');
    }
  }
);

const transport = new StdioServerTransport();

server.connect(transport).catch((error) => {
  console.error('Failed to start MCP server', error);
  process.exit(1);
});
