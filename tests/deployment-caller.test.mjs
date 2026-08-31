import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const gatewayRevision = 'f6319b2dbaf4c1f10230c6425967f34553acd61d';
const workflow = readFileSync('.github/workflows/deploy-api.yml', 'utf8');
const manifest = JSON.parse(readFileSync('.github/hetzner-release.json', 'utf8'));
const deploymentGuide = readFileSync('deploy/README.md', 'utf8');

test('production release uses the immutable shared OIDC caller', () => {
  assert.match(workflow, /on:\s*\n\s*workflow_run:/);
  assert.match(workflow, /workflows:\s*\["CI"\]/);
  assert.match(workflow, /branches:\s*\[main\]/);
  assert.match(workflow, /actions:\s*read/);
  assert.match(workflow, /contents:\s*read/);
  assert.match(workflow, /id-token:\s*write/);
  assert.match(
    workflow,
    new RegExp(
      `uses: mahmoudelfeelig/HetznerReleaseGateway/\\.github/workflows/release\\.yml@${gatewayRevision}`
    )
  );
  assert.match(workflow, /source_sha:\s*\$\{\{ github\.event\.workflow_run\.head_sha \}\}/);
  assert.match(workflow, /ci_run_id:\s*\$\{\{ github\.event\.workflow_run\.id \}\}/);
});

test('caller has no direct-host credential or command surface', () => {
  assert.doesNotMatch(workflow, /\$\{\{\s*secrets\./i);
  assert.doesNotMatch(
    workflow,
    /\b(?:ssh|scp|rsync)\b|\/opt\/|HETZNER_(?:HOST|USER|PATH|SSH_KEY)/i
  );
  assert.doesNotMatch(
    deploymentGuide,
    /\b(?:ssh|scp|rsync)\b|\/opt\/|HETZNER_(?:HOST|USER|PATH|SSH_KEY)|git\s+pull/i
  );
  assert.equal(existsSync('deploy/Caddyfile.example'), false);
  assert.equal(existsSync('deploy/caddy/docker-compose.yml.example'), false);
});

test('release manifest identifies only the reviewed RPS build contract', () => {
  assert.equal(manifest.version, 1);
  assert.equal(manifest.id, 'rps');
  assert.deepEqual(manifest.source, {
    repository: 'mahmoudelfeelig/RPS',
    default_branch: 'main',
    required_workflows: ['CI'],
  });
  assert.equal(manifest.release.strategy, 'source-build');
  assert.deepEqual(
    manifest.release.components.map(({ name }) => name),
    ['web', 'api']
  );
});
