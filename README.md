# ReadMe agent plugins

Official [ReadMe](https://readme.com) plugins that connect AI coding agents to ReadMe's
[MCP server](https://docs.readme.com/main/docs/readmes-mcp-server), so agents can search your
guides and API reference, inspect OpenAPI specs, draft changelog entries, and open documentation
updates for review.

One plugin per client, because each client has its own manifest format and its own way of handling
credentials.

| Client              | Plugin                | Marketplace manifest                | Install                                                                   |
| ------------------- | --------------------- | ----------------------------------- | ------------------------------------------------------------------------- |
| Cursor              | [`cursor/`](cursor/)  | `.cursor-plugin/marketplace.json`   | `/add-plugin readme`, or **Cursor Settings → Plugins**                    |
| Claude              | [`claude/`](claude/)  | `.claude-plugin/marketplace.json`   | `/plugin marketplace add readmeio/agent-plugins`                          |
| ChatGPT and Codex   | [`codex/`](codex/)    | `.agents/plugins/marketplace.json`  | `codex plugin marketplace add readmeio/agent-plugins`                     |

Each plugin directory has its own README with install steps and auth setup.

Claude and Codex take the repository itself as a marketplace from the command line, as above. Cursor
has no CLI equivalent: teams add this repository under **Dashboard → Plugins → Team Marketplaces →
Add Marketplace → Import from Repo**, and Cursor indexes it from the root manifest.

## Repository structure

The repository root is a marketplace for all three clients — it is not itself a plugin. Each client
reads only its own marketplace manifest and ignores the others.

```
agent-plugins/
├── .cursor-plugin/marketplace.json   # Cursor marketplace  → cursor
├── .claude-plugin/marketplace.json   # Claude marketplace  → ./claude
├── .agents/plugins/marketplace.json  # Codex marketplace   → ./codex
├── cursor/
│   ├── .cursor-plugin/plugin.json
│   ├── mcp.json
│   ├── assets/logo.svg
│   ├── README.md
│   ├── CHANGELOG.md
│   └── LICENSE
├── claude/
│   ├── .claude-plugin/plugin.json
│   ├── .mcp.json
│   ├── skills/
│   └── README.md
├── codex/
│   ├── plugin.json                   # Agent Plugins 1.0.0 manifest
│   ├── mcp.json
│   ├── skills/
│   └── README.md
├── README.md
└── LICENSE
```

## Authentication

All three plugins talk to the same endpoint, `https://docs.readme.com/mcp`, and all three ship
anonymous. Without a key you get read-only access to public docs, which is enough for searching and
reading, and none of the plugins prompt for anything on install.

Write tools such as `update-docs` need a ReadMe API key. That step is the user's, not the package's,
because each client wires credentials differently and the Agent Plugins spec forbids putting them in
a plugin at all: it requires headers to be literal package data with no secrets in them, and Codex
strips `Authorization` from plugin MCP configs regardless. In every client the shape is the same,
register the server yourself with the key and your entry replaces the plugin's anonymous one. Each
plugin README has the exact snippet.

## License

MIT
