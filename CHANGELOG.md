# Changelog

## [2.0.0] - 2026-02-26

### Breaking Changes

- **ESLint v9 required** — ESLint peer dependency raised from `^8.3.0` to `^9.39.3`. ESLint v8 is no longer supported.
- **Flat config only** — ESLint v9 drops legacy `.eslintrc.*` support by default. Configure the plugin using the new flat-config format (`eslint.config.js`).
- **`context.getFilename()` removed** — The rule now uses `context.filename` (the ESLint v9 API). If you have a custom fork of this rule relying on `context.getFilename()`, update it accordingly.
- **`@typescript-eslint/parser` v8 required** — The parser peer dependency is raised to `^8.56.1` (the first major series with ESLint v9 peer support). Parser v5 / v6 / v7 are no longer compatible.

### Highlights

- Full compatibility with **ESLint v9** (flat config + ESM-safe dependency tree).
- `no-cross-feature-imports` rule now declares an explicit **JSON Schema** (`meta.schema`). ESLint v9 validates rule options against the schema and rejects unknown properties; this catches misconfigured rule options early.
- All **14 test cases** in the `no-cross-feature-imports` test suite now run (a stale `only: true` artifact was silently skipping 13 of them).

### What's Changed

#### Dependencies

| Package | Before | After |
|---|---|---|
| `eslint` | `^8.3.0` | `^9.39.3` |
| `@types/eslint` | `^7.28.0` | `^9.6.1` |
| `@types/estree` | `^0.0.50` | `^1.0.8` |
| `@types/node` | `^16.7.10` | `^18.19.130` |
| `@typescript-eslint/parser` | `^5.5.0` | `^8.56.1` |
| `jest` | `^27.4.3` | `^29.7.0` |
| `ts-jest` | `^27.x` | `^29.4.6` |
| `@types/jest` | `^27.x` | `^29.5.14` |

#### Rule: `no-cross-feature-imports`

- Replaced removed `context.getFilename()` with `context.filename` ([ESLint v9 migration guide](https://eslint.org/docs/latest/use/migrate-to-9.0.0)).
- Added `meta.schema` describing the rule's option object so ESLint v9 can validate options at lint time.

#### Tests

- Updated `RuleTester` constructor to the ESLint v9 flat-config shape:
  ```ts
  // before (ESLint v8)
  new RuleTester({ parser: require.resolve('@typescript-eslint/parser') })

  // after (ESLint v9)
  new RuleTester({ languageOptions: { parser: require('@typescript-eslint/parser') } })
  ```
- Removed `only: true` from the "allow import styles" test case — it was a leftover dev artifact that silently skipped all other test cases.

## [1.1.1] and earlier

See git history for previous changes.
