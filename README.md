# Bazaario — Full-Stack E-Commerce Platform

Bazaario is a production-ready, full-stack e-commerce platform designed with a modern React frontend and a robust Spring Boot backend. The project is built with high-performance standards, strong security controls, and enterprise-grade concurrency controls to mimic real-world production systems.

---

## 🚀 Key Features & Architectural Advancements

### 🛡️ Concurrency & High-Throughput Optimizations
* **Pessimistic Write Locking (Race Condition Solution)**: 
  To prevent overselling and negative stock counts when multiple users purchase the last available unit of a product simultaneously, Bazaario implements **Pessimistic Write Locking** (`SELECT ... FOR UPDATE` via `@Lock(LockModeType.PESSIMISTIC_WRITE)`). This ensures a thread-safe check-and-decrement stock operation inside transactional order placements.
* **Cart Isolation**:
  The active cart is cleared immediately upon order placement, preventing double-ordering or check-out abandonment issues where a user could modify a cart while a payment checkout is in progress.

### 💳 Robust Payment Processing & Idempotency
* **Razorpay Payment Gateway Integration**: Smooth integration for initiating and verifying secure digital payments.
* **Idempotent Payment Verification**:
  Prevents double-charging or duplicate order confirmations due to network blips or double-clicks. Verified through:
  1. A database-level `UNIQUE` constraint on payment transaction IDs.
  2. An API-level check that halts processing and returns the existing record if a transaction ID has already been verified.
* **Accurate Financial Arithmetic**:
  All financial operations, including GST (5%), platform fees, and Paise conversions (1 INR = 100 Paise), are performed using `BigDecimal` with `.setScale(0, RoundingMode.HALF_UP).intValueExact()` to avoid truncation bugs.

### 🔒 Enterprise-Grade Security
* **Stateless JWT Authentication**: Secure user session management via JWT tokens.
* **Google OAuth2 Support**: Google Sign-In with automatic account linking (merges standard email accounts with OAuth profiles under a unified `BOTH` provider state).
* **Defense in Depth**:
  Authorization is verified at both the filter chain and method-level using Spring Security's `@PreAuthorize` annotation (e.g., restricting order status modifications to admins).
* **CORS Allowed Origins**:
  CORS configurations are externalized into `application.properties` to easily adapt from local development to production hosts without modifying source code.

### 📈 Database & API Quality of Service
* **Flyway Migrations**: Automated, versioned database schema migrations (V1 to V5) for reliable and repeatable environment setups.
* **Pagination & DoS Prevention**:
  API requests supporting pagination are capped at a maximum page size of `100` at the controller layer to guard against memory exhaustion and database DoS vectors.

---

## 🛠️ Technology Stack

### Frontend
* **Core**: React 19, JavaScript (ES6+), Vite
* **Styling**: TailwindCSS, Vanilla CSS
* **Routing**: React Router DOM (v7)
* **API Client**: Axios

### Backend
* **Core**: Java 17, Spring Boot (v3.5)
* **Security**: Spring Security, JWT, Google OAuth2
* **Persistence**: Spring Data JPA, Hibernate, MySQL Driver
* **Migrations**: Flyway Migration
* **Build System**: Maven

---

## 📂 Project Structure

```
├── backend/bazaario/               # Spring Boot Application
│   ├── src/main/java/             # Source code (controller, service, repository, entity, security)
│   ├── src/main/resources/        # Application properties and database migrations
│   ├── pom.xml                    # Maven dependencies configuration
│   └── Dockerfile                 # Container deployment setup
│
├── src/                           # Frontend React Application
│   ├── components/                # Reusable UI components
│   ├── context/                   # React Context (Cart, Auth, etc.)
│   ├── pages/                     # Routed pages (Home, Cart, Checkout, Order History)
│   ├── index.css                  # Global style sheet and theme tokens
│   └── main.jsx                   # React entry point
│
├── package.json                   # Node.js dependencies & scripts
├── vite.config.js                 # Vite bundler configuration
└── README.md                      # Project documentation
```

---

## 🚦 Getting Started

### 📋 Prerequisites
* **Node.js** (v22 or higher)
* **Java JDK** (v17 or higher)
* **Maven** (v3.8 or higher)
* **MySQL Server** (running locally or in a container)

### 💻 Running the Frontend
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser.

### ☕ Running the Backend
1. Configure your database settings inside `backend/bazaario/src/main/resources/application.properties` or set environment variables:
   * `spring.datasource.url`
   * `spring.datasource.username`
   * `spring.datasource.password`
2. Run migrations and build the project:
   ```bash
   cd backend/bazaario
   mvn clean install
   ```
3. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```
4. The backend API will be available at `http://localhost:8081`.

---

## 🔄 State Machine: Order Status Transitions

Order statuses follow strict transition paths validated by the service layer:
```
  [ PENDING ] ───────► [ PROCESSING ] ───────► [ SHIPPED ] ───────► [ DELIVERED ]
       │                     │                      │
       ▼                     ▼                      ▼
  [ CANCELLED ]         [ CANCELLED ]          [ CANCELLED ]
```
* Statuses are managed as the `OrderStatus` enum.
* Violating status paths (e.g., trying to move a `DELIVERED` order back to `PENDING`) will result in a `400 Bad Request` validation error.

---

## 🛡️ Concurrency Deep-Dive: Stock Race Condition & L1 Cache Eviction

### The Challenge
In e-commerce platforms, checkout concurrency can cause race conditions. If two threads check the available stock of a product simultaneously (e.g., `stock = 1`) and verify it is sufficient, both can proceed to decrement the stock and save. This leads to **overselling** (negative stock counts) in the database.

### The Solution: Pessimistic Write Locking & Persistence Context Detachment
Bazaario implements a robust defense against this using database-level row locking:
1. **Pessimistic Locking**: `ProductRepository.findByIdWithLock()` executes a database `SELECT ... FOR UPDATE` query. This locks the target row for write operations. Any concurrent thread requesting the same row is blocked until the first thread's transaction commits.
2. **L1 Cache / Persistence Context Eviction**: Because Hibernate caches queried entities in its Session (L1 cache), calling `findByIdWithLock` normally returns the cached stale entity instance without blocking. To prevent this, Bazaario calls `entityManager.detach(cartItem.getProduct())` to evict the product from the current Session context before executing the query. This forces Hibernate to run the locking database query, wait for lock acquisition, and retrieve the latest committed state.

### Proven by Multi-Threaded Integration Tests
We implemented `OrderServiceConcurrencyTest` to verify this behavior under heavy load:
* Two parallel threads use `ExecutorService` and coordinate via `CountDownLatch` to call `placeOrder()` simultaneously on a product with a single stock item (`stock = 1`).
* **Assertion**: Exactly one thread successfully places the order, and the other thread receives a `400 BadRequestException` due to insufficient stock. The final stock is asserted to be exactly `0` (never negative).

---

## 🔮 Future Improvements & Known Limitations

* **Auth Rate-Limiting**: To prevent brute-force attacks on `/api/auth/login`, implementing an attempt-counter and IP-based lockout (using Redis or Spring Security Rate Limiting) is planned as a future production enhancement.

