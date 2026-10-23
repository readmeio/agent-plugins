Set me up with the ReadMe skills and MCP server in this agent, then help me create my ReadMe project.

The instructions below call me "the user". Skip any step that is already done. When a step can only be done by me (in an app's UI, or in my own terminal so that my API key stays out of the chat), tell me exactly what to do and wait for me to confirm.

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

### Install the ReadMe Plugin

*Note: Only do this if the user does not already have the ReadMe plugin available.*

#### Cursor UI

1. Open **Customize** in the sidebar.
2. Search for **ReadMe**.
3. Find the "Readme" plugin with author "ReadMe" and select **Add**.
4. If the user is working on an existing project (they may be setting up a new project for the first time) set the **ReadMe API key** when prompted - this can be left blank for the moment. The user can acess this key via **Settings → API Keys** in their ReadMe project. 
  1. It can be set later by navigating to the ReadMe plugin in the UI and selecting **Configure**.

*NOTE: For first-time setup on ReadMe, the user may be creating a new project. If they are, they will not yet have their API key. In that case leave the api key as a placeholder and when the user creates their project the user/you can modify the configuration with the actual API key.*

In the IDE chat, running the command `/add-plugin readme` will also do the same.

#### Cursor CLI - `agent` (Not recommended)

The ReadMe plugin can be installed from a running `agent` session - this must be performed by an agent.

1. Start `agent`
2. Run the `/plugin` slash command
3. Cycle to the "Marketplace" for the installed plugins
4. Search for "readme"
5. Select "ReadMe" from the Cursor Plugin Marketplace
  1. Here you can select to install for yourself (user scope) or for the project you are in (project scope). If you are working in a BiDi synced repository, it is recommended to use project scope, but for MCP it is best to use the user scope.
6. You must configure your API key via the Cursor Application - the agent does not expose any way to add environment keys to config. This is why this configuration method is not recommended.

#### Confirmation

Confirm that the ReadMe plugin is installed, that its skills are available, and that you can list tools from its MCP server. The user may need to reload the window or start a new session before the install is recognized.

## Claude Code connection

Applies to the Claude Code CLI and the Code tab in the Claude Desktop App. For the Chat interface in the Claude Desktop App or claude.ai refer to the "Claude Chat connection" section instead.

These commands can be run by Claude Code (in either the CLI or the desktop app), or the user can run them manually.

*Note: If the user only uses Claude Code via the desktop app, they can instead install the plugin via the app UI by following the "Claude Chat connection" section. This is NOT recommended - the API key cannot be edited after it is configured, and the plugin will not be available in the Claude Code CLI. Do not install via both methods, as this will result in duplicate ReadMe MCP servers.*

*Note 2: Claude code cloud agents should refer to the the "Claude Chat connection" section file - they must install via apps rather than locally in their cloud environment.

### Install the ReadMe Plugin

*Note: Only run this step if the user does not already have the ReadMe Plugin available*.

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

The API key is never committed to the repository - it is kept in the user's OS keychain. Each contributor must configure their own API key.

#### Confirmation

That you are able to successfully read skills from the installed ReadMe plugin.

### Configure the API key

The user can access their API key via **Settings → API Keys** in their ReadMe project.

*NOTE: For first-time setup on ReadMe, the user may be creating a new project. If they are, they will not yet have their API key. In that case skip this step and when the user creates their project the user/you can configure the actual API key.*

The user should run this themselves so that the key is not written to their shell history:

```sh
read -rsp "Input your ReadMe API key: " README_API_KEY && printf '{"api_key":"%s"}' "$README_API_KEY" | claude plugin configure readme@readme --values-stdin
```

Alternatively, running `claude plugin configure readme@readme` will prompt the user for the key.

#### Confirmation

That you are able to successfully list tools from the ReadMe MCP server. The user may need to restart their session before the configuration is recognized.

## Claude Chat connection

Applies to the Chat interface in the Claude Desktop App AND claude code cloud agents. For Claude Code (CLI or the desktop Code tab) refer to the "Claude Code connection" section instead.

*Note: claude.ai web is not supported - it does not allow setting headers on the MCP connector, so the ReadMe API key cannot be configured. Use the Claude Desktop App or Claude Code instead.*

### Install the ReadMe Plugin

*Note: Only do this if the user does not already have the ReadMe plugin available.*

The user can install the ReadMe plugin via UI by following these steps:

1. Navigate to Plugins from Customize -> Plugins and select the "Add" button, select "Add Marketplace"
2. From the pop-up menu, select "Add from a Repository" and paste in the official Readme agent plugins repository: https://github.com/readmeio/agent-plugins
3. Select "Sync Automatically" (optional, this keeps your plugin up to date with our latest changes) and select "Sync"
4. Navigate back to Plugins and search for "ReadMe" and click on the "ReadMe" result with "yours" on it. Once inside, click the "Add" button.

#### Confirmation

Confirm that the ReadMe plugin is installed and that its skills are available.

### Install the MCP Server

The user must manually connect to the MCP server via the "Connector" tab on the plugin - select it, and click on the "Connect" button.

1. On the pop-up menu select "Continue"
2. For Authentication, leave it as "No sign-in"
  1. If the user has a ReadMe API key they should click on the "Add Header", select "authorization" as the header type, and have value `Bearer YOUR_README_API_KEY` using their actual API key. The user can access this key via **Settings → API Keys** in their ReadMe project.
3. Leave the Advanced settings as they are (should be streamable HTTP)
4. Click "Add" to finish

*NOTE: For first-time setup on ReadMe, the user may be creating a new project. If they are, they will not yet have their API key. In that case leave the header out and when the user creates their project they must re-configure the connector with the actual API key.*

*Note: Claude does not expose a way to edit the MCP settings after originally configuring them - the user must remove and re-add the connector to change their API key.*

#### Confirmation

Ensure that the MCP server is visible and that you can run tools to verify that the step has been successfully completed.

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

*Note: Only run this step if the user does not already have the ReadMe Plugin available*.

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

To confirm successful installation, verify that you can now see the ReadMe plugin and its available skills. The user may have to restart their application for this installation to be recognized.

### Install the ReadMe MCP Server

Unfortunately, due to constraints from OpenAI the ReadMe MCP server cannot be installed with authentication via the plugin and must be configured manually.

#### ChatGPT Web

Currently no MCP configuration is supported via ChatGPT web due to limitations from OpenAI. Install and use either the desktop application or the Codex CLI instead.

#### Codex CLI & ChatGPT Desktop App

*NOTE: For first-time setup on ReadMe, the user may be creating a new project. If they are, they will not yet have their API key. In that case register the server without authentication, and once the user has created their project re-run the steps below with their actual API key (run `codex mcp remove readme` first if Codex reports that the server already exists). Do not use `--bearer-token-env-var` with an unset variable - Codex fails to start the MCP server.*

```sh
codex mcp add readme --url https://docs.readme.com/mcp
```

With an API key:

```sh
codex mcp add readme \
  --url https://docs.readme.com/mcp \
  --bearer-token-env-var README_API_KEY
```

The user must then set `README_API_KEY` in their environment. The ChatGPT desktop app does not inherit environment variables from the user's shell - if the user uses the desktop app, set the header directly in `~/.codex/config.toml` instead:

```toml
[mcp_servers.readme]
url = "https://docs.readme.com/mcp"
http_headers = { Authorization = "Bearer YOUR_README_API_KEY" }
```

If the user wants to connect to more than one ReadMe project, register an MCP server per project with the same URL but different names:

```sh
codex mcp add readme_projectA \
  --url https://docs.readme.com/mcp \
  --bearer-token-env-var README_PROJECT_A_API_KEY

codex mcp add readme_projectB \
  --url https://docs.readme.com/mcp \
  --bearer-token-env-var README_PROJECT_B_API_KEY
```

#### Confirmation

Ensure that the MCP server is visible and that you can run tools to verify that the step has been successfully completed.

### Codex Cloud Agents

Codex cloud agents cannot run these setup steps themselves. You must instruct the user to run the commands and give them the option to configure via the user-interface too.

If they ask to use the user interface, give them the ways to setup in the UI.

## Other agents connection (no plugin)

Applies to any agent without a ReadMe plugin, including local coding agents such as OpenCode, Gemini CLI, GitHub Copilot CLI, VS Code, and Windsurf. It also works for Claude Code, Codex, and Cursor if the user does not want a plugin.

This setup does not use a plugin. It uses two separate CLIs:

- [`npx skills`](https://github.com/vercel-labs/skills) installs the ReadMe skills.
- [`npx add-mcp`](https://github.com/neondatabase/add-mcp) registers the ReadMe MCP server.

Both need Node.js. Both detect installed agents and ask which ones to target; use `-a <agent>` to pick one directly.

*Note: Do not combine this with a ReadMe plugin in the same agent. It results in duplicate skills and duplicate ReadMe MCP servers.*

### Install the ReadMe skills

*Note: Only run this step if the user does not already have the ReadMe skills available.*

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
npx add-mcp "https://docs.readme.com/mcp?projects=developers" --name readme
```

This takes the same `-g` and `-a <agent>` flags. Without an API key the server only has read access to public docs.

#### Configure the API key

The user can access their API key via **Settings → API Keys** in their ReadMe project.

*NOTE: For first-time setup on ReadMe, the user may be creating a new project. If they are, they will not yet have their API key. In that case skip this step and when the user creates their project the user/you can configure the actual API key.*

The user should run this themselves in a terminal. `add-mcp` prompts for `README_API_KEY`, so the key never enters the chat or shell history:

```sh
npx add-mcp "https://docs.readme.com/mcp?projects=developers" --name readme --header 'Authorization: Bearer ${README_API_KEY}'
```

Keep the single quotes so the shell does not expand the variable. Re-running with the same name replaces the anonymous `readme` entry.

The key may be written into the agent's config file. With project scope, check that file is not committed; prefer `-g` when adding a key.

#### Confirmation

That you are able to successfully list tools from the ReadMe MCP server. The user may need to restart their agent before the configuration is recognized.

For an agent that neither CLI supports, consult the agent's own skills and MCP setup docs, using the same skills repository and MCP URL.

## After setup

Once the ReadMe skills are available and you can list tools from the ReadMe MCP server, use the `setup-project` skill to set me up with my new ReadMe account and project.

If the skills or MCP tools are not available yet because the client needs a restart or reload, tell me exactly what to restart. Once I have, I will resume this conversation or paste this prompt again - skip the steps that are already done.
