# Fly.io deployment notes

If you deploy on Fly.io the remote builder runs `npx next build` inside the image context. This repo validates required environment variables at module import time (see `src/env.js`), which causes the build to fail on Fly unless the builder has those env vars available.

Two secure ways to handle this on Fly:

- Quick/test (not secret-safe): tell the builder to skip validation during the build by passing a build-arg.

  Example (local deploy):

  ```bash
  flyctl deploy --build-arg SKIP_ENV_VALIDATION=1 -a <app-name>
  ```

  Or add to `fly.toml` (beware this stores the value in plaintext):

  ```toml
  [build]
    args = { SKIP_ENV_VALIDATION = "1" }
  ```

- Recommended secure flow:

  1. Build the image in CI where you can inject secrets securely (GitHub Actions, etc.). Pass `SKIP_ENV_VALIDATION=1` for the build step if you don't want to expose secrets to the builder, then push the image to a registry.
  2. Deploy the prebuilt image to Fly with `flyctl deploy --image <registry>/<image>:tag -a <app-name>`.
  3. Provide runtime secrets to your Fly app (these are available to the app at runtime) with:

  ```bash
  flyctl secrets set DATABASE_URL="postgres://..." AUTH_SECRET="..." -a <app-name>
  ```

Notes:
- The repository includes a `Dockerfile` that accepts `--build-arg SKIP_ENV_VALIDATION=1` and sets it as `ENV` so the `@t3-oss/env-nextjs` validator will skip validation during build. This avoids exposing runtime secrets to the remote builder.
- If you prefer to have the builder perform validation, pass actual values as build args, but avoid committing secrets into `fly.toml` or source control; instead inject them from CI using `flyctl deploy --build-arg` or equivalent.
