# Atrinik deployment-control guide

## Scope

- This repository owns the Cloudflare control plane and registered host-agent
  contracts for build, deployment, and hardware-validation targets.
- It does not own Classic source, server state, game discovery, or production
  credentials.
- `atrinik/classic` owns the tested server image; this repository consumes an
  exact image digest after an authorized event.

## Safety boundaries

- Agents connect outbound over authenticated WebSocket; never expose Docker's
  socket or an unrestricted shell endpoint.
- Webhook input is untrusted until its signature, repository, workflow, branch,
  conclusion, and delivery identity are validated.
- Job messages use fixed capability names and validated data. Never interpolate
  payload values into shell commands, paths, image names, or unit names.
- Keep persistent game data outside the repository and never share state between
  separate server generations or targets.
- Builders that execute PR code must be isolated from deploy agents and secrets.
- Keep app private keys, webhook secrets, agent private keys, join passwords,
  Cloudflare identifiers, and tokens out of Git, tests, logs, and issue bodies.

## Validation

```sh
npm ci
npm run check
npm run deploy:dry-run
git diff --check
```

Use immutable action references, least-privilege workflow permissions, and
reviewed Cloudflare bindings. Changes to repository or App policy also require
coordination with `atrinik/github-settings`; changes to workspace ownership
require coordination with `atrinik/atrinik`.

## Delivery

Use Conventional Commit pull-request titles. Keep deployment, registration,
approval, retry, rollback, and offline-agent behavior covered by deterministic
tests. Do not enable a live target or add an official-server target merely by
merging a code change; those are separate operator-approved provisioning and
authorization steps.
