# Playwright Hybrid Automation Framework

[![Playwright Tests](https://github.com/Johnny-Fingers/playwright-hybrid-automation-framework/actions/workflows/playwright.yml/badge.svg)](https://github.com/Johnny-Fingers/playwright-hybrid-automation-framework/actions/workflows/playwright.yml)
[![Playwright](https://img.shields.io/badge/Playwright-1.61.1-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/badge/pnpm-11.8.0-F69220?logo=pnpm&logoColor=white)](https://pnpm.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-supported-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

A production-oriented test automation framework built with [Playwright](https://playwright.dev/) and TypeScript. It demonstrates hybrid API and UI testing against a local [RealWorld](https://github.com/gothinkster/realworld) application, with a focus on maintainable architecture, reliable test setup, and environment-independent execution.

This repository showcases how design patterns, custom fixtures, and containerization come together to produce stable and readable automation.

---

## Application Under Test

The framework targets a local **RealWorld** application running at:

| Layer | URL |
|-------|-----|
| UI    | `http://localhost:5173` |
| API   | `http://localhost:3001` |

The SUT (System Under Test) lives in a separate repository: [node-react-real-world-example-app](https://github.com/Johnny-Fingers/node-react-real-world-example-app). To run the tests locally, clone and start both the backend and frontend from that repository first.

The application follows the [RealWorld](https://github.com/gothinkster/realworld) specification. Tests cannot rely on pre-existing users, articles, or comments — every run must establish its own preconditions. This constraint is a core driver behind the fixture-based setup strategy described below.

---

## Architecture Overview

The framework separates concerns across three layers:

```
┌─────────────────────────────────────────────────────────────┐
│                        tests/                               │
│              (spec files — what to validate)                │
├─────────────────────────────────────────────────────────────┤
│  fixtures/          │  src/ui/pages/    │  src/api/         │
│  (test setup)       │  (Page Objects)   │  controllers/     │
│                     │                   │  models/          │
├─────────────────────────────────────────────────────────────┤
│                   Playwright Test Runner                    │
│              (API + Browser projects, reporting)            │
└─────────────────────────────────────────────────────────────┘
```

### Why a hybrid API + UI approach?

- **API tests** validate backend contracts quickly and deterministically — ideal for CRUD operations, status codes, and response payloads.
- **UI tests** validate the end-user experience — navigation, form interactions, and visual feedback.
- **Shared fixtures** bridge both layers: the same registration logic that seeds API tests also powers UI authentication, avoiding duplicated setup code.

Playwright's multi-project configuration runs API and UI suites in parallel against their respective base URLs, while sharing a single codebase and fixture layer.

---

## Design Decisions

### 1. Custom Fixtures for Test Pre-Setup

Playwright's [fixture extension API](https://playwright.dev/docs/test-fixtures) is used to guarantee that every test starts with the conditions it needs — without polluting test bodies with boilerplate.

Three fixtures are defined in `fixtures/auth.fixture.ts`:

| Fixture | Purpose |
|---------|---------|
| `registeredUser` | Registers a unique user via API and exposes credentials (`username`, `email`, `password`) to the test. |
| `authenticatedRequest` | Registers a user, obtains a JWT, and provides an `APIRequestContext` pre-configured with the `Authorization` header. |
| `authenticatedPage` | Registers a user, injects the JWT into `localStorage`, and provides a browser `Page` ready for authenticated UI flows. |

**Why this matters:** Because the database is ephemeral, hard-coded credentials would fail unpredictably. Fixtures register a fresh, unique user (using `Date.now()` for uniqueness) before each test that needs one, making tests self-contained and repeatable regardless of external database state.

### 2. Page Object Model (UI Tests)

UI interactions are encapsulated in page classes under `src/ui/pages/`. Each page object:

- Declares locators as `readonly` properties in the constructor.
- Exposes intent-revealing methods (`login()`, `createArticle()`, `isUserLoggedIn()`) instead of raw selector calls.
- Hides DOM structure from test files.

**Why this matters:** When the UI changes, updates are localized to a single page class rather than scattered across multiple specs.

### 3. Model–Controller Pattern (API Tests)

API interactions follow a lightweight Model–Controller separation:

- **Models** (`src/api/models/`) — TypeScript interfaces for request payloads and response shapes (`UserResponse`, `ArticleResponse`, etc.), providing compile-time safety and self-documenting contracts.
- **Controllers** (`src/api/controllers/`) — Classes that wrap Playwright's `APIRequestContext` and expose domain methods (`register()`, `create()`, `delete()`).

**Why this matters:** Tests assert on business outcomes, not HTTP plumbing. Controllers centralize endpoint paths and header logic; models ensure responses are typed and validated consistently.

### 4. Authentication via `localStorage`

The frontend stores the JWT in `localStorage` under the key `token`. For UI tests that require an authenticated session, the `authenticatedPage` fixture:

1. Registers a user through the API.
2. Extracts the token from the response.
3. Injects it via `context.addInitScript()` before the page loads.

**Why this matters:** Logging in through the UI for every test would be slower and more brittle. API-based registration combined with `localStorage` injection skips the login form while still producing a genuinely authenticated browser context.

### 5. Docker for Environment-Independent Execution

Tests can run inside the official Playwright Docker image (`mcr.microsoft.com/playwright:v1.61.1-noble`), which ships with all browser dependencies pre-installed. This eliminates "works on my machine" issues caused by missing system libraries or browser binaries.

**Why this matters:** CI pipelines and collaborators can execute the full suite without configuring a local browser environment. The same image is used in GitHub Actions, ensuring parity between local Docker runs and CI.

---

## Test Scenarios

### API Tests (`tests/api/`)

| Suite | Scenario | Key Assertion |
|-------|----------|---------------|
| **Authentication** | Register a new user | `201 Created`, token returned |
| | Login with valid credentials | `200 OK`, token returned |
| | Login with wrong password | `401 Unauthorized`, error payload |
| **Articles** | Create an article | `201 Created`, slug generated |
| | Get article by slug | `200 OK`, correct title and slug |
| | Delete an article | `204 No Content`, subsequent GET returns `404` |
| **Comments** | Add a comment to an article | `201 Created`, comment body and ID present |

### UI Tests (`tests/ui/`)

| Suite | Scenario | Key Assertion |
|-------|----------|---------------|
| **Authentication** | Login via the sign-in form | Redirect to home, username visible in navbar |
| **Articles** | Create and publish an article | Redirect to article page, title and body rendered |

UI tests run on both **Desktop Chrome** and **Desktop Firefox** to demonstrate cross-browser coverage.

---

## Project Structure

```
playwright-hybrid-automation-framework/
├── fixtures/
│   └── auth.fixture.ts          # Custom fixtures (user registration, auth contexts)
├── src/
│   ├── api/
│   │   ├── controllers/         # API endpoint wrappers
│   │   │   ├── auth.controller.ts
│   │   │   ├── article.controller.ts
│   │   │   └── comment.controller.ts
│   │   └── models/              # Request/response TypeScript interfaces
│   │       ├── user.model.ts
│   │       ├── article.model.ts
│   │       └── comment.model.ts
│   └── ui/
│       └── pages/               # Page Object Model classes
│           ├── login.page.ts
│           ├── home.page.ts
│           └── article.page.ts
├── tests/
│   ├── api/                     # API test specs
│   │   ├── auth.spec.ts
│   │   ├── articles.spec.ts
│   │   └── comments.spec.ts
│   └── ui/                      # UI test specs
│       ├── auth-ui.spec.ts
│       └── articles-ui.spec.ts
├── .github/workflows/
│   └── playwright.yml           # CI pipeline (GitHub Actions)
├── playwright.config.ts         # Multi-project Playwright configuration
├── package.json
├── tsconfig.json
└── pnpm-lock.yaml
```

---

## Requirements

| Dependency | Version |
|------------|---------|
| [Node.js](https://nodejs.org/) | 18+ recommended |
| [pnpm](https://pnpm.io/) | 11.8.0 (enforced via `devEngines`) |
| [Playwright](https://playwright.dev/) | 1.61.1 |
| [Docker](https://www.docker.com/) *(optional)* | For containerized execution |

The local backend and frontend must be running before executing the tests.

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/Johnny-Fingers/playwright-hybrid-automation-framework.git
cd playwright-hybrid-automation-framework
pnpm install
```

### 2. Install browsers (local execution only)

```bash
pnpm exec playwright install
```

This step is **not** needed when running inside Docker — browsers are already included in the image.

---

## Running Tests

### Run the full suite

```bash
pnpm test:all
```

### Run a specific project

```bash
# API tests only
pnpm exec playwright test --project=api-tests

# UI tests on Chrome only
pnpm exec playwright test --project=ui-chrome

# UI tests on Firefox only
pnpm exec playwright test --project=ui-firefox
```

### Run a single spec file

```bash
pnpm exec playwright test tests/api/auth.spec.ts
```

### Run in headed mode (watch the browser)

```bash
pnpm exec playwright test --project=ui-chrome --headed
```

### Run via Docker (no local browser setup required)

```bash
# Run the full suite
pnpm test:docker:all

# Run with custom Playwright arguments
pnpm test:docker -- --project=api-tests
```

---

## CI/CD

A GitHub Actions workflow (`.github/workflows/playwright.yml`) runs on every push and pull request to `main`:

- Executes inside the official Playwright Docker container.
- Caches `pnpm` dependencies for faster builds.
- Retries failed tests twice (`retries: 2` in CI).
- Uploads the HTML report as an artifact on failure.

---

## Reporting

Playwright generates two report formats after each run:

| Reporter | Output | Usage |
|----------|--------|-------|
| **HTML** | `playwright-report/` | Interactive report with traces, screenshots, and videos |
| **List** | Terminal stdout | Real-time pass/fail summary |

To open the HTML report locally:

```bash
pnpm exec playwright show-report
```

Traces, screenshots, and videos are captured **only on failure** to keep artifacts lean while preserving enough context for debugging.

---

## Configuration Highlights

Key settings from `playwright.config.ts`:

- **Parallel execution** enabled (`fullyParallel: true`) for faster feedback.
- **Separate base URLs** per project — API tests target `localhost:3001`, UI tests target `localhost:5173`.
- **CI safeguards** — `forbidOnly` prevents accidental `.only` commits; retries and worker limits protect the CI agent.
- **Failure artifacts** — `trace: retain-on-failure`, `screenshot: only-on-failure`, `video: on-first-retry`.

---

## License

This project is licensed under the [MIT License](LICENSE).
