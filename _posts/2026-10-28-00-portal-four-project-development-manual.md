---
date:       2026-10-28
title: "Portal Four-Project Development Manual"
created: '2026-10-28'
tags:
  - dev-portal
slug: portal-four-project-development-manual
permalink: /2026/10/28/portal-four-project-development-manual
description: "A hands-on manual for the four Portal repositories, covering architecture, integration, backend and frontend standards, and directory ownership."
---

> Applicable repositories: `hoox-cap-backend`, `hoox-cms-backend`, `hoox-cms-pub-ui`, `hoox-cms-pub-app`
>
> Code baseline: `master` branch; verification date 2026-10-27. Corresponding commits:
>
> - `hoox-cap-backend`: `39c86a39` (2026-09-15)
> - `hoox-cms-backend`: `3e59965a` (2026-09-23)
> - `hoox-cms-pub-ui`: `31d38981` (2026-10-26)
> - `hoox-cms-pub-app`: `bc1c72b0` (2026-10-26)
>
> All four repositories had clean working trees at verification time. This document describes only facts visible in the repositories; anything that cannot be confirmed from the code is explicitly marked "to be confirmed" rather than inferred.

## 1. What This Documentation Solves

This is not a "framework introduction"; it is a hands-on manual for taking over the projects, integrating frontend and backend, and day-to-day development. It focuses on answering:

1. What each of the four projects is, where its boundaries are, and how they are connected at runtime.
2. Which files, ports, and authentication parameters must match in pairs for local integration.
3. Where code should go and which standards to follow when adding a backend API, a BFF proxy, or a page.
4. The responsibility of each directory, and which directories are generated artifacts that must not be edited by hand.
5. The "pitfalls" that already exist in the current code, to avoid changing things based on intuition and causing problems.

## 2. Documentation Navigation

| Document | Content | Intended readers |
| --- | --- | --- |
| [01-System Overview and Terminology](/2026/10/28/portal-system-overview-and-terminology) | Terminology, positioning of the four projects, current state, architecture diagrams, request flow, declaration flow diagram | Everyone; read first |
| [02-Integration and Configuration Standards](/2026/10/28/portal-integration-and-configuration-standards) | Local startup, port matrix, environment variables, configuration files, authentication, integration scenarios, and troubleshooting | Frontend/backend integration engineers |
| [03-Backend Development Standards](/2026/10/28/portal-backend-development-standards) | CAP/CMS layering, Java class standards, annotations, response envelope, exceptions, persistence, SQL, tests | Java developers |
| [04-Frontend Development Standards](/2026/10/28/portal-frontend-development-standards) | Next.js App Router, TS standards, data layer, BFF, authentication, i18n, styles, tests | Frontend developers |
| [05-Directory Guide](/2026/10/28/portal-directory-guide) | Item-by-item description of the four repositories' directories/packages/routes, plus "where to change what" | Everyone |

## 3. The Four Projects in Brief

| Project | Role | Technology stack | Local default entry point |
| --- | --- | --- | --- |
| `hoox-cap-backend` | One of Portal's backends, providing declaration, materials, payment, licenses, and other capabilities | Java 21, Spring Boot 2.7.18, SOFA RPC 3.14.1, JAX-RS | Web `8087`, RPC REST `8346` |
| `hoox-cms-backend` | Portal admin backend, responsible for display content configuration and also providing public client APIs | Java 21, Spring Boot 2.7.18, SOFA RPC 3.14.1, MyBatis-Plus | Web `8083`, RPC REST `8343` |
| `hoox-cms-pub-ui` | Portal PC frontend | Next.js 16, React 19, antd 4, NextAuth, Lingui 5 | `http://localhost:8080` |
| `hoox-cms-pub-app` | Portal H5 frontend (InnoApp/WebView) | Next.js 14, React 18, antd-mobile 5, Lingui 4 | `http://localhost:8081/h5` |

Neither frontend lets "the browser access the backend directly": the browser only accesses the Next.js same-origin BFF, and the BFF then accesses CMS/CAP/SMP/GOMS/Cloud Form with authentication headers. See document 01 for the complete chain.

## 4. Shortest Path to Local Integration

First make sure the local machine has: JDK 21, Maven, Node.js (the PC frontend requires `>=20.9.0`), access to the intranet Maven/Nexus and npm private registry, and dependencies such as GaussDB/Redis/ZooKeeper.

```text
1. Start the CMS backend: run CmsWebApplication in the IDE, or run the executable jar after packaging
   -> Web 8083 / RPC REST 8343

2. Start the CAP backend: run CapWebApplication in the IDE, or run the executable jar after packaging
   -> Web 8087 / RPC REST 8346

3. Modify hoox-cms-pub-ui/.env.development
   CMS_REST_API_BASEPATH=http://127.0.0.1:8343
   CAP_REST_API_BASEPATH=http://127.0.0.1:8346
   CAP_SERVER_API_BASEPATH=http://127.0.0.1:8087

4. Modify hoox-cms-pub-app/.env.development
   Likewise point CMS/CAP to the local machine; H5 also needs a reachable APP_API / Cloud Form address

5. Start the frontends
   cd hoox-cms-pub-ui  && npm install && npm run dev   -> http://localhost:8080
   cd hoox-cms-pub-app && npm install && npm run dev   -> http://localhost:8081/h5
```

For details, the meaning of each variable, and how authentication parameters match, see [02-Integration and Configuration Standards](/2026/10/28/portal-integration-and-configuration-standards).

## 5. 10 Things You Must Know Before Development

1. **The BFF is the only entry point.** After adding a backend API, changing `core/datasources` alone is not enough; you must also add a proxy and an **exact whitelist entry** in `src/app/api/**/route.ts`, otherwise the request will be rejected by the BFF.
2. **Both frontends have a BFF, but the prefixes differ.** PC uses `/api/...`, H5 uses `/api-h5/...`; H5 is also mounted under `basePath: '/h5'`.
3. **The backend has two ports.** `SERVER_PORT` is the Web/MVC port, and `RPC_REST_PORT` is the SOFA REST port; ordinary JAX-RS facades generally use the latter, while Spring MVC Controllers such as file upload use the former.
4. **A Maven profile is not a Spring profile.** Maven's `dev` determines which set of `resources/dev` files is packaged; Spring's `devops`, `datasource`, and so on are configuration fragments in `spring.profiles.include`. Do not confuse the two.
5. **The frontend `.env` contains shared-environment addresses, not local-machine addresses.** Local integration must change the base paths to `127.0.0.1` with the corresponding ports; otherwise you may think you are calling the local machine while actually hitting `10.201.50.41`.
6. **Authentication is paired.** The frontend's `CLIENT_ID` and `*_API_AUTH_K` private key must match the backend's `hoox.oauth.auth.hooxAppAuthProvider.<clientId>.publicKey`; PC also has a NextAuth session + CSRF, and H5 also has a CST token / `encryt_uf`.
7. **The BFF whitelist uses exact paths.** Business segments in proxy paths are joined with `-`, for example `cap-rest/hoox/cap/...`; when adding an API, also update the corresponding proxy's `WHITELIST_GET_PATHS`/`WHITELIST_POST_PATHS` and authentication exclusions (if needed).
8. **Response envelopes are not completely identical.** The frontend consumes responses uniformly as `BaseResponse` (`flag/message/errorCode/affectRows/recordsTotal/data`); H5's CAP proxy normalizes only the **POST** branch into `{code,flag,message,data,errorCode}`, while the GET branch passes through. Do not assume all fields are preserved.
9. **CMS has two schema configurations.** The JDBC URL defaults to `currentSchema=hoox_cms`, while MyBatis-Plus globally uses `schema=dpmp`; when changing the database/schema, both must be checked, not just one.
10. **Frontend builds do not block TS/ESLint errors by default.** Both `next.config.js` files set `ignoreBuildErrors` / `ignoreDuringBuilds`, so "build succeeded" does not mean the types are correct; run `npx tsc --noEmit` and `npm run lint` separately before committing.

## 6. Current State Summary

- Both backends are Maven multi-module projects that produce executable fat jars and depend on the internal `hoox-common` BOM and SOFA RPC; no Dockerfile or CI configuration was found in the repositories.
- Both backends committed only the `dev` environment resource directory; Maven profiles such as `test`, `prod`, `huawei`, and `dm` exist in the POMs, but the corresponding resource directories do not exist (based on the current repositories).
- CAP is mainly based on JAX-RS facades, with a small number of file Controllers annotated with both Spring MVC and JAX-RS; CMS is mainly based on JAX-RS facades + MyBatis-Plus.
- Both frontends use the App Router; PC pages are mainly RSC + `page.client.tsx`, and H5 declaration pages are multi-step flows driven by a Zustand state machine.
- The frontend configuration contains key-type settings (mostly ciphertext); this document only gives variable names and formats and does not repeat any key values.
- The repositories contain unit tests (48 PC test files and 30 H5 test files, counted under `src/__tests__` and co-located `*.test.ts(x)` files), but no end-to-end tests or CI pipeline configuration were found.

## 7. Reading Conventions

- Paths are relative to the repository root by default; when crossing repositories, the repository name is given.
- Key values are written uniformly as `<...>` or "ciphertext"; shared-environment addresses are listed as they appear in the repositories so that accidental connections can be recognized. Do not copy any real keys.
- "Must" and "do not" indicate hard constraints already enforced by code/configuration; "recommended" indicates team conventions that will not immediately cause an error if not followed in code.
- Items marked "to be confirmed" cannot be confirmed from the current repositories alone and require verification with the environment owner or the counterparty.
- Ports in the diagrams are **local development defaults**; shared-environment/production values are determined by deployment configuration.
