---
name: onboarding
description: Get a new customer from zero to a live ReadMe developer hub. Use when someone is new to ReadMe, asks what ReadMe is, wants to sign up, create a project, publish their first API reference or guide, or needs an API key for this plugin. Explains the product and walks the web-UI setup flow.
---

# ReadMe onboarding

> Onboarding endpoints are coming soon. Until then this skill only covers the web-UI flow and ReadMe basics.

## What ReadMe is

ReadMe hosts a developer hub for your API at `{subdomain}.readme.io` or a custom domain. One hub contains:

| Section | Content |
| --- | --- |
| Guides | Markdown pages in categories, with a sidebar |
| API Reference | Interactive docs generated from an OpenAPI or Swagger definition, with a Try It console |
| Recipes | Step-by-step code walkthroughs |
| Changelog | Release notes, shared across versions |
| Custom Pages | Free-form Markdown or HTML pages |

Guides, reference, recipes and custom pages live on a **branch** (a version such as `1.0` or `stable`). The changelog does not. Ask AI and the project's MCP server answer questions from the hub content. Metrics track page views, search, page quality, and, with SDK setup, API calls.

Plans: Starter (free), Pro, Enterprise. Enterprise supports child projects and Developer Metrics API reads.

## Quick Start

1. Sign up at `https://dash.readme.com/signup`.
2. Click **Create New Project**. Set a name, upload a logo (ReadMe picks brand colors from it), and choose the subdomain.
3. Add the API definition under **API Reference**: upload an OpenAPI file, import a URL, build one from scratch, or run `npx rdme openapi upload <file>` from a terminal. ReadMe validates the file and renders every endpoint.
4. Write the first guide under **Guides**. Use the AI Agent for a draft or the editor for a blank page. A "Getting Started" page is the usual first one.
5. Generate an API key at **Configuration → API Keys**, URL `https://dash.readme.com/project/{subdomain}/v{version}/api-key`.
6. Attach the key. The plugin's own `readme` server is anonymous and cannot read the key. The user registers a server with the same name at user scope, which replaces the plugin's one, then exports the key in the shell that starts the editor and restarts it. In Claude Code:

   ```
   export README_API_KEY=rdme_…
   claude mcp add --scope user --transport http readme https://docs.readme.com/mcp --header 'Authorization: Bearer ${README_API_KEY}'
   ```

   Keep the single quotes: Claude Code expands `${README_API_KEY}` when it starts, so the key never lands in a config file. In Codex: `codex mcp add readme --url https://docs.readme.com/mcp --bearer-token-env-var README_API_KEY`. Not possible in Claude Desktop Chat, Cowork or claude.ai; see the section below.
7. Verify: `readme:execute-request` with spec title `ReadMe API`, `GET https://api.readme.com/v2/projects/me`. A 200 with the project name means the plugin is wired to the right project. A 500 titled `An unknown error has occurred.` means the key is missing or wrong; go back to step 5.

After step 7, load the `readme-api` skill for anything else in the project.

## Doing it with Claude in Chrome

Steps 1 to 5 are all browser work. If the Claude in Chrome extension is connected (`mcp__claude-in-chrome__*` tools are available), offer to drive them in the user's own browser instead of only listing the steps: open the signup page, create the project, upload the API definition, and open the API Keys page. Let the user type credentials and payment details themselves. Steps 6 and 7 stay in the terminal.

## When you cannot install anything yourself

In Claude Desktop Chat, Cowork and claude.ai you have no shell and cannot add a marketplace, install a plugin or edit MCP config. Do not attempt it and do not ask the user to run commands. If the `readme:*` tools are missing, the user has to install the plugin by hand. Give them these steps exactly:

1. Click **Customize** in the left sidebar, then **Plugins**. In Cowork, open the **Cowork** tab first.
2. Under **Personal plugins**, click **+** → **Add marketplace** and enter `readmeio/agent-plugins`.
3. Find **readme** in the list and click **Install**, then start a new chat so the tools load.

Plugins need a paid Claude plan. On Team and Enterprise an owner may have disabled personal marketplaces, in which case they add it under **Organization settings → Plugins**.

Once installed, the ReadMe connector on these surfaces is read-only: `readme:search`, `readme:fetch` and the endpoint tools work on public projects, but there is no way to supply `README_API_KEY`, so steps 6 and 7 of the Quick Start do not apply and write tools such as `readme:update-docs` fail. Say so before the user tries. For creating or updating pages, offer to continue in Claude Code, Codex or Cursor with the server registered as in step 6.

## Reading the docs meanwhile

Use `readme:search` for a question, then `readme:fetch` with the returned id. Useful pages:

| Id | Page |
| --- | --- |
| `main/quickstart` | Three-step setup |
| `main/creating-a-project` | Project settings on creation |
| `main/openapi-upload-and-management` | Upload, sync, and re-sync an OpenAPI file |
| `main/branches` | How branches and versions work |
| `ref:main/intro-to-the-readme-api` | API v2 overview and auth |
| `main/sdks` | Metrics SDKs for API logs |
