# Changelog

All notable changes to this plugin will be documented here.

## 1.0.0 — initial release

- Added the `readme` MCP server pointing at ReadMe's hosted Streamable HTTP endpoint (`https://docs.readme.com/mcp`).
- Ships anonymous. Public docs are readable without a key, and write access is opt-in: users register the server with their own API key when they want it.
- Added the `mcp-server` skill, so the agent knows this server reads ReadMe's own documentation and that only `execute-request` with the user's key reaches their project.
- Logo: ReadMe's official owl mark.
