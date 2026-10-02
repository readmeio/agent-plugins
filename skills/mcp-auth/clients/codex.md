# Codex connection

## Connection handoff

The bundled MCP configuration is anonymous. The existing connection approach reads the credential through an environment-variable reference:

```sh
codex mcp add readme --url https://docs.readme.com/mcp --bearer-token-env-var README_API_KEY
```

Have the user set `README_API_KEY` privately in the environment that launches Codex and start a new session afterwards. Store a variable name, not the token, in configuration.

## Before merge

- **NEEDS_INPUT — Registration:** Verify current CLI syntax, plugin/server precedence, existing-registration updates, and config scope; add canonical Codex MCP documentation.
- **NEEDS_INPUT — IDE:** Confirm IDE-extension environment inheritance and reconnect instructions independently from the CLI.
