---
name: install-readme-mcp-and-skills
description: Install the ReadMe skills and MCP server in the current agent. Use only when the user does not have these configured already.
disable-model-invocation: true
---

# Install the ReadMe MCP server and skills

Set the user up with the ReadMe skills and MCP server in this agent.

Skip any step that is already done. When a step can only be done by the user (in an app's UI, or in their own terminal so that their API key stays out of the chat), tell them exactly what to do and wait for them to confirm.

Work out which client and surface you are running in, then follow only the matching section below. If it is unclear, ask the user.

| Environment | Section |
| --- | --- |
| Cursor IDE, Cursor web, or Cursor CLI | "Cursor connection" |
| Claude Code CLI or the desktop Code tab | "Claude Code connection" |
| Claude Desktop Chat, Claude Code cloud agents, or claude.ai | "Claude Chat connection" |
| ChatGPT web or desktop, Codex desktop app, Codex CLI, Codex cloud agents | "ChatGPT & Codex Connections" |
| Any other agent, including local coding agents, or a user who does not want a plugin | "Other agents connection (no plugin)" |

## Cursor connection

Applies to the Cursor IDE, Cursor web, and the Cursor CLI (`agent`). A plugin installed at user scope in any one is available in the others. Install the plugin once. Cursor web follows the same steps as the Cursor UI below.

The plugin includes the ReadMe MCP server, so installing the plugin is the whole setup.

### Install the ReadMe Plugin

#### Cursor UI

1. Open **Customize** in the sidebar.
2. Search for **ReadMe**.
3. Find the "Readme" plugin with author "ReadMe" and select **Add**.
4. When Cursor prompts, sign in with a ReadMe account.

In the IDE chat, running the command `/add-plugin readme` will also do the same.

#### Cursor CLI - `agent`

Cursor's `agent` cannot sign in to MCP servers with OAuth yet, so the plugin's MCP server does not authenticate there.

1. Install the plugin through the Cursor UI steps above. Its skills are then available in `agent` too.
2. Connect the MCP server with a project API key instead (see Project API keys in the main skill). The user should run this themselves in a terminal and pick Cursor when prompted. `add-mcp` prompts for `README_API_KEY`, so the key never enters the chat or shell history:

```sh
npx add-mcp "https://docs.readme.com/mcp" --name readme -g --header 'Authorization: Bearer ${README_API_KEY}'
```

Keep the single quotes so the shell does not expand the variable. `-g` writes to the user-level Cursor config, which keeps the key out of project files.

#### Confirmation

Confirm that the ReadMe plugin is installed, that its skills are available, and that you can list tools from its MCP server. The user may need to reload the window or start a new session before the install is recognized.

## Claude Code connection

Applies to the Claude Code CLI and the Code tab in the Claude Desktop App. For claude code cloud agents, the Chat interface in the Claude Desktop App or claude.ai refer to the "Claude Chat connection" section instead.

These commands can be run by Claude Code (in either the CLI or the desktop app), or the user can run them manually.

### Install the ReadMe Plugin

You must add the ReadMe plugin marketplace from the official agent-plugins repository, then install the plugin from that marketplace.

#### User scope (Recommended)

Available to the user in every project.

```sh
claude plugin marketplace add https://github.com/readmeio/agent-plugins.git
claude plugin install readme@readme --scope user
```

#### Project scope

Recommended if the user is working in a BiDi synced repository. The plugin is enabled in the project's `.claude/settings.json`, which is committed so that other contributors are prompted to install it.

```sh
claude plugin marketplace add https://github.com/readmeio/agent-plugins.git --scope project
claude plugin install readme@readme --scope project
```

Nothing secret is committed. Each contributor signs in with their own ReadMe account.

#### NOTE - restarting sessions

The user may have to restart their environment for the MCP server to reload. In that case ALWAYS recommend they quit and come back to this same session to continue - don't recommend that they start a new conversation.

#### Confirmation

That you are able to successfully read skills from the installed ReadMe plugin.

## Claude Chat connection

Applies to the Chat interface in the Claude Desktop App, Claude web app (claude.ai) AND claude code cloud agents (must be installed in the UI). For Claude Code (CLI or the desktop Code tab) refer to the "Claude Code connection" section instead.

### Install the ReadMe Plugin

The user can install the ReadMe plugin via UI by following these steps:

1. Navigate to Plugins from Customize -> Plugins and select the "Add" button, select "Add Marketplace"
2. From the pop-up menu, select "Add from a Repository" and paste in the official Readme agent plugins repository: https://github.com/readmeio/agent-plugins
3. Disable "Sync Automatically" and click "Sync"
4. Navigate back to Plugins and search for "ReadMe" and click on the "ReadMe" result with "yours" label on it. Once inside, click the "Add" button.
5. In the plugin, you must click on the "Connectors" tab, and select "Connect" on the connector that comes along with the plugin. Leave the settings as defaults when options are given to you, and sign in with a ReadMe account.

At this point the mcp connection is ready, and the skills will be in the environment.

#### Confirmation

Confirm that the ReadMe plugin is installed and that its skills are available.

## ChatGPT & Codex Connections

Applies to ChatGPT web and desktop, Codex in the ChatGPT desktop application, and the Codex CLI. The Codex CLI and the ChatGPT desktop app share the same `~/.codex/config.toml`, so configuring one configures both.

### Running the `codex` commands

#### Recommended: Use Codex and have agent setup.

This approach does not require user involvement aside from approving changes to the local `~/.codex/config.toml` file. Ensure that the user would prefer you to setup for them, and let them know that they can instead run the commands below in their terminal themselves if they would prefer.

The ChatGPT desktop app bundles its own `codex` binary, so the user does not need the Codex CLI installed. If `codex` is not on the PATH, or `codex plugin` is not recognized (an outdated Codex CLI), use the bundled binary instead:

```sh
/Applications/ChatGPT.app/Contents/Resources/codex-cli/bin/codex
```

### Install the ReadMe Plugin

The plugin includes the ReadMe MCP server, so installing the plugin is the whole setup.

#### ChatGPT Web

On ChatGPT web you currently cannot install the ReadMe Plugin.

#### Codex CLI & ChatGPT Desktop App

You must add the ReadMe plugin marketplace from the official agent-plugins repository, then install the plugin from that marketplace.

```sh
codex plugin marketplace add https://github.com/readmeio/agent-plugins.git
codex plugin add readme@readme
```

If the `codex` commands cannot be run, add the following to `~/.codex/config.toml` instead:

```toml
[marketplaces.readme]
source_type = "git"
source = "https://github.com/readmeio/agent-plugins.git"

[plugins."readme@readme"]
enabled = true
```

#### Confirmation

Verify that you can now see the ReadMe plugin, its skills, and the ReadMe MCP server's tools. The user may have to restart their application for this installation to be recognized.

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

Confirm with the user that the ReadMe skills are available and that you can list tools from the ReadMe MCP server.

If the skills or MCP tools are not available yet because the client needs a restart or reload, tell the user exactly what to restart. Once they have, skip the steps that are already done.

If the user is creating a new ReadMe account and project, use the `setup-project` skill next.
