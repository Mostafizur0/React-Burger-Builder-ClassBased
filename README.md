# Burger Builder

[![CI](https://github.com/Mostafizur0/React-Burger-Builder-ClassBased/actions/workflows/ci.yml/badge.svg)](https://github.com/Mostafizur0/React-Burger-Builder-ClassBased/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-18-brightgreen.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/react-18.3-blue.svg)](https://react.dev)
[![Firebase](https://img.shields.io/badge/firebase-11.10-orange.svg)](https://firebase.google.com)

A single-page burger-ordering application: stack your own burger, watch the price update in real time, sign in, and place an order. Built with React class components, Redux and the Firebase Web SDK, modernised from a 2020 Create React App project onto React 18, React Router 5, the Firebase SDK and a hardened Docker image, with a React Testing Library suite held at 100% coverage.

---

## Screenshots

### Builder

![Burger builder with a stack of ingredients](docs/screenshots/01-burger-builder.png)

*The builder with two meat, two cheese, one salad and one bacon. The stack renders live and the price tracks it.*

### Build controls

![Build control panel](docs/screenshots/02-build-controls.png)

*Each ingredient row carries a Less/More pair. Rows disable the Less button at zero.*

### Authentication

![Sign up and sign in form](docs/screenshots/03-auth.png)

*Email and password sign-up. A malformed address is flagged in red once the field is touched.*

### Checkout summary

![Checkout summary modal](docs/screenshots/04-checkout.png)

*ORDER NOW opens the order summary with the ingredient list and the total.*

### Contact data

![Contact data form](docs/screenshots/05-contact-data.png)

*All six fields — name, street, ZIP, country, e-mail and delivery method. ORDER stays disabled until the form validates.*

### Orders

![Orders list](docs/screenshots/06-orders.png)

*The signed-in user's orders, each with its ingredients and price.*

### Mobile drawer

![Mobile side drawer at 480px](docs/screenshots/07-mobile-drawer.png)

*Below 500px the navigation collapses into a drawer opened by the hamburger.*

---

## Features

- **Live burger builder** — add and remove salad, bacon, cheese and meat; the visual stack and the price update together.
- **Email/password authentication** — sign up and sign in against the Firebase Auth SDK, with session state kept in the Redux store rather than in `localStorage`.
- **Guarded checkout** — an unauthenticated visitor sees "SIGN UP TO ORDER" and is routed to the sign-in page instead of the summary.
- **Two-step checkout** — an order summary modal, then a validated contact form before the order is written.
- **Order history** — the signed-in user can list their own orders.
- **Responsive layout** — a slide-out drawer replaces the top navigation below 500px.
- **Offline-tolerant builder** — if the backend is unreachable or unconfigured, the builder falls back to local ingredient defaults and still renders.
- **Accessible, tested UI** — React Testing Library over Enzyme, with a 100% coverage threshold enforced in CI.
- **Hardened container** — a two-stage, non-root, health-checked image with security headers and dotfile denial.

## Tech stack

| Layer | Choice | Version |
|---|---|---|
| UI runtime | React / React DOM | 18.3.1 |
| Build tool | Create React App (`react-scripts`) | 5.0.1 |
| Routing | React Router DOM | 5.3.4 |
| State | Redux + Redux Thunk | 4.2.1 / 2.4.2 |
| Backend | Firebase Web SDK (Auth + Realtime Database) | 11.10.0 |
| Testing | React Testing Library, Jest | 14.3.1, 27.5.1 |
| Container | nginx (unprivileged) on `node:18-alpine` builder | 1.25-alpine |
| Language | JavaScript (ES modules via Babel) | — |

The class-component architecture is retained deliberately. The original project was written in class components and the modernisation targets the toolchain, dependencies and security posture — not a rewrite of the component model.

## Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Node.js | 18.x | The project's virtual environment, pinned by `.nvmrc` |
| npm | 9 or newer | `package.json` declares `engines` |
| nvm | any recent | Optional but recommended — `nvm use` reads `.nvmrc` |

```bash
nvm install   # reads .nvmrc and installs Node 18
nvm use       # switches to it
node -v       # v18.x
```

## Quick start

```bash
nvm use
npm ci
npm start
```

The app opens at <http://localhost:3000>. `npm ci` installs the exact tree in `package-lock.json`, so a fresh clone behaves identically to CI and to the Docker build.

## Environment variables

Copy `.env.example` to `.env.local` and fill in your own Firebase web configuration. `.env.local` is git-ignored and must never be committed. The committed `.env` holds the same configuration as the default, so a fresh clone builds with the expected project.

| Variable | Default | Purpose |
|---|---|---|
| `REACT_APP_FIREBASE_API_KEY` | `AIzaSyCi8kZHcinIYYLGTFKeFl_7skwAx4TiZDE` | Firebase Web API key |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | `burger-builder-951c6.firebaseapp.com` | Auth host used by the sign-in redirect |
| `REACT_APP_FIREBASE_PROJECT_ID` | `burger-builder-951c6` | Firebase project identifier |
| `REACT_APP_FIREBASE_DATABASE_URL` | `https://burger-builder-951c6-default-rtdb.asia-southeast1.firebasedatabase.app/` | Realtime Database endpoint |
| `REACT_APP_FIREBASE_STORAGE_BUCKET` | `burger-builder-951c6.firebasestorage.app` | Storage bucket name |
| `REACT_APP_FIREBASE_APP_ID` | `1:390447306725:web:6a0023c81c7834244b410c` | Firebase web app identifier |
| `REACT_APP_FIREBASE_AUTH_EMULATOR_HOST` | unset | Points Auth at a local emulator, e.g. `127.0.0.1:9099` |
| `REACT_APP_FIREBASE_DATABASE_EMULATOR_HOST` | unset | Points the Database at a local emulator, e.g. `127.0.0.1:9000` |

The two emulator variables are optional and only for local development against the [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite). Production builds leave them unset and talk to the real project.

> **New to Firebase?** See [Firebase setup](#firebase-setup) for how to provision a Realtime Database, deploy the security rules, seed the data, and wire up `.env.local` for the first time.

### Running against the local emulator suite

The committed configuration points at a project whose hosting and database endpoints are not publicly reachable, so the app is exercised locally through the Firebase Emulator Suite. Start it with the **Firebase CLI** and a Java runtime:

```bash
npx firebase-tools emulators:start --only auth,database
```

The emulators must run under the same project id as `.env.local`, otherwise the security rules bind to a different namespace and are not applied:

```bash
npx firebase-tools emulators:start --project burger-builder-951c6 --only auth,database
```

`.firebaserc` already selects that project, so `npx firebase-tools emulators:start` picks it up. The emulator hosts are then set in `.env.local`:

```
REACT_APP_FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
REACT_APP_FIREBASE_DATABASE_EMULATOR_HOST=127.0.0.1:9000
```

With the emulators running, `npm start` serves a fully working app: sign up, build a burger, check out, and read the order back from `/orders`, all enforced by the rules in `firebase.database.rules.json`.

> **A Firebase web config is public by design.** It ships inside the browser bundle and cannot be kept secret. What protects your data is the Realtime Database rules and the API-key restrictions configured in the Google Cloud console — see [Security](#security).

---

## Firebase setup

This section covers the three things that have to line up for the backend to work: a provisioned project, the database rules deployed, and a seeded `ingredients` node.

### The data model

The Realtime Database holds two nodes.

```
/
├── ingredients/          # the starting counts for the builder
│   ├── salad: 0
│   ├── bacon: 0
│   ├── cheese: 0
│   └── meat: 0
└── orders/               # written by the app, one child per order
    └── -NxyzOrderId/
        ├── ingredients: { salad: 1, bacon: 0, cheese: 2, meat: 1 }
        ├── orderData: { name, street, zipCode, country, email, deliveryMethod }
        ├── price: 5.7
        └── userId: <the Firebase Auth uid of the buyer>
```

`ingredients` holds **counts only** — the starting stack the builder loads. Prices are not in the database; they live in `src/shared/defaultIngredients.js` so the client and the rules agree on what a number means:

| Ingredient | Price |
|---|---|
| salad | 0.5 |
| cheese | 0.4 |
| meat | 1.3 |
| bacon | 0.7 |

The base price is `4`. The app merges whatever it reads from the database *over* the defaults in that file, so a partial `ingredients` node cannot produce a `NaN` price.

### Database rules

`firebase.database.rules.json` in the repo root is the source of truth:

```json
{
  "rules": {
    ".read": false,
    ".write": false,
    "ingredients": {
      ".read": true,
      ".write": false
    },
    "orders": {
      ".indexOn": "userId",
      ".read": "auth != null && query.orderByChild == 'userId' && query.equalTo == auth.uid",
      ".write": "auth != null",
      "$orderId": {
        ".read": "auth != null && data.child('userId').val() === auth.uid",
        ".write": "auth != null && newData.child('userId').val() === auth.uid",
        ".validate": "newData.hasChildren(['ingredients', 'price', 'userId']) && newData.child('price').isNumber()"
      }
    }
  }
}
```

| Rule | Effect |
|---|---|
| `".read": false` / `".write": false` at the root | Deny by default — anything not explicitly granted is refused |
| `ingredients: ".read": true` | Public read, so the builder can load counts before sign-in |
| `ingredients: ".write": false` | No client may write ingredients |
| `orders: ".indexOn": "userId"` | **The index the filtered read depends on** — see the note below |
| `orders: ".read"` | Read only through a query scoped to `auth.uid` |
| `orders: ".write": "auth != null"` | Any signed-in user may write an order |
| `orders/$orderId: ".read"` | Read one order only if its `userId` matches `auth.uid` |
| `orders/$orderId: ".write"` | Write only if `newData.userId` matches `auth.uid` |
| `orders/$orderId: ".validate"` | An order must carry `ingredients`, `price` (a number) and `userId` |

#### Why `".indexOn": "userId"` matters

The app reads orders with a filtered query (`src/store/actions/order.js`):

```js
const ordersQuery = query(ref(database, 'orders'), orderByChild('userId'), equalTo(userId));
```

A Realtime Database query on an unindexed child is rejected outright, with:

```
Index not defined, add ".indexOn": "userId", for path "/orders"
```

The `.read` rule also has to recognise that exact query shape, via `query.orderByChild` and `query.equalTo`. Deploy **both** halves — the index *and* the rule.

### Provisioning a Realtime Database

**1. Create the project.** In the [Firebase console](https://console.firebase.google.com) → **Add project**. Google Analytics is optional for this app.

**2. Create the database.** In the console → **Build → Realtime Database → Create Database**.

- Pick a location. The URL in `.env.local` ends in a region suffix — `asia-southeast1` for Singapore, `europe-west1` for Belgium, `us-central1` for Iowa — so the region must match your URL.
- Start in **locked mode**. The rules in this repo are locked down by default, and you are about to deploy them.
- Copy the database URL the console shows you. It looks like `https://<project>-default-rtdb.<region>.firebasedatabase.app`.

**3. Enable Authentication.** In the console → **Build → Authentication → Get started** → **Sign-in method** → enable **Email/Password**. Turn off the "email enumeration protection" link if you want the sign-up form to report `email-already-in-use` rather than failing silently.

**4. Register a web app.** In the console → **Project settings** (the gear) → **Your apps** → **Web** → add an app. Firebase then shows the config object you need for `.env.local`:

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "<project>.firebaseapp.com",
  projectId: "<project>",
  databaseURL: "https://<project>-default-rtdb.<region>.firebasedatabase.app",
  storageBucket: "<project>.firebasestorage.app",
  appId: "..."
};
```

**5. Point the CLI at the project.** `.firebaserc` in the repo root selects the default project:

```json
{
  "projects": {
    "default": "burger-builder-951c6"
  }
}
```

Replace that value with your own project id. Then authenticate:

```bash
npm install -g firebase-tools
firebase login
firebase use <your-project-id>
```

### Deploying the rules

```bash
firebase deploy --only database --project <your-project-id>
```

**Capture the currently deployed rules first**, because the deploy replaces them wholesale:

```bash
firebase database:get --project <your-project-id> / --shallow
```

or read them in the console under **Realtime Database → Rules**. Diff them against the local file before overwriting anything you have not seen.

Verify the deploy landed:

```bash
# Public read on ingredients - should return the seeded object
curl -s "https://<project>-default-rtdb.<region>.firebasedatabase.app/ingredients.json"

# Unfiltered orders read - should be denied, proving the rule is scoped
curl -s "https://<project>-default-rtdb.<region>.firebasedatabase.app/orders.json"
```

### Seeding data

The `ingredients` node is **not client-writable** — the rules set `".write": false` on it deliberately. Seed it with the Firebase console or an Admin SDK script.

**From the console:** Realtime Database → Data → add `ingredients` as an object with the four keys.

**From the Admin SDK** (needs a service account, and never commit its key). `firebase-admin` is not a dependency of this project — install it for the one-off script:

```bash
npm install --no-save firebase-admin
```

The script below is a template, not a file in this repo. Save it as `scripts/seed-ingredients.js` and point it at your own service account:

```js
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert(require('./service-account-key.json')),
  databaseURL: 'https://<project>-default-rtdb.<region>.firebasedatabase.app'
});

admin.database().ref('ingredients').set({ salad: 0, bacon: 0, cheese: 0, meat: 0 })
  .then(() => console.log('ingredients seeded'))
  .then(() => process.exit(0))
  .catch(error => { console.error(error); process.exit(1); });
```

```bash
node scripts/seed-ingredients.js
```

Download the service account JSON from **Project settings → Service accounts → Generate new private key**, and keep it out of version control.

**Against the local emulator**, the owner token bypasses the rules, so a plain `curl` is enough:

```bash
NS=burger-builder-951c6-default-rtdb
curl -s -X PUT \
  -H 'Authorization: Bearer owner' \
  -H 'Content-Type: application/json' \
  -d '{"salad":0,"bacon":0,"cheese":0,"meat":0}' \
  "http://127.0.0.1:9000/ingredients.json?ns=$NS"
```

### Configuring the env file

`.env.local` is git-ignored and must never be committed. Copy the template and fill it in:

```bash
cp .env.example .env.local
```

```
REACT_APP_FIREBASE_API_KEY=AIzaSy...
REACT_APP_FIREBASE_AUTH_DOMAIN=<project>.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=<project>
REACT_APP_FIREBASE_DATABASE_URL=https://<project>-default-rtdb.<region>.firebasedatabase.app
REACT_APP_FIREBASE_STORAGE_BUCKET=<project>.firebasestorage.app
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef
```

Every variable must be prefixed `REACT_APP_` — Create React App only inlines those into the bundle, and it does so at **build time**. Changing `.env.local` therefore requires a restart (`npm start` picks it up; a `docker build` picks it up on the next build). Nothing in `src/` reads these values directly; `src/services/firebase.js` is the single place they are read.

The committed `.env` holds the same values as the default, so a fresh clone builds with the expected project. Override locally through `.env.local`, which wins over `.env`.

#### Using the emulator instead of a live project

Set the two emulator variables to route the SDK at the local emulators instead of the live project:

```
REACT_APP_FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
REACT_APP_FIREBASE_DATABASE_EMULATOR_HOST=127.0.0.1:9000
```

The emulator accepts any API key value, so the rest of `.env.local` can stay as it is.

### Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `Ingredients could not be loaded from the server.` | The `ingredients` read was denied, or the project is unreachable | Deploy the rules; confirm the `ingredients` node exists and the region in `REACT_APP_FIREBASE_DATABASE_URL` matches the one the console shows |
| `Your orders could not be loaded.` | The filtered read was rejected — usually a missing index | Deploy the rules so `".indexOn": "userId"` is present, and check that the deployed rules match the local file |
| `Index not defined, add ".indexOn": "userId"` | The index is not in the deployed rules | `firebase deploy --only database` |
| `Permission denied` on a raw `curl` to `orders.json` | The unfiltered collection read is denied **by design** | Read with `?orderBy="userId"&equalTo=<uid>` instead |
| Orders save but never appear in `/orders` | The stored `userId` does not match the signed-in `auth.uid` | The `userId` is written from `state.auth.userId`; sign in with the account that owns the order |
| Sign-in fails with `auth/operation-not-allowed` | Email/Password is not enabled | Enable it in **Authentication → Sign-in method** |
| `auth/api-key-not-valid` | The API key belongs to another project | Re-copy the config from **Project settings → Your apps** |
| The app renders but every request 401s | The emulators run under a different project id than the app | Start them with `--project <the same id as .env.local>`; the rules bind to the namespace derived from the project id |


## Scripts

| Script | Command | Purpose |
|---|---|---|
| `npm start` | `react-scripts start` | Dev server on port 3000 with hot reload |
| `npm run build` | `react-scripts build` | Production bundle into `build/` |
| `npm test` | `react-scripts test` | Jest in watch mode |
| `npm run test:coverage` | `react-scripts test --coverage --watchAll=false` | Single test run with the coverage report |
| `npm run lint` | `eslint --ext .js,.jsx src` | ESLint over `src/` |
| `npm run eject` | `react-scripts eject` | Expose the CRA build config (one-way) |

## Testing and coverage

```bash
npm run test:coverage
```

The suite uses React Testing Library and drives the app the way a user does — by role, label and visible text — rather than by reaching into component internals.

The `jest.coverageThreshold` block in `package.json` sets **100% for statements, branches, functions and lines**. The run fails if any metric drops below the threshold, so a regression cannot merge. `src/test-utils.js`, `src/setupTests.js` and `src/store/actions/index.js` are excluded from collection as test infrastructure rather than application code.

Current state: **51 suites, 239 tests, 100% across all four metrics.**

The HTML report lands in `coverage/lcov-report/index.html`:

```bash
open coverage/lcov-report/index.html
```

## Security

Full detail lives in **[docs/security-report.md](docs/security-report.md)** — scope and method, a before/after dependency table, the application finding catalogue, residual risks, and the verbatim `npm audit` output.

Database access control lives in `firebase.database.rules.json` and denies by default:

| Path | Rule |
|---|---|
| `/` | `.read: false`, `.write: false` |
| `ingredients` | Publicly readable, never client-writable |
| `orders` | Readable only when the query is scoped to `auth.uid`; writable only by a signed-in user whose `userId` matches |
| `orders/$orderId` | Validated to carry `ingredients`, `price` and `userId`, with `price` constrained to a number |

Deploy the rules with:

```bash
firebase deploy --only database
```

**To report a vulnerability**, open a GitHub Security Advisory on this repository or contact the maintainer privately rather than filing a public issue for an unpatched problem. Include the affected file or route, reproduction steps, and the impact you observed.

## Docker

The image builds in two stages: `node:18-alpine` compiles the app, then `nginxinc/nginx-unprivileged:1.25-alpine` serves the static bundle as uid/gid 101 on port 8080.

```bash
# Build
docker build -t burger-builder .

# Run
docker run --rm -p 8080:8080 burger-builder

# Or with compose
docker compose up --build
```

Then open <http://localhost:8080>. The container exposes a health endpoint at `/healthz` and declares a `HEALTHCHECK` against it, so `docker ps` reports `healthy` once nginx is serving.

```bash
docker ps                                   # check the health status
curl -i http://localhost:8080/healthz      # 200 ok
```

`docker/nginx.conf` sets `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` and a `Content-Security-Policy`, denies dotfiles so `/.env` returns 403, and falls back to `index.html` for client-side routes.

`scripts/verify-container.sh` asserts all of the above against a running container:

```bash
sh scripts/verify-container.sh 8090 burger-test
```

## CI/CD

`.github/workflows/ci.yml` runs on pushes and pull requests to `main`/`master`, on a weekly schedule, and on manual dispatch. It declares `permissions: contents: read` at the top level.

| Job | What it gates |
|---|---|
| `lint-test-build` | `npm ci`, ESLint, the 100%-coverage test run, and the production build. Uploads the coverage and build artifacts. |
| `audit` | `npm audit --audit-level=high`. Fails the pipeline on any high or critical advisory. |
| `secrets` | Gitleaks secret scan over the current tree. **Fails the build** when a credential is committed. |
| `docker` | Builds the image, pushes it to GHCR on non-PR events, starts the container, checks `/healthz`, `/`, `/orders` and the CSP header, then removes the container. |
| `security` | Trivy image scan (critical/high) and the GitHub dependency review on pull requests. Both are non-blocking, so a scanner outage cannot stop a merge. |

### Secret scanning

The `secrets` job runs [Gitleaks](https://github.com/gitleaks/gitleaks) over the checked-out tree and **fails the build** on any finding:

```bash
gitleaks detect --no-banner --redact --verbose --no-git --source . --config .gitleaks.toml
```

`--no-git` scans the working tree rather than the commit history, which is the scope this gate covers. The matcher values are redacted in the log so a real secret is never echoed into the build output. The job needs no repository secrets and no extra permissions, and it neither uploads a SARIF artifact nor comments on the pull request — so it stays inside the workflow's `permissions: contents: read` block and never prompts on a fork PR.

The allowlist lives in `.gitleaks.toml` in the repo root, so every exception is visible in review. It is scoped to **exact values**, and it exists because a Firebase Web configuration is public by design — it is inlined into the browser bundle at build time and cannot be kept secret. Access is constrained by the Realtime Database rules and by API-key restrictions in the Google Cloud console. The two allowlisted values are:

| Value | Where | Why |
|---|---|---|
| `AIzaSyCi8kZHcinIYYLGTFKeFl_7skwAx4TiZDE` | `.env`, `README.md` | The live Firebase Web API key. Public by design. |
| `AIzaSyB5cHT6x62tTe-g27vBDIqWcwQWBSj3uiY` | `docs/security-report.md` | An old, revoked key quoted verbatim as the "before" baseline of the audit finding that moved the key out of source. Inert, but still matches the pattern. |

Any *other* secret — in those files or anywhere else — still fails the build. If the scan flags something you believe is a false positive, add it to `.gitleaks.toml` with a comment explaining why. Never exclude a file by path: a path-based entry suppresses *every* secret in that file, which defeats the purpose of the gate.

`.github/dependabot.yml` opens weekly npm and GitHub Actions update pull requests, labelled `dependencies` and `security`.

## Project structure

```
.
├── .github/
│   ├── workflows/ci.yml          # lint, test, audit, secrets, docker and security jobs
│   └── dependabot.yml            # weekly dependency updates
├── .gitleaks.toml                # secret-scan config and the scoped allowlist
├── docker/
│   └── nginx.conf                # unprivileged nginx config, headers, dotfile denial
├── docs/
│   ├── screenshots/              # the seven images referenced above
│   └── security-report.md        # dependency and application security report
├── public/                       # static assets served as-is
├── scripts/
│   ├── verify-container.sh       # asserts the image's headers, routes and health
│   └── capture-screenshots.js    # drives the UI and regenerates the screenshots
├── src/
│   ├── components/               # Burger, Navigation, Order and UI primitives
│   │   ├── Burger/               # builder, build controls, order summary
│   │   ├── Navigation/           # toolbar, side drawer, nav items
│   │   ├── Order/                # order card and checkout summary
│   │   └── UI/                   # Button, Input, Modal, Spinner, Backdrop, ErrorModal
│   ├── containers/               # route-level components
│   │   ├── Auth/                 # sign-up / sign-in
│   │   ├── BurgerBuilder/        # the builder page
│   │   ├── Checkout/             # checkout summary and contact form
│   │   └── Orders/               # order history
│   ├── hoc/                      # Aux and Layout wrappers
│   ├── services/firebase.js      # Firebase init, config and emulator wiring
│   ├── shared/                   # ingredient defaults and object helpers
│   ├── store/                    # Redux actions and reducers
│   ├── App.js                    # routes, lazy loading and the auth gate
│   └── index.js                  # React 18 root and store bootstrap
├── Dockerfile                    # two-stage, non-root, health-checked image
├── docker-compose.yml
├── firebase.database.rules.json  # Realtime Database rules
└── firebase.json                 # hosting, database rules and emulator config
```

## Deployment

**Firebase Hosting**

```bash
npm run build
firebase deploy --only hosting
```

`firebase.json` configures the SPA rewrite to `index.html` and attaches the security headers to every response.

**The Docker image**

```bash
docker build -t burger-builder .
docker run -d --name burger-builder -p 8080:8080 burger-builder
```

**Any static host**

`npm run build` produces a self-contained `build/` directory. Serve it with an SPA fallback to `index.html` for the client-side routes, and set the same security headers.

> Before deploying, set your own Firebase configuration, deploy the database rules, and confirm Email/Password sign-in is enabled in the Firebase console.

## Known limitations

- **The committed Firebase project is not publicly reachable.** Its hosting endpoint returns 404 and the Realtime Database answers `401 Permission denied`, so the app is verified against the local Emulator Suite rather than the live project. The `.env` default keeps the same values for convenience — supply your own project through `.env.local`.
- **The rules in `firebase.database.rules.json` are not deployed to the live project.** That file is the source of truth, but it only takes effect after `firebase deploy --only database`. Until then the live project enforces whatever was deployed previously — which is why a fresh clone sees `401 Permission denied` on the `ingredients` read even though the local rules grant it. See [Deploying the rules](#deploying-the-rules).
- **The emulator must run under the same project id as the app.** `firebase-tools` binds the security rules to the namespace derived from the project id, so starting the emulators under a different `--project` silently leaves the data unprotected. `.firebaserc` pins the correct id.
- **Local ingredient fallback.** If the `ingredients` node is missing, partial or unreachable, the builder falls back to the local defaults in `src/shared/defaultIngredients.js` and still renders. Remote counts are merged *over* those defaults, so a partial node cannot produce a `NaN` price.
- **The price of a loaded ingredient stack starts at the base price.** `setIngredients` resets `totalPrice` to the base price and the price only moves as the user edits the stack, so a stack seeded with non-zero counts displays those counts next to the base price until an ingredient is added or removed. This is inherited from the original implementation.
- **Authentication needs a reachable Firebase project.** Without one, the app starts in offline mode and the sign-in form reports that authentication is not configured.
- **The order price is computed client-side.** The submitted price is what the browser calculated. A production deployment should recompute it server-side from an authoritative ingredient table. See residual risk R4 in the security report.
- **A full page load on `/orders` redirects to `/`.** The app restores its Firebase session asynchronously, so a deep link can hit the catch-all route before the session is ready. Navigating from within the app works correctly.
- **The GitHub Actions workflow has not been run on GitHub-hosted runners.** The same gates were verified locally, including a real container build and verification.

## License

MIT — see [LICENSE](LICENSE).
