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

## 2. Discord Developer Portal

1.  Go to the [Discord Developer Portal](https://discord.com/developers/applications).
2.  Click **New Application** and give it a name (e.g., "EBNN Admin").
3.  Go to the **OAuth2** tab.
    *   **Client ID**: Copy this and paste it into Supabase (Provider settings).
    *   **Client Secret**: Reset/Copy this and paste it into Supabase.
    *   **Redirects**: Add the Callback URL you copied from Supabase (step 1.C.4).
4.  **Save Changes** in both Discord Portal and Supabase Dashboard.

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
| `CONTACT_PERSONAL_MAIL` | Your personal email | Where you want to receive new contact alerts |

3.  **Deploy**.

---

## 5. Discord Server Setup (For future Role-Based Access)

*Currently, the app authenticates any valid Discord user. To enforce strict Admin roles later:*
1.  Enable "Developer Mode" in your Discord User Settings -> Advanced.
2.  Right-click your Server -> **Copy Server ID**.
3.  Go to Server Settings -> Roles -> Right-click your "Admin" role -> **Copy Role ID**.
4.  (Future update requirement): You will need to add these IDs to your environment variables if you enable strict role checking in the code.
