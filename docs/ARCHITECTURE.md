# Architecture

## Control-plane boundary

The Cloudflare Worker is an internet-facing control plane. It authenticates
GitHub events, validates target policy, records desired state, and reports
operator-safe status. It never runs Docker, compiles untrusted source, or
opens a game-port connection to an agent.

A Durable Object is the single coordinator for each target. Its durable state
must include the desired artifact, the accepted deployment ID, the latest
agent-reported status, and replay/idempotency records. Important state must not
depend on in-memory Worker or Durable Object lifetime.

The initial target is `home-main`, a Linux host behind home NAT. The host agent
opens an outbound authenticated WebSocket and keeps it reconnectable. The
control plane sends the newest desired deployment over that connection. When
the agent is offline, the desired deployment remains pending and is delivered
after the next authenticated registration/reconnect.

## Event sources

The Classic repository owns a trusted image-publication workflow. It runs only
after the canonical Classic validation gate succeeds on `main`, builds the
image from the exact validated commit, and publishes an immutable
commit-addressed image with provenance and an SBOM. The control plane accepts
only successful completion of that workflow.

An automatic staging target may accept every successful `main` image. An
official target must require an explicit administrator request, an exact image
digest, and a separate approval state. A normal source push or pull-request
event must never directly deploy to the official target.

## Agent contract

Each agent has a stable non-secret ID, a local private key, a capability set,
and an explicitly registered target policy. Enrollment uses a one-time
operator-issued code or equivalent authenticated handoff. Subsequent messages
are authenticated and bound to the target and deployment ID.

The protocol must support:

- registration and capability readback;
- reconnect and desired-state reconciliation;
- idempotent `accepted`, `started`, `healthy`, `failed`, and `rolled_back`
  transitions;
- bounded heartbeats and last-seen state;
- one active deployment per target;
- stale-job rejection and rapid-merge coalescing; and
- a status path that cannot issue commands.

Deployment data is declarative. The agent maps an allowlisted operation to a
local implementation. It must not accept arbitrary commands, environment
variables, image registries, paths, or unit names from the network.

## Classic deployment lifecycle

The home agent performs the following bounded operation:

1. Verify the requested target, repository, commit, and digest.
2. Pull the exact server image from GHCR.
3. Back up the target's persistent `server-data`.
4. Gracefully replace the Compose service on UDP port 1731.
5. Wait for the image health check and verify the expected process/heartbeat.
6. Report the exact deployed digest and health result.
7. Restore the previous image reference, and restore data when required by a
   format-changing rollback, if the new generation is unhealthy.

The stable 5.34.x server will be a different target with UDP port 1730 and a
different state directory. No target shares account, character, or QUIC
identity data.

## Future builder and GPU targets

Build targets and deploy targets have different capabilities. A builder that
executes PR code must not have production state, deployment credentials, or
the Docker socket used by an official server. Hardware benchmark jobs should
run from reviewed benchmark artifacts, return bounded results, and be
identified by hardware/driver metadata without exposing unnecessary host data.

The control plane may coordinate these jobs, but the actual build and GPU work
remains on the registered hardware host.
