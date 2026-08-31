# Operations

This repository does not provision a live target by itself. Cloudflare
bindings, GitHub App installation, secrets, agent enrollment, server data, and
production target approval are separate operator-owned state.

## Intended first target

The first host agent will manage one Classic mainline server:

```text
target: home-main
transport: outbound WSS to the control-plane Worker
game transport: UDP 1731
state: /srv/atrinik/main/server-data
image: digest-pinned ghcr.io/atrinik/classic-server
```

The state directory must be backed up before image replacement. It contains
game data and the persistent QUIC identity; it must never be copied to the
stable 5.34.x target.

## NAT and availability

The agent initiates the TLS/WebSocket connection, so the home router does not
need to forward an HTTP webhook port and the host does not need a static IP or
hostname. The agent reconnects with bounded exponential backoff and sends a
heartbeat to keep the connection observable.

The Durable Object retains the latest desired state while the agent is offline.
On reconnect, the agent reports its current digest and the control plane sends
the desired state only when reconciliation requires it.

## Secrets

Keep these outside Git:

- GitHub App private key and webhook secret;
- Cloudflare account and binding identifiers where treated as sensitive;
- per-agent private keys and enrollment material;
- GHCR read credentials when an image is private; and
- all server passwords and mutable game data.

Use Worker secrets, host file permissions, and a dedicated service identity.
Never put secret values in issue bodies, logs, fixtures, or deployment
messages.

## Recovery

Every deployment has an idempotency key and an exact image digest. The agent
must preserve the previous known-good reference until the new container is
healthy. A failed deployment reports diagnostics and leaves the previous
target available. Data-format changes require a restorable state backup; a
binary-only rollback is not automatically safe after an incompatible data
migration.

An administrator can retry an exact job or redeliver a GitHub event. A missed
event must not be repaired by accepting an arbitrary image tag or by executing
an unreviewed command on the host.
