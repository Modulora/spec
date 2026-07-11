# Specification Build Plan

> Repository: `Modulora/spec` · Status: approved planning baseline

## Mission

Define the open, framework-neutral contracts that make Modulora components portable, attributable, verifiable, and safe to consume. Preserve shadcn registry compatibility while adding ownership, source model, provenance, evidence, signature, and revocation semantics through companion documents.

## Ownership boundary

This repository owns:

- `modulora-item` companion schema;
- attestation and evidence schemas;
- canonical serialization and digest/signature rules;
- source models and trust vocabulary;
- public API/OpenAPI contracts and generated types;
- valid, invalid, malicious, and compatibility fixtures;
- conformance/versioning policy.

It does not own shadcn's schema, application persistence, UI, authorization, scanning implementations, signing-key custody, installer filesystem behavior, or cloud entitlements.

## Consumers

| Consumer | Needs |
|---|---|
| Core | Validation, generated types, API contract, evidence semantics |
| CLI | Canonical parsing, signatures, revocation, malicious fixtures |
| Cloud | Private/commercial extension fields through public contracts |
| Integrations | Stable search/component/version/evidence response formats |

## Design principles

1. Reference the canonical shadcn item; do not fork or duplicate it.
2. Keep framework compatibility explicit and extensible.
3. Separate listing visibility from source availability.
4. Describe evidence and limitations rather than certify safety.
5. Make published versions immutable and revocation additive.
6. Reject ambiguous canonicalization and unsafe parsing behavior.
7. Version every contract and document compatibility guarantees.

## Proposed repository shape

```text
rfcs/
  0001-companion-manifest.md
  0002-attestation.md
  0003-evidence.md
schemas/
  v0/modulora-item.schema.json
  v0/attestation.schema.json
  v0/evidence.schema.json
openapi/
  v0/modulora.openapi.yaml
packages/typescript/
fixtures/
  valid/
  invalid/
  malicious/
  compatibility/
docs/
  trust-vocabulary.md
  canonicalization.md
  versioning.md
```

## Milestone 0 — Governance and tooling

### Deliverables

- RFC template and decision process.
- Semantic versioning/compatibility policy for schemas and API.
- JSON Schema validation and formatting tooling.
- CI for schema validation, generated types, fixtures, links, license, and secrets.
- CODEOWNERS requiring spec and security review.

### Acceptance

- Every normative change begins with an RFC or recorded decision.
- Generated artifacts are reproducible and CI detects drift.
- Breaking changes require a versioned path and migration notes.

## Milestone 1 — Companion manifest v0

### Required fields

- Schema version and item identifier.
- Namespace, component slug, immutable release version.
- Framework and compatibility declarations.
- Canonical shadcn item URL/digest.
- Owner identity and source reference.
- Source model: open-source, external-commercial, private-team, hosted-commercial.
- Visibility: public, unlisted, private.
- SPDX license expression or explicit commercial/custom state.
- Purchase-domain/link metadata for external commercial listings.
- Support, deprecation, and revocation references.

### Acceptance

- Open-source and external-commercial examples validate without proprietary extensions.
- Visibility and source model cannot produce contradictory states.
- Unknown fields follow a documented forward-compatibility policy.
- Size/depth/string/item limits are normative.

## Milestone 2 — Attestation v0

### Deliverables

- Canonical JSON representation and byte-level digest scope.
- File digest records and exact source commit.
- Publisher authorization identity and time.
- Platform signing identity, key ID, algorithm, and signature.
- Key rotation, revocation, compromised-key cutoff, and release revocation.
- Optional transparency-log reference.

### Acceptance

- Core and CLI produce/verify identical canonical digests across platforms.
- Property tests cover field ordering, Unicode normalization, numbers, timestamps, and duplicate keys.
- Invalid/unknown/revoked signatures fail closed.
- Hash integrity and signing identity are explicitly distinguished.

## Milestone 3 — Evidence v0

### Evidence types

- owner verified;
- source linked;
- artifact signed;
- secret/dependency/license/static scan;
- build/typecheck checked;
- human reviewed;
- source not assessed;
- deprecated/revoked.

Every evidence record includes exact release digest, status, scope, timestamp, tool/policy version, issuer, limitations, and superseding state.

### Acceptance

- A generic “verified”/“secure” result cannot be represented without a named evidence type.
- External-commercial fixtures require source-not-assessed where source is unavailable.
- Evidence expiry/supersession rules are machine-readable.
- UI copy can be generated without overstating what a result proves.

## Milestone 4 — Public API contract v0

### Deliverables

- Search, creator, component, version, manifest, attestation, evidence, and revocation endpoints.
- Pagination, filtering, sorting, stable errors, rate-limit headers, ETags, cache control.
- Immutable artifact URL semantics.
- Generated TypeScript client/types.

### Acceptance

- Core provider and generated client pass contract tests.
- CLI can implement discovery and verification without importing core code.
- Public/private visibility and authorization behavior are described separately.

## Milestone 5 — Conformance suite

### Fixture classes

- Valid open-source and external-commercial items.
- Multiple frameworks for future extensibility.
- Unsupported schema versions and unknown fields.
- Oversized/deep documents and duplicate keys.
- Absolute/traversal/null/device paths.
- Symlink/hardlink/case-collision scenarios.
- Unicode confusables and namespace spoofing.
- Unsafe targets, scripts, lifecycle hooks, secrets, and malformed dependencies.
- Invalid, unknown, expired, rotated, revoked, and mismatched signatures.

### Acceptance

- Core and CLI run the same fixture suite.
- Fixture expected outcomes are versioned and documented.
- Third-party implementations can run conformance without private services.

## Package and release plan

- Publish `@modulora/spec` with schemas and generated types.
- Publish through npm trusted/OIDC publishing with provenance.
- Protect release tags and require spec/security reviewers.
- Generate checksums, SBOM, changelog, and migration notes.
- Keep fixtures available directly from GitHub releases.

## Test contract

- JSON Schema meta-validation.
- Golden canonicalization vectors across runtimes.
- Property/fuzz tests for parsers and canonicalization.
- Backwards/forwards compatibility matrix.
- OpenAPI lint, generated-client compile, provider/client contract tests.
- Secret scan and active-content checks for fixtures/docs.

## Explicit non-goals

- Replacing or extending shadcn's schema in place.
- Defining visual quality or subjective component scores.
- Claiming scans prove safety.
- Encoding payment-provider details.
- Implementing application authorization or installer writes.

## Definition of done

Version 0 is ready when:

- the companion, attestation, and evidence schemas are published;
- canonicalization vectors agree in core and CLI;
- malicious fixtures are comprehensive enough for independent review;
- API contracts generate a working client;
- compatibility and migration policies are public;
- no private Modulora service is required for conformance.

## Handoffs

- Core implements schemas and API provider only after v0 release candidate.
- CLI consumes exact schema versions and fixture releases.
- Cloud proposes commercial/private additions through public RFCs when they affect shared contracts.
