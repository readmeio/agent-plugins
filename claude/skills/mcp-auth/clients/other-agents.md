# Other agents connection (no plugin)

Applies to any agent without a ReadMe plugin, including local coding agents such as OpenCode, Gemini CLI, GitHub Copilot CLI, VS Code, and Windsurf. It also works for Claude Code, Codex, and Cursor if the user does not want a plugin.

This setup does not use a plugin. It uses two separate CLIs:

- [`npx skills`](https://github.com/vercel-labs/skills) installs the ReadMe skills.
- [`npx add-mcp`](https://github.com/neondatabase/add-mcp) registers the ReadMe MCP server.

Both need Node.js. Both detect installed agents and ask which ones to target; use `-a <agent>` to pick one directly.

## Install the ReadMe skills

```sh
npx skills add readmeio/agent-plugins
```

| Scope | Flag | When to use |
| --- | --- | --- |
| Project | (default) | Working in a BiDi synced repository. Skills go in the project and can be committed for other contributors |
| User | `-g` | Working through MCP. Skills are available in every project |

Run `npx skills update` later to pull new versions.

### Confirmation

That you are able to read the ReadMe skills, e.g. `managing-readme-docs`.

## Add the ReadMe MCP server

```sh
npx add-mcp "https://docs.readme.com/mcp" --name readme
```

This takes the same `-g` and `-a <agent>` flags. Agents that support MCP OAuth prompt the user to sign in with their ReadMe account, either when the server connects or on the first `execute-request`.

### Agents without OAuth support

An agent that cannot sign in with OAuth uses a project API key instead (see Project API keys in the main skill). After adding the server above, the user adds an `Authorization: Bearer <api-key>` header to the `readme` entry in the agent's own MCP settings or config file. The user enters the key there themselves, so it stays out of the chat and shell history.

With project scope, the config file lives in the project. Check that it is not committed; prefer `-g` when adding a key.

### Confirmation

That you are able to successfully list tools from the ReadMe MCP server. The user may need to restart their agent before the configuration is recognized.

For an agent that neither CLI supports, consult the agent's own skills and MCP setup docs, using the same skills repository and MCP URL.
