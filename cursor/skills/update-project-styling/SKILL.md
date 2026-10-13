---
name: update-project-styling
description: Configure ReadMe project branding and site appearance, including logos, colors, typography, and supported layout settings.
---

# Update ReadMe project styling

## Workflow

1. **Inspect.** Read [project targeting and source of truth](../PROJECT-WORKFLOW.md). For confirmed Git-backed configuration covered by the documented sync workflow, read the mapped configuration files and supported fields. For hosted configuration, retrieve current settings and inspect the available operation's schema and scope.
   **Done:** The current configuration, supported fields, and affected project/branch scope are explicit.
2. **Specify.** Collect the desired branding assets and appearance changes using the support matrix below. Distinguish missing assets from unsupported options and show which current settings will remain.
   **Done:** Every requested change is mapped to a supported field or a named manual/deferred action.
3. **Apply.** For confirmed Git-backed configuration covered by the documented sync workflow, edit only the agreed, supported fields in the mapped files. For hosted configuration, submit only the agreed, schema-supported changes or direct the user to the appropriate dashboard setting. Preserve unrelated settings.
   **Done:** Each agreed setting is applied or reported as pending.
4. **Verify.** Re-read the changed local configuration or hosted settings and follow [verification](../PROJECT-WORKFLOW.md). Review the site's supported preview modes; check asset loading, legibility, and contrast, or hand off unavailable visual checks. Report local validation, remote sync, and publication state separately.
   **Done:** Stored values match the request and visual review is complete or explicitly handed off.

## Branding support matrix

Record user preferences as desired inputs, not promises of supported API fields.

| Area | Inputs to collect | Supported settings |
| --- | --- | --- |
| Logos and icons | Assets, variants, intended placement | NEEDS_INPUT — formats, size limits, upload/link mechanism, light/dark support |
| Colors | Primary/accent colors, existing brand palette | NEEDS_INPUT — writable color fields and accepted values |
| Typography | Font choice, font files or hosted sources | NEEDS_INPUT — font support, licensing/access constraints, API coverage |
| Appearance | Light/dark preferences, layout goals | NEEDS_INPUT — modes, layout options, plan restrictions |
| Advanced styling | Specific changes beyond built-in settings | NEEDS_INPUT — custom CSS/HTML support and safe preview/rollback |

**NEEDS_INPUT — Canonical docs:** Add maintained ReadMe branding/appearance documentation and dashboard links. Confirm configuration read/update operations, asset handling, and visual preview capabilities.
