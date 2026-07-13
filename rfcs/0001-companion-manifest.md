# RFC 0001 — Companion Manifest, Attestation, and Evidence v0

- Status: accepted for v0
- Author: @jal-co
- Created: 2026-07-11

## Context

Modulora distributes components using the shadcn registry format for install payloads. The shadcn schema deliberately does not carry ownership, source-model, provenance, commerce, signature, or trust semantics. Modulora needs those semantics without forking shadcn's schema.

## Proposal

Three versioned companion documents accompany every release:

| Document | Schema | Purpose |
|---|---|---|
| `modulora-item.json` | `schemas/v0/modulora-item.schema.json` | Identity, ownership, framework, source model, visibility, license, purchase link |
| `attestation.json` | `schemas/v0/attestation.schema.json` | Immutable release digest, file digests, source commit, publisher authorization, platform signature |
| `evidence.json` | `schemas/v0/evidence.schema.json` | Scoped, timestamped trust records with explicit limitations |

### Design decisions

1. **Reference, don't fork.** `shadcnItem` identifies the upstream schema (`https://ui.shadcn.com/schema/registry-item.json`), canonical hosted URL, item `name`/`type`, and the Modulora file-content digest. The shadcn document remains the install payload; the companion does not duplicate files, dependencies, CSS variables, environment variables, docs, or registry dependencies.
2. **Source model and visibility are separate axes.** A public listing may have externally purchased source.
3. **Conditional requirements.** `external-commercial` requires a verified `purchase` destination; `open-source` and `private-team` require a `source` repository and commit; `open-source` requires an SPDX license expression.
4. **No generic trust label.** Evidence records use twelve named types with `passed/failed/warning/asserted/not-applicable` statuses. Scan and build records must declare `toolVersion` and `limitations`.
5. **Immutability.** Attestations bind a `releaseDigest` computed over the canonicalized manifest and sorted file digests (`modulora-json-c14n-0`: UTF-8, sorted keys, no insignificant whitespace, NFC strings). Any change is a new version.
6. **Strict parsing.** All objects use `additionalProperties: false`, bounded lengths/counts, and path patterns rejecting absolute paths, traversal, and doubled separators.
7. **React-only enum for launch.** `framework` will gain `vue`/`svelte` additively; unknown-value handling is a consumer conformance requirement.
8. **Cross-document conformance.** JSON Schema validates each document independently. Consumers MUST additionally enforce that companion `name`, `shadcnItem.name`, and fetched item `name` match; `shadcnItem.type` matches fetched `type`; page/file entries include `target`; and the fetched files reproduce `contentSha256`.
9. **One content digest profile.** `modulora-content-v0` is the web/CLI/registry contract: normalize CRLF to LF; trim and codepoint-sort paths; encode each pair as `<pathLength>:<path>\n<contentLength>:<content>`; join pairs with LF-NUL-LF; SHA-256 the UTF-8 bytes. The hosted item MAY repeat the result at `meta.contentSha256`; that meta field is excluded from its own digest.

## Non-goals

- Defining scan implementations or safety guarantees.
- Key custody, distribution, or transparency-log operation (owned by infra).
- Payment or entitlement payloads (future RFC before hosted commerce).

## Compatibility

`schemaVersion: "0"` documents may change until v1. From v1, changes follow semantic versioning: additive optional fields are minor; anything else is a new major schema version with migration notes.

## Security considerations

The schemas are the first line of defense against malicious registry payloads. Fixture classes in `fixtures/` include traversal, oversized, confusable, and unsafe-target cases, and CI must keep every fixture's expected outcome true.
