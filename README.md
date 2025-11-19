# GitHub Integration Hub

> Built by Cristian to demonstrate OAuth orchestration, secure token storage, SDK/CLI tooling, and MCP servers in TypeScript.

## Why this project exists
I wanted a hands-on showcase proving I can:
- Design an OAuth flow (GitHub) with state handling and token persistence.
- Build a lightweight data layer on SQLite using TypeScript.
- Expose the same business logic via HTTP routes, an SDK, a CLI, and an MCP server for AI agents.

Everything runs on Node.js LTS with Express, better-sqlite3, and TypeScript.

## Feature highlights
- (OAuth) `/auth/github/start` and `/auth/github/callback` wrap the GitHub dance.
- (Storage) Automatic SQLite table creation plus refresh scaffolding and repository helpers.
- (Services) Shared orchestration reused by HTTP routes, the CLI, the SDK, and MCP tools.
- (Tooling) Type-safe `IntegrationHubClient` SDK together with the `github-integration-hub` CLI.
- (Agents) MCP tools `github_start_auth`, `github_list_repos`, and `github_create_issue`.

## Getting started
### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Copy `.env.example` to `.env` and set your GitHub OAuth credentials:
```
PORT=3000
DATABASE_FILE=./github-integration-hub.db
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret
GITHUB_OAUTH_AUTHORIZE_URL=https://github.com/login/oauth/authorize
GITHUB_OAUTH_TOKEN_URL=https://github.com/login/oauth/access_token
GITHUB_API_BASE_URL=https://api.github.com
GITHUB_REDIRECT_URI=http://localhost:3000/auth/github/callback
GITHUB_INTEGRATION_HUB_BASE_URL=http://localhost:3000
```
> Ensure the GitHub OAuth app redirect matches `GITHUB_REDIRECT_URI`.

### 3. Run the backend
Development mode with hot reload:
```bash
npm run dev
```

Production-style build + run:
```bash
npm run build
npm start
```
The server logs: `GitHub Integration Hub listening on port <port>`.

## MCP server (for AI agents)
Compile once, then launch the stdio server:
```bash
npm run build
npm run start:mcp
```
Tools available:
- `github_start_auth` – returns an authorization URL for a `userId`.
- `github_list_repos` – lists repos for the stored connection.
- `github_create_issue` – posts an issue using the saved token.

Point your MCP-aware IDE/CLI (for example Codex) to this stdio process and the tools become callable immediately.

## HTTP API reference
| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/github/start` | Returns `{ authUrl }` for `userId` |
| GET | `/auth/github/callback` | Exchanges `code` + `state`, saves tokens |
| GET | `/connections` | Lists connections (`?userId=` optional) |
| POST | `/actions/github/list-repos` | Lists repos via stored token |
| POST | `/actions/github/create-issue` | Creates an issue |
| GET | `/health` | Service heartbeat |

## CLI (`github-integration-hub`)
```bash
npm run build
npx github-integration-hub connections:list
npx github-integration-hub actions:list-repos --user alice
npx github-integration-hub actions:create-issue --user alice --owner my-org --repo api --title "Hello" --body "Proof from Cristian"
```
Flags:
- `--base-url` overrides `GITHUB_INTEGRATION_HUB_BASE_URL`.
- `connections:list --user <userId>` filters entries.

## SDK example
```ts
import { IntegrationHubClient } from 'github-integration-hub/sdk';

const client = new IntegrationHubClient({ baseUrl: process.env.GITHUB_INTEGRATION_HUB_BASE_URL! });

async function showcase() {
  const { authUrl } = await client.startGithubAuth('user-123');
  console.log('Send someone to authorize:', authUrl);

  const repos = await client.listGithubRepos('user-123');
  console.log(repos.map((repo) => repo.full_name));
}
```

## Manual OAuth test plan
1. `POST /auth/github/start` with `{ "userId": "demo-user" }`.
2. Visit the returned `authUrl`, approve the GitHub app.
3. Callback stores the connection automatically.
4. Trigger actions using HTTP, the CLI, SDK, or MCP tools.

## Project structure
```
.
|-- cli/               # CLI entry point
|-- sdk/               # TypeScript SDK
|-- src/
|   |-- config/        # Environment helpers
|   |-- db/            # SQLite init + repository
|   |-- mcp/           # MCP server
|   |-- providers/     # GitHub OAuth + API clients
|   |-- routes/        # Express routers
|   `-- services/      # Token manager + actions
|-- .env.example
|-- package.json
|-- tsconfig.json
`-- README.md
```

---

**Made by Cristian.** Ping me if you want to talk about backend integrations, OAuth design, or MCP tooling.
