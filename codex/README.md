# ReadMe plugin for ChatGPT and Codex

Connects ChatGPT and Codex to the [ReadMe MCP server](https://docs.readme.com/main/docs/readmes-mcp-server) so the model can search, read, and update your ReadMe docs and API reference.

## Install

The repository root is a Codex plugin marketplace. Add it, then install the plugin:

```
codex plugin marketplace add readmeio/agent-plugins
codex plugin add readme@readme
```

For a local checkout, pass the checkout path to `codex plugin marketplace add` instead. Start a new Codex session after installing so the skills and MCP server load.

## Authentication

Public read access works without any setup.

Write tools such as `update-docs` need your ReadMe API key. Codex strips `Authorization` headers from plugin MCP configs, so register the server yourself once with the key read from an environment variable:

```
export README_API_KEY=rdme_…
codex mcp add readme --url https://docs.readme.com/mcp --bearer-token-env-var README_API_KEY
```

Your `readme` entry replaces the plugin's anonymous one. The skills keep working because the server name is unchanged. Find your key under **Configuration → API Keys** in your ReadMe project dashboard.
