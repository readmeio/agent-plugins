# Cursor connection

## Connection handoff

The package declares a `README_API_KEY` **plugin variable**, not a shell environment variable. Have the user set **ReadMe API key** in the install prompt or **Plugins → Configure** for the installed ReadMe plugin, then reconnect the server.

Prefer the plugin credential setting. An independently configured `readme` server can shadow the plugin connection; inspect non-secret registration details when the configured key appears unused.

## Before merge

- **NEEDS_INPUT — UI:** Verify current install/configure labels and reconnect steps; add Cursor's canonical plugin-variable documentation.
- **NEEDS_INPUT — Precedence:** Verify user/project MCP overrides and how to detect duplicate registrations without exposing headers.
