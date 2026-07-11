# Specification Checklist

## Governance

- [ ] Add CONTRIBUTING.md and RFC process.
- [ ] Define semantic versioning and compatibility policy.
- [ ] Add CODEOWNERS for schema and security review.
- [ ] Publish generated documentation and changelog policy.

## Companion manifest v0

- [ ] Define component identity, namespace, owner, framework, and source model.
- [ ] Define open-source, external-commercial, private-team, and hosted-commercial states.
- [ ] Reference—not duplicate—the canonical shadcn install item.
- [ ] Define source repository, commit, license expression, and purchase-domain metadata.
- [ ] Define immutable version and canonical digest rules.

## Evidence and attestation v0

- [ ] Define owner, source, signature, scan, build, review, and revocation evidence.
- [ ] Document what every evidence state does and does not prove.
- [ ] Define canonical JSON serialization and digest scope.
- [ ] Define signing identity, key version, rotation, revocation, and cutoff semantics.
- [ ] Define external commercial “Source not assessed” requirements.

## Conformance

- [ ] Add JSON Schema validation.
- [ ] Add valid and invalid fixtures.
- [ ] Add oversized, traversal, Unicode-confusable, symlink, unsafe-target, and secret fixtures.
- [ ] Generate TypeScript types.
- [ ] Publish `@modulora/spec` through trusted publishing.
- [ ] Add cross-version conformance tests for core and CLI.

## API contract

- [ ] Define search, component, version, evidence, and revocation endpoints.
- [ ] Define error vocabulary and pagination.
- [ ] Define cache, ETag, and immutable artifact semantics.
- [ ] Generate and test a public API client.
