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
├── skills/                           # Canonical skills — edit these
├── cursor/
│   ├── .cursor-plugin/plugin.json
│   ├── mcp.json
│   ├── skills/                       # Generated from ../skills
│   ├── assets/logo.svg
│   ├── README.md
│   ├── CHANGELOG.md
│   └── LICENSE
├── claude/
│   ├── .claude-plugin/plugin.json
│   ├── .mcp.json
│   ├── skills/                       # Generated from ../skills
│   └── README.md
├── codex/
│   ├── plugin.json                   # Agent Plugins 1.0.0 manifest
│   ├── mcp.json
│   ├── skills/                       # Generated from ../skills
│   └── README.md
├── scripts/
├── README.md
└── LICENSE
```

## Skills

The three skills are agent-agnostic: anything a client does differently — registering an API key,
driving a browser, installing the plugin by hand — is a per-client table inside the shared file, so
there is one copy of every fact. They carry only what the MCP server cannot tell an agent at
runtime; route maps come from `list-endpoints` and `get-endpoint`, not from a skill.

Edit `skills/` and nothing else, then regenerate the three published copies:

```
node scripts/sync-skills.mjs
```

CI runs `node scripts/sync-skills.mjs --check` and fails if a client copy has drifted. Each client
ships its own directory because each marketplace submission reads only that directory.

## Authentication

All three plugins talk to the same endpoint, `https://docs.readme.com/mcp`. Without a key you get
read-only access to public docs. Writes through `execute-request` need a ReadMe API key, and each
client wires that credential differently.

Cursor declares `README_API_KEY` as a plugin variable and prompts for it on install (or under
**Plugins → Configure**). Claude and Codex cannot put secrets in a plugin MCP config — the Agent
Plugins spec requires headers to be literal package data, and Codex strips `Authorization` anyway
— so those clients still ship anonymous and the user registers the server themselves. Each plugin
README has the exact steps.

## License

MIT
