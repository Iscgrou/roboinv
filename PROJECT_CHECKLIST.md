# Project Checklist: Human-Level AI Accounting Assistant

This checklist outlines the remaining actions required to achieve a complete and ideal version of the AI-powered Telegram bot for accounting and management.

---

### Phase 1: AI Core & Intelligence (Highest Priority)

*The AI's "brain." ]PHV  GVHWithout this, the assistant cannot understand commands.*

- [ ] **NLU Model Training `[MANUAL]`**:
    - **Details:** Gather a comprehensive dataset of sample Persian phrases for every defined intent (`record_payment`, `check_balance`, etc.). Meticulously label the correct intent and -
    
    all relevant entities (`representative_name`, `amount`, etc.) for each phrase. Use the chosen NLU provider's platform (e.g., Google Dialogflow, Rasa, wit.ai) to train a custom model with this data. This is a critical manual task.
    - **Status:** Not Started.

- [ ] **Real NLU API Integration**:
    - **Details:** In `ai-integration-service/aiIntegrationService.js`, replace the placeholder NLU logic with real API calls to the trained NLU model. Implement the specific authentication, request format, and response parsing for the chosen provider. Ensure API keys are handled securely via environment variables.
    - **Status:** Not Started.

- [ ] **Implement NLU Confidence Handling**:
    - **Details:** Modify the `telegram-bot-service/bot.js` to process the confidence score returned by the NLU API. If the score for an intent is below a defined threshold (e.g., 90%), the bot must not execute the action directly but instead ask for confirmation ("Did you mean to record a payment?").
    - **Status:** Not Started.

---

### Phase 2: Backend Logic & Feature Completion

*Ensuring the actions triggered by the AI are robust, accurate, and complete.*

- [x] **Refine Reminder Service Logic**:
    - **Details:** The `notification-service` currently has a placeholder for the due date (`[تاریخ سررسید جایگزین شود]`). This task involves fetching the actual `due_date` from the oldest outstanding invoice for a representative and inserting it into the reminder message. This requires enhancing the `reminder-scheduler-service` to query this data and pass it to the `notification-service`.
    - **Status:** Completed.

- [x] **Implement Sales Partner Commission Calculation**:
    - **Details:** Create a scheduled job or a triggerable service that calculates the `total_earned_commission` for each sales partner. This requires querying all payments/invoices from representatives linked to a sales partner within a specific period and applying the partner's `commission_rate`.
    - **Status:** Completed.

- [x] **Implement Advanced Filtering in DAOs**:
    - **Details:** Upgrade the basic `get...s` methods in DAOs (e.g., `getRepresentatives`, `getSalesPartners`) to accept filter objects and dynamically build `WHERE` clauses in the SQL queries. This allows for more specific requests like "list representatives with a negative balance."
    - **Status:** Completed.

- [x] **Implement Event Sourcing Snapshotting**:
    - **Details:** For entities with a long event history (e.g., representatives), implement a snapshotting mechanism to improve performance. This involves periodically saving the current state of an entity so that state reconstruction does not require replaying thousands of events.
    - **Status:** Completed.

---

### Phase 3: AI Assistant User Experience (UX)

*Making the interaction with the AI feel natural and intelligent.*

- [x] **Implement Multi-turn Conversation Management**:
    - **Details:** Enhance the `telegram-bot-service` to handle contextual follow-up questions. The bot must remember the context of the current conversation (e.g., which representative is being discussed) to understand commands like "What is his balance?".
    - **Status:** Completed.

- [x] **Implement Robust Entity Resolution for Ambiguity**:
    - **Details:** Improve the logic for identifying entities. If the NLU extracts a name that matches multiple records in the database (e.g., two representatives named "Bahrami"), the bot must ask the administrator for clarification.
    - **Status:** Completed.

---

### Phase 4: Production Readiness & Security

*Ensuring the system is stable, secure, and maintainable.*

- [ ] **Implement Comprehensive Testing (Unit, Integration, E2E)**:
    - **Details:** Write unit tests for all critical business logic, integration tests for service-to-service communication (API Gateway & Message Queue), and end-to-end tests that simulate a full user workflow from voice/text command to database change.
    - **Status:** In Progress (Unit tests, security integration test, and command-flow integration test created).

- [x] **Implement API Gateway Security**:
    - **Details:** Implement a robust authentication and authorization mechanism in the API Gateway, such as JWT (JSON Web Tokens). This will secure all backend service endpoints and ensure only authorized administrators can perform actions.
    - **Status:** Completed.

- [x] **Implement Production Secrets Management**:
    - **Details:** For production deployment, migrate all sensitive information (database passwords, API keys, tokens) from environment variables to a secure secrets management solution like HashiCorp Vault or a cloud provider's equivalent (AWS Secrets Manager, etc.).
    - **Status:** Completed (Dev Phase - using .env).
