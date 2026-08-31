# Atrinik deployment control

[![Check](https://github.com/atrinik/deploy-control/actions/workflows/check.yml/badge.svg)](https://github.com/atrinik/deploy-control/actions/workflows/check.yml)

Cloudflare control-plane and registered-agent infrastructure for Atrinik
builds, deployments, hardware validation, and operator-approved releases.

This repository is currently a seed. It defines the intended boundaries and
initial Worker entrypoint; it does not yet control a live server, accept
production credentials, or execute arbitrary remote commands.

## Purpose

The control plane is intended to coordinate machines that are behind NAT or
otherwise lack stable inbound addresses. A small agent opens an authenticated
outbound WebSocket to the Cloudflare Worker. The Worker records desired state
and delivers jobs to connected agents without requiring a public address at
the agent site.

The first target is a persistent Classic server on UDP port 1731 that receives
the latest successfully validated `main` server image. Later targets may
include an explicitly approved official server, isolated build hosts, and
real-hardware GPU qualification agents.

## Architecture

```text
GitHub App webhook
        |
        v
Cloudflare Worker ---> per-target Durable Object ---> outbound WSS agent
                                                          |
                                                          v
                                               Docker, builds, or benchmarks
```

- The Worker authenticates GitHub webhook deliveries and applies repository,
  workflow, branch, and conclusion policy.
- A Durable Object owns one target's desired release, current status,
  connection, idempotency records, and approval state.
- Agents initiate the network connection, reconnect after interruptions, and
  reconcile desired state when they come back online.
- Agents accept only fixed, capability-scoped operations. Payloads never
  become shell commands, image repositories, or filesystem paths.
- Classic CI owns the tested image build. The control plane coordinates a
  digest-pinned image; it is not a replacement for GitHub validation.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and
[docs/OPERATIONS.md](docs/OPERATIONS.md) for the design and operational
boundaries.

## Development

Use the pinned Node and npm versions:

```sh
npm ci
npm run check
npm run deploy:dry-run
```

The initial Worker exposes only a credential-free `/healthz` response. Cloudflare
bindings, agent registration, GitHub App handling, and deployment operations
must be introduced through reviewed changes with tests and explicit security
boundaries.

## Related repositories

- [`atrinik/classic`](https://github.com/atrinik/classic) owns the Classic
  source, validation, and server image build.
- [`atrinik/github-settings`](https://github.com/atrinik/github-settings) owns
  organization repository, Actions, App, and secret-name governance.
- [`atrinik/atrinik`](https://github.com/atrinik/atrinik) owns workspace
  registration and cross-repository coordination.
- [`atrinik/observatory`](https://github.com/atrinik/observatory) may consume
  operator-safe build and deployment status in the future.
- [`atrinik/metaserver-worker`](https://github.com/atrinik/metaserver-worker)
  remains the owner of game-server discovery and rendezvous; it does not
  become a deployment command channel.

## License

This repository is MIT licensed. See [LICENSE](LICENSE).
