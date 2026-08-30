# HackSprint — System Architecture

**Status:** Living document
**Scope:** Backend platform architecture
**Audience:** Engineers contributing to or operating HackSprint

---

## 1. Overview

HackSprint is a centralized hackathon and developer learning platform built on a microservices architecture. It allows users to register and authenticate, browse and participate in hackathons, upload project submissions, receive notifications, and store media assets on Amazon S3.

Unlike a typical CRUD web application, HackSprint is deliberately structured as a backend-focused distributed system. The platform exists as much to be an engineering exercise as it does to be a product: it is a vehicle for building real experience with distributed systems design, inter-service communication, containerized deployment, observability, and cloud operations. That framing matters throughout this document — several architectural choices favor learning value and operational realism over the shortest path to a working feature.

This document describes the system as it is currently implemented. Section 9 separates out work that is planned but not yet built; nothing in that section should be read as part of the current system.

---

## 2. Current Architecture

At a high level, a request enters through a single public edge, is terminated and forwarded by Nginx, routed by an API Gateway, and handled by one of five independently deployable services.

```mermaid
graph TD
    Internet["Internet"] --> Nginx["Nginx Reverse Proxy"]
    Nginx --> Gateway["API Gateway"]
    Gateway --> Auth["Auth Service"]
    Gateway --> Hackathon["Hackathon Service"]
    Gateway --> Media["Media Service"]
    Gateway --> Notification["Notification Service"]
    Gateway --> Chatbot["Chatbot Service"]

    Auth --> Mongo[("MongoDB")]
    Hackathon --> Mongo
    Media --> Mongo
    Notification --> Mongo

    Auth --> Redis[("Redis")]
    Hackathon --> Redis

    Media --> S3[("Amazon S3")]

    Chatbot --> Gemini[("Gemini API")]

    Prometheus["Prometheus"] -.scrapes.-> Auth
    Prometheus -.scrapes.-> Hackathon
    Prometheus -.scrapes.-> Media
    Prometheus -.scrapes.-> Notification
    Prometheus -.scrapes.-> Chatbot
    Prometheus --> Grafana["Grafana"]
```

The five services implemented today are the Auth Service, the Hackathon Service, the Media Service, the Notification Service, and the Chatbot Service. Each is its own Express application, each owns its own deployment lifecycle, and each is reachable only through the API Gateway — no service is exposed directly to the internet. Inter-service communication is overwhelmingly synchronous HTTP, with one exception: transactional email is handed off asynchronously via a BullMQ/Redis job queue, with the Auth Service enqueueing jobs and the Notification Service consuming them. No broader message broker exists beyond that single queue, and none should be assumed by anything downstream of this document.

The Chatbot Service is architecturally distinct from the other four: it holds no database connection at all. It answers general platform FAQ questions via Google's Gemini API using a fixed system prompt, with the frontend supplying the visible conversation history on each request rather than the service persisting any state itself — see [`services.md`](./services.md) Section 6 for why that boundary is deliberate, not an oversight.

The Hackathon Service supports two distinct event formats behind one `Hackathon` document schema, distinguished by an `eventFormat` field: the original **submission-based** format (registration → project submission → judging/voting), and an **on-spot** format for in-person, bracket/tournament-style events (drone combat, robotics, similar physical competitions). On-spot events reuse the existing phase mechanism with a `MATCH_ROUND` phase type, and add one new collection, `Match` (team A vs. team B, scores, a computed winner, and an admin-editable `scheduledAt`). Standings for an on-spot event are derived on read from `Match` documents rather than stored as a persisted status, and are always publicly visible — unlike submission-based results, which an admin can gate behind `showResult`. Adding this format required no new service and no change to the request path described above; it lives entirely inside the Hackathon Service's existing routes and data model.

There are now two pieces of time-based (rather than request-driven) execution in the system, both `node-cron` jobs inside the Hackathon Service, both calling out to the Notification Service synchronously the same as any other inter-service call:

- A hourly sweep for registration/submission phases closing soon, firing a reminder at 24 hours out and again at 12 hours out (each milestone tracked independently, so both fire exactly once per phase).
- A 5-minute sweep for on-spot `Match` documents, reminding both teams as their scheduled match time approaches (1 hour out, then 15 minutes out) — a much tighter cadence than the hourly job, since on-spot matches are same-day events where a 24-hour-granularity check would mostly miss the window entirely.

Neither is a job queue — both are in-process timers, and should not be conflated with the BullMQ queues described below, which are genuinely separate, message-passing mechanisms.

The Notification Service also now sends **browser push notifications** (Web Push / VAPID) alongside its existing in-app notifications, for every notification the platform creates — the two reminder jobs above included. A `PushSubscription` collection stores each browser's push endpoint per user, subscribed to from the frontend's notification bell (auto-subscribed on first visit, no click required, unless the user has already denied permission). Sending a push is queued through its own BullMQ/Redis queue (`push`), separate from the pre-existing `email` queue, so a slow or failing push provider can never delay in-app notification creation. This is the second asynchronous branch in the system, alongside transactional email — it should no longer be described as the only one.

Related reading: [`api-gateway.md`](./api-gateway.md), [`services.md`](./services.md).

---

## 3. Request Flow

A typical client request follows a fixed path from the browser or client application down to the data layer and back. There is no branching logic at the network layer — routing decisions happen at the API Gateway, and everything below it is a direct service-to-datastore interaction.

```mermaid
sequenceDiagram
    participant Client
    participant Nginx as Nginx (HTTPS termination)
    participant Gateway as API Gateway
    participant Service as Target Service
    participant Data as MongoDB / Redis / S3

    Client->>Nginx: HTTPS request
    Nginx->>Gateway: Forward request (HTTP, internal network)
    Gateway->>Service: Route to target service
    Service->>Data: Read/write (MongoDB, Redis, or S3 as applicable)
    Data-->>Service: Result
    Service-->>Gateway: Response
    Gateway-->>Nginx: Response
    Nginx-->>Client: HTTPS response
```

Nginx is the only component that speaks TLS to the outside world; everything behind it communicates over the internal Docker network in plaintext HTTP. This is a standard pattern for single-host deployments: it keeps certificate management in one place and avoids the overhead of terminating and re-establishing TLS at every hop, while still giving each internal service network isolation via Docker's bridge networking.

---

## 4. Data Layer

HackSprint currently uses three data stores, each chosen for a distinct access pattern rather than out of convenience.

### 4.1 MongoDB — Primary Datastore

MongoDB is the system of record. It stores user accounts, hackathon records, submissions, media metadata, and notification data. A document database fits this domain well: hackathon and submission records are naturally nested and heterogeneous (a submission may reference varying numbers of team members, links, and attachments), and the schema is still evolving as the platform grows, which document flexibility accommodates better than a rigid relational schema would at this stage.

Every service that needs persistent state talks to MongoDB directly; there is currently no shared data-access service or ORM layer abstracting this — each service owns its own collections and its own queries.

### 4.2 Redis — Caching Layer

Redis is currently used for caching and for session-related functionality where applicable. It also serves as infrastructure that is already in place ahead of planned rate-limiting work (see Section 9) — the instance exists and is wired into services today, but no rate-limiting logic runs against it yet. It is important to be precise here: Redis's *current* job is caching and sessions, nothing more.

### 4.3 Amazon S3 — Object Storage

S3 stores everything that isn't structured record data: file uploads, project submissions, images, documents, and other large media assets. Offloading binary content to S3 rather than MongoDB keeps the primary database small, fast, and focused on queryable data, and it means media storage scales independently of database storage. Services authenticate to S3 using an IAM role rather than embedded credentials (see Section 6).

---

## 5. Why Microservices

The decision to build HackSprint as a set of independent services, rather than a single monolithic application, was deliberate and comes with real tradeoffs discussed in full in Section 10. The reasoning:

**Independent deployment.** Each of the five services — Auth, Hackathon, Media, Notification, Chatbot — can be built, tested, and deployed on its own schedule. A change to how notifications are sent does not require redeploying the authentication code path.

**Service isolation.** Each service owns its own codebase and its own responsibilities. The Media Service knows about S3 uploads; it does not need to know how authentication tokens are issued. This keeps each service's mental model small enough to reason about in isolation.

**Scalability.** Because services are separate deployable units, any one of them can, in principle, be scaled independently of the others if it becomes a bottleneck — for example, the Media Service under heavy upload traffic — without scaling the entire platform.

**Technology flexibility.** While every current service happens to be an Express application, the service boundary means that constraint is a choice, not a structural requirement. A future service is free to use a different runtime if the workload calls for it.

**Fault isolation.** A failure or bug in one service does not directly crash the process space of another. If the Notification Service fails, users can still authenticate and submit projects; the failure is contained to its own container.

**Maintainability.** Smaller, focused codebases are easier for a single engineer (or small team) to hold in their head, which matters directly for a project whose explicit goal is to build and maintain production-realistic infrastructure without a large team behind it.

**Future expansion.** Adding a new capability — for example, a leaderboard or judging service — means adding a new service behind the gateway, not modifying a shared monolith. Section 9 describes several such extensions that this structure is designed to accommodate.

This is not a claim that microservices are strictly better than a monolith for an application of this size — Section 10 addresses that tradeoff directly. The choice here is also intentionally pedagogical: part of the point of HackSprint is to gain hands-on experience with the operational realities of distributed systems.

---

## 6. Deployment

HackSprint runs in production on a single AWS EC2 instance running Ubuntu 24.04. Docker and Docker Compose handle containerization and orchestration: every service, along with Nginx, is defined as a container and brought up as a unit via Compose. This is the appropriate level of orchestration complexity for a single-host deployment — it provides reproducible builds and isolated runtimes without the operational overhead of a multi-node scheduler (see Section 9 for planned Kubernetes work).

Nginx sits in front of the stack as the reverse proxy and terminates HTTPS using a Let's Encrypt certificate, serving the platform on a custom domain. GitHub Actions drives continuous deployment: changes pushed through the pipeline build and ship containers to the EC2 host.

Access to Amazon S3 is granted via an IAM role attached to the EC2 instance rather than static AWS credentials stored in application code or environment files. This removes an entire class of credential-leak risk and is standard practice for any service running on AWS infrastructure.

Observability in production is handled by Prometheus, which scrapes metrics from each service, and Grafana, which visualizes those metrics on dashboards.

```mermaid
graph LR
    GH["GitHub Actions"] -->|deploy| EC2["AWS EC2 (Ubuntu 24.04)"]
    subgraph EC2Host["EC2 Host"]
        DC["Docker Compose"] --> N["Nginx (Let's Encrypt SSL)"]
        DC --> Services["Application Services"]
        DC --> Mon["Prometheus + Grafana"]
    end
    IAM["IAM Role"] -.grants access.-> Services
    Services -.-> S3v[("Amazon S3")]
```

---

## 7. Current Implementation Summary

To remove any ambiguity about what exists today, this section states the current implementation plainly:

The project contains five production services — Auth, Hackathon, Media, Notification, and Chatbot — each an independent Express application. Communication between the gateway and these services, and any direct service-to-service calls, is synchronous HTTP; the two exceptions are transactional email, queued by the Auth Service and consumed by the Notification Service, and browser push delivery, queued internally within the Notification Service — both over their own BullMQ/Redis job queue. Docker Compose orchestrates all containers on a single EC2 host. The API Gateway is responsible for routing incoming requests to the correct backend service. Nginx is responsible for HTTPS termination and sits in front of the gateway. Prometheus collects metrics from the running services, and Grafana renders those metrics for operators. IAM roles are used so that no AWS credentials are ever present in application code or configuration files.

---

## 8. Component Diagram

The following diagram summarizes the full current system in one view — client traffic, the request path, the five services, and the infrastructure each one depends on.

```mermaid
graph TD
    Internet["Internet"] --> Nginx["Nginx"]
    Nginx --> Gateway["API Gateway"]

    Gateway --> Auth["Auth Service"]
    Gateway --> Hackathon["Hackathon Service"]
    Gateway --> Media["Media Service"]
    Gateway --> Notification["Notification Service"]
    Gateway --> Chatbot["Chatbot Service"]

    Auth --> MongoDB[("MongoDB")]
    Hackathon --> MongoDB
    Media --> MongoDB
    Notification --> MongoDB

    Auth --> Redis[("Redis")]
    Hackathon --> Redis

    Media --> S3[("Amazon S3")]

    Chatbot --> Gemini[("Gemini API")]

    Prometheus["Prometheus"] --> Grafana["Grafana"]
    Auth -.metrics.-> Prometheus
    Hackathon -.metrics.-> Prometheus
    Media -.metrics.-> Prometheus
    Notification -.metrics.-> Prometheus
    Chatbot -.metrics.-> Prometheus
```

---

## 9. Future Improvements

The following items are planned but **not implemented**. They are listed here to make the intended direction of the system explicit and to give context for design decisions made today that anticipate this work — nothing in this section should be treated as part of the current architecture described above.

- **Redis-backed rate limiting** — using the Redis infrastructure already in place (Section 4.2) to enforce per-user or per-IP request limits.
- **Gateway JWT verification** — moving token verification into the API Gateway so downstream services can trust an already-authenticated request.
- **Refresh token architecture** — longer-lived refresh tokens paired with short-lived access tokens.
- **Background job queues for other workloads** — a BullMQ/Redis queue already handles transactional email between the Auth Service and Notification Service; extending that pattern to other work that shouldn't block the request/response cycle (e.g., media processing) is still open.
- **Circuit breakers** — protecting services from cascading failure when a downstream dependency is slow or unavailable.
- **Distributed tracing** — end-to-end visibility into a single request as it crosses service boundaries.
- **Centralized logging** — aggregating logs from all services into a single searchable store, rather than per-container logs.
- **Alertmanager** — automated alerting on top of the existing Prometheus metrics.
- **MongoDB automated backups** — scheduled, verified backups of the primary datastore.
- **Docker image optimization** — reducing image size and build time across services.
- **Kubernetes** — migrating orchestration from Docker Compose to Kubernetes as the deployment grows beyond a single host.
- **Service discovery** — replacing static service addressing with dynamic discovery, relevant once the system moves beyond a single-host Compose deployment.
- **Horizontal scaling** — running multiple instances of individual services behind the gateway to handle increased load.

---

## 10. Tradeoffs

The current architecture is a set of deliberate tradeoffs, not a default.

**Advantages.** Each service can be understood, tested, and deployed independently, which keeps the codebase approachable even as the platform grows. Fault isolation means a bug in one service degrades a slice of functionality rather than taking down the whole platform. The infrastructure — Docker Compose, Nginx, Prometheus/Grafana, GitHub Actions — mirrors patterns used in real production systems, which is directly aligned with the project's learning goals around distributed systems, containerization, and observability.

**Disadvantages.** Synchronous HTTP between services means a slow or unavailable downstream service can directly slow down or fail the request that depends on it — there is no circuit breaker yet to absorb that, and only email delivery and browser push have been moved off the synchronous path onto a queue. Four services on a single EC2 host also means the "distributed" system currently shares a single point of physical failure; true fault isolation at the infrastructure level would require multiple hosts. Operating four independent services also carries more day-to-day overhead — more containers to monitor, more deployment pipelines, more surface area — than a single monolithic application would for the same feature set.

**Why this is appropriate at current scale.** HackSprint's traffic and team size today do not require horizontal scaling, service discovery, or Kubernetes — Section 9 lists these as future work precisely because they would add operational complexity the project doesn't yet need. A single EC2 host running Docker Compose is enough capacity for the current user base, and it gives the clearest possible view into how each piece of the system behaves, which matters for a project whose purpose includes learning how these pieces work. Introducing broader message queues, circuit breakers, or multi-node orchestration before they're needed would trade that clarity for complexity without a corresponding benefit yet.
