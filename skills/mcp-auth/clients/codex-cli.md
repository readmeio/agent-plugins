# Codex CLI connection

The instructions here require the Codex CLI to be installed. Although these instructions are only for codex CLI, they ultimately impact the installed ChatGPT/Codex Desktop application because they share the same configuration file.

## Install the ReadMe Plugin

*Note: Only run this step if the user does not already have the ReadMe Plugin available*.

You must add the ReadMe plugin marketplace from the official agent-plugins repository, then install the plugin from that marketplace.

```sh
codex plugin marketplace add https://github.com/readmeio/agent-plugins.git
codex plugin add readme@readme
```

### Confirmation

That you are able to successfully read tools from the installed readme plugin.

## Install the ReadMe MCP Server

The plugin for codex does not come with the MCP server due to limitations from OpenAI's side on authentication options for servers installed with plugins.

Setup directly via CLI instead:

*NOTE: For first-time setup on ReadMe, the user may be creating a new project. If they are, they will not yet have their API key. In that case leave the api key as a placeholder and when the user creates their project the user/you can modify the configuration with the actual API key.*

```sh
codex mcp add readme_projectA \
       --url https://docs.readme.com/mcp \
       --bearer-token-env-var YOUR_README_API_KEY
```

If the user withes to manage multiple ReadMe docs projects, they may do so by registering multiple MCP connections:

```sh
codex mcp add readme_projectA \
       --url https://docs.readme.com/mcp \
       --bearer-token-env-var README_PROJECT_A_API_KEY

     codex mcp add readme_projectB \
       --url https://docs.readme.com/mcp \
       --bearer-token-env-var README_PROJECT_B_API_KEY
```

### Confirmation

That you are able to successfully list tools from the created MCP connection.

