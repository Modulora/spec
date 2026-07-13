import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const root = new URL("..", import.meta.url).pathname;
const schemas = {
  "modulora-item": JSON.parse(readFileSync(join(root, "schemas/v0/modulora-item.schema.json"), "utf8")),
  attestation: JSON.parse(readFileSync(join(root, "schemas/v0/attestation.schema.json"), "utf8")),
  evidence: JSON.parse(readFileSync(join(root, "schemas/v0/evidence.schema.json"), "utf8")),
  taxonomy: JSON.parse(readFileSync(join(root, "schemas/v0/taxonomy.schema.json"), "utf8")),
};

const taxonomy = JSON.parse(readFileSync(join(root, "taxonomy/v0/taxonomy.json"), "utf8"));

/**
 * Taxonomy resolution per the spec: resolve aliases, then the id must
 * exist and (for new publishes) not be deprecated. Returns null when the
 * document declares no category — the manifest field is optional.
 */
function taxonomyCheck(doc) {
  const resolve = (id) => taxonomy.aliases[id] ?? id;
  const inList = (list, id) => list.some((t) => t.id === id);
  if (doc.category !== undefined) {
    const id = resolve(doc.category);
    if (!inList(taxonomy.categories, id)) return `unknown category "${doc.category}"`;
    if (taxonomy.deprecated.includes(id)) return `deprecated category "${doc.category}"`;
  }
  if (doc.componentType !== undefined) {
    const id = resolve(doc.componentType);
    if (!inList(taxonomy.componentTypes, id)) return `unknown componentType "${doc.componentType}"`;
    if (taxonomy.deprecated.includes(id)) return `deprecated componentType "${doc.componentType}"`;
  }
  return null;
}

const ajv = new Ajv2020.default({ allErrors: true, strict: true, strictRequired: false, strictTypes: false });
addFormats.default(ajv);
const validators = Object.fromEntries(
  Object.entries(schemas).map(([name, schema]) => [name, ajv.compile(schema)]),
);


/** Canonical file digest shared by web, CLI, and the hosted /r/ item. */
function contentDigest(files) {
  const parts = [...files]
    .map((file) => ({ path: String(file.path).trim(), content: String(file.content ?? "").replace(/\r\n/g, "\n") }))
    .sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0))
    .map((file) => `${file.path.length}:${file.path}\n${file.content.length}:${file.content}`);
  return createHash("sha256").update(parts.join("\n\0\n"), "utf8").digest("hex");
}

/** Cross-document contract that JSON Schema cannot express. */
function shadcnReferenceCheck(companion, item) {
  const ref = companion.shadcnItem;
  if (!ref) return "companion has no shadcnItem reference";
  if (item.$schema !== ref.schema) return `schema mismatch: ${item.$schema} != ${ref.schema}`;
  if (item.name !== ref.name || companion.name !== ref.name) return "companion/shadcn item name mismatch";
  if (item.type !== ref.type) return "companion/shadcn item type mismatch";
  if (!Array.isArray(item.files) || item.files.length === 0) return "shadcn item has no files";
  for (const file of item.files) {
    if (!file.path || !file.type) return "every shadcn file requires path and type";
    if (["registry:page", "registry:file"].includes(file.type) && !file.target) return `${file.type} file requires target`;
  }
  const digest = contentDigest(item.files);
  if (digest !== ref.contentSha256) return `content digest mismatch: ${digest} != ${ref.contentSha256}`;
  if (item.meta?.contentSha256 !== undefined && item.meta.contentSha256 !== digest) return "registry-item meta.contentSha256 mismatch";
  return null;
}

export function runFixtures() {
  const manifest = JSON.parse(readFileSync(join(root, "fixtures/manifest.json"), "utf8"));
  const results = [];
  for (const [relPath, expectation] of Object.entries(manifest)) {
    const doc = JSON.parse(readFileSync(join(root, "fixtures", relPath), "utf8"));
    const validate = validators[expectation.schema];
    if (!validate) throw new Error(`unknown schema ${expectation.schema} for ${relPath}`);
    const valid = validate(doc);
    let pass = valid === expectation.valid;
    let errors = valid ? [] : (validate.errors ?? []).map((e) => `${e.instancePath} ${e.message}`);
    // Optional second layer: taxonomy resolution (aliases → existence → deprecation).
    if (pass && expectation.taxonomy !== undefined) {
      const taxonomyError = taxonomyCheck(doc);
      const taxonomyOk = taxonomyError === null;
      pass = taxonomyOk === expectation.taxonomy;
      if (!pass) errors = [taxonomyError ?? "expected a taxonomy failure but resolution succeeded"];
    }
    // Optional paired hosted shadcn item: validates semantic fields and content digest.
    if (pass && expectation.shadcnFixture) {
      const item = JSON.parse(readFileSync(join(root, "fixtures", expectation.shadcnFixture), "utf8"));
      const referenceError = shadcnReferenceCheck(doc, item);
      const referenceOk = referenceError === null;
      const expectedReference = expectation.shadcn !== false;
      pass = referenceOk === expectedReference;
      if (!pass) errors = [referenceError ?? "expected shadcn reference failure but mapping succeeded"];
    }
    results.push({
      fixture: relPath,
      schema: expectation.schema,
      expected: expectation.valid,
      actual: valid,
      pass,
      errors,
    });
  }
  // The taxonomy document must satisfy its own schema.
  {
    const validate = validators.taxonomy;
    const valid = validate(taxonomy);
    results.push({
      fixture: "taxonomy/v0/taxonomy.json",
      schema: "taxonomy",
      expected: true,
      actual: valid,
      pass: valid === true,
      errors: valid ? [] : (validate.errors ?? []).map((e) => `${e.instancePath} ${e.message}`),
    });
  }
  // Every fixture file must be covered by the manifest.
  const listed = new Set(Object.keys(manifest));
  for (const dir of ["valid", "invalid", "malicious"]) {
    for (const file of readdirSync(join(root, "fixtures", dir))) {
      const rel = `${dir}/${file}`;
      if (!listed.has(rel)) results.push({ fixture: rel, pass: false, errors: ["missing from manifest.json"] });
    }
  }
  return results;
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const results = runFixtures();
  const failures = results.filter((r) => !r.pass);
  for (const r of results) {
    console.log(`${r.pass ? "PASS" : "FAIL"} ${r.fixture} (expected ${r.expected ? "valid" : "invalid"})`);
    if (!r.pass) for (const err of r.errors.slice(0, 3)) console.log(`      ${err}`);
  }
  console.log(`\n${results.length - failures.length}/${results.length} fixtures passed`);
  if (failures.length > 0) process.exit(1);
}
