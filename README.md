# Modulora Specification

Open specifications for Modulora component manifests, provenance, trust evidence, and public API contracts.

## Purpose

Modulora uses the shadcn registry schema as its first install format. This repository defines companion documents that add creator ownership, source model, immutable release identity, commercial-link metadata, evidence, signatures, and revocation without breaking shadcn compatibility.

Planned artifacts:

```text
schemas/
  modulora-item.schema.json
  attestation.schema.json
  evidence.schema.json
openapi/
  modulora.openapi.yaml
fixtures/
  valid/
  invalid/
  malicious/
```

## Principles

- Framework-neutral data model; React launches first.
- Versioned, backwards-compatible schemas.
- Evidence states describe what was checked and their limitations.
- No single ambiguous “verified” badge.
- Public conformance fixtures include malicious and edge-case inputs.
- Trust-critical behavior remains open.

## Status

The specification is not yet implemented. See [`CHECKLIST.md`](./CHECKLIST.md).

## License

Apache License 2.0.
