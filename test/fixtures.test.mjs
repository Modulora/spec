import { test } from "node:test";
import assert from "node:assert/strict";
import { runFixtures } from "../scripts/validate-fixtures.mjs";

const results = runFixtures();

test("fixture suite is non-trivial", () => {
  assert.ok(results.length >= 15, `expected >=15 fixtures, found ${results.length}`);
  assert.ok(results.some((r) => r.fixture.startsWith("malicious/")), "malicious fixtures required");
});

for (const result of results) {
  test(`${result.fixture} is ${result.expected ? "valid" : "rejected"}`, () => {
    assert.equal(result.actual, result.expected, result.errors.join("; "));
  });
}
