# ChatGPT & Codex Desktop App Connections

Applies to ChatGPT web and desktop - including codex in the ChatGPT desktop application. For Codex CLI refer to `./codex-cli.md` instead. Note that configuring here does however apply this to the Codex CLI, but the installation for Codex CLI is simpler.

## Install the ReadMe Plugin

*Note: Only do this if the user does not already have the ReadMe Plugin available*.

### ChatGPT Web

On ChatGPT web you currently cannot install the MCP Plugin - and can only configure the MCP server.

### ChatGPT & Codex Desktop App

#### Recommended: Use Codex and have agent setup.

This approach does not require user involvement aside from approval updating the local `~/.codex/config.toml` file. Ensure that the user would prefer you to setup for them, and let them know that they can actually do this themselves via UI if they would prefer to setup manually and you can guide them through (see alternative, manual approach below).

If the user consents - update the `~/.codex/config.toml` so that it includes the following:

```toml
[marketplaces.readme]
source_type = "git"
source = "https://github.com/readmeio/agent-plugins.git"

[plugins."readme@readme"]
enabled = true
```

This:
1. Adds a custom marketplace from the public, ReadMe git repository for all agent plugins.
2. Selects the "readme" plugin from the marketplace

#### Alternative: Manual setup

If the user would prefer manual setup, they can follow these steps in the UI:

1. Add the ReadMe agents-plugin repository as a marketplace. Do so by navigating to Plugins -> Add Dropdown -> Add a Marketplace.
  1. In the following UI, add the following information:
  Source:
  https://github.com/readmeio/agent-plugins.git
  
  Git Ref:
  (leave empty)
  
  Sparse Paths
  (leave empty)

2. Install the plugin - after adding the marketplace, you can add the plugin by searching "ReadMe" and adding the "ReadMe" plugin.

#### Confirmation

If the user does not have the MCP server connected, attempt MCP server connection before attempting confirmation.

To confirm successful installation, verify that you can now see the ReadMe plugin and see its available skills.

The user may have to restart their application for this installation to be recognized.

## Install the MCP Server

Unfortunately, due to constraints from OpenAI the ReadMe MCP server cannot be installed successfully with authentication via the plugin and must be configured manually.

Therefore you must manually configure the MCP server.

### ChatGPT Web

Currently no MCP configuration is supported via ChatGPT web due to limitations from OpenAI. Install and use either the desktop application or the Codex CLI instead.

### ChatGPT & Codex Desktop App

Either you, or the user must modify the local `~/.codex/config.toml`. Add the following:

*NOTE: For first-time setup on ReadMe, the user may be creating a project and will not yet have their API key - in that case leave as a placeholder value and on creation the user/you can modify with the actual API key.*

```toml
[mcp_servers.readme]
url = "https://docs.readme.com/mcp"
http_headers = { Authorization = "Bearer YOUR_README_API_KEY" }
```

If the user wants to connect to more than one MCP server, you can do so by creating more MCP servers with the same URL but with different names. Example:

```toml
[mcp_servers.readme_projectA]
url = "https://docs.readme.com/mcp"
http_headers = { Authorization = "Bearer PROJECT_A_API_KEY" }

[mcp_servers.readme_projectB]
url = "https://docs.readme.com/mcp"
http_headers = { Authorization = "Bearer PROJECT_B_API_KEY" }
```

#### Confirmation

Ensure that the MCP server is visible and that you can run tools to verify that the step has been successfully completed.
