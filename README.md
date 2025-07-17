# Project: Human-Level AI Accounting Assistant for Telegram

## 1. Project Goal & Vision

The primary and unwavering objective of this project is to create a **human-level AI assistant** that operates within a Telegram bot. This assistant is designed to function as a highly capable and autonomous accountant and internal manager for a business that sells proxy panel services.

... (rest of the file) ...

---

## 5. How to Run the Project for Testing

The project is fully containerized with Docker Compose, making it easy to run for initial testing using the command-based interface.

**For a detailed, step-by-step guide on deploying this project to a new Ubuntu 22 server, please refer to the [Ubuntu Deployment Guide](./DEPLOYMENT_GUIDE_UBUNTU.md).**

### Quick Setup for Developers:

#### Prerequisites:
- Docker
- Docker Compose

#### Setup and Execution:

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
