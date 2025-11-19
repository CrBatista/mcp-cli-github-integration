#!/usr/bin/env node
import { Command } from 'commander';
import dotenv from 'dotenv';
import { IntegrationHubClient } from '../sdk';

dotenv.config();

const program = new Command();
program.name('github-integration-hub').description('GitHub Integration Hub CLI by Cristian');

const getBaseUrl = (override?: string): string => {
  const baseUrl = override ?? process.env.GITHUB_INTEGRATION_HUB_BASE_URL;
  if (!baseUrl) {
    throw new Error('Set GITHUB_INTEGRATION_HUB_BASE_URL or pass --base-url');
  }
  return baseUrl;
};

const getClient = (baseUrl?: string) => new IntegrationHubClient({ baseUrl: getBaseUrl(baseUrl) });

program
  .command('connections:list')
  .description('List stored connections')
  .option('--user <userId>', 'Filter by user ID')
  .option('--base-url <url>', 'Override backend base URL')
  .action(async (options) => {
    try {
      const client = getClient(options.baseUrl);
      const connections = await client.listConnections(options.user);
      console.table(connections);
    } catch (error: any) {
      console.error('Failed to list connections:', error?.message ?? error);
      process.exitCode = 1;
    }
  });

program
  .command('actions:list-repos')
  .requiredOption('--user <userId>', 'User ID that authorized GitHub')
  .option('--base-url <url>', 'Override backend base URL')
  .description('List GitHub repositories for a user via the backend')
  .action(async (options) => {
    try {
      const client = getClient(options.baseUrl);
      const repos = await client.listGithubRepos(options.user);
      repos.forEach((repo) => {
        console.log(`- ${repo.full_name} (${repo.html_url})`);
      });
    } catch (error: any) {
      console.error(error.message ?? error);
      process.exitCode = 1;
    }
  });

program
  .command('actions:create-issue')
  .requiredOption('--user <userId>', 'User ID')
  .requiredOption('--owner <owner>', 'Repository owner')
  .requiredOption('--repo <repo>', 'Repository name')
  .requiredOption('--title <title>', 'Issue title')
  .option('--body <body>', 'Issue body', '')
  .option('--base-url <url>', 'Override backend base URL')
  .description('Create a GitHub issue via the backend')
  .action(async (options) => {
    try {
      const client = getClient(options.baseUrl);
      const issue = await client.createGithubIssue({
        userId: options.user,
        owner: options.owner,
        repo: options.repo,
        title: options.title,
        body: options.body ?? ''
      });
      console.log(`Created issue #${issue.number}: ${issue.html_url}`);
    } catch (error: any) {
      console.error(error.message ?? error);
      process.exitCode = 1;
    }
  });

program.parseAsync(process.argv);
