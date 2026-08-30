# CineLink Project Backlog Reconstruction

> **Purpose:** reconstruct a factual, auditable backlog from repository evidence so that CineLink can be managed in GitHub Projects without pretending that retrospective issues existed during the original implementation.

## 1. Audit methodology

This reconstruction is based on the accessible Git history of `Furo347/CineLink`, commit messages and diffs, current project documentation, CI/CD configuration, issue forms, Dependabot configuration, application routes, tests, Docker assets, and production-related implementation commits.

The following rules were applied:

- A task is marked **historical done** only when implementation evidence exists in the repository.
- Low-level commits are grouped into meaningful deliverables rather than converted into one issue per commit.
- Repository evidence is preferred over recollection.
- User-reported incidents are identified separately from repository-confirmed implementation.
- The recent creation date of future GitHub issues must never be presented as the historical implementation date.
- Exact effort, cost, original priority, and original deadlines cannot be reconstructed reliably unless separately documented.

## 2. Executive summary

### Completed scope

CineLink currently includes:

- a TypeScript/Express/MongoDB backend;
- JWT registration and login;
- TMDB movie discovery, details, and search;
- favorites, ratings, comments, user profiles, avatars, follow/unfollow, and an activity feed;
- a React/Vite/TypeScript/Tailwind frontend;
- administration and role-based access controls;
- backend and frontend automated tests;
- Docker and Docker Compose;
- GitHub Actions for backend and frontend;
- SonarCloud quality analysis;
- Vercel frontend deployment;
- Render backend deployment;
- a public health endpoint and structured application logging;
- Dependabot and structured GitHub Issue Forms.

### Partially completed scope

The following areas are operational but still require formalization or hardening:

- external monitoring evidence and operational runbook;
- application changelog and release discipline;
- reliable stabilization of all MongoMemoryServer-based tests;
- complete production-readiness audit;
- formal GitHub Projects backlog and historical traceability.

### Remaining work

The most relevant future work concerns:

- feed pagination or infinite scrolling;
- skeleton loading;
- frontend request caching;
- relative timestamps;
- direct follow/unfollow interactions in the feed;
- activity likes;
- improved observability;
- maintenance documentation;
- structured release management.

### Production and maintenance maturity

CineLink is beyond a basic student prototype. It has a credible delivery and operational foundation, but it still needs a formal maintenance process, stable monitoring evidence, incident traceability, release documentation, and systematic backlog management to be considered fully production-ready.

## 3. Proposed epics

1. **Product framing and software architecture**
2. **Backend foundation and authentication**
3. **Movie and social features**
4. **Frontend web application**
5. **Quality, testing and DevOps**
6. **Production deployment and operational maintenance**

## 4. Detailed backlog inventory

| ID | Parent epic | Proposed issue title | Type | Status | Description | Exact implementation evidence | Relevant paths | Estimated period | Workstream | Role | Priority | Size | Risk | Milestone | Labels | Certification |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CL-001 | Product framing and software architecture | Define the CineLink product scope and social-cinema value proposition | documentation | historical done | Formalize the product purpose, target use cases, and principal capabilities. | Commit [`99b9506`](https://github.com/Furo347/CineLink/commit/99b9506e5d0f09b82483eca4925108421c609912) expands the README with the platform positioning and feature set. | `README.md`, certification documentation | May 2026 | Product & Architecture | Product Owner | P1 | M | Low | v1.0 | historical, documentation, bloc-3 | Bloc 3 |
| CL-002 | Product framing and software architecture | Establish the backend/frontend monorepo architecture | maintenance | historical done | Separate the REST API and web application while retaining one repository and coherent delivery process. | Repository structure and README architecture; frontend and backend commit history. | `cinelink-backend/`, `cinelink-frontend/`, `README.md` | Late 2025 – early 2026 | Product & Architecture | Software Architect | P1 | L | Medium | v1.0 | historical, maintenance, bloc-3 | Bloc 3 |
| CL-003 | Product framing and software architecture | Document architecture, API endpoints and deployment procedures | documentation | historical done | Produce maintainable technical documentation for architecture, API usage, setup, validation, accessibility and deployment. | Commits [`918deaf`](https://github.com/Furo347/CineLink/commit/918deafd4ffdd243195e4b7586d5639423715047), [`2edd1fe`](https://github.com/Furo347/CineLink/commit/2edd1fe855966f9d53e63ecbc79df47c2a627d1c), [`b6edd46`](https://github.com/Furo347/CineLink/commit/b6edd4636583056620c219c98512aad7c725e015), and [`f4145aa`](https://github.com/Furo347/CineLink/commit/f4145aa125e49af43a443a136a5aca65b8746b75). | `README.md`, `docs/`, backend deployment documentation | Apr–Jul 2026 | Documentation | Software Architect | P2 | L | Low | v1.0 | historical, documentation, bloc-3, bloc-4 | Both |
| CL-004 | Backend foundation and authentication | Implement JWT registration and login | feature | historical done | Create secure registration and login with password hashing, JWT generation, and environment-based secrets. | Commit [`080d8e2`](https://github.com/Furo347/CineLink/commit/080d8e2d672b2ff350f6c476b55c18baed6d1af9), dated 4 Nov 2025. | `cinelink-backend/src/controllers/authController.ts`, auth routes, user model | Nov 2025 | Backend | Backend Developer | P0 | L | High | v1.0 | historical, feature, security, bloc-3 | Bloc 3 |
| CL-005 | Backend foundation and authentication | Harden authentication validation and route protection | maintenance | historical done | Strengthen input validation, password rules, JWT checks and protected-route behavior. | Commits [`2c08519`](https://github.com/Furo347/CineLink/commit/2c08519542f9a9bb949abb400d9a7efd2bf09b8d) and [`c06fcba`](https://github.com/Furo347/CineLink/commit/c06fcba71296ba70c511c93707f2601276a07085). | auth controller, validation rules, auth middleware, auth tests | Q2 2026 | Backend | Backend Developer | P0 | M | High | v1.0 | historical, maintenance, security, bloc-4 | Both |
| CL-006 | Backend foundation and authentication | Integrate TMDB popular movies, movie details and search | feature | historical done | Replace mock movie data with TMDB-backed popular movies, details, credits, videos and search. | Commits [`7112806`](https://github.com/Furo347/CineLink/commit/711280634c0198c1f7feb98719402cac6609ffeb), dated 13 Nov 2025; [`351a432`](https://github.com/Furo347/CineLink/commit/351a4320705af9c2edece9dc1600030f47794008); and [`93ddfba`](https://github.com/Furo347/CineLink/commit/93ddfba645c4b6e0fbada3df0c618539cad34f88). | movie and search controllers/routes, TMDB client | Nov–Dec 2025 | Backend | Backend Developer | P1 | L | Medium | v1.0 | historical, feature, bloc-3 | Bloc 3 |
| CL-007 | Backend foundation and authentication | Implement user profiles, avatar management and user discovery | feature | historical done | Expose user search, public profiles, personal profile data, favorites/comments by user and avatar handling. | Commits [`01918b1`](https://github.com/Furo347/CineLink/commit/01918b154a45c2d4a47151f1cfd38cdb1876d51e), [`0594477`](https://github.com/Furo347/CineLink/commit/0594477c05d5a97b724db21d9602841c329403e7), [`0d898c1`](https://github.com/Furo347/CineLink/commit/0d898c15982dcd17340cde789302d202c7d58e0d), and [`d91aca5`](https://github.com/Furo347/CineLink/commit/d91aca5c98c008ce77652945d531318d897800d6). | user routes/controllers/models; profile and avatar frontend features | Q1–Q2 2026 | Backend | Backend Developer | P1 | L | Medium | v1.0 | historical, feature, bloc-3 | Bloc 3 |
| CL-008 | Backend foundation and authentication | Add administrator roles and role-based access control | feature | historical done | Add admin roles, protected admin routes, user/comment moderation and a promotion script. | Commit [`11ee7fd`](https://github.com/Furo347/CineLink/commit/11ee7fd6317223d111e440bfa460a758df5ab8bf). | admin routes/controllers, role middleware, user model, admin tests | Jul 2026 | Backend | Backend Developer | P1 | L | High | v1.0 | historical, feature, security, bloc-3, bloc-4 | Both |
| CL-009 | Movie and social features | Implement favorites lifecycle and movie ratings | feature | historical done | Add, list, enrich, remove and rate user favorites. | Commits [`c89f296`](https://github.com/Furo347/CineLink/commit/c89f296829b8d14d03a27540961dbf5d3226525a), dated 5 Nov 2025; [`279cab8`](https://github.com/Furo347/CineLink/commit/279cab8cd4b83d6e544feff890295aebc51bc83e); [`a57b7f7`](https://github.com/Furo347/CineLink/commit/a57b7f7cd16537f30868d5b66ed00999c9639753); and [`a761364`](https://github.com/Furo347/CineLink/commit/a761364ca3155709984747e4b83a9d83b92e3641). | favorite model/controller/routes and favorites frontend | Nov 2025 – Q1 2026 | Backend | Backend Developer | P1 | L | Medium | v1.0 | historical, feature, bloc-3 | Bloc 3 |
| CL-010 | Movie and social features | Implement movie comments and controlled deletion | feature | historical done | Create, list and delete comments while enforcing ownership and later admin moderation. | Commit [`e0d137d`](https://github.com/Furo347/CineLink/commit/e0d137d97bdb87eee023ca9e7efe3e2dbe2f625b), dated 9 Dec 2025; commit [`e232e50`](https://github.com/Furo347/CineLink/commit/e232e50eb6b52e1bbfdcfc96fb1d1af57a1b558f). | comment model/controller/routes and movie details comments UI | Dec 2025 – May 2026 | Backend | Backend Developer | P1 | M | Medium | v1.0 | historical, feature, bloc-3 | Bloc 3 |
| CL-011 | Movie and social features | Implement follow and unfollow relationships | feature | historical done | Add follower/following relationships, duplicate/self-follow protection and following retrieval. | Commit [`26659be`](https://github.com/Furo347/CineLink/commit/26659be524672f163979d1d0c63d0cc9f48ad7a8), dated 9 Dec 2025; frontend commit [`3679669`](https://github.com/Furo347/CineLink/commit/3679669988ec9416a1ef777ab964f0a6cc45cea5). | follow model/controller/routes and frontend follow components/pages | Dec 2025 – Q1 2026 | Backend | Backend Developer | P1 | M | Medium | v1.0 | historical, feature, bloc-3 | Bloc 3 |
| CL-012 | Movie and social features | Build the personalized activity feed | feature | historical done | Aggregate followed-user activity and present favorite, rating and comment events with movie and avatar data. | Commits [`fdeadc2`](https://github.com/Furo347/CineLink/commit/fdeadc2771f97f8d6b7321ab711dff92283002bf), [`76bce16`](https://github.com/Furo347/CineLink/commit/76bce16fb8b357ee81e47611c7fed971471b6c9c), and [`54ee013`](https://github.com/Furo347/CineLink/commit/54ee0131e03dba83a75fee7a55237a997347b7f7). | backend feed controller/routes; `features/feed/`; app routing | Q2 2026 | Backend | Backend Developer | P1 | XL | High | v1.0 | historical, feature, performance, bloc-3 | Bloc 3 |
| CL-013 | Movie and social features | Provide deterministic demo data and seed tooling | maintenance | historical done | Seed demo users, favorites, comments and follow relations for validation and presentation. | Commits [`4b15ca8`](https://github.com/Furo347/CineLink/commit/4b15ca8eaabd315531d7c20da1f5b8fe3ec43b2b), [`49768c9`](https://github.com/Furo347/CineLink/commit/49768c9ccacc2d1debe6a7b73fb4b7904c25f2db), and [`eaaf3cd`](https://github.com/Furo347/CineLink/commit/eaaf3cd16cf88b3f069f9006a9014906cd0cd399). | backend seed script and README | Apr 2026 | Quality & DevOps | Backend Developer | P2 | M | Medium | v1.0 | historical, maintenance, documentation, bloc-3 | Bloc 3 |
| CL-014 | Frontend web application | Establish the React/Vite/TypeScript frontend and authentication guard | feature | historical done | Create the web frontend foundation, UI theme, authentication pages, token storage and protected routing. | Commit [`700e613`](https://github.com/Furo347/CineLink/commit/700e6130dd8c57fb6d76a88a1fb78561d1a11121) and subsequent frontend history. | `cinelink-frontend/src/app/`, `features/auth/`, `services/` | Q1 2026 | Frontend | Frontend Developer | P0 | XL | High | v1.0 | historical, feature, security, bloc-3 | Bloc 3 |
| CL-015 | Frontend web application | Deliver movie catalog, details, trailers and comments UI | feature | historical done | Implement catalog/search, movie details, cast, trailer and comment interactions. | Commits [`397b5c4`](https://github.com/Furo347/CineLink/commit/397b5c41f2a53de4956a539d3a54f341b2014e3f) and [`3ff455a`](https://github.com/Furo347/CineLink/commit/3ff455a5e33266e84547117598f6c24ae8d31b0b). | movie feature pages/components/API services | Q1–Q2 2026 | Frontend | Frontend Developer | P1 | XL | Medium | v1.0 | historical, feature, bloc-3 | Bloc 3 |
| CL-016 | Frontend web application | Deliver favorites, ratings and user-feedback interactions | feature | historical done | Implement favorites list/add/remove, ratings, enriched metadata, toast feedback and star display. | Commits [`a761364`](https://github.com/Furo347/CineLink/commit/a761364ca3155709984747e4b83a9d83b92e3641), [`24d82f8`](https://github.com/Furo347/CineLink/commit/24d82f83730a8ec6224ae4a459c5f8fc3c29a761), and [`653f4c7`](https://github.com/Furo347/CineLink/commit/653f4c76670e53dde81cbc386edc77fa5d2f5acd). | favorites feature and movie details integration | Q1–Q2 2026 | Frontend | Frontend Developer | P1 | L | Medium | v1.0 | historical, feature, bloc-3 | Bloc 3 |
| CL-017 | Frontend web application | Deliver users, profiles and following pages | feature | historical done | Allow users to discover accounts, view profiles, manage their own profile and follow/unfollow users. | Commits [`01918b1`](https://github.com/Furo347/CineLink/commit/01918b154a45c2d4a47151f1cfd38cdb1876d51e), [`0594477`](https://github.com/Furo347/CineLink/commit/0594477c05d5a97b724db21d9602841c329403e7), and [`3679669`](https://github.com/Furo347/CineLink/commit/3679669988ec9416a1ef777ab964f0a6cc45cea5). | users and follow frontend features | Q1 2026 | Frontend | Frontend Developer | P1 | L | Medium | v1.0 | historical, feature, bloc-3 | Bloc 3 |
| CL-018 | Frontend web application | Deliver the activity feed interface and empty states | feature | historical done | Display followed-user activity, movie cards, actor links, timestamps, loading and empty states. | Commits [`fdeadc2`](https://github.com/Furo347/CineLink/commit/fdeadc2771f97f8d6b7321ab711dff92283002bf) and [`54ee013`](https://github.com/Furo347/CineLink/commit/54ee0131e03dba83a75fee7a55237a997347b7f7). | `cinelink-frontend/src/features/feed/` | Q2 2026 | Frontend | Frontend Developer | P1 | L | Medium | v1.0 | historical, feature, performance, bloc-3 | Bloc 3 |
| CL-019 | Frontend web application | Add administration dashboard and moderation UI | feature | historical done | Provide user-management statistics and admin moderation actions in the frontend. | Commit [`a12e879`](https://github.com/Furo347/CineLink/commit/a12e879fbdc6329d2f82ba7f8084c59ed109ba73), dated Jul 2026; backend RBAC commit [`11ee7fd`](https://github.com/Furo347/CineLink/commit/11ee7fd6317223d111e440bfa460a758df5ab8bf). | admin frontend feature and admin backend routes | Jul 2026 | Frontend | Frontend Developer | P1 | L | High | v1.0 | historical, feature, security, bloc-3 | Bloc 3 |
| CL-020 | Frontend web application | Improve accessibility, loading states and authentication UX | feature | historical done | Improve wait messaging, loading behavior, accessibility documentation and user guidance. | Commits [`f25b84e`](https://github.com/Furo347/CineLink/commit/f25b84eb8d1d5ec12524d412c7830e15d841a65b), [`b6edd46`](https://github.com/Furo347/CineLink/commit/b6edd4636583056620c219c98512aad7c725e015), [`35d435c`](https://github.com/Furo347/CineLink/commit/35d435c73c60e82b51e91df2e3e59c7bd1d557bd), and [`ecffce7`](https://github.com/Furo347/CineLink/commit/ecffce74005105fc82c3e425e61223a477d63e2d). | auth pages, accessibility documentation | May–Jul 2026 | Frontend | Frontend Developer | P2 | M | Low | v1.0 | historical, feature, documentation, bloc-3 | Bloc 3 |
| CL-021 | Quality, testing and DevOps | Build backend integration and route test coverage | maintenance | historical done | Add Jest/Supertest/MongoMemoryServer tests for health, auth, search, users, favorites, follows, comments and administration. | Commits [`63a1371`](https://github.com/Furo347/CineLink/commit/63a1371cc3d804a8014455046b21d873f3a881af), [`29d25d2`](https://github.com/Furo347/CineLink/commit/29d25d24f69b47e427a85eba11714c1bc73f1fa4), [`6c91f59`](https://github.com/Furo347/CineLink/commit/6c91f59e17f223807ac720e1a32097bbf2263311), and [`5e9fc21`](https://github.com/Furo347/CineLink/commit/5e9fc21de3863967cebc969d4b03710570bea531). | `cinelink-backend/tests/`, Jest configuration | Dec 2025 – Jul 2026 | Quality & DevOps | QA | P1 | XL | Medium | v1.0 | historical, maintenance, bloc-3, bloc-4 | Both |
| CL-022 | Quality, testing and DevOps | Establish frontend component testing with Vitest and JSDOM | maintenance | historical done | Configure and implement frontend component and authentication-page tests. | Commits [`cc58acc`](https://github.com/Furo347/CineLink/commit/cc58acc864b4e6e99c79fff539899472f4976be6), [`b6cd356`](https://github.com/Furo347/CineLink/commit/b6cd3566aa305b81dd8792839ea18bd3788a6d84), and [`31acfe8`](https://github.com/Furo347/CineLink/commit/31acfe802db73a44e85cad9e96a14372153b0ef6). | frontend tests and Vitest configuration | May 2026 | Quality & DevOps | QA | P2 | M | Medium | v1.0 | historical, maintenance, bloc-3, bloc-4 | Both |
| CL-023 | Quality, testing and DevOps | Containerize the backend and MongoDB development environment | maintenance | historical done | Add a multi-stage Node 20 image and Docker Compose stack with MongoDB 7 and persistent storage. | Commit [`7668860`](https://github.com/Furo347/CineLink/commit/7668860842b35d59d6c80af738998c0d08e83ecf), dated 21 Jan 2026. | `cinelink-backend/Dockerfile`, `docker-compose.yml` | Jan 2026 | Quality & DevOps | DevOps | P1 | M | Medium | v1.0 | historical, maintenance, bloc-3, bloc-4 | Both |
| CL-024 | Quality, testing and DevOps | Establish backend and frontend continuous integration | maintenance | historical done | Automatically install, test, type-check and build application changes. | Backend commits [`12f64c7`](https://github.com/Furo347/CineLink/commit/12f64c75be256a37fb4bd4881bb184ba7233d77b), [`caaa86e`](https://github.com/Furo347/CineLink/commit/caaa86ec63789085bb9cc4a9a4307cdbdc96d505), and [`0274696`](https://github.com/Furo347/CineLink/commit/02746960f32e632554b91ccf6486915008787872); frontend commit [`d5e85c2`](https://github.com/Furo347/CineLink/commit/d5e85c2f08cd99a765b891e85b7f529e732e939f). | `.github/workflows/` | Jan–Apr 2026 | Quality & DevOps | DevOps | P0 | L | High | v1.0 | historical, maintenance, bloc-3, bloc-4 | Both |
| CL-025 | Quality, testing and DevOps | Integrate continuous code-quality analysis | maintenance | historical done | Add SonarCloud analysis to the CI/quality workflow. | Commit [`a4aacb8`](https://github.com/Furo347/CineLink/commit/a4aacb8fc887d09dc5b823ef8214d3757442bc44). | GitHub Actions and Sonar configuration | Jul 2026 | Quality & DevOps | QA | P2 | M | Medium | v1.0 | historical, maintenance, bloc-3, bloc-4 | Both |
| CL-026 | Production deployment and operational maintenance | Automate dependency updates and structured issue intake | maintenance | historical done | Add weekly Dependabot scanning for backend, frontend and Actions; add professional bug, feature and maintenance forms. | Commits [`a9853f4`](https://github.com/Furo347/CineLink/commit/a9853f42f9dfb68ee07b79e7309653b1fa998730), [`fc9e2a1`](https://github.com/Furo347/CineLink/commit/fc9e2a166bc01ad3152a0a156807830a889d1d5a), and merge [`7423482`](https://github.com/Furo347/CineLink/commit/74234827ccb0f455ceee20167b5a7899f4c81b8a). | `.github/dependabot.yml`, `.github/ISSUE_TEMPLATE/` | Jul 2026 | Production & MCO | DevOps | P1 | M | Low | v1.0 | historical, maintenance, dependencies, bloc-3, bloc-4 | Both |
| CL-027 | Production deployment and operational maintenance | Prepare production configuration and database safeguards | maintenance | historical done | Validate required database configuration, production seed execution and connection logging. | Commits [`1076da4`](https://github.com/Furo347/CineLink/commit/1076da4fd04f23dc604f0f695653ab498357d93a), [`eaaf3cd`](https://github.com/Furo347/CineLink/commit/eaaf3cd16cf88b3f069f9006a9014906cd0cd399), and deployment documentation. | DB configuration, seed scripts, environment documentation | Apr–Jul 2026 | Production & MCO | DevOps | P0 | M | High | v1.0 | historical, maintenance, bloc-4 | Bloc 4 |
| CL-028 | Production deployment and operational maintenance | Deploy the frontend and support client-side routing | maintenance | historical done | Deploy the React application through Vercel and ensure SPA routes rewrite to `index.html`. | Commit [`ba1a01a`](https://github.com/Furo347/CineLink/commit/ba1a01a9cba0460893030315e179bede653d52ee); successful Vercel status on `main`. | Vercel configuration and frontend production deployment | May 2026 | Production & MCO | DevOps | P0 | M | Medium | v1.0 | historical, maintenance, bloc-4 | Bloc 4 |
| CL-029 | Production deployment and operational maintenance | Add production health checks, structured logging and deployment documentation | maintenance | historical done | Expose `/` and `/api/health`, report database health and runtime metrics, add application logging and document production deployment. | Commits [`eda5139`](https://github.com/Furo347/CineLink/commit/eda513903c600082be4d4e86f0780be03467403d) and [`db1cacc`](https://github.com/Furo347/CineLink/commit/db1cacccbd8fa8c1d3a35b403d043e227ba481e3), dated 6 Jul 2026. | health route/controller, logger, HTTP logging, `docs/deployment.md` | Jul 2026 | Production & MCO | DevOps | P0 | L | High | v1.0 | historical, maintenance, bloc-4 | Bloc 4 |
| CL-030 | Production deployment and operational maintenance | Formalize external availability monitoring | maintenance | partially done | Monitor production frontend and backend availability and retain alerting evidence. | User-confirmed Better Stack setup; repository evidence and monitoring screenshots are not yet retained. | External Better Stack configuration; future monitoring documentation | Jul 2026 | Production & MCO | DevOps | P1 | S | Medium | v1.1 | maintenance, documentation, bloc-4 | Bloc 4 |

## 5. Historical incident inventory

### INC-001 — Render deployment timed out after successful backend startup

**Status:** resolved, exact root cause not fully proven.

**Verified symptoms**

```text
==> Running 'npm start'
> cinelink-backend@1.0.0 start
> node dist/server.js
MongoDB connected
Server running on port 10000
==> Timed Out
```

**Impact**

The backend process started and connected to MongoDB, but Render did not mark the deployment healthy. The production API was therefore not considered successfully deployed during that attempt.

**Confirmed facts**

- MongoDB connectivity succeeded.
- Express listened on Render's supplied port.
- The deployment nevertheless timed out.
- A public root route and `/api/health` were added or verified.
- The production health endpoint later returned HTTP 200 with application and database status `UP`.
- A later Render deployment succeeded.

**Probable explanation**

The most credible explanation is a health-detection or route-availability issue during the Render deployment lifecycle. This remains an inference because no Render platform diagnostic proves a single root cause.

**Resolution evidence**

- [`db1cacc`](https://github.com/Furo347/CineLink/commit/db1cacccbd8fa8c1d3a35b403d043e227ba481e3) adds the public root status endpoint and tests.
- `/api/health` was externally validated after redeployment.
- Better Stack monitoring was subsequently introduced as a preventive control.

### INC-002 — Backend CI initially lacked stable triggers and environment handling

**Status:** resolved.

**Symptoms**

CI configuration required refinement around triggers and authentication environment variables.

**Evidence and resolution**

- [`12f64c7`](https://github.com/Furo347/CineLink/commit/12f64c75be256a37fb4bd4881bb184ba7233d77b) introduced backend CI.
- [`b251944`](https://github.com/Furo347/CineLink/commit/b25194425129028ebc7af8254687420ade3e701d) improved JWT environment handling and cleaned the workflow.
- [`caaa86e`](https://github.com/Furo347/CineLink/commit/caaa86ec63789085bb9cc4a9a4307cdbdc96d505) added explicit event triggers and workflow structure.
- [`0274696`](https://github.com/Furo347/CineLink/commit/02746960f32e632554b91ccf6486915008787872) stabilized npm caching and the Mongo service.

### INC-003 — TypeScript and test configuration incompatibilities

**Status:** resolved for known historical cases.

**Symptoms**

TypeScript/test build configuration required changes to imports, `tsconfig`, and deprecated settings.

**Evidence and resolution**

- [`66656c4`](https://github.com/Furo347/CineLink/commit/66656c4408e5946479d5d86ce0e59ebd358b7210) adjusted Supertest import syntax and TypeScript configuration.
- [`5fb4ac1`](https://github.com/Furo347/CineLink/commit/5fb4ac1c7bdc6de183fdc7fa481f0e86dcca029c) corrected a deprecated TypeScript configuration.
- Frontend test/build configuration was stabilized through [`b6cd356`](https://github.com/Furo347/CineLink/commit/b6cd3566aa305b81dd8792839ea18bd3788a6d84).

### INC-004 — Missing or invalid MongoDB production configuration

**Status:** mitigated.

**Symptoms**

Application startup and production seed execution depend on a valid `MONGO_URI`.

**Evidence and resolution**

- [`1076da4`](https://github.com/Furo347/CineLink/commit/1076da4fd04f23dc604f0f695653ab498357d93a) adds explicit handling for a missing `MONGO_URI` and connection-status logging.
- [`eaaf3cd`](https://github.com/Furo347/CineLink/commit/eaaf3cd16cf88b3f069f9006a9014906cd0cd399) adds production-environment support for the seed script.
- Deployment documentation lists required environment variables.

### INC-005 — Incorrect logout navigation path

**Status:** resolved.

**Evidence**

Commit [`a62de7f`](https://github.com/Furo347/CineLink/commit/a62de7fb44189a9b710164b3e0e95540f22f613d) changes logout navigation to `/login`.

### INC-006 — Intermittent MongoMemoryServer timeout in backend tests

**Status:** open.

**Observed result**

A user-run test session completed with six suites passing and one suite failing because MongoMemoryServer exceeded its startup timeout.

**Current assessment**

The failure appears infrastructure/test-environment related rather than caused by the MCO health/logging implementation. It still needs a reproducible issue, timeout diagnostics, isolation of the failing suite, and a stable correction.

## 6. Current and future backlog

| Proposed title | Type | Status | Expected value | Suggested milestone | Labels |
|---|---|---|---|---|---|
| Fix intermittent MongoMemoryServer startup timeout in backend tests | bug | open | Restore reliable CI and local test execution | v1.1 | bug, maintenance, bloc-4 |
| Implement pagination or infinite scrolling in the activity feed | feature | open | Reduce initial payload and improve feed scalability | v1.1 | feature, performance, bloc-3, bloc-4 |
| Add skeleton loading states to the frontend | feature | open | Improve perceived performance and visual stability | v1.1 | feature, performance, bloc-3 |
| Implement frontend request caching | maintenance | open | Reduce redundant API/TMDB requests and improve responsiveness | v1.2 | maintenance, performance, bloc-4 |
| Display relative timestamps in the activity feed | feature | open | Improve readability of recent social activity | v1.1 | feature, bloc-3 |
| Add follow and unfollow actions directly from the feed | feature | open | Reduce navigation friction and increase social interaction | v2.0 | feature, bloc-3 |
| Add likes to activity-feed events | feature | open | Introduce direct engagement with social activity | v2.0 | feature, bloc-3 |
| Improve structured logging with correlation identifiers | maintenance | open | Improve incident analysis and request traceability | v1.2 | maintenance, bloc-4 |
| Create an operational maintenance runbook | documentation | open | Standardize incident, deployment, rollback and recovery procedures | v1.2 | documentation, maintenance, bloc-4 |
| Establish and maintain `CHANGELOG.md` | documentation | open | Provide release traceability and communicate maintenance changes | v1.1 | documentation, maintenance, bloc-4 |
| Perform a production-readiness audit | maintenance | open | Identify remaining security, performance, resilience and documentation gaps | v1.2 | maintenance, security, performance, bloc-4 |
| Add Better Stack status badges to the repository README | documentation | open | Make production availability visible from the repository | v1.1 | documentation, maintenance, bloc-4 |

## 7. Uncertainties requiring human validation

The following information cannot be reconstructed safely from repository evidence alone:

1. The original project start date and original delivery deadline.
2. The original prioritization process used before GitHub Projects.
3. Actual time spent per feature or incident.
4. Original cost estimates and actual project costs.
5. Whether every historical commit was implemented by the same role or under an explicitly assigned project role.
6. Exact dates for external Render, Vercel, Atlas and Better Stack configuration changes when no repository commit records them.
7. The definitive root cause of the Render timeout.
8. The exact failing MongoMemoryServer suite and its reproducibility rate.
9. Any verbal stakeholder validation not preserved in documentation.
10. The original acceptance criteria used before the introduction of GitHub Issue Forms.
11. Whether some repository documentation describes intended architecture more strongly than the actual implementation.
12. Better Stack alert-delivery evidence and uptime history, which should be captured at the end of the MCO work.

## 8. Rules for creating retrospective GitHub issues

Every retrospective issue created from this document must:

- include the `historical` label;
- state that it was reconstructed from repository evidence;
- link to the relevant commits and files;
- use the actual implementation period, not the issue creation date;
- be closed only after evidence is reviewed;
- avoid invented effort, cost, deadline, stakeholder feedback or root-cause claims.

Use this note verbatim:

> This issue was reconstructed retrospectively from repository evidence in order to formalize project traceability. It was not used as the original implementation ticket.
