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
6. Attach the key. The plugin's own `readme` server is anonymous and cannot read the key. The user registers a server with the same name, which replaces the plugin's one, then exports the key in the shell that starts Codex and starts a new session. In Codex:

   ```
   export README_API_KEY=rdme_…
   codex mcp add readme --url https://docs.readme.com/mcp --bearer-token-env-var README_API_KEY
   ```

   Codex reads the variable at startup, so the key never lands in a config file. The ChatGPT desktop app shares Codex's config, so this registration also covers Codex sessions there. In Claude Code the equivalent is `claude mcp add --scope user --transport http readme https://docs.readme.com/mcp --header 'Authorization: Bearer ${README_API_KEY}'`. Not possible in ChatGPT web; see the section below.
7. Verify: `readme:execute-request` with spec title `ReadMe API`, `GET https://api.readme.com/v2/projects/me`. A 200 with the project name means the plugin is wired to the right project. A 500 titled `An unknown error has occurred.` means the key is missing or wrong; go back to step 5.

After step 7, load the `readme-api` skill for anything else in the project.

## Doing it with the ChatGPT browser

Steps 1 to 5 are all browser work. In the ChatGPT desktop app or ChatGPT web, offer to drive them with `@Browser` instead of only listing the steps: open the signup page, create the project, and open the API Keys page. The built-in browser has its own profile, so the user signs in to ReadMe there and types credentials and payment details themselves; ChatGPT asks before submitting forms. It cannot upload files, so for step 3 import the OpenAPI definition by URL or run `npx rdme openapi upload <file>` from Codex. Codex CLI and the IDE extension have no browser; list the steps there. Steps 6 and 7 stay in the terminal.

## When you cannot install anything yourself

In a ChatGPT chat, desktop or web, you have no shell and cannot add a marketplace, install a plugin or edit MCP config. Do not attempt it and do not ask the user to run commands in the chat. If the `readme:*` tools are missing, the user has to install the plugin by hand. Give them these steps exactly:

- ChatGPT desktop app: open the **Plugins** tab and click **Add marketplace**. Enter `readmeio/readme-plugins` as the source, leave the Git ref as `main` and the sparse paths empty, then click **Add marketplace**. Install **readme** from the new marketplace and start a new chat so the tools load.
- ChatGPT web: only the plugin directory is available. Until the ReadMe plugin is listed there, send the user to the desktop app or to Codex CLI.

Once installed, the ReadMe connector in a chat is read-only: `readme:search`, `readme:fetch` and the endpoint tools work on public projects, but ChatGPT cannot take an API key, so steps 6 and 7 of the Quick Start do not apply and write tools such as `readme:update-docs` fail. Say so before the user tries. For creating or updating pages, offer to continue in Codex with the server registered as in step 6.

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
