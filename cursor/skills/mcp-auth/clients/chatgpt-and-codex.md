# ChatGPT & Codex Connections

Applies to ChatGPT web and desktop, Codex in the ChatGPT desktop application, and the Codex CLI. The Codex CLI and the ChatGPT desktop app share the same `~/.codex/config.toml`, so configuring one configures both.

## Running the `codex` commands

### Recommended: Use Codex and have agent setup.

This approach does not require user involvement aside from approving changes to the local `~/.codex/config.toml` file. Ensure that the user would prefer you to setup for them, and let them know that they can instead run the commands below in their terminal themselves if they would prefer.

The ChatGPT desktop app bundles its own `codex` binary, so the user does not need the Codex CLI installed. If `codex` is not on the PATH, or `codex plugin` is not recognized (an outdated Codex CLI), use the bundled binary instead:

```sh
/Applications/ChatGPT.app/Contents/Resources/codex-cli/bin/codex
```

## Install the ReadMe Plugin

The plugin includes the ReadMe MCP server, so installing the plugin is the whole setup.

### ChatGPT Web

On ChatGPT web you currently cannot install the ReadMe Plugin.

### Codex CLI & ChatGPT Desktop App

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

### Confirmation

Verify that you can now see the ReadMe plugin, its skills, and the ReadMe MCP server's tools. The user may have to restart their application for this installation to be recognized.

