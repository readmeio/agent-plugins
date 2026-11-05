# ReadMe Plugin for Claude

This repository provides an official Claude plugin that bundles:
- **ReadMe Skills** that teach Claude how to work intelligently inside your ReadMe project
- The ReadMe MCP Server, which enabled Claude to securely search, read, and update your ReadMe projects

This plugin allows Claude users to install everything — Skills + MCP server — with **one click**.

---

## 🚀 Features
✅ Fully packaged ReadMe Skills
✅ Integrated ReadMe MCP Server

---

## Installation (Claude Code)
### 1. Add this plugin's marketplace
In Claude Code, run:
`/plugin marketplace add readmeio/agent-plugins`
### 2. Install the plugin
`/plugin install readme@readme`
### 3. Restart Claude Code
This ensures the MCP server starts correctly.

The **Code** tab of the Claude Desktop app is Claude Code, so these steps apply there too.

---

## Installation (Claude Desktop Chat, Cowork, claude.ai)
The Chat and Cowork tabs of Claude Desktop and claude.ai share one plugin system. There is no `/plugin` command; plugins are managed from the **Customize** menu. Plugins need a paid plan (Pro, Max, Team or Enterprise).
### 1. Open the Plugins page
Click **Customize** in the left sidebar, then **Plugins**. In Cowork, open the **Cowork** tab first.
### 2. Add this plugin's marketplace
Under **Personal plugins**, click **+** → **Add marketplace** and enter `readmeio/agent-plugins`.
### 3. Install the plugin
Find **readme** in the list and click **Install**. Open it afterwards to see its skills and the ReadMe connector; each one can be toggled individually.
### 4. Use it
Type `/` in a chat or click **+** to pick a ReadMe skill. No restart is needed. Click **Update** on the marketplace to pull new versions.

Notes:
- To sign in, open the plugin's **Connectors** tab, click **Connect** on the ReadMe connector, keep the default settings and sign in with your ReadMe account.
- On Team and Enterprise plans an owner may have turned off personal marketplaces. Ask them to add this marketplace under **Organization settings → Plugins**.
- Claude cannot install the plugin for you on these surfaces. If you paste a ReadMe skill into a chat before installing, it will walk you through the steps above.

---

## 🔑 Authentication
The plugin signs in to the ReadMe MCP server with OAuth. Your client asks you to sign in with your ReadMe account, either when the server connects or on the first request that needs it. One sign-in covers every project your account can reach.

The plugin never reads API keys or other credentials from your machine. If you need a project API key instead of OAuth, the `mcp-auth` skill walks you through adding it in your client's own MCP settings.

---

## Skills

| Skill | What it does |
| ----- | ------------ |
| `managing-readme-docs` | Shared reference for working on a ReadMe project: MCP routing, project sections, BiDi Sync, and confirming the active project and branch |
| `mcp-auth` | Installs the plugin and MCP server, and signs in when a request fails authentication |
| `setup-project` | Creates a new ReadMe project, for a signed-in user or together with a new account |
| `edit-page-content` | Creates and edits guides, API reference prose, changelogs, recipes and custom pages |
| `manage-navigation` | Organizes the sidebar: categories, page order, titles and URLs |
| `update-project-settings` | Views and updates project settings such as appearance, AI, SEO, access, domains and integrations |
