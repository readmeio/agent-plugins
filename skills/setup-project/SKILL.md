---
name: setup-project
description: Set up a first ReadMe project from an OpenAPI definition, an existing documentation site, or source material for new docs.
---

# Set up a ReadMe project

## Workflow

1. **Intake.** Establish the intended audience, project name/subdomain, owner/account status, and starting point. Use the matching intake branch below and collect available branding.
   **Done:** Every input needed for the initial plan is supplied or explicitly deferred.
2. **Plan.** Propose the initial sections, navigation, seed content, branding, and migration/import approach. Separate supported automation from user actions and deferred work.
   **Done:** The user approves the setup scope and which account/project to create or reuse.
3. **Provision.** Read [Creating a project](https://docs.readme.com/main/docs/creating-a-project) and discover available onboarding operations. Create the approved account/project only through supported capabilities. If unavailable, hand the user the signup link (`https://dash.readme.com/signup`) and the documented project-creation steps; resume when they return the project link. Let the user enter credentials, consent, and billing details.
   **Done:** A confirmed project link and owner exist, or a specific manual handoff is recorded.
4. **Target and route.** Read [project targeting and source of truth](../PROJECT-WORKFLOW.md). Assign each approved item to its write surface and scope using that guidance. Resolve missing project/branch or sync/file-mapping confirmation before that item's writes.
   **Done:** Each item has a confirmed target and write surface, or is pending with the missing confirmation named.
5. **Connect and verify hosted access.** Skip this step for local-only work confirmed in step 4. For hosted items, use the existing connection first. Only when connection setup is needed, read the [client-specific connection reference](../mcp-auth/CLIENTS.md); apply non-secret configuration only with permission, and let the user supply credentials through their client's settings. Use a supported, non-mutating project read and inspect its current schema to confirm the connection reaches the intended project. Invoke [mcp-auth](../mcp-auth/SKILL.md) only when the read fails for authentication, then retry the read after recovery. If the read is unavailable or does not succeed, stop hosted seeding and give the user a client-specific manual next step; confirmed local items can still proceed.
   **Done:** Hosted items have a successful intended-project read or are blocked with the reason and next action; confirmed local items remain independent of hosted access.
6. **Seed and configure.** Apply the approved initial structure and content only to confirmed mapped local files or the successfully verified hosted target. Use [edit-page-content](../edit-page-content/SKILL.md), [manage-navigation](../manage-navigation/SKILL.md), or [update-project-styling](../update-project-styling/SKILL.md) for the matching work on its selected surface. Keep blocked hosted-only configuration pending rather than substituting local files. Treat migration kickoff and completed migration as different states.
   **Done:** Each approved item is verified on its write surface or listed as pending with its next action; local validation is distinguished from remote sync/publication.
7. **Hand off.** Give the project link, the setup summary, and any pending manual next steps.
   **Done:** The user has the project link and a concise record of completed and deferred work.

## Intake branches

### Existing OpenAPI definition

Collect its file or URL, source of truth, intended API version, and update workflow. Plan import and the first supporting guide.

Consult [OpenAPI upload and management](https://docs.readme.com/main/docs/openapi-upload-and-management) before importing.

**NEEDS_INPUT — Import:** Confirm supported onboarding/import operations, accepted definition formats, validation errors, and re-import behavior.

### Migration from an existing site

Collect the source URL/export, ownership, sections to migrate, and content/assets to preserve. Explain the ReadMe-assisted migration option once its current process is confirmed; plan the kickoff and review handoff rather than promising immediate completion.

**NEEDS_INPUT — Migration:** Add the ReadMe migration-service URL, supported sources, required access, kickoff operation or contact path, timing guidance, and status/completion checks.

### Starting from scratch

Collect source files, notes, product/API context, and example or competitor sites. Identify which sources are authoritative and which are inspiration. Plan a small usable seed, such as a getting-started guide and initial API reference when applicable.

**NEEDS_INPUT — Seed:** Add supported generation/seeding operations and the minimum content required for a usable first project.

### Branding

Ask for available logos/icons, primary/accent colors, typography, and light/dark preferences; distinguish requested assets from supported settings. Record missing assets as deferred, using [update-project-styling](../update-project-styling/SKILL.md) for the support matrix.

**NEEDS_INPUT — Provisioning:** Add account/project creation and initial-configuration contracts, required fields, duplicate-project handling, and recovery from partial setup.
