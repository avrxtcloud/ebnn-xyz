import { Resend } from 'resend';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    const resend = new Resend(process.env.RESEND_API_KEY || 're_123');
    try {
        const { name, email, subject, message } = await req.json();

        // 1. Setup Authentication for Google Sheets
        const serviceAccountAuth = new JWT({
            email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || 'test@example.com',
            key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet(process.env.CONTACT_SHEET_ID || '123', serviceAccountAuth);

        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];

        const now = new Date();

        // 2. Save to the specific Contact Sheet
        await sheet.addRow({
            Name: name,
            Email: email,
            Subject: subject,
            Message: message,
            Date: now.toLocaleDateString(),
            Time: now.toLocaleTimeString()
        });

        // 3. Notify via Resend
        await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
            to: process.env.CONTACT_PERSONAL_MAIL!,
            subject: `[CORE CONTACT] ${subject}`,
            html: `
                <div style="font-family: sans-serif; background-color: #020617; color: #3b82f6; padding: 20px; border: 1px solid #1e293b;">
                    <h2 style="color: #ffffff; border-bottom: 1px solid #3b82f6; padding-bottom: 10px; font-style: italic;">New Transmission Received</h2>
                    <p style="color: #94a3b8;"><strong>From:</strong> ${name} (<a href="mailto:${email}" style="color: #3b82f6;">${email}</a>)</p>
                    <p style="color: #94a3b8;"><strong>Subject:</strong> ${subject}</p>
                    <div style="background: #0f172a; padding: 15px; border-radius: 10px; color: #f1f5f9; margin: 20px 0; border: 1px solid rgba(255,255,255,0.05);">
                        ${message}
                    </div>
                    <p style="font-size: 10px; color: #475569; font-family: monospace;">SYSTEM_TIMESTAMP: ${now.toLocaleString()}</p>
                </div>
            `,
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Core Contact Error:", error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
