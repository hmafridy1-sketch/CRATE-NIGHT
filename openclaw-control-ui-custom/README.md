# Crate Night Jarvis — OpenClaw Control UI starter

A responsive black-and-gold static dashboard starter for the Crate Night Jarvis project.

## Current capabilities
- Responsive dashboard layout
- Task draft list held only in the current page session
- Local activity feed
- Gateway connection and security setup notes
- No API keys, tokens, or external libraries required

## Important limitations
This is a **frontend prototype**, not the official OpenClaw Control UI and not connected to an OpenClaw Gateway, Firebase, or an AI model. The task form only creates local drafts and does not run tasks. Gateway status shown here is illustrative and must not be treated as live system status.

Do not put Gateway tokens, Firebase service-account keys, or other secrets into this folder or browser JavaScript. Do not expose a Gateway publicly without the authentication and origin protections required by your installed OpenClaw version.

## Preview
Open `index.html` in a browser, or use GitHub Pages with the repository's existing deployment configuration if it is set up to publish this folder. A GitHub file commit alone does not publish a new website.

## Next integration steps
1. Verify the installed OpenClaw version and supported Control UI configuration on the actual Gateway host.
2. Review the official OpenClaw Control UI documentation for that version.
3. Implement and test authenticated Gateway communication using supported interfaces.
4. Add backend integration separately; never expose secrets in client-side code.

## Termux note
The repository file is not automatically copied into `$HOME/.openclaw/control-ui-custom` on your Android phone. Clone or download the repository on the device only after confirming the Termux environment and Git setup. Do not point `gateway.controlUi.root` at this prototype expecting it to replace the official UI without validating compatibility first.
