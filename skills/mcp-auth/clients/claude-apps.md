# Claude app connections

Applies to Claude Desktop **Chat**, Cowork, and claude.ai. The desktop **Code** surface uses the [Claude Code reference](claude-code.md).

## Connection handoff

These surfaces use app/cloud connector settings rather than a local Claude Code registration. Guide the user through the supported app settings; shell environment variables are not a substitute for connector credentials.

If authenticated ReadMe connections are unavailable on their surface, explain that limitation and hand off project writes to a supported client. Public ReadMe product-documentation reads can continue.

## Before merge

- **NEEDS_INPUT — Surface support:** Verify authenticated connector support separately for Desktop Chat, Cowork, and claude.ai; the previous draft asserted all were read-only.
- **NEEDS_INPUT — UI:** Add each supported surface's key/auth flow, install/settings link, plan/admin restrictions, and reconnect steps. Provide a tested manual alternative where auth is unsupported.
