Set me up with the ReadMe skills and MCP server in this agent, then help me create my ReadMe project.

The instructions below call me "the user". Skip any step that is already done. When a step can only be done by me (in an app's UI, or in my own terminal so that my API key stays out of the chat), tell me exactly what to do and wait for me to confirm.

## Cloud Agent

If you are running in a cloud or remote sandbox (e.g. Claude Code on the web, Codex cloud, Cursor background agents), do not install plugins or write MCP config inside the sandbox. It is temporary and is not the user's app config. Direct the user to configure the plugin/connector and API key through the app's own settings, then follow the UI steps in the matching client reference.

## Other agents connection (no plugin)

Applies to any agent without a ReadMe plugin, including local coding agents such as OpenCode, Gemini CLI, GitHub Copilot CLI, VS Code, and Windsurf. It also works for Claude Code, Codex, and Cursor if the user does not want a plugin.

This setup does not use a plugin. It uses two separate CLIs:

- [`npx skills`](https://github.com/vercel-labs/skills) installs the ReadMe skills.
- [`npx add-mcp`](https://github.com/neondatabase/add-mcp) registers the ReadMe MCP server.

Both need Node.js. Both detect installed agents and ask which ones to target; use `-a <agent>` to pick one directly.

### Install the ReadMe skills

```sh
npx skills add readmeio/agent-plugins
```

| Scope | Flag | When to use |
| --- | --- | --- |
| Project | (default) | Working in a BiDi synced repository. Skills go in the project and can be committed for other contributors |
| User | `-g` | Working through MCP. Skills are available in every project |

Run `npx skills update` later to pull new versions.

#### Confirmation

That you are able to read the ReadMe skills, e.g. `managing-readme-docs`.

### Add the ReadMe MCP server

```sh
npx add-mcp "https://docs.readme.com/mcp" --name readme
```

This takes the same `-g` and `-a <agent>` flags. Agents that support MCP OAuth prompt the user to sign in with their ReadMe account, either when the server connects or on the first `execute-request`.

#### Agents without OAuth support

An agent that cannot sign in with OAuth uses a project API key instead (see Project API keys in the main skill). The user should run this themselves in a terminal. `add-mcp` prompts for `README_API_KEY`, so the key never enters the chat or shell history:

```sh
npx add-mcp "https://docs.readme.com/mcp" --name readme --header 'Authorization: Bearer ${README_API_KEY}'
```

Keep the single quotes so the shell does not expand the variable. Re-running with the same name replaces the anonymous `readme` entry.

The key may be written into the agent's config file. With project scope, check that file is not committed; prefer `-g` when adding a key.

#### Confirmation

That you are able to successfully list tools from the ReadMe MCP server. The user may need to restart their agent before the configuration is recognized.

For an agent that neither CLI supports, consult the agent's own skills and MCP setup docs, using the same skills repository and MCP URL.

## After setup

Once the ReadMe skills are available and you can list tools from the ReadMe MCP server, use the `setup-project` skill to set me up with my new ReadMe account and project.

If the skills or MCP tools are not available yet because the client needs a restart or reload, tell me exactly what to restart. Once I have, I will resume this conversation or paste this prompt again - skip the steps that are already done.
