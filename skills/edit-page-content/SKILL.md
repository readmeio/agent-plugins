---
name: edit-page-content
description: Create or edit ReadMe page content, including guides, API reference prose, changelogs, discussions, recipes, and custom pages.
---

# Edit ReadMe page content

## Workflow

1. **Target.** Read [project targeting and source of truth](../PROJECT-WORKFLOW.md). Identify the page type and whether this is a new page or an edit; use [page types](PAGE-TYPES.md) for section paths and scope.
   **Done:** The project, write surface, section, page identity, and applicable branch are explicit.
2. **Locate and read.** For confirmed local work, read the mapped file's complete body/metadata, or confirm its mapped destination for a new page. For hosted work, search the customer's content through the project API, scoped to the target where supported. If search is insufficient, retrieve categories for the section, then pages within each relevant category, following pagination. Fetch the complete target page before editing.
   **Done:** The exact page and full current body/metadata are available, or the new page's category and slug are agreed.
3. **Draft.** Read [Creating and managing guides](https://docs.readme.com/main/docs/creating-and-managing-guides) for guide operations, [Structuring your docs](https://docs.readme.com/main/docs/structuring-your-docs.md) for organization, and [ReadMe MDX](MDX.md) when writing page bodies. Preserve unrelated content and metadata; use the page-type reference for type-specific requirements.
   **Done:** A complete replacement body or new-page draft satisfies the requested change and applicable ReadMe rules.
4. **Write.** For confirmed local work, edit the mapped file. For hosted work, inspect the available operation's schema. Submit the **full updated body** for body edits, not a patch/diff; send unrelated metadata only if required, retaining its current values.
   **Done:** The intended write surface contains the requested content; failures and partial changes are explicit.
5. **Verify.** Follow [verification](../PROJECT-WORKFLOW.md). Check every changed link, anchor, component, and requested content change, plus preservation of unrelated fields. Provide the page/review link and publication state.
   **Done:** The saved result matches the draft, or remaining rendering/review checks are named.

## Links and identity

Prefer root-relative internal links such as `/docs/getting-started`, with descriptive anchor text. Use a section's correct path and append `#heading-anchor` only after checking the destination heading/anchor.

ReadMe page slugs stay one layer deep regardless of sidebar nesting: a nested guide can still be `/docs/getting-started`, not `/docs/category/getting-started`.

**NEEDS_INPUT — Link forms:** Document the alternative ReadMe internal-reference syntax, cross-branch/custom-domain behavior, slug collisions, and generated heading-anchor rules.

## Operation gaps

**NEEDS_INPUT — Page API:** Confirm search filters, category/page enumeration, complete-body fields, create/update operations, concurrency protection, and writable metadata by page type. Add canonical operation pointers rather than a copied endpoint catalog.
