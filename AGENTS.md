# AGENTS.md - Repository Automation Rules

## Documentation location policy

- Store all repository documentation files under `docs/`.
- Use subfolders that match document purpose:
  - `docs/getting-started/` for setup and onboarding docs.
  - `docs/guides/` for contributor and implementation guides.
  - `docs/testing/` for QA/testing documentation.
  - `docs/testing/postman/` for Postman collections and related assets.
  - `docs/reports/` for generated test reports and attachments.
- Do not create new standalone documentation files at repository root (except this `AGENTS.md` and the root `README.md` entrypoint).

## Documentation filename convention

- Use timestamp-first names: `YYYYMMDD-HHMMSS_slug.ext`.
- Timestamp source for migrated files: latest git commit datetime, with filesystem mtime fallback when git history is unavailable.
- Timestamp source for newly authored docs: current local datetime.
- Use lowercase kebab-case slugs.

## Required updates when adding/changing docs

- Update `docs/README.md` so the document index remains sorted by timestamp.
- Update any cross-links affected by renamed or moved documentation files.
- If the root `README.md` quick links become stale, refresh them.
