Set me up with the ReadMe skills and MCP server in this agent, then help me create my ReadMe project.

The instructions below call me "the user". Skip any step that is already done. When a step can only be done by me (in an app's UI, or in my own terminal so that my API key stays out of the chat), tell me exactly what to do and wait for me to confirm.

## Cloud Agent

If you are running in a cloud or remote sandbox (e.g. Claude Code on the web, Codex cloud, Cursor background agents), do not install plugins or write MCP config inside the sandbox. It is temporary and is not the user's app config. Direct the user to configure the plugin/connector and API key through the app's own settings, then follow the UI steps in the matching client reference.

## ChatGPT & Codex Connections

Applies to ChatGPT web and desktop, Codex in the ChatGPT desktop application, and the Codex CLI. The Codex CLI and the ChatGPT desktop app share the same `~/.codex/config.toml`, so configuring one configures both.

### Running the `codex` commands

#### Recommended: Use Codex and have agent setup.

This approach does not require user involvement aside from approving changes to the local `~/.codex/config.toml` file. Ensure that the user would prefer you to setup for them, and let them know that they can instead run the commands below in their terminal themselves if they would prefer.

The ChatGPT desktop app bundles its own `codex` binary, so the user does not need the Codex CLI installed. If `codex` is not on the PATH, or `codex plugin` is not recognized (an outdated Codex CLI), use the bundled binary instead:

```sh
/Applications/ChatGPT.app/Contents/Resources/codex-cli/bin/codex
```

### Install the ReadMe Plugin

The plugin includes the ReadMe MCP server, so installing the plugin is the whole setup.

#### ChatGPT Web

On ChatGPT web you currently cannot install the ReadMe Plugin.

#### Codex CLI & ChatGPT Desktop App

You must add the ReadMe plugin marketplace from the official agent-plugins repository, then install the plugin from that marketplace.

```sh
codex plugin marketplace add https://github.com/readmeio/agent-plugins.git
codex plugin add readme@readme
```

If the `codex` commands cannot be run, add the following to `~/.codex/config.toml` instead:

```toml
[marketplaces.readme]
source_type = "git"
source = "https://github.com/readmeio/agent-plugins.git"

[plugins."readme@readme"]
enabled = true
```

#### Confirmation

Verify that you can now see the ReadMe plugin, its skills, and the ReadMe MCP server's tools. The user may have to restart their application for this installation to be recognized.

## After setup

Once the ReadMe skills are available and you can list tools from the ReadMe MCP server, use the `setup-project` skill to set me up with my new ReadMe account and project.

If the skills or MCP tools are not available yet because the client needs a restart or reload, tell me exactly what to restart. Once I have, I will resume this conversation or paste this prompt again - skip the steps that are already done.
