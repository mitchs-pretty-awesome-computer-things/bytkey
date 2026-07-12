## Agent skills

### Issue tracker

Issues live in GitHub Issues for `mitchs-pretty-awesome-computer-things/bytkey`; external PRs are not a triage surface. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical roles map to the default label strings (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context repo: read `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

### Code style

Project-specific TypeScript conventions (array syntax, discriminated union tags, etc.) live in `docs/code-style.md`. Read it before writing or reviewing code.

### Pull request titles

Use [Conventional Commits](https://www.conventionalcommits.org/) prefixes for pull request titles. We squash-merge, so the PR title becomes the final commit message. Common prefixes:

- `feat:` — new feature or capability
- `fix:` — bug fix
- `docs:` — documentation-only changes
- `style:` — formatting, missing semicolons, etc.; no code change
- `refactor:` — code change that neither fixes a bug nor adds a feature
- `perf:` — performance improvement
- `test:` — adding or correcting tests
- `chore:` — build process, dependency updates, or other tooling changes
- `ci:` — continuous integration changes

Keep the summary concise and in the imperative mood.
