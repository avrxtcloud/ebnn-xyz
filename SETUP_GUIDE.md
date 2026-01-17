# 🚀 EBNN Deployment & Configuration Guide

Follow these steps to configure your external services (Supabase, Discord, Vercel, Google) for the EBNN ecosystem.

---

## 1. Supabase Setup (Database & Auth)

### A. Create Project & Database
1.  Go to [supabase.com](https://supabase.com) and create a new project.
2.  Once created, go to the **SQL Editor** tab.
3.  Open the `supabase_schema.sql` file from this repository, copy its content, and paste it into the SQL Editor.
4.  Click **Run** to create the `bio_profile` and `bio_links` tables.

### B. Get API Credentials
1.  Go to **Project Settings** (gear icon) -> **API**.
2.  Copy these two values:
    *   `Project URL` (This is your `NEXT_PUBLIC_SUPABASE_URL`)
    *   `anon` / `public` Key (This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

### C. Configure Discord Authentication
1.  In Supabase, go to **Authentication** -> **Providers**.
2.  Find **Discord** and click to expand/enable it.
3.  Keep this tab open; you will need to paste the **Client ID** and **Client Secret** here in the next step.
4.  **Important**: Copy the **Callback URL (for OAuth)** shown here (it looks like `https://<your-project-ref>.supabase.co/auth/v1/callback`).

---

## 2. Discord Developer Portal (Bot & Auth)

1.  Go to the [Discord Developer Portal](https://discord.com/developers/applications).
2.  Click **New Application** and give it a name (e.g., "EBNN Admin").
3.  **OAuth2 Tab**:
    *   **Client ID**: Copy this and paste it into Supabase.
    *   **Client Secret**: Copy this and paste it into Supabase.
    *   **Redirects**: Add the Callback URL you copied from Supabase.
4.  **Bot Tab**:
    *   Click **Reset Token** and copy the new Token.
    *   Save this as `DISCORD_BOT_TOKEN` in your environment (Vercel/.env).
    *   Ensure **Privileged Gateway Intents** (Server Members Intent) is enabled if needed, though for basic role modification via API it's less critical than just having the bot token.
5.  **Installation / Invite Bot**:
    *   Go to **OAuth2** -> **URL Generator**.
    *   Select scopes: `bot`.
    *   Select permissions: `Administrator` (or just `Manage Roles`/`View Channels` if you want to be granular).
    *   Copy the generated URL.
    *   Open it in a browser and invite the Bot to your Discord Server.

---

## 3. Google Cloud (For Contact Forms)

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a project and enable the **Google Sheets API**.
3.  Go to **Credentials** -> **Create Credentials** -> **Service Account**.
4.  Create the account and download the **JSON Key File**.
5.  Open the JSON file:
    *   `client_email`: This is your `GOOGLE_SERVICE_ACCOUNT_EMAIL`.
    *   `private_key`: This is your `GOOGLE_PRIVATE_KEY`.
6.  **Important**: Create a Google Sheet for your contacts/subscribers and **Share** it with the `client_email` address (give it "Editor" access).
7.  Copy the **Sheet ID** from your browser URL (usually between `/d/` and `/edit`).

---

## 4. Vercel Deployment

1.  Import your GitHub repository (`ebnn-xyz`) into Vercel.
2.  In the deployment configuration, add the following **Environment Variables**:

| Variable Name | Description | Where to get it |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL | Supabase -> Settings -> API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key | Supabase -> Settings -> API |
| `RESEND_API_KEY` | Key for sending emails | [Resend.com](https://resend.com) API Keys |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service Account Email | Google Cloud JSON Key |
| `GOOGLE_PRIVATE_KEY` | Private Key (include `-----BEGIN...`) | Google Cloud JSON Key |
| `CONTACT_SHEET_ID` | Sheet ID to save contacts | Google Sheet URL |
| `SUBSCRIBE_SHEET_ID` | Sheet ID to save subs | Google Sheet URL |
| `CONTACT_PERSONAL_MAIL` | Your personal email | For alerts |
| `DISCORD_GUILD_ID` | Your Server ID | Right-click Server -> Copy ID |
| `DISCORD_ADMIN_ROLE_ID` | ID of the Admin Role | Server Settings -> Roles -> Copy ID |
| `DISCORD_BOT_TOKEN` | Bot Token | Discord Dev Portal -> Bot -> Token |

3.  **Deploy**.
