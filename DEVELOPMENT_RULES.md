# Crate Night Development Rules

## CI/CD and Build Stability

These rules apply to Crate Night and Jarvis repository workflows.

### 1. Deterministic runner selection
- Use an explicit GitHub-hosted runner label such as `ubuntu-24.04` for production CI and release workflows.
- Do not use `ubuntu-latest` in production/release workflows when reproducible builds are required.
- Treat the `-latest` labels as moving aliases. During an image migration, different runner instances may receive the new image at different times; do not assume a rollout is atomic.
- Change the pinned OS only through a reviewed migration.

### 2. Runtime and toolchain pinning
- Declare and pin required runtime versions (for example Node.js, Java/JDK, Python, and .NET) in workflow configuration and/or project version files.
- Do not rely on whichever runtime happens to be preinstalled on a hosted runner.
- For Java projects, select the JDK explicitly with `actions/setup-java`; verify the selected JDK against the Gradle/Maven wrapper and plugins.
- Do not assume Java 17 or Java 25 is the correct project version based only on a runner image README or issue discussion. Confirm the actual toolchain compatibility first.
- Keep package-manager lockfiles and use deterministic install commands (for example `npm ci` when a valid npm lockfile is committed).

### 3. GitHub Actions supply-chain controls
- Prefer pinning third-party Actions to a verified full commit SHA. If a major-version tag is used for readability, document the exception and keep it updated.
- Grant workflow permissions using least privilege; set explicit `permissions:` at workflow or job level.
- Never print, commit, or expose secrets in logs, artifacts, or repository files.

### 4. Required validation before deployment
- Run the project's clean dependency-install and production build steps in CI.
- Run relevant tests, linting, type checks, and security checks where configured.
- Deployment must depend on successful required checks; failed or skipped required validation must block production deployment.
- Review build logs and confirm the exact runner image and runtime versions when diagnosing failures.

### 5. OS image migration procedure
- Keep the current production runner pinned while evaluating a new Ubuntu LTS image.
- Add a separate non-production compatibility job using the candidate runner (for example `ubuntu-26.04`) before migration.
- Validate native dependencies, permissions, caches, system utilities, Docker tooling, and application packaging.
- Check for OS-specific changes such as runner account/home-directory changes and `sudo` implementation/behavior changes; do not assume old paths or flags remain valid.
- Compare build and test results on both pinned images, document any required fixes, and migrate only after review.
- After migration, monitor CI runs and retain a straightforward rollback to the previous pinned image.

### 6. Workflow review checklist
- [ ] Runner OS is explicitly pinned for production/release jobs.
- [ ] Runtime and toolchain versions are explicitly selected.
- [ ] Dependency lockfiles are committed and deterministic install commands are used.
- [ ] Actions are pinned/reviewed and workflow permissions are least-privilege.
- [ ] Required tests and production build pass before deployment.
- [ ] Candidate OS migration has a separate compatibility test and documented approval.

## Source and scope

This policy was adopted following the discussion of GitHub Actions runner-image migration in `actions/runner-images#14748` (Ubuntu LTS image transition, November 2026). The issue discussion is a trigger for these general stability controls, not a substitute for checking the current official runner-image documentation and the project's actual toolchain requirements.

Reference: https://github.com/actions/runner-images/issues/14748
