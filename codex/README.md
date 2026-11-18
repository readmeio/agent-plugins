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

The plugin signs in to the ReadMe MCP server with OAuth. ChatGPT or Codex asks you to sign in with your ReadMe account, either when the server connects or on the first request that needs it. One sign-in covers every project your account can reach.

The plugin never reads API keys or other credentials from your machine. If you need a project API key instead of OAuth, the `mcp-auth` skill walks you through adding it in your client's own MCP settings.

## Skills

| Skill | What it does |
| ----- | ------------ |
| `managing-readme-docs` | Shared reference for working on a ReadMe project: MCP routing, project sections, BiDi Sync, and confirming the active project and branch |
| `mcp-auth` | Installs the plugin and MCP server, and signs in when a request fails authentication |
| `setup-project` | Creates a new ReadMe project, for a signed-in user or together with a new account |
| `edit-page-content` | Creates and edits guides, API reference prose, changelogs, recipes and custom pages |
| `manage-navigation` | Organizes the sidebar: categories, page order, titles and URLs |
| `update-project-settings` | Views and updates project settings such as appearance, AI, SEO, access, domains and integrations |
