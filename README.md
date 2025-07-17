# Project: Human-Level AI Accounting Assistant for Telegram

## 1. Project Goal & Vision

The primary and unwavering objective of this project is to create a **human-level AI assistant** that operates within a Telegram bot. This assistant is designed to function as a highly capable and autonomous accountant and internal manager for a business that sells proxy panel services.

The AI assistant must be able to:
- **Understand Natural Language:** Process administrator requests via both voice and text in Persian.
- **Perform Accounting Tasks:** Handle all financial operations, including invoice generation, payment recording, and balance tracking.
- **Manage Entities:** Manage the accounts of representatives (resellers) and sales partners.
- **Automate Proactively:** Execute scheduled tasks such as sending payment reminders and calculating sales commissions without human intervention.
- **Be Secure & Reliable:** Ensure all operations, especially financial transactions, are secure, accurate, and auditable.

The final product should feel less like a rigid bot and more like a competent human colleague.

---

## 2. System Architecture

This project is built on a robust, scalable, and maintainable **Microservice Architecture**. This design decouples responsibilities, allowing for independent development, testing, and deployment of each component.

![image](https'//user-images.githubusercontent.com/111827373/286214197-21a41755-9005-4c03-8d26-271d44004724.png')


### Core Components:

| Service Directory                  | Purpose                                                                                                                              | Technology       |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------- |
| `telegram-bot-service`             | The user-facing component. Handles all interactions with the Telegram Bot API, processes commands, and orchestrates calls to the backend. | Node.js, Express |
| `api-gateway`                      | A single, secure entry point for all backend services. Manages request routing and enforces security policies (JWT).                   | Node.js, Express |
| `auth-service`                     | Handles administrator authentication, validates credentials, and issues JSON Web Tokens (JWT).                                         | Node.js, Express |
| `representative-management-service`| Manages all data and business logic related to representatives (CRUD operations, balance updates).                                     | Node.js          |
| `sales-partner-management-service` | Manages all data and business logic for sales partners.                                                                              | Node.js          |
| `invoice-generation-service`       | Processes consumption data from JSON files and generates weekly invoices. Triggered via the message queue.                             | Node.js          |
| `payment-processing-service`       | Handles the recording of payments from representatives.                                                                              | Node.js          |
| `reporting-service`                | Provides data aggregation and generates various financial reports (e.g., outstanding invoices, payment history).                       | Node.js          |
| `notification-service`             | Responsible for sending notifications (e.g., payment confirmations, reminders) to administrators via the Telegram API.               | Node.js          |
| `reminder-scheduler-service`       | A scheduled service that runs daily to identify representatives needing payment reminders and triggers the notification service.         | Node.js          |
| `commission-calculator-service`    | A scheduled service that runs weekly to calculate and update the earned commissions for all sales partners.                            | Node.js          |
| `ai-integration-service`           | The "brain's gateway." This service is responsible for interacting with external AI providers for STT and NLU.                           | Node.js          |

### Technology Stack:

- **Backend:** Node.js
- **Database:** PostgreSQL (for relational data integrity)
- **Messaging:** RabbitMQ (for asynchronous tasks like invoice generation)
- **Containerization:** Docker & Docker Compose (for a unified development and testing environment)
- **Testing:** Jest

---

## 3. Project Status & Path Traveled (Current State)

The project has achieved a state of **functional completion for a command-based Minimum Viable Product (MVP)**. All architectural foundations and core backend logic are in place.

### What Has Been Completed:

- **Full Backend Architecture:** All microservices listed above have been created and are running.
- **Robust Database Schema:** The PostgreSQL database schema is fully defined, including event sourcing tables (`events`) and performance optimizations (`snapshots`).
- **Core Business Logic:** All primary financial and management logic is implemented (invoice/payment processing, commission calculation, reminders).
- **Advanced Backend Features:** Event Sourcing for auditable financial transactions and Snapshotting for long-term performance have been implemented.
- **Security Foundation:** A JWT-based authentication service and an API Gateway policy are implemented, securing the backend.
- **Testable Command-Based Bot:** The `telegram-bot-service` has been refactored to work with concrete commands (e.g., `/balance [name]`). It is ready for initial deployment and use.
- **Comprehensive Testing Infrastructure:** A multi-layered testing strategy (Unit, Integration, E2E) is in place, and foundational tests have been written.

---

## 4. Critical Next Steps & Path to Completion

The highest priority is to evolve the bot from a command-based system into the envisioned **human-level AI assistant**. This work is concentrated in **Phase 1: AI Core & Intelligence**.

### The Most Important Next Step `[MANUAL TASK]`

1.  **NLU Model Training:** This is the most critical and time-consuming remaining task. It cannot be automated further and requires human input.
    - **Action:** Gather a large and diverse dataset of sample Persian phrases that an administrator would use for every intent (`record_payment`, `check_balance`, etc.). This data must be meticulously labeled with the correct intents and entities (e.g., `representative_name`, `amount`). Use a chosen NLU provider (like Google Dialogflow) to train a custom model with this data.
    - **Why it's Critical:** The entire "intelligence" of the assistant depends on the quality of this model. An inaccurate model will make the assistant unusable.

### Subsequent Technical Steps (To be executed after NLU Training)

2.  **Real NLU API Integration:**
    - **Action:** Update the `ai-integration-service` to call the newly trained NLU model's real API endpoint. This involves replacing the current placeholder logic with provider-specific requests and response parsing.

3.  **Implement NLU Confidence Handling:**
    - **Action:** Enhance the `telegram-bot-service` to use the confidence score from the NLU model. If the AI's confidence is low, it must ask the user for confirmation before acting.

4.  **Complete Production Readiness:**
    - **Action:** Write a full suite of integration and E2E tests for all AI-driven workflows. Implement a production-grade secrets management solution (e.g., HashiCorp Vault or a cloud provider's equivalent) to replace the `.env` file for deployment.

---

## 5. How to Run the Project for Testing

The project is fully containerized with Docker Compose, making it easy to run for initial testing using the command-based interface.

### Prerequisites:
- Docker
- Docker Compose

### Setup and Execution:

1.  **Create `.env` file:**
    -   Make a copy of `.env.example` and rename it to `.env`.
    -   Fill in the required values, especially `TELEGRAM_BOT_TOKEN`, `JWT_SECRET`, and `ADMIN_CHAT_ID`.

2.  **Run Infrastructure:**
    -   Start the database and message queue:
        ```bash
        docker-compose up -d postgres rabbitmq
        ```

3.  **Prepare Database:**
    -   Connect to the PostgreSQL database using a client (Host: `localhost`, Port: `5432`).
    -   Execute all SQL scripts in the `database/sql` directory to create the tables.
    -   Create at least one admin user in the `admin_users` table with a securely hashed password (you can use the `auth-service`'s `/hash-password` endpoint for this).

4.  **Run the Full Application:**
    -   Execute the following command from the project root:
        ```bash
        docker-compose up --build -d
        ```

5.  **Start Interacting with the Bot:**
    -   Find your bot in Telegram and use the `/login` command to authenticate.
    -   You can now use the command-based interface (e.g., `/balance [name]`).
