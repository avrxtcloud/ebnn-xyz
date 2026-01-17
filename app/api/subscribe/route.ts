import { Resend } from 'resend';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    const resend = new Resend(process.env.RESEND_API_KEY || 're_123');
    try {
        const { email } = await req.json();

        // 1. Setup Authentication for Google Sheets
        const serviceAccountAuth = new JWT({
            email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || 'test@example.com',
            key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet(process.env.SUBSCRIBE_SHEET_ID || '123', serviceAccountAuth); // Use specific sheet ID

        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];

        // Check for duplicate? (Basic implementation as per request)
        // For now, just add.

        const now = new Date();

        await sheet.addRow({
            Email: email,
            Date: now.toLocaleDateString(),
            Time: now.toLocaleTimeString()
        });

        // 3. Send Confirmation/Welcome Email via Resend
        await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
            to: email,
            subject: `[CORE] Welcome to EBNN Network`,
            html: `
                <div style="font-family: sans-serif; background-color: #020617; color: #3b82f6; padding: 20px; border: 1px solid #1e293b;">
                    <h2 style="color: #ffffff; border-bottom: 1px solid #3b82f6; padding-bottom: 10px; font-style: italic;">Uplink Authorized</h2>
                    <p style="color: #94a3b8;">You have been successfully added to the EBNN Core distribution list.</p>
                </div>
            `,
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        // Handle conflicts if needed, for now general error
        console.error("Core Subscribe Error:", error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
