# Cursor connection

Applies to the Cursor IDE, Cursor web, and the Cursor CLI (`agent`). A plugin installed at user scope in any one is available in the others. Install the plugin once. Cursor web follows the same steps as the Cursor UI below.

The plugin includes the ReadMe MCP server, so installing the plugin is the whole setup.

## Authentication uses a project API key

Cursor authenticates with a ReadMe project API key, not OAuth. This is a known Cursor bug that Cursor must fix: when an MCP server accepts the connection and asks for sign-in only on a later request (ReadMe asks on the first `execute-request`), Cursor never opens the sign-in page.

Until Cursor fixes it, the API key is the standard Cursor setup, so offer it without waiting for the user to ask:

- The user creates the key in their project under **Settings → API Keys** (append `#/settings/api-keys` to any URL on their docs domain).
- A key reaches one project. `x-readme-subdomain` is optional; when sent, it must match the key's project.
- To work on a different project, the user replaces the key under the plugin's **Configure**.

**Note: For new accounts they should be created with the `ai_onboarding` endpoint before continuing.

## Install the ReadMe Plugin

### Cursor UI

1. Open **Customize** in the sidebar.
2. Search for **ReadMe**.
3. Find the "Readme" plugin with author "ReadMe" and select **Add**.
4. Set the **ReadMe API key** when prompted. It can be left blank for now and set later by opening the ReadMe plugin and selecting **Configure**.

*NOTE: For first-time setup on ReadMe, the user may be creating a new project and will not have an API key yet. Leave it blank, and set it once the project exists (the `setup-project` skill covers this).*

In the IDE chat, running the command `/add-plugin readme` will also do the same.

### Cursor CLI - `agent`

The ReadMe plugin can be installed from a running `agent` session.

1. Start `agent`
2. Run the `/plugin` slash command
3. Cycle to the "Marketplace" for the installed plugins
4. Search for "readme"
5. Select "ReadMe" from the Cursor Plugin Marketplace
  1. Here you can select to install for yourself (user scope) or for the project you are in (project scope). If you are working in a BiDi synced repository, it is recommended to use project scope, but for MCP it is best to use the user scope.
6. Set the API key in the Cursor app (ReadMe plugin → **Configure**). The `agent` CLI has no way to set plugin variables.

### Confirmation

Confirm that the ReadMe plugin is installed, that its skills are available, and that you can list tools from its MCP server. The user may need to reload the window or start a new session before the install or key change is recognized.
