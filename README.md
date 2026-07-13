# Modulora Specification

Open specifications for Modulora component manifests, provenance, trust evidence, and public API contracts.

## Purpose

Modulora uses the shadcn registry schema as its first install format. This repository defines companion documents that add creator ownership, source model, immutable release identity, commercial-link metadata, evidence, signatures, and revocation without breaking shadcn compatibility.

Current artifacts:

```text
schemas/v0/       item, taxonomy, attestation, and evidence schemas
taxonomy/v0/      canonical categories, component types, aliases
fixtures/         valid, invalid, and malicious conformance documents
rfcs/              companion-manifest and scoped-evidence semantics
```

Key semantics:

- [`RFC 0001`](./rfcs/0001-companion-manifest.md) — companion manifest model.
- [`RFC 0002`](./rfcs/0002-scoped-evidence-and-attestations.md) — limitation-aware evidence and the attestation signature boundary.

## Principles

- Framework-neutral data model; React launches first.
- Versioned, backwards-compatible schemas.
- Evidence states describe what was checked and their limitations.
- No single ambiguous “verified” badge.
- Public conformance fixtures include malicious and edge-case inputs.
- Trust-critical behavior remains open.

## Status

The v0 schemas, canonical taxonomy, and conformance fixtures are implemented. Public API contracts remain planned; see [`CHECKLIST.md`](./CHECKLIST.md).

## Build plan

- [`PLAN.md`](./PLAN.md) — self-contained scope, dependencies, milestones, acceptance criteria, security/test gates, and definition of done.
- [`CHECKLIST.md`](./CHECKLIST.md) — concise progress tracker.

## License

Apache License 2.0.
