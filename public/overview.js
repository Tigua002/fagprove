const STATUS_LABELS = {
    draft: "Venter på godkjenning",
    sent: "Sendt",
    approved: "Godkjent",
    denied: "Avvist",
};
const STATUS_COLORS = {
    draft: "var(--clay)",
    sent: "var(--stone-md)",
    approved: "var(--green)",
    denied: "var(--red)",
};

let activeFilter = "all";
let searchQuery = "";
let openItemEl = null;

/* ── helpers ── */
function tagClass(s) {
    return "tag tag-" + s;
}
function barClass(s) {
    return "exp-status-bar bar-" + s;
}

/* ── filter + search ── */
function applyFilter() {
    const items = [...document.querySelectorAll(".exp-item")];
    let visible = 0;  
    items.forEach((el) => {
        
        const statusMatch =
            activeFilter === "all" || el.dataset.status == activeFilter;
        const q = searchQuery.toLowerCase();
        const searchMatch =
            !q ||
            el.dataset.name.toLowerCase().includes(q) ||
            el.dataset.country.toLowerCase().includes(q) ||
            el.dataset.type.toLowerCase().includes(q) ||
            el.dataset.beskrivelse.toLowerCase().includes(q);
        const show = statusMatch && searchMatch;
        el.classList.toggle("hidden", !show);
        if (show) visible++;
    });

    document.getElementById("emptyState").style.display = visible
        ? "none"
        : "flex";

    // Update section label
    const label =
        activeFilter === "all"
            ? "Alle oppføringer"
            : activeFilter;
    document.getElementById("listLabel").textContent =
        label + (searchQuery ? ` · "${searchQuery}"` : "");
}

/* ── chip click ── */
document.querySelectorAll(".sum-card").forEach((chip) => {
    chip.addEventListener("click", () => {
        document
            .querySelectorAll(".sum-card")
            .forEach((c) => c.classList.remove("accent"));
        chip.classList.add("accent");
        activeFilter = chip.dataset.filter;
        applyFilter();
    });
});

/* ── search input ── */
document.getElementById("searchInput").addEventListener("input", (e) => {
    searchQuery = e.target.value.trim();
    applyFilter();
});

/* ── open panel ── */
function openPanel(item) {
    openItemEl = item;
    document.getElementById("panelTitle").textContent = item.Beskrivelse;
    document.getElementById("panelBruker").textContent = item.Navn;
    document.getElementById("panelLand").textContent = item.Land;
    document.getElementById("panelType").textContent = item.Type;
    document.getElementById("panelDate").textContent = item.Dato;
    document.getElementById("panelAmount").textContent =
        item.Antall + " " + item.Valuta;

    // participants
    const peopleEl = document.getElementById("panelPeople");
    peopleEl.innerHTML = "";
    item.Deltagere.split(",").forEach((p) => {
        const chip = document.createElement("div");
        chip.className = "person-chip";
        const cls = p.startsWith("+")
            ? ""
            : p[1] === "K" || p[1] === "T"
              ? "s"
              : p[1] === "R" || p[1] === "P"
                ? "g"
                : "";
        console.log(p);

        chip.innerHTML = `<div class="avatar ${cls}">${p.trim()[0]}</div><span>${p.trim()}</span>`;
        peopleEl.appendChild(chip);
    });

    updatePanelStatus(item.Status);

    document.getElementById("detailPanel").classList.add("open");
    document.getElementById("overlay").classList.add("open");
    document.body.style.overflow = "hidden";
}

function updatePanelStatus(status) {
    document.getElementById("panelStatusDot").style.background =
        STATUS_COLORS[status];
    document.getElementById("panelStatusText").textContent =
        STATUS_LABELS[status];
    document
        .getElementById("btnApprove")
        .classList.toggle("btn-active", status === "Godkjent");
    document
        .getElementById("btnDeny")
        .classList.toggle("btn-active", status === "Avvist");
}

/* ── close panel ── */
function closePanel() {
    document.getElementById("detailPanel").classList.remove("open");
    document.getElementById("overlay").classList.remove("open");
    document.body.style.overflow = "";
    openItemEl = null;
}

document.getElementById("panelClose").addEventListener("click", closePanel);
document.getElementById("overlay").addEventListener("click", closePanel);

/* ── row click ── */
document.querySelectorAll(".exp-item").forEach((el) => {
    el.addEventListener("click", () => openPanel(el));
});

/* ── change status ── */
async function setStatus(id, newStatus) {
    let sideTag;
    let statusTag;
    if (newStatus == "Godkjent") {
        statusTag = "tag status-tag tag-approved";
        sideTag = "exp-status-bar bar-approved";
    } else if (newStatus == "Venter på godkjenning") {
        statusTag = "tag status-tag tag-draft";
        sideTag = "exp-status-bar bar-draft";
    } else {
        statusTag = "tag status-tag tag-denied";
        sideTag = "exp-status-bar bar-denied";
        newStatus = "Avvist"
    }
    let elCol = document.getElementsByClassName("exp-item");
    
    let el = null;
    
    for (let target of elCol) {
        console.log(target);
        console.log(target.getAttribute("data-id"));
        
        if (target.getAttribute("data-id") == id) {
            el = target;
            break;
        }
    }
    const data = {
        id,
        status: newStatus
    }
    const response = await apiCall("/oppdater/status", "POST", data)
    
    // update status bar
    console.log(el);
    
    el.querySelector(".exp-status-bar").className = sideTag;
    
    // update tag
    const tag = el.querySelector(".status-tag");
    tag.className = statusTag;
    tag.textContent = newStatus;
    
    updatePanelStatus(newStatus);
    applyFilter();
    countCards();
    loadItems()
    openItemEl.Status = newStatus
    showToast("Status endret til " + newStatus);
}

document.getElementById("btnApprove").addEventListener("click", () => {
    if (openItemEl) setStatus(openItemEl.ID, "Godkjent");
    setTimeout(closePanel, 600);
});

document.getElementById("btnDeny").addEventListener("click", () => {
    if (openItemEl) setStatus(openItemEl.ID, "Avvist");
    setTimeout(closePanel, 600);
});

/* ── toast ── */
let toastTimer;
function showToast(msg) {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

async function loadItems() {
    const response = await apiCall("/soknader", "GET");
    console.log(response.data);
    document.getElementById("expList").innerHTML = "";

    let venter = 0;
    let godkjent = 0;
    let avvist = 0;
    response.data.forEach((item) => {
        let parentDiv = document.createElement("div");
        let statusDiv = document.createElement("div");
        let iconDiv = document.createElement("div");
        let infoDiv = document.createElement("div");
        let rightDiv = document.createElement("div");
        let sideTag = "";
        let statusTag = "";

        if (item.Status == "Godkjent") {
            godkjent++;
            statusTag = "tag-approved";
            sideTag = "exp-status-bar bar-approved";
        } else if (item.Status == "Venter på godkjenning") {
            venter++;
            statusTag = "tag-draft";
            sideTag = "exp-status-bar bar-draft";
        } else if (item.Status == "Avvist") {
            avvist++;
            statusTag = "tag-denied";
            sideTag = "exp-status-bar bar-denied";
        }
        const letters = ["s", "g", ""];

        const randomLetter =
            letters[Math.floor(Math.random() * letters.length)];
        iconDiv.innerHTML = `<svg viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>`;
        infoDiv.innerHTML = `      
        <div class="exp-name">${item.Beskrivelse}</div>
        <div class="exp-sub">
        <span>${item.Land} · ${item.Navn}</span>
        <div class="avatars">
        ${item.Deltagere.split(",")
            .map((p) => {
                const randomLetter =
                    letters[Math.floor(Math.random() * letters.length)];
                return `<div class="avatar ${randomLetter}">${p.trim()[0].toUpperCase()}${p.trim()[1].toUpperCase()}</div>`;
            })
            .join("")}
        </div>
        </div>
      `;

        parentDiv.setAttribute("data-id", item.ID);
        parentDiv.setAttribute("data-name", item.Navn);
        parentDiv.setAttribute("data-country", item.Land);
        parentDiv.setAttribute("data-beskrivelse", item.Beskrivelse);
        parentDiv.setAttribute("data-type", item.Type);
        parentDiv.setAttribute("data-status", item.Status);

        rightDiv.innerHTML = `
      <div class="exp-amount">${item.Antall} <span>${item.Valuta}</span></div>
      <div class="exp-date">${item.Dato}</div>
      <div style="margin-top:4px"><span class="tag ${statusTag} status-tag">${item.Status}</span></div>
      `;
        parentDiv.setAttribute("class", "exp-item");

        statusDiv.setAttribute("class", sideTag);
        iconDiv.setAttribute("class", "exp-icon");
        infoDiv.setAttribute("class", "exp-info");
        rightDiv.setAttribute("class", "exp-right");

        parentDiv.appendChild(statusDiv);
        parentDiv.appendChild(iconDiv);
        parentDiv.appendChild(infoDiv);
        parentDiv.appendChild(rightDiv);

        parentDiv.addEventListener("click", () => {
            openPanel(item);
        });

        document.getElementById("expList").appendChild(parentDiv);
    });
    document.getElementById("sum-total").textContent = response.data.length;
    document.getElementById("sum-draft").textContent = venter;
    document.getElementById("sum-approved").textContent = godkjent;
    document.getElementById("sum-denied").textContent = avvist;
    applyFilter()

}

async function countCards() {
    const response = await apiCall("/soknader", "GET");
    let venter = 0;
    let godkjent = 0;
    let avvist = 0;
    response.data.forEach(item => {
        if (item.Status == "Godkjent") {
            godkjent++;
        } else if (item.Status == "Venter på godkjenning") {
            venter++;
        } else if (item.Status == "Avvist") {
            avvist++;
        }
    })
    document.getElementById("sum-total").textContent = response.data.length;
    document.getElementById("sum-draft").textContent = venter;
    document.getElementById("sum-approved").textContent = godkjent;
    document.getElementById("sum-denied").textContent = avvist;
}
// ── API call
async function apiCall(url, method, data) {
    let response;
    if (method == "POST") {
        response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
    } else {
        response = await fetch(url, {
            method: method,
        });
    }
    console.log(response);
    return await response.json();
}
/* ── init ── */
loadItems();
