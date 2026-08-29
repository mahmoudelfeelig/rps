# Production Release Contract

RPS delegates production releases to the shared, reusable release workflow. This repository contains only the application build contract; live routing, runtime values, deployment policy, rollback state, and host access remain in the private deployment controller.

## Automated Release

[`deploy-api.yml`](../.github/workflows/deploy-api.yml) runs only after a successful `CI` push workflow on `main`. It calls the shared release workflow at an immutable commit and grants only `actions: read`, `contents: read`, and `id-token: write`.

The short-lived OIDC identity proves which repository, branch, workflow run, and source commit requested the release. GitHub receives no production server credentials, and this repository must not add any host-address, login, private-key, or host-path variables.

[`hetzner-release.json`](../.github/hetzner-release.json) is the public build manifest. It defines the RPS image components and their Docker build inputs. Changes to that manifest, the caller workflow, or the immutable shared-workflow revision require review just like production code.

## Runtime Boundary

[`docker-compose.prod.yml`](docker-compose.prod.yml) and [`.env.example`](.env.example) document application-level service and environment requirements. They are not instructions for mutating production directly. The private controller owns the live service definition, injects runtime values, verifies the requested release, and records deployment and rollback evidence.

Uploaded media remains persistent state and must never be replaced or pruned by a code release. Database credentials, signing values, mail credentials, and other runtime secrets belong only in the controller-managed runtime environment.

## Verification

Run `npm run test:deployment` to validate the immutable caller, least-privilege permissions, manifest identity, and absence of direct-host deployment hooks. Application CI runs the same check before a release can be requested.
