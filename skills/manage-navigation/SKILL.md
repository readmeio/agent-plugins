---
name: manage-navigation
description: Organize ReadMe navigation by creating or renaming categories, moving or reordering pages, changing page titles/slugs, or removing navigation content.
---

# Manage ReadMe navigation

## Workflow

1. **Inspect.** Read [project targeting and source of truth](../PROJECT-WORKFLOW.md), then [Structuring your docs](https://docs.readme.com/main/docs/structuring-your-docs.md). For confirmed local work, read the mapped navigation files and their documented representation; otherwise retrieve the target section's categories and their pages through the project API, including all pagination. Establish existing order/parent relationships on the selected surface.
   **Done:** The affected navigation and its project/branch are known.
2. **Plan.** Show the proposed before/after structure, including page identities, destination categories, order, title versus slug changes, and removals. Check inbound links when URLs change. Explain destructive effects and obtain explicit approval for deletion.
   **Done:** The desired structure and any destructive/URL-changing actions are approved.
3. **Apply.** For confirmed local work, edit the mapped navigation files using their documented representation. For hosted work, discover supported category/page operations and inspect their schemas. Preserve page bodies while changing navigation metadata. Apply only supported ReadMe hierarchy changes.
   **Done:** Every approved structural change has a result, with any partially completed sequence recorded.
4. **Verify.** Re-read the changed local files or hosted categories/pages and compare membership, order, titles, slugs, and hierarchy to the plan. Follow [verification](../PROJECT-WORKFLOW.md), check affected links, and report outstanding review, redirect, and sync/publishing work.
   **Done:** The resulting structure matches the plan or every discrepancy is reported.

## ReadMe hierarchy

Categories organize pages; sidebar nesting does not create nested URL paths. Use [page types and paths](../edit-page-content/PAGE-TYPES.md) when a slug changes. Use [edit-page-content](../edit-page-content/SKILL.md) when the page body itself must change.

## Reference to fill

- **NEEDS_INPUT — Structure operations:** Add canonical docs/API pointers for category CRUD, page moves, ordering, supported nesting depth, and section restrictions.
- **NEEDS_INPUT — Identity:** Confirm rename versus slug-change behavior, inbound-link discovery, and redirects.
- **NEEDS_INPUT — Removal:** Confirm hide/archive/delete options, child-page handling, category-deletion effects, and recovery.
- **NEEDS_INPUT — Scope:** Confirm which navigation elements exist and are writable in ReadMe; distinguish categories/pages from site navigation links and branch/version selection.
