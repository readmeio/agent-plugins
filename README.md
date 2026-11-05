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
│   ├── skills/                       # Frozen snapshot of ../skills, re-synced by hand
│   ├── assets/icon.svg
│   └── README.md
├── codex/
│   ├── plugin.json                   # Agent Plugins 1.0.0 manifest
│   ├── mcp.json
│   ├── skills/                       # Generated from ../skills
│   ├── assets/                       # icon.svg, logo.svg
│   └── README.md
├── scripts/
├── README.md
└── LICENSE
```

## Skills

The skills are agent-agnostic. Anything a client does differently, such as installing the plugin or
signing in, lives in a per-client reference under `skills/mcp-auth/clients/`, so there is one copy
of every fact. Skills carry only what the MCP server cannot tell an agent at runtime; route maps
come from `list-endpoints` and `get-endpoint`, not from a skill.

Edit `skills/` and nothing else, then regenerate the Codex and Cursor copies:

```
node scripts/sync-skills.mjs
```

CI runs `node scripts/sync-skills.mjs --check` and fails if a client copy has drifted. Each client
ships its own directory because each marketplace submission reads only that directory.

`claude/skills/` is left out on purpose. Anthropic reviews the `claude/` directory for its plugin
directory, and every change to it sends the submission to the back of the review queue. Re-sync it
only when we mean to resubmit:

```
rm -rf claude/skills && cp -R skills claude/skills
```

## Authentication

All three plugins talk to the same endpoint, `https://docs.readme.com/mcp`.

- **Claude and Codex** sign in with OAuth. The user signs in with their ReadMe account when the
  client prompts, and one sign-in covers every project the account can reach. Requests pick the
  project with the `x-readme-subdomain` header. These plugins ship no credentials and never read
  keys from the user's machine.
- **Cursor** uses a project API key. Cursor never opens the sign-in page when a server asks for it
  on a later request rather than on connect, so OAuth doesn't work there yet. The plugin declares
  `README_API_KEY` as a plugin variable and prompts for it on install (or under the plugin's
  **Configure**). A key reaches one project, so no `x-readme-subdomain` header is sent.

Clients without OAuth support can use a project API key, entered by the user in the client's own
MCP settings. The `mcp-auth` skill has the steps for each client.

## License

MIT
