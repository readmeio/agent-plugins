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
- The ReadMe connector runs from Anthropic's cloud, not your machine, so an API key exported in your shell is not picked up here. Read tools work on public projects. Write tools need an authenticated connection, which this plugin cannot provide on these surfaces yet.
- On Team and Enterprise plans an owner may have turned off personal marketplaces. Ask them to add this marketplace under **Organization settings → Plugins**.
- Claude cannot install the plugin for you on these surfaces. If you paste a ReadMe skill into a chat before installing, it will walk you through the steps above.

---

## 🔑 Authentication
The plugin connects to the ReadMe MCP server anonymously. Read tools work on public projects without any setup. Write tools such as `update-docs` need your project's **API key**, found under **Configuration → API Keys** in your ReadMe dashboard.

The plugin cannot read the key itself. In Claude Code, register the server once under the same name, which replaces the plugin's anonymous one:

```
export README_API_KEY=rdme_…
claude mcp add --scope user --transport http readme https://docs.readme.com/mcp --header 'Authorization: Bearer ${README_API_KEY}'
```

Keep the single quotes so Claude Code expands the variable at startup instead of writing the key into its config. Export `README_API_KEY` in the shell that launches Claude Code, then restart it. The skills keep working because the server name is unchanged.

One key maps to one project. To switch projects, change the exported key and restart.

Claude Desktop Chat, Cowork and claude.ai cannot take an API key, so the plugin stays read-only there.