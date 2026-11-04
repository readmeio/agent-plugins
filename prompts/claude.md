Set me up with the ReadMe skills and MCP server in this agent, then help me create my ReadMe project.

The instructions below call me "the user". Skip any step that is already done. When a step can only be done by me (in an app's UI, or in my own terminal so that my API key stays out of the chat), tell me exactly what to do and wait for me to confirm.

## Cloud Agent

If you are running in a cloud or remote sandbox (e.g. Claude Code on the web, Codex cloud, Cursor background agents), do not install plugins or write MCP config inside the sandbox. It is temporary and is not the user's app config. Direct the user to configure the plugin/connector and API key through the app's own settings, then follow the UI steps in the matching client reference.

Work out which client and surface you are running in, then follow only the matching section below. If it is unclear, ask the user.

| Environment | Section |
| --- | --- |
| Claude Code CLI or the desktop Code tab | "Claude Code connection" |
| Claude Desktop Chat, Claude Code cloud agents, or claude.ai | "Claude Chat connection" |

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

## After setup

Once the ReadMe skills are available and you can list tools from the ReadMe MCP server, use the `setup-project` skill to set me up with my new ReadMe account and project.

If the skills or MCP tools are not available yet because the client needs a restart or reload, tell me exactly what to restart. Once I have, I will resume this conversation or paste this prompt again - skip the steps that are already done.
