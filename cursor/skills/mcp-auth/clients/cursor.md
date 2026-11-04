# Cursor connection

Applies to the Cursor IDE, Cursor web, and the Cursor CLI (`agent`). A plugin installed at user scope in any one is available in the others. Install the plugin once. Cursor web follows the same steps as the Cursor UI below.

The plugin includes the ReadMe MCP server, so installing the plugin is the whole setup.

## Install the ReadMe Plugin

### Cursor UI

1. Open **Customize** in the sidebar.
2. Search for **ReadMe**.
3. Find the "Readme" plugin with author "ReadMe" and select **Add**.
4. When Cursor prompts, sign in with a ReadMe account.

In the IDE chat, running the command `/add-plugin readme` will also do the same.

### Cursor CLI - `agent`

Unfortunately Cursor's `agent` does not work with OAuth at the moment - and you must instead use Cursor UI. Refer to the `./other-agents.md` file for context on how to do this for a client without OAauth support.

Traditional API keys do work with the `agent` configuration though.

### Confirmation

Confirm that the ReadMe plugin is installed, that its skills are available, and that you can list tools from its MCP server. The user may need to reload the window or start a new session before the install is recognized.
