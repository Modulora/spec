# RFC 0002: Scoped Evidence and Release Attestations v0.1

**Status:** Accepted for v0

## Principle

Modulora MUST NOT emit or display a generic `verified` or `secure` claim. A trust statement MUST identify:

1. the exact release (`itemRef` + `releaseDigest`),
2. what was checked (`type`),
3. the subject and coverage of that check,
4. who issued it and when, and
5. what the result does **not** prove (`limitations`) where omission could mislead.

Evidence informs a user; it does not endorse a component.

## Canonical registry-facing evidence

The canonical terms used by registry surfaces are:

- `publisher-identity` — the authenticated publisher identity was bound to the release.
- `domain-verified` — control of one exact domain was demonstrated. It does not prove source ownership or permanent control.
- `content-integrity` — the named release/files are bound to the release digest. It does not prove safety.
- `install-parity` — output fetched through one exact install command matched the covered release files. It does not prove runtime safety or future parity.
- `secret-scan` — covered paths were scanned by a named tool/version. It cannot prove absence of unknown or obfuscated secrets.

Other schema values support source linking, dependency/license/static scans, builds, human review, unassessed source, deprecation, and revocation. `owner-verified` remains readable for early v0 records; new issuers SHOULD use `publisher-identity`.

## Subject and coverage

`subject` is the exact thing the evidence concerns: a release, publisher, domain, install command, or source. `coverage` is the machine-readable boundary (paths, command, domain, or commit).

A consumer MUST NOT widen evidence beyond those bounds. In particular:

- domain evidence requires a `domain` subject;
- install parity requires an `install-command` subject and the exact command in coverage;
- expired evidence MUST be displayed as stale, not passed.

The legacy human-readable `scope` remains valid for v0 compatibility. Issuers SHOULD emit structured `subject`/`coverage` and MAY include `scope` as explanatory copy.

## Limitations

Limitations are REQUIRED for scans, build checks, human review, and `source-not-assessed`. A human review is a listing decision unless its scope explicitly says otherwise; it MUST NOT be presented as a security audit.

## Attestation signature boundary

`releaseDigest` identifies canonical manifest data and sorted file digests. It does not, by itself, bind publisher authorization or other attestation fields.

Therefore an attestation includes `attestationDigest`, computed over the canonical attestation statement excluding `signature` and `transparencyLog`. `signature.payload` MUST equal `attestationDigest`, and `signature.value` signs that digest. Consumers MUST reject a signature that declares any other payload.

A transparency-log reference is optional and does not replace signature validation.

## Digest independence

Evidence, taxonomy, moderation categorization, and display copy are outside the source-content digest. Updating evidence MUST NOT mutate an immutable release or change install parity.
