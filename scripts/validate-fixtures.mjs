import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const root = new URL("..", import.meta.url).pathname;
const schemas = {
  "modulora-item": JSON.parse(readFileSync(join(root, "schemas/v0/modulora-item.schema.json"), "utf8")),
  attestation: JSON.parse(readFileSync(join(root, "schemas/v0/attestation.schema.json"), "utf8")),
  evidence: JSON.parse(readFileSync(join(root, "schemas/v0/evidence.schema.json"), "utf8")),
};

const ajv = new Ajv2020.default({ allErrors: true, strict: true, strictRequired: false, strictTypes: false });
addFormats.default(ajv);
const validators = Object.fromEntries(
  Object.entries(schemas).map(([name, schema]) => [name, ajv.compile(schema)]),
);

export function runFixtures() {
  const manifest = JSON.parse(readFileSync(join(root, "fixtures/manifest.json"), "utf8"));
  const results = [];
  for (const [relPath, expectation] of Object.entries(manifest)) {
    const doc = JSON.parse(readFileSync(join(root, "fixtures", relPath), "utf8"));
    const validate = validators[expectation.schema];
    if (!validate) throw new Error(`unknown schema ${expectation.schema} for ${relPath}`);
    const valid = validate(doc);
    results.push({
      fixture: relPath,
      schema: expectation.schema,
      expected: expectation.valid,
      actual: valid,
      pass: valid === expectation.valid,
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
