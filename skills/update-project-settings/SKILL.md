---
name: update-project-settings
description: View and update ReadMe project settings, including appearance, branding, AI features, MCP server settings, agent discovery, llms.txt, SEO, access and domains, API reference, localization, and integrations. Use when a user wants to configure any settings on their ReadMe docs site.
---

# Update ReadMe project settings

Note - these settings are only configurable via the ReadMe MCP Server - BiDi sync users must use the server or configure on their ReadMe site.

## Workflow

1. **Target.** Retrieve the current project via `execute-request` with `GET https://api.readme.com/v2/projects/me` and confirm it is the project the user means. Note `parent` (enterprise) and `plan.type`.
   **Done:** The intended project is confirmed and its current settings are in hand.
2. **Locate.** Match the request to a category and read its corresponding category file. When the user asks broadly (e.g. "what can I change about my styling?"), offer that category's common operations. Inspect the `updateProject` schema with `get-endpoint` for the exact fields.
   **Done:** Every requested change maps to a schema field or to a named dashboard-only action.
3. **Plan.** Show the current and proposed value for every field. Flag each change that is noted as being plan-gated, needs an extra purchase, may be overridden by an enterprise parent, or is write-only (see [How project settings behave](#how-project-settings-behave)). Get explicit approval: changes go live as soon as they are saved and make sure the user is aware of this.
   **Done:** The user has approved every field change, with the before values recorded for rollback.
4. **Apply.** Complete any upload step the category file names first. Send `PATCH https://api.readme.com/v2/projects/me` containing only the approved fields.
   **Done:** The request returned 200, or the error is reported with the field it names.
5. **Verify.** Retrieve the project again and compare every changed field with the plan. A field that kept its old value usually means a plan gate. Confirm write-only fields in the dashboard unless the category file says otherwise, and hand visual checks to the user.
   **Done:** Every approved field matches the plan, or each mismatch is reported with its likely cause.

## How project settings behave

- **Live immediately.** Settings are project-wide, apply to every branch and version, and are visible to readers as soon as they are saved. There is no draft or preview, so the recorded before values are the rollback.
- **Partial updates.** Send only the fields being changed; nested objects merge with the stored values.
- **Arrays are replaced in full.** Any array you send becomes the complete new value. Read the current array, edit it, and send the whole array back; sending one item deletes the rest. Keyed maps vary, so read the field's schema description before writing one.
- **Read-only fields.** Fields whose schema description says "Read-only" are ignored on write.
- **Write-only fields.** Passwords and secrets can be set but are never returned.
- **Plan-gated settings.** Some settings need a higher plan, such as Pro or Enterprise. Writes to a gated setting are silently ignored: the request still returns 200 and the old value stays. If the user wants to upgrade their plan, send the user to their plan page, reached by adding `#/settings/manage-plans` to any URL on their documentation domain.
- **Extra purchases.** Some features need an add-on beyond any plan, such as AI-enabled translations. Direct the user to sales@readme.io.
- **Enterprise parent projects.** A non-null `parent` means the project is a child in an enterprise group. Depending on the setting, the parent's value can override the child's, act as a default until the child sets its own, or be the only place the setting can be changed. Read the field's schema description for its inheritance rule before writing it on a child.

## Categories

### AI settings

Reader-facing Ask AI, the in-product AI agent, and the Slack AI Writer. Read [AI settings](categories/ai.md).

- Turn Ask AI on or off, and choose where readers can open it
- Give the in-product AI agent custom knowledge, and let it search project content
- Choose which built-in models the in-product AI agent can use
- Let the Slack AI Writer merge or delete the branches it opens
- Check whether AI Writer, Inline Editor, Linter, Docs Audit, or all AI features are available (read-only)
