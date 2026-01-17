import Link from "next/link";

export default function TermsPage() {
    return (
        <div className="p-6 sm:p-12 min-h-screen">
            <main className="max-w-3xl mx-auto glass p-8 sm:p-12 rounded-[2.5rem] shadow-2xl">
                <header className="mb-10 border-b border-white/5 pb-8">
                    <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase">Terms_of_Service</h1>
                    <p className="text-blue-500 font-mono text-[10px] mt-2 tracking-widest uppercase">Protocol Version 1.0</p>
                </header>

                <section className="space-y-8 text-slate-300 text-sm leading-relaxed">
                    <div>
                        <h2 className="text-white font-bold uppercase tracking-widest mb-3">01. Acceptance of Terms</h2>
                        <p>By accessing EBNN.xyz, you agree to comply with these terms. The &quot;Core&quot; reserves the right to update these terms at any time without prior notification.</p>
                    </div>

                    <div>
                        <h2 className="text-white font-bold uppercase tracking-widest mb-3">02. Intellectual Property</h2>
                        <p>All design elements, code snippets, and visual assets are the intellectual property of Ebin Sebastian (EBNN) unless otherwise stated. Unauthorized reproduction of the &quot;Bento-System&quot; layout is prohibited.</p>
                    </div>

                    <div>
                        <h2 className="text-white font-bold uppercase tracking-widest mb-3">03. User Conduct</h2>
                        <p>Users must not attempt to breach the terminal, inject malicious code via contact forms, or disrupt the newsletter uplink. Any such activity will result in a permanent IP block from the EBNN network.</p>
                    </div>

                    <div>
                        <h2 className="text-white font-bold uppercase tracking-widest mb-3">04. Limitation of Liability</h2>
                        <p>EBNN is provided &quot;as is.&quot; We are not liable for any data loss, technical outages, or interruptions in the newsletter service.</p>
                    </div>
                </section>

                <footer className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center">
                    <Link href="/" className="text-blue-500 font-mono text-[10px] uppercase hover:text-white transition-colors">← Back to Core</Link>
                    <p className="text-[9px] text-slate-600 font-mono">SYSTEM_COMPLIANCE_v1</p>
                </footer>
            </main>
        </div>
    );
}
