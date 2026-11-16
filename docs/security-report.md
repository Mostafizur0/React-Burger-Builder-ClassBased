# Security Report — React Burger Builder

**Scope:** dependency audit and application source review of this repository.
**Date of audit:** 2026-01 (working tree at plan revision 1, commit `cf48e57` as the "before" baseline).
**Tooling:** `npm audit` (npm 11.18.0 / Node v25.6.1), ESLint, manual source review against `git show HEAD:<path>`, Firebase Emulator Suite for rule enforcement.

---

## 1. Scope and method

### In scope

| Area | Method | Evidence |
|---|---|---|
| Direct and transitive dependencies | `npm audit --audit-level=high`, `npm audit --json` | Section 5, verbatim output |
| Application source (`src/`) | Manual review of every changed file, compared against the pre-modernization tree at `HEAD` | Section 3 |
| Realtime Database access control | Review of `firebase.database.rules.json` | Section 3 |
| Served response headers | Review of `docker/nginx.conf` and `firebase.json` | Section 3 |
| Container hardening | Review of `Dockerfile`; runtime verification of the built image | Section 3 |
| Secret exposure | Repository-wide grep for key patterns and token-in-URL patterns | Section 2 |

### Out of scope

- The security of Google's Firebase platform itself, and of the target project's console-side configuration (API-key restrictions, App Check, billing).
- Any hosted deployment of this app. Nothing in this repository was pushed to a production host, and the GitHub Actions workflow in `.github/workflows/ci.yml` has not been executed on GitHub-hosted runners.
- Penetration testing, dynamic application security testing, and manual code review by a second party.
- The `coverage/` and `build/` directories as shipped artifacts.

### Grep patterns used against `src/`

`axios`, `AIza`, `?auth=`, `identitytoolkit`, `withErrorHandler`, `asyncComponent`, `componentWillMount`, `localStorage`

**Result: zero matches in `src/`.** The pre-modernization tree returned matches for all of these — the "before" column in Section 3 names each one with its original file and line.

---

## 2. Dependency findings

### 2.1 Version change table

Every row was read from the committed lockfiles (`git show HEAD:package-lock.json` for "before", the current `package-lock.json` for "after") and from `npm audit --json`.

| Package | Version before | Advisory class | Version after | Status |
|---|---|---|---|---|
| `axios` | 0.16.2 | high (prototype pollution, SSRF, ReDoS advisories in this range) | **removed** — replaced by the Firebase SDK | **Fixed** |
| `sw-precache-webpack-plugin` | 0.11.4 | high (via `request@2.82.0` → `shelljs` / `tough-cookie`) | **removed** — `workbox-webpack-plugin@6.6.0` via `react-scripts@5` | **Fixed** |
| `request` | 2.82.0 | high (`shelljs` command injection, `tough-cookie` prototype pollution) | **removed** | **Fixed** |
| `webpack` | 3.5.1 | high (multiple advisories; `webpack-dev-middleware` prototype pollution) | `5.112.2` | **Fixed** |
| `webpack-dev-server` | 2.7.1 | high (directory traversal, `eval` XSS) | `4.15.2` — still flagged, see 2.2 | **Partially fixed** |
| `webpack-dev-middleware` | 1.12.0 | high (prototype pollution) | `7.4.6` (forced via `overrides`) | **Fixed** |
| `postcss` | 6.0.12 | moderate (`postcss` 6/7 line; `css-select` / `nth-check` prototype pollution) | `8.5.33` (forced via `overrides`) | **Fixed** |
| `nth-check` | 1.0.1 | moderate (ReDoS) | `2.1.1` (forced via `overrides`) | **Fixed** |
| `glob-parent` | 2.0.0 | high (ReDoS) | `6.0.2` | **Fixed** |
| `micromatch` | 2.3.11 | moderate (ReDoS) | `4.0.8` | **Fixed** |
| `braces` | 1.8.5 | high (uncontrolled resource consumption) | `3.0.3` | **Fixed** |
| `minimatch` | 3.0.4 | moderate (ReDoS) | `3.1.5` | **Fixed** |
| `node-fetch` | 1.7.3 | high (exposure of sensitive info) | **removed** | **Fixed** |
| `json5` | 0.5.1 | moderate (prototype pollution) | `2.2.3` | **Fixed** |
| `loader-utils` | 1.1.0 | high (prototype pollution) | `2.0.4` | **Fixed** |
| `serialize-javascript` | 1.4.0 | moderate (XSS) | `7.1.4` (forced via `overrides`) | **Fixed** |
| `trim-newlines` | 1.0.0 | moderate (ReDoS) | **removed** | **Fixed** |
| `cross-spawn` | 5.1.0 | high (ReDoS) | `7.0.6` | **Fixed** |
| `find-up` | 2.1.0 | high (ReDoS) | `4.1.0` | **Fixed** |
| `inflight` | 1.0.6 | moderate (memory leak) | `1.0.6` (present; no published fix at the pinned line) | **Accepted** |
| `rimraf` | 2.6.2 | high (path traversal via crafted glob) | `3.0.2` | **Fixed** |
| `yargs` | 7.1.0 | high (prototype pollution) | `16.2.2` | **Fixed** |
| `ansi-regex` | 2.1.1 | high (ReDoS) | `5.0.1` | **Fixed** |
| `redux` | 3.7.2 | moderate (prototype pollution in `applyMiddleware` / `bindActionCreators`) | `4.2.1` | **Fixed** |
| `react-router-dom` | 4.2.2 | moderate (open redirect / XSS in `<Redirect>`) | `5.3.4` | **Fixed** |
| `react` | 16.0.0 | moderate (multiple XSS and prototype-pollution advisories) | `18.3.1` | **Fixed** |
| `enzyme` | 3.1.0 | low (abandoned; pulls in an old `cheerio`) | **removed** — replaced by React Testing Library | **Fixed** |
| `express` | 4.15.5 | high (open redirect / XSS in `res.redirect`) | `4.22.3` | **Fixed** |
| `@grpc/grpc-js` | 1.9.16 | **high** (unauthorized certificates, error-message leakage) | `1.14.7` (forced via `overrides`) | **Fixed** |
| `@tootallnate/once` | 1.0.0 | moderate (incorrect control flow scoping) | `2.0.1` (forced via `overrides`) | **Fixed** |
| `deepmerge` | — | low (prototype poisoning of returned objects) | `4.3.1` (forced via `overrides`) | **Accepted — no fix available**, see 2.2 |
| `uuid` | — | moderate (v3.0.0–v3.4.0 insufficient entropy) | `11.1.1` (forced via `overrides`) | **Fixed** |
| `@firebase/app`, `@firebase/auth`, `@firebase/database` | 0.16.6 / 1.13.10 / 1.1.6 | not flagged by audit, but declared `node >= 24.12.0`, which broke the CRA 5 build | consolidated into `firebase@11.10.0` | **Fixed** |
| `firebase` (umbrella) | — | high (transitively pulled `@grpc/grpc-js@1.9.16` via `@firebase/firestore`) | `11.10.0` + `@grpc/grpc-js` override | **Fixed** |
| `jest` | 20.0.4 | low (dev dependency; `jest` < 25.2.0-alpha.86 advisories) | `27.5.1` | **Fixed** |
| `react-dev-utils` | 4.0.1 | low | `12.0.1` | **Fixed** |
| `svgo` | 1.2.0 | moderate (prototype pollution) | `2.8.4` (forced via `overrides`) | **Fixed** |
| `postcss-normalize` | — | moderate | `10.0.1` | **Fixed** |

### 2.2 Remaining findings — residual, not fixed

`npm audit` reports **15 vulnerabilities (13 low, 2 moderate)**. Zero high, zero critical. Every remaining finding is inside the `react-scripts@5.0.1` development-tool dependency chain and is **not** present in the shipped production bundle.

| Advisory | Severity | Affected package | Why it is not fixed |
|---|---|---|---|
| [GHSA-gcqx-w48m-w2h4](https://github.com/advisories/GHSA-gcqx-w48m-w2h4) — `deepmerge` `mergeObject()` allows prototype poisoning of returned objects | low | `deepmerge@4.3.1` | This is the **newest published version** of `deepmerge`. No fixed release exists. The package is pinned at `4.3.1` via `overrides`. It is reached through `jest-config`, `fork-ts-checker-webpack-plugin`, `@rollup/plugin-node-resolve` and `@svgr/plugin-svgo` — all build-time only. |
| [GHSA-9jgg-88mc-972h](https://github.com/advisories/GHSA-9jgg-88mc-972h), [GHSA-4v9v-hfq4-rm2v](https://github.com/advisories/GHSA-4v9v-hfq4-rm2v), [GHSA-79cf-xcqc-c78w](https://github.com/advisories/GHSA-79cf-xcqc-c78w), [GHSA-mx8g-39q3-5c79](https://github.com/advisories/GHSA-mx8g-39q3-5c79), [GHSA-f5vj-f2hx-8m93](https://github.com/advisories/GHSA-f5vj-f2hx-8m93), [GHSA-m28w-2pqf-7qgj](https://github.com/advisories/GHSA-m28w-2pqf-7qgj) — source code exposure, cross-origin exposure, HMR WebSocket interception, CSRF on internal dev endpoints, DoS via malformed `Host`/`Origin` | moderate | `webpack-dev-server@4.15.2` (via `react-scripts@5.0.1`) | `react-scripts` pins `webpack-dev-server` to the 4.x line. The only audit-suggested fix is `npm audit fix --force`, which **downgrades `react-scripts` to `0.0.0`** and breaks the build toolchain. `webpack-dev-server` runs only in `npm start` on the developer machine; it is not installed into, or served by, the production container image. |

**Impact assessment.** A moderate-severity `webpack-dev-server` advisory is exploitable only by someone who can reach a developer's dev server and induce them to browse to a hostile page. That is a developer-workstation risk, not a production risk. `deepmerge`'s low-severity advisory requires the attacker to control the *shape* of a merged object, which in this chain means build configuration, not user input.

**Acceptance decision.** These are accepted with the reasoning above rather than claimed as fixed. The CI gate `npm audit --audit-level=high` (in `.github/workflows/ci.yml`) fails the build on any high or critical advisory, so this residual floor cannot silently regress upward.

### 2.3 Other dependency hygiene

- `package-lock.json` is **lockfileVersion 3** and is committed, so CI and Docker use `npm ci` and resolve an identical tree to local development.
- `.npmrc` sets `legacy-peer-deps=false`. This was changed deliberately: with `legacy-peer-deps=true`, `ajv-keywords@5` was bound to the hoisted root `ajv@6` (which ESLint requires), and the production build died with `Cannot find module 'ajv/dist/compile/codegen'`.
- `overrides` in `package.json` force `postcss`, `nth-check`, `serialize-javascript`, `svgo`, `webpack-dev-middleware`, `@grpc/grpc-js`, `deepmerge`, `uuid` and `@tootallnate/once` to versions without the high-severity advisories.
- `.github/dependabot.yml` opens weekly npm and GitHub Actions update PRs, labelled `dependencies` and `security`.

---

## 3. Application findings

Each finding below was confirmed by reading the original file at `HEAD` and the current file in the working tree.

### 3.1 Hardcoded Firebase API key in source — **Fixed**

- **Before:** `src/store/actions/auth.js` at `HEAD` hardcoded the key in two request URLs:
  ```js
  let url = 'https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=AIzaSyB5cHT6x62tTe-g27vBDIqWcwQWBSj3uiY';
  ```
  `src/axios-orders.js` at `HEAD` hardcoded the demo project host `https://react-burger.firebaseio.com/`.
- **After:** `src/services/firebase.js` reads all six values from `process.env.REACT_APP_FIREBASE_*`. No key literal appears in `src/`. The key now in `.env` belongs to the `burger-builder-951c6` project.
- **Note on severity:** a Firebase *web* API key is public by design — it is embedded in every page served by a Firebase app and cannot be kept secret. The real risk was the combination of a hardcoded key with no API-key restrictions and no database rules. Mitigation is documented in `.env.example` and Section 4.

### 3.2 ID token appended to the request URL — **Fixed**

- **Before:** `src/store/actions/order.js` at `HEAD`:
  ```js
  axios.post('/orders.json?auth=' + token, orderData)
  ```
  and
  ```js
  const queryParams = '?auth=' + token + '&orderBy="userId"&equalTo="' + userId + '"';
  ```
  A bearer token in a query string leaks into browser history, proxy logs, and server access logs.
- **After:** `src/store/actions/order.js` uses the Firebase SDK (`push`, `get`, `query`, `orderByChild`, `equalTo`). The SDK attaches credentials in the `Authorization` header, not the URL. The comment at the top of `purchaseBurger` states this explicitly.
- **Verification:** grep for `?auth=` across `src/` returns zero matches.

### 3.3 Legacy `identitytoolkit/v3` REST endpoints — **Fixed**

- **Before:** `src/store/actions/auth.js` at `HEAD` called `identitytoolkit/v3/relyingparty/signupNewUser` and `identitytoolkit/v3/relyingparty/verifyPassword` directly.
- **After:** `src/store/actions/auth.js` uses `createUserWithEmailAndPassword`, `signInWithEmailAndPassword`, `signOut` and `onAuthStateChanged` from `firebase/auth`.
- **Verification:** grep for `identitytoolkit` across `src/` returns zero matches.

### 3.4 Open demo database rules — **Fixed**

- **Before:** `firebase.database.rules.json` **did not exist** at `HEAD`, and `firebase.json` at `HEAD` contained only a `hosting` block with no `database` section. The demo project's orders were readable and writable by anyone.
- **After:** `firebase.database.rules.json` denies by default (`.read: false`, `.write: false` at the root) and grants:
  - `ingredients` — world-readable, never client-writable.
  - `orders` — readable only via `query.orderByChild == 'userId' && query.equalTo == auth.uid`; writable only by a signed-in user whose `userId` matches `auth.uid`.
  - `$orderId` — validated to require `ingredients`, `price` and `userId`, with `price` constrained to a number.
  - `firebase.json` now references the rules file through the `database.rules` key, so `firebase deploy --only database` applies them.
- **Verification:** the rules file is present in the working tree and referenced from `firebase.json`.
- **Correction found during the browser pass:** the rules were missing an `".indexOn": "userId"` declaration on the `orders` node. A Realtime Database query on an unindexed child is rejected outright — the emulator returned `Index not defined, add ".indexOn": "userId", for path "/orders"`. The order was written correctly, but the user's own order list could never be read back, so the `/orders` page silently showed nothing. The index is now declared and the read is verified to return the user's own orders while still denying reads for an unauthenticated caller.
- **Rules enforcement verified against the emulator.** An unauthenticated root read, an unauthenticated `orders` read and an unauthenticated `orders` write are each rejected with `401 Permission denied`, while `ingredients` stays publicly readable. A signed-in user can write an order carrying their own `auth.uid` and read it back through the `userId` query.

### 3.5 Axios interceptor swallowed rejections — **Fixed**

- **Before:** `src/hoc/withErrorHandler/withErrorHandler.js` at `HEAD` registered a response interceptor whose error handler returned nothing:
  ```js
  this.resInterceptor = axios.interceptors.response.use( res => res, error => {
      this.setState( { error: error } );
  } );
  ```
  The rejection was absorbed, and the `catch` block in the calling action never ran — so a failed request produced no user-visible error.
- **After:** the HOC is deleted. `src/components/UI/ErrorModal/ErrorModal.js` reads the error slice from the Redux store and renders it in a dismissible modal; each action now dispatches its own failure action.
- **Verification:** grep for `withErrorHandler` across `src/` returns zero matches.

### 3.6 `err.response.data.error` throws `TypeError` on network errors — **Fixed**

- **Before:** `src/store/actions/auth.js` at `HEAD`:
  ```js
  .catch(err => {
      dispatch(authFail(err.response.data.error));
  });
  ```
  When the request fails at the network layer there is no `response` object, so `err.response.data` throws a `TypeError` inside the `catch` handler. The user saw nothing, and the real error was masked by the secondary failure.
- **After:** `src/store/actions/auth.js` normalises the failure:
  ```js
  const toAuthError = (error) => ({
      message: (error && error.message) || 'Authentication failed. Please try again.'
  });
  ```
  `src/store/actions/order.js` uses fixed, user-safe messages (`'The order could not be saved.'`, `'Your orders could not be loaded.'`) rather than leaking raw SDK error objects into the UI.

### 3.7 Deprecated `componentWillMount` in the error HOC — **Fixed**

- **Before:** `src/hoc/withErrorHandler/withErrorHandler.js` at `HEAD` used `componentWillMount` and `componentWillUnmount`.
- **After:** the HOC is deleted. `src/hoc/asyncComponent/asyncComponent.js` — which also used `componentDidMount` for a lazy import — is deleted in favour of `React.lazy` + `Suspense` in `src/App.js`.
- **Verification:** grep for `componentWillMount` and `asyncComponent` across `src/` returns zero matches.

### 3.8 Vulnerable transitive dependency chain — **Fixed**

The pre-modernization tree pulled in `sw-precache → request/shelljs`, `webpack` 3.5.1, `webpack-dev-server` 2.7.1, `postcss` 6/7, `axios` 0.16.2, `redux` 3.7.2, `react-router-dom` 4.2.2 and `react` 16.0.0. All are replaced by `react-scripts@5.0.1`, React 18.3.1, React Router 5.3.4, Redux 4.2.1 and the Firebase SDK 11.10.0. See Section 2.1 for the per-package table.

### 3.9 `removeIngredient` added the price instead of subtracting it — **Fixed**

- **Before:** `src/store/reducers/burgerBuilder.js` at `HEAD`:
  ```js
  totalPrice: state.totalPrice + INGREDIENT_PRICES[action.ingredientName],
  ```
  inside `removeIngredient`. Removing an ingredient *increased* the total.
- **After:** `src/store/reducers/burgerBuilder.js` subtracts:
  ```js
  totalPrice: state.totalPrice - INGREDIENT_PRICES[action.ingredientName],
  ```
- **Why it is a security-adjacent finding:** a client-side price that cannot be decreased is a price-tampering primitive. Any client can edit the price that is submitted to the database, so the server-side price must always be recomputed from the authoritative ingredient list. **This project still trusts the client-submitted price** — see Residual Risk R4.

### 3.10 No security headers on the served app — **Fixed**

- **Before:** `firebase.json` at `HEAD` had a `hosting` block with **no** `headers` array.
- **After, two deployment paths:**
  - `firebase.json` hosting `headers` for `source: "**"`: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, and a `Content-Security-Policy` that pins `default-src 'self'`, allows `script-src`/`script-src-elem` only to `'self'` and `*.firebasedatabase.app`, allows `connect-src` only to `*.firebaseio.com` (http and wss), `*.firebaseapp.com`, `identitytoolkit.googleapis.com`, `securetoken.googleapis.com` and `*.firebasedatabase.app` (http and wss), and sets `object-src 'none'` and `frame-ancestors 'none'`.
  - `docker/nginx.conf` adds the same set plus `Strict-Transport-Security: max-age=31536000; includeSubDomains` and `form-action 'self'`.
- **Verification:** `scripts/verify-container.sh` asserts every header is present against the running image. All assertions passed.

### 3.11 Service worker precached a stale bundle — **Fixed**

- **Before:** `src/index.js` at `HEAD` ended with `registerServiceWorker();` and `src/registerServiceWorker.js` existed, so a cached bundle could be served after a deploy.
- **After:** `src/registerServiceWorker.js` is deleted and the call is removed. `src/index.js` uses `createRoot` from `react-dom/client` inside `StrictMode`.
- **Verification:** grep for `serviceWorker` and `registerServiceWorker` across `src/` returns zero matches.

### 3.12 Hardened container image — **Fixed**

- **Before:** no `Dockerfile` existed.
- **After:** a two-stage build — `node:18-alpine` builds, `nginxinc/nginx-unprivileged:1.25-alpine` serves. The runtime image runs as uid/gid 101 (non-root), listens on 8080, sets `GENERATE_SOURCEMAP=false` so source maps never enter the shipped image, and defines a `HEALTHCHECK` against `/healthz`. `docker/nginx.conf` denies dotfiles (`location ~ /\. { deny all; }`), which is what returns HTTP 403 for `/.env`. Image size is ~76.1 MB.
- **Verification:** the container was built, started, asserted by `scripts/verify-container.sh` (all assertions passed), and removed.

### 3.13 Unbounded ingredient read left the builder spinning forever — **Fixed**

- **Before:** `initIngredients` in `src/store/actions/burgerBuilder.js` awaited the Realtime Database read with no timeout:
  ```js
  return get(ref(database, 'ingredients'))
  ```
  The Firebase SDK holds a websocket open, so a request against an unreachable or misconfigured project never settles — it neither resolves nor rejects. The builder therefore stayed on its spinner indefinitely.
- **Observed:** against the dead demo project the websocket accepted the upgrade and then sent `Firebase error. Please ensure that you have the URL of your Firebase Realtime Database instance configured correctly.` instead of closing the connection, so the promise stayed pending. The container served a permanent "Loading..." screen. A network-level error would have been caught by the existing `.catch`; a *silent* server error was not.
- **After:** the read is raced against a 5-second timeout, and both the timeout and the rejection paths fall back to `DEFAULT_INGREDIENTS` and record a user-visible message:
  ```js
  const timeout = new Promise((resolve, reject) => {
      setTimeout(() => reject(new Error('Ingredient request timed out.')), INGREDIENTS_TIMEOUT_MS);
  });
  return Promise.race([get(ref(database, 'ingredients')), timeout])
  ```
- **Verification:** the container now renders the full builder with local defaults, reports "Ingredients could not be loaded from the server.", and the price updates correctly. A unit test covers the never-settling case.

### 3.14 The ID token was read from the wrong object after sign-in — **Fixed**

- **Before (introduced by the T4 migration):** `src/store/actions/auth.js` treated the value resolved by the Firebase SDK as a `User`:
  ```js
  .then(user => user.getIdToken().then(idToken => ({ idToken, uid: user.uid })))
  ```
  `createUserWithEmailAndPassword` and `signInWithEmailAndPassword` resolve with a **`UserCredential`**, not a `User`. `UserCredential` has no `getIdToken()` — the `User` lives on its `user` property — so the call threw `TypeError: user.getIdToken is not a function` on every successful sign-in.
- **Impact:** the sign-in *itself* succeeded and Firebase had established the session, but the token never reached the Redux store. `state.auth.token` stayed `null`, so `App` treated the visitor as anonymous even though the SDK held a live session, and the user saw the raw SDK error in the modal instead of being signed in.
- **After:** the credential is unwrapped first:
  ```js
  .then(credential => credential.user)
  .then(user => user.getIdToken().then(idToken => ({ idToken, uid: user.uid })))
  ```
- **Verification:** reproduced in the browser against the Auth emulator — the error appeared verbatim on the page. After the fix the session is restored on reload (the navigation shows **Orders** and **Logout**, and the button reads **ORDER NOW** rather than **SIGN UP TO ORDER**), an order written through the app carries the correct `auth.uid` as `userId`, and `/orders` reads it back. A regression test (`should read the token from the credential user, not the credential`) pins the credential→user contract.

### 3.15 The emulator could run under a different project than the app — **Fixed**

- **Before:** `.firebaserc` still held the placeholder `ENTER_YOUR_PROJECT_ID_HERE`, and the local emulator was started under an unrelated project id (`demo-burger`). The Realtime Database binds security rules to the namespace derived from the **project id**, so the rules in `firebase.database.rules.json` were never applied to the namespace the app actually used — every read and write was permitted.
- **After:** `.firebaserc` pins `burger-builder-951c6`, matching `.env.local` and `.env`, and the README documents that the emulators must be started under that same project id.
- **Verification:** with the emulators running under the correct project, an unauthenticated root read, an unauthenticated `orders` read and an unauthenticated `orders` write are all rejected with `401 Permission denied`. Under the mismatched project id the same requests returned `200`.

---

## 4. Residual risks

| ID | Risk | Why it remains | Mitigation |
|---|---|---|---|
| R1 | **The committed Firebase project is not publicly reachable.** The `burger-builder-951c6` hosting endpoint returns 404 and its Realtime Database answers `401 Permission denied` to an unauthenticated read, and the Identity Toolkit rejects the key with `CONFIGURATION_NOT_FOUND`. The config ships in `.env` as the default. | The project is not provisioned with a publicly reachable Identity Platform configuration or open database rules. | The app degrades safely: `src/services/firebase.js` checks `isFirebaseConfigured`, and `initIngredients` falls back to `DEFAULT_INGREDIENTS` when the backend is unreachable or unconfigured. The full stack is verified against the local Emulator Suite, which enforces the same rules. Supply your own project via `.env.local`. |
| R2 | **A Firebase web config is public by design.** | It is embedded in the browser bundle by the platform's own design; hiding it is impossible and provides no security. | Real protection lives in (a) the Realtime Database rules in `firebase.database.rules.json` and (b) console-side API-key restrictions (HTTP referrer allowlist + required APIs). Both are documented in `.env.example` and the README. |
| R3 | **The database rules are only as good as their deployment.** They exist in the repository but were never deployed to the target project. | Deployment requires Firebase CLI credentials for a specific project. | `firebase deploy --only database` applies them. CI does not deploy. The rule file denies by default at the root, so an undeployed project is protected by the platform's default deny rather than by these rules. |
| R4 | **The order price is computed and submitted by the client.** | `purchaseBurger` sends the price the browser calculated. A tampered client can post an arbitrary price. | Orders are scoped to the authenticated user by `userId` and `auth.uid`, so one user cannot alter another's order. The *price* itself is not server-verified. A production deployment should recompute the price from an authoritative ingredient table server-side (Cloud Function) before accepting an order. |
| R5 | **13 low and 2 moderate advisories remain in the `react-scripts` chain.** | Detailed in Section 2.2. `deepmerge` has no fixed release; `webpack-dev-server` can only be "fixed" by downgrading `react-scripts` to `0.0.0`. | Both are build-time only and absent from the production image. The `npm audit --audit-level=high` CI gate prevents the residual floor from growing. |
| R6 | **The CI image push trusts `GITHUB_TOKEN`.** | The `docker` job pushes to `ghcr.io` using the workflow's automatic token with `packages: write`. | The workflow sets `permissions: contents: read` at the top level and grants `packages: write` only to the `docker` job. The `security` job additionally requests `security-events: write`. The `audit` job has no write permission at all. Push is skipped on pull requests. |
| R7 | **The CI workflow has never been executed on GitHub-hosted runners.** | It exists in `.github/workflows/ci.yml` but has not run in this repository. | The same four gates were executed locally and passed: lint, 100% coverage, production build, audit, plus a real Docker build and container verification. The `docker` job's exact steps were reproduced by `scripts/verify-container.sh`. |
| R8 | **`inflight@1.0.6` remains in the tree** with a moderate memory-leak advisory. | No fixed release is published on the pinned line. | Build-time only; not in the production bundle. |
| R9 | **The emulator and the app must agree on the project id.** Starting `firebase-tools emulators:start` under a different `--project` silently binds the rules to a different namespace and leaves the data unprotected. | The Realtime Database derives its namespace from the project id, and the emulator only applies rules to the namespace it was started for. | `.firebaserc` pins `burger-builder-951c6`, matching `.env.local` and `.env`, and the README documents the requirement. The mismatch was observed directly: the same unauthenticated write that returns `401` under the correct project returned `200` under a mismatched one. |
| R10 | **The price of a loaded ingredient stack starts at the base price.** `setIngredients` resets `totalPrice` to the base price rather than deriving it from the loaded counts, so a stack seeded with non-zero counts shows those counts next to the base price until the user edits the stack. | Inherited from the original implementation and not a security defect. | The order itself records the price the user actually built, so the two agree for any stack the user constructs. A server-side recomputation (R4) would remove the ambiguity entirely. |

---

## 5. Post-fix re-scan

Command: `npm audit --audit-level=high` — **exit code 0**.

Full audit (`npm audit`) output, verbatim:

```
# npm audit report

deepmerge  >=4.2.0
deepmerge mergeObject() allows prototype poisoning of returned objects - https://github.com/advisories/GHSA-gcqx-w48m-w2h4
fix available via `npm audit fix --force`
Will install react-scripts@0.0.0, which is a breaking change
node_modules/deepmerge
  @rollup/plugin-node-resolve  >=8.0.0
  Depends on vulnerable versions of deepmerge
  node_modules/@rollup/plugin-node-resolve
    workbox-build  >=6.0.0-alpha.0
    Depends on vulnerable versions of @rollup/plugin-node-resolve
    node_modules/workbox-build
      workbox-webpack-plugin  >=6.0.0-alpha.0
      Depends on vulnerable versions of workbox-build
      node_modules/workbox-webpack-plugin
        react-scripts  >=0.1.0
        Depends on vulnerable versions of @svgr/webpack
        Depends on vulnerable versions of jest
        Depends on vulnerable versions of jest-watch-typeahead
        Depends on vulnerable versions of react-dev-utils
        Depends on vulnerable versions of webpack-dev-server
        Depends on vulnerable versions of workbox-webpack-plugin
        node_modules/react-scripts
  @svgr/plugin-svgo  >=5.5.0
  Depends on vulnerable versions of deepmerge
  node_modules/@svgr/plugin-svgo
    @svgr/webpack  >=5.5.0
    Depends on vulnerable versions of @svgr/plugin-svgo
    node_modules/@svgr/webpack
  fork-ts-checker-webpack-plugin  >=5.0.0-alpha.1
  Depends on vulnerable versions of deepmerge
  node_modules/fork-ts-checker-webpack-plugin
    react-dev-utils  >=12.0.0-next.31
    Depends on vulnerable versions of fork-ts-checker-webpack-plugin
    node_modules/react-dev-utils
  jest-config  >=25.2.0-alpha.86
  Depends on vulnerable versions of deepmerge
  node_modules/jest-config
    @jest/core  >=25.2.0-alpha.86
      Depends on vulnerable versions of jest-config
      node_modules/@jest/core
        jest  >=25.2.0-alpha.86
          Depends on vulnerable versions of @jest/core
          node_modules/jest
            jest-watch-typeahead  >=0.6.0
              Depends on vulnerable versions of jest
              node_modules/jest-watch-typeahead
            jest-cli  >=25.2.0-alpha.86
              Depends on vulnerable versions of @jest/core
              node_modules/jest-cli

webpack-dev-server  <=5.2.5
Severity: moderate
webpack-dev-server users' source code may be stolen when they access a malicious web site with non-Chromium based browser - https://github.com/advisories/GHSA-9jgg-88mc-972h
webpack-dev-server users' source code may be stolen when they access a malicious web site - https://github.com/advisories/GHSA-4v9v-hfq4-rm2v
webpack-dev-server vulnerable to cross-origin source code exposure on non-HTTPS origins - https://github.com/advisories/GHSA-79cf-xcqc-c78w
webpack-dev-server vulnerable to HMR WebSocket interception via permissive user proxies - https://github.com/advisories/GHSA-mx8g-39q3-5c79
webpack-dev-server vulnerable to cross-site request forgery via internal developer endpoints - https://github.com/advisories/GHSA-f5vj-f2hx-8m93
webpack-dev-server vulnerable to denial of service via a malformed Host or Origin header - https://github.com/advisories/GHSA-m28w-2pqf-7qgj
fix available via `npm audit fix --force`
Will install react-scripts@0.0.0, which is a breaking change
node_modules/webpack-dev-server

15 vulnerabilities (13 low, 2 moderate)

To address all issues (including breaking changes), run:
  npm audit fix --force
```

**Summary:** 0 high, 0 critical, 2 moderate, 13 low — all in the `react-scripts` development-tool chain, analysed in Section 2.2.

### Non-UI gate results at the time of this report

| Gate | Command | Result |
|---|---|---|
| Lint | `npm run lint` | exit 0, no errors |
| Tests + coverage | `npm run test:coverage` | exit 0 — 51/51 suites, 239/239 tests, **100%** statements / branches / functions / lines |
| Production build | `npm run build` | exit 0, "Compiled successfully." |
| Audit | `npm audit --audit-level=high` | exit 0 |
| Lockfile reproducibility | `npm ci` | exit 0, reproduced the tree |
| Docker build | `docker build -t burger-builder .` | exit 0 |
| Container verification | `sh scripts/verify-container.sh 8090 burger-test` | all assertions passed — `/healthz` 200, `/` 200, hashed asset 200, `/orders` 200 (SPA fallback), `/.env` 403, security headers present |
| Browser flows | `node scripts/capture-screenshots.js` | 17/17 checks passed against the Auth + Database emulators |
| Rules enforcement | direct REST probes against the Database emulator | unauthenticated root read, `orders` read and `orders` write each rejected with `401 Permission denied`; signed-in write and scoped read succeed |

---

## 6. How to report a vulnerability

Open a GitHub Security Advisory on this repository, or contact the maintainer privately. Please do not open a public issue for an unpatched vulnerability. Include the affected file or route, the reproduction steps, and the impact you observed.

**Scope of this report.** It covers the code in this repository. A Firebase web API key appearing in a public bundle is **not** a vulnerability on its own — see R2 in Section 4.
