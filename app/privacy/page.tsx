import Link from "next/link";

export default function PrivacyPage() {
    return (
        <div className="p-6 sm:p-12 min-h-screen">
            <main className="max-w-3xl mx-auto glass p-8 sm:p-12 rounded-[2.5rem] shadow-2xl">
                <header className="mb-10 border-b border-white/5 pb-8">
                    <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase">Privacy_Protocol</h1>
                    <p className="text-blue-500 font-mono text-[10px] mt-2 tracking-widest uppercase">Last Updated: Dec 2025</p>
                </header>

                <section className="space-y-8 text-slate-300 text-sm leading-relaxed">
                    <div>
                        <h2 className="text-white font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span> 01. Data Collection
                        </h2>
                        <p>We collect minimal data required for communication. This includes your email address when you subscribe to the newsletter and any information provided via the contact terminal. We do not use tracking cookies for advertising.</p>
                    </div>

                    <div>
                        <h2 className="text-white font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span> 02. Usage of Information
                        </h2>
                        <p>Your data is used strictly for:</p>
                        <ul className="list-disc ml-5 mt-2 space-y-1 text-slate-400">
                            <li>Sending technical briefings via newsletter.</li>
                            <li>Responding to direct inquiries via the contact form.</li>
                            <li>Ensuring security and integrity of the EBNN network.</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-white font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span> 03. Third-Party Services
                        </h2>
                        <p>We utilize trusted infrastructure providers including **Vercel** for hosting, **Resend** for email transmission, and **Google Sheets** for encrypted data storage. Your data is never sold to third-party advertisers.</p>
                    </div>
                </section>

                <footer className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center">
                    <Link href="/" className="text-blue-500 font-mono text-[10px] uppercase hover:text-white transition-colors">← Back to Core</Link>
                    <p className="text-[9px] text-slate-600 font-mono">EBNN_SECURE_DOC</p>
                </footer>
            </main>
        </div>
    );
}
