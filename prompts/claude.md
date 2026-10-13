Set the user up with the ReadMe skills and MCP server in their coding agent, then help them create their ReadMe project.

Skip any step that is already done. When a step can only be done by the user (in an app's UI, or in their own terminal so that their API key stays out of the chat), tell them exactly what to do and wait for them to confirm.

Work out which client and surface you are running in, then follow only the matching section below. If it is unclear, ask the user.

| Environment | Section |
| --- | --- |
| Claude Code CLI or the desktop Code tab | "Claude Code connection" |
| Claude Desktop Chat or claude.ai | "Claude Chat connection" |

## Claude Code connection

Applies to the Claude Code CLI and the Code tab in the Claude Desktop App. For the Chat interface in the Claude Desktop App or claude.ai refer to the "Claude Chat connection" section instead.

These commands can be run by Claude Code (in either the CLI or the desktop app), or the user can run them manually.

*Note: If the user only uses Claude Code via the desktop app, they can instead install the plugin via the app UI by following the "Claude Chat connection" section. This is NOT recommended - the API key cannot be edited after it is configured, and the plugin will not be available in the Claude Code CLI. Do not install via both methods, as this will result in duplicate ReadMe MCP servers.*

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

Applies to the Chat interface in the Claude Desktop App. For Claude Code (CLI or the desktop Code tab) refer to the "Claude Code connection" section instead.

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

## After setup

Once the ReadMe skills are available and you can list tools from the ReadMe MCP server, use the `setup-project` skill to set the user up with their new ReadMe account and project.

If the skills or MCP tools are not available yet because the client needs a restart or reload, tell the user exactly what to restart. Once they have, they should resume this conversation or paste this prompt again - the steps that are already done will be skipped.
