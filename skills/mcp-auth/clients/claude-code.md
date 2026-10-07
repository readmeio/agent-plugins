# Claude Code connection

## Connection handoff

The bundled MCP configuration is anonymous. The existing connection approach registers an authenticated HTTP server named `readme`, with the key referenced from the environment:

```sh
claude mcp add --scope user --transport http readme https://docs.readme.com/mcp --header 'Authorization: Bearer ${README_API_KEY}'
```

Have the user set `README_API_KEY` privately in the environment that launches Claude Code and restart/reconnect afterwards. Keep the single quotes so the registration stores a variable reference rather than expanding the secret in the shell.

## Before merge

- **NEEDS_INPUT — Registration:** Verify this command, runtime variable expansion, plugin/server naming and precedence, and update-versus-add behavior against current Claude Code docs.
- **NEEDS_INPUT — Scope:** Confirm user versus project scope and desktop Code environment inheritance; add exact reconnect steps and documentation links.
