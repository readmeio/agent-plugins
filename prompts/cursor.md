Set me up with the ReadMe skills and MCP server in this agent, then help me create my ReadMe project.

The instructions below call me "the user". Skip any step that is already done. When a step can only be done by me (in an app's UI, or in my own terminal so that my API key stays out of the chat), tell me exactly what to do and wait for me to confirm.

## Cloud Agent

If you are running in a cloud or remote sandbox (e.g. Claude Code on the web, Codex cloud, Cursor background agents), do not install plugins or write MCP config inside the sandbox. It is temporary and is not the user's app config. Direct the user to configure the plugin/connector and API key through the app's own settings, then follow the UI steps in the matching client reference.

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

## After setup

Once the ReadMe skills are available and you can list tools from the ReadMe MCP server, use the `setup-project` skill to set me up with my new ReadMe account and project.

If the skills or MCP tools are not available yet because the client needs a restart or reload, tell me exactly what to restart. Once I have, I will resume this conversation or paste this prompt again - skip the steps that are already done.
