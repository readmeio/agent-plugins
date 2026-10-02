# ReadMe page types

Load when selecting a page type, resolving its URL, or applying type-specific authoring rules.

| Type | Authoring concern | Public path |
| --- | --- | --- |
| Guides | Narrative docs organized into categories | `/docs/{slug}` |
| API Reference | Distinguish descriptive prose from an OpenAPI operation/definition change | `/reference/{slug}` |
| Changelogs | Release-note content and publication state | NEEDS_INPUT — confirm route and scope |
| Discussions | Distinguish a topic from a reply and confirm available write operations | NEEDS_INPUT — confirm route and MCP/API support |
| Recipes | Step-by-step code walkthroughs | NEEDS_INPUT — confirm current availability, route, and format |
| Custom pages | Standalone content outside the standard guide/reference organization | NEEDS_INPUT — confirm route and supported body formats |

Sidebar nesting does not add path segments to a page slug. Use the actual page URL returned by ReadMe when available.

## API Reference

For an imported API, identify the authoritative OpenAPI source before changing endpoint definitions; keep prose edits distinct from spec updates. Read [OpenAPI upload and management](https://docs.readme.com/main/docs/openapi-upload-and-management) for that branch.

**NEEDS_INPUT — API authoring:** Add canonical reference-page documentation, manual versus imported endpoint behavior, editable prose fields, and preservation/re-import rules. Decide whether observed endpoint-creation failures justify a separate `creating-endpoints` skill; keep it deferred until then.

## Other page types

**NEEDS_INPUT — Type pointers:** Add maintained ReadMe documentation URLs and creation/edit/publication constraints for each type above. Verify existing guide/reference path conventions across supported project generations.

**NEEDS_INPUT — Discussion and recipe scope:** Confirm whether these belong in current supported workflows; narrow the skill description if they are unavailable.

Scope and Git-backed behavior belong in [project workflow](../PROJECT-WORKFLOW.md), rather than a second scope map here.
