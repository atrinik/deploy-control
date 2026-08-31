# Contributing

Use a Conventional Commits pull-request title and run `npm ci` followed by
`npm run check`. Run `npm run deploy:dry-run` when changing Worker entrypoints
or bindings. Keep generated Wrangler declarations and `dist/` output
untracked, never commit credentials or host state, and preserve the capability,
approval, digest, retry, and rollback boundaries documented in `README.md` and
`docs/`.

The source is MIT licensed under this repository's `LICENSE`. Changes to
Cloudflare settings, GitHub App installation, repository permissions, or
operator secrets belong in the documented governance and manual-provisioning
paths; do not add live values to this repository.
