---
name: mcp-auth
description: Recover a ReadMe MCP connection when a project operation is rejected for missing, invalid, expired, or unresolved authentication.
---

# Recover ReadMe MCP authentication

Invoke on an authentication failure, not before routine project work.

## Workflow

1. **Classify.** Capture the failing operation and non-secret error response. Check whether the response actually indicates missing/rejected credentials rather than validation, insufficient permissions, plan restrictions, or a service outage.
   **Done:** There is an authentication failure to repair, or the error is handed back to its owning workflow.
2. **Identify the environment.** Establish both the client and surface (for example Claude Code versus Claude Desktop Chat); ask if unclear. Read only the matching [client connection reference](CLIENTS.md).
   **Done:** The instructions apply to the user's actual environment.
3. **Repair.** Direct the user to the intended ReadMe project's **Configuration → API Keys** and their client's credential settings. Keep secrets out of chat, committed files, and tool arguments. The user enters or rotates the key; apply non-secret configuration only with permission. Follow the environment's reconnect instructions.
   **Done:** The user confirms the credential is configured, or receives an explicit manual handoff.
4. **Verify and resume.** Use a documented, non-mutating project-identity operation through the MCP connection; confirm the project matches the intended target. Retry the interrupted operation only after successful verification, checking the existing state before retrying a write with an uncertain result.
   **Done:** The intended project is reachable and the original workflow resumes, or the unresolved error is reported without repeated guesses.

## Authentication scope

Public reads of ReadMe's own product docs can use the plugin's anonymous connection. Operations on the customer's project use the authenticated connection; a successful public-doc search does not verify it. The credential selects the project.

Use [MCP routing](../PROJECT-WORKFLOW.md) for the project-operation contract.

## Reference to fill

- **NEEDS_INPUT — Failure contract:** Confirm auth-required operations and reliable error/status mappings. The old drafts treated some generic 500 responses as empty-key failures; verify that behavior before using it diagnostically.
- **NEEDS_INPUT — Key UI:** Verify the current key-creation/rotation labels and link to maintained ReadMe instructions.
- **NEEDS_INPUT — Verification:** Confirm the current read-only identity operation, key/project permissions, and supported project-switching behavior.
