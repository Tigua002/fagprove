/* ══ Tab / page state ══ */
let currentTab = "open"; // start on Åpen
let prev = "";
const TAB_PAGES = {
    open: "page-open",
    home: "page-home",
    history: "page-history",
};

function switchTab(tab) {
    if (tab == "history") {
        loadHistory();
    } else if (tab == "open") {
        loadDrafts();
    }
    if (currentTab === tab) return;
    prev = JSON.parse(JSON.stringify(currentTab));
    currentTab = tab;

    const order = ["open", "home", "history"];
    const goRight = order.indexOf(tab) > order.indexOf(prev);

    Object.entries(TAB_PAGES).forEach(([key, pageId]) => {
        const el = document.getElementById(pageId);
        el.classList.remove("visible", "hidden-left", "hidden-right");
        if (key === tab) {
            el.classList.add("visible");
        } else {
            el.classList.add(goRight ? "hidden-left" : "hidden-right");
        }
    });

    // also hide home if visible
    const home = document.getElementById("page-home");
    // home.classList.remove("visible");
    // home.classList.add("hidden-left");

    // update nav active state
    document
        .getElementById("nav-open")
        .classList.toggle("active", tab === "open");
    document
        .getElementById("nav-history")
        .classList.toggle("active", tab === "history");
}

function goToForm(
    antall,
    valuta,
    type,
    date,
    description,
    attendees,
    country,
    id,
) {
    console.log(type);

    if (state.status == "Godkjent") {
        document.getElementsByClassName("header-title")[0].textContent =
            "Godkjent";
        document.getElementsByClassName("amount-label")[0].style.color =
            "#ffffff";
        document.getElementsByClassName("amount-card")[0].style.background =
            "#3baa6e";
        document.getElementById("submit-btn").classList.remove("submit-btn");
        document
            .getElementById("submit-btn")
            .classList.add("submit-btn-disabled");
        document.getElementById("submit-btn").setAttribute("disabled", "true");
        document.getElementById("save-btn").setAttribute("disabled", "true");
        document
            .getElementById("save-btn")
            .classList.add("header-save-disabled");
        document.getElementById("save-btn").classList.remove("header-save");
    } else if ((state.status = "New")) {
        document.getElementsByClassName("header-title")[0].textContent =
            "Ny utgift";
        document.getElementsByClassName("amount-label")[0].style.color =
            "var(--stone-md)";
        document.getElementsByClassName("amount-card")[0].style.background =
            "var(--stone)";
        document.getElementById("submit-btn").classList.add("submit-btn");
        document
            .getElementById("submit-btn")
            .classList.remove("submit-btn-disabled");
        document.getElementById("submit-btn").removeAttribute("disabled");
        document.getElementById("save-btn").removeAttribute("disabled");
        document
            .getElementById("save-btn")
            .classList.remove("header-save-disabled");
        document.getElementById("save-btn").classList.add("header-save");

        resetAll();
    }
    let antallElement = document.getElementById("amount-input");
    let typeElement = document.getElementById("select-type");
    let dateElement = document.getElementById("input-date");
    let descElement = document.getElementById("input-desc");
    let attenElement = document.getElementById("input-att");
    let countryElement = document.getElementById("select-country");

    if (!(antall instanceof PointerEvent)) {
        antallElement.value = antall;
    }

    if (valuta) {
        document
            .querySelectorAll("#currency-menu .currency-opt")
            .forEach((opt) => opt.classList.remove("selected"));

        const selectedCurrency = document.querySelector(
            `#currency-menu .currency-opt[data-val="${valuta}"]`,
        );
        document.getElementById("currency-label").textContent = valuta;

        if (selectedCurrency) {
            selectedCurrency.classList.add("selected");
        }
    }
    if (type) {
        typeElement.value = type;
        applyField("type");
    }

    if (date) {
        let [day, month, year] = date.split(".");
        dateElement.value = `${year}-${month}-${day}`;
        applyField("date");
    }
    if (description) {
        descElement.value = description;
        applyField("desc");
    }
    if (attendees) {
        attenElement.value = attendees;
        applyField("att");
    }

    if (country) {
        countryElement.value = country;
        applyField("country");
    }

    document.querySelectorAll(".page").forEach((p) => {
        p.classList.remove("visible", "hidden-left", "hidden-right");
        p.classList.add("hidden-left");
    });
    const form = document.getElementById("page-form");
    form.classList.remove("hidden-left", "hidden-right");
    form.classList.add("visible");
    document.getElementById("bottom-nav").style.display = "none";
}

function goBack() {
    document.getElementById("bottom-nav").style.display = "";
    document.querySelectorAll(".page").forEach((p) => {
        p.classList.remove("visible", "hidden-left", "hidden-right");
        p.classList.add("hidden-right");
    });
    // restore current tab
    const activePageId = TAB_PAGES[currentTab];
    document.getElementById(activePageId).classList.remove("hidden-right");
    document.getElementById(activePageId).classList.add("visible");
}

// Start on Åpen tab
switchTab("home");

document.getElementById("btn-new-expense") &&
    document.getElementById("btn-new-expense").addEventListener("click", () => {
        state.status = "new";
        goToForm();
    });
document.getElementById("back-btn").addEventListener("click", goBack);

/* ══ Form logic ══ */
const state = {
    amount: "",
    currency: "NOK",
    type: "",
    date: "",
    desc: "",
    att: "",
    country: "",
    comment: "",
    status: "",
};

const fields = [
    {
        id: "type",
        row: "row-type",
        inp: "inp-type",
        val: "val-type",
        get: () => document.getElementById("select-type").value,
        element: document.getElementById("select-type"),
    },
    {
        id: "date",
        row: "row-date",
        inp: "inp-date",
        val: "val-date",
        get: () => formatDate(document.getElementById("input-date").value),
        element: document.getElementById("input-date"),
    },
    {
        id: "desc",
        row: "row-desc",
        inp: "inp-desc",
        val: "val-desc",
        get: () => document.getElementById("input-desc").value.trim(),
        element: document.getElementById("input-desc"),
    },
    {
        id: "att",
        row: "row-att",
        inp: "inp-att",
        val: "val-att",
        get: () => document.getElementById("input-att").value.trim(),
        element: document.getElementById("input-att"),
    },
    {
        id: "country",
        row: "row-country",
        inp: "inp-country",
        val: "val-country",
        get: () => document.getElementById("select-country").value,
        element: document.getElementById("select-country"),
    },
    {
        id: "comment",
        row: "row-comment",
        inp: "inp-comment",
        val: "val-comment",
        get: () => document.getElementById("input-comment").value.trim(),
        element: document.getElementById("input-comment"),
    },
];

function formatDate(v) {
    if (!v) return "";
    const d = new Date(v + "T00:00:00");
    return d.toLocaleDateString("en-NO", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

function applyField(fieldId) {
    const f = fields.find((x) => x.id === fieldId);
    const val = f.get();
    if (!val) return;
    state[fieldId] = val;
    document.getElementById(f.val).textContent = val;
    document.getElementById(f.row).classList.add("has-value");
    document.getElementById(f.inp).classList.remove("open");
    document.getElementById(f.row).classList.remove("active");
    document.getElementById(f.row).setAttribute("aria-expanded", "false");
}
function resetField(fieldId) {
    const f = fields.find((x) => x.id === fieldId);
    const val = f.get();
    state[fieldId] = val;
    document.getElementById(f.val).textContent = "";
    document.getElementById(f.row).classList.remove("has-value");
    document.getElementById(f.inp).classList.add("open");
    f.element.value = "";
    console.log(f.element);

    document.getElementById(f.row).classList.add("active");
    document.getElementById(f.row).setAttribute("aria-expanded", "true");
}

function closeAll(except) {
    fields.forEach((f) => {
        if (f.id === except) return;
        document.getElementById(f.inp).classList.remove("open");
        document.getElementById(f.row).classList.remove("active");
        document.getElementById(f.row).setAttribute("aria-expanded", "false");
    });
}
function resetAll() {
    resetField("type");
    resetField("date");
    resetField("desc");
    resetField("att");
    resetField("country");
    closeAll();
}
async function loadHistory() {
    let response = await apiCall("/bestillinger/Timur", "GET");

    document.getElementById("historikk").innerHTML = "";
    if (!response.data) {
        return;
    }
    let expenses = response.data.toSorted((a, b) =>
        b.Status.localeCompare(a.Status),
    );
    expenses.forEach((expense) => {
        let parentDiv = document.createElement("div");
        let statusDiv = document.createElement("div");
        let draftDiv = document.createElement("div");
        let iconDiv = document.createElement("div");
        let typeDiv = document.createElement("div");
        let rightDiv = document.createElement("div");

        parentDiv.setAttribute("class", "exp-item");

        if (expense.Status == "Godkjent") {
            statusDiv.setAttribute("class", "exp-status-bar approved");
        } else {
            statusDiv.setAttribute("class", "exp-status-bar sent");
        }
        iconDiv.setAttribute("class", "exp-icon");
        iconDiv.innerHTML = `<svg viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>`;
        typeDiv.setAttribute("class", "exp-info");
        typeDiv.innerHTML = `
        <div class="exp-status-label">${expense.Status}</div>
        <div class="exp-name">${expense.Type} TESTER</div>
        `;
        rightDiv.setAttribute("class", "exp-right");
        rightDiv.innerHTML = `
                <div class="exp-date"><svg viewBox="0 0 24 24"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49"/></svg>${expense.Dato}</div>
            <div class="exp-amount">${expense.Antall} <span>${expense.Valuta}</span></div>`;

        parentDiv.appendChild(draftDiv);
        parentDiv.appendChild(statusDiv);
        parentDiv.appendChild(iconDiv);
        parentDiv.appendChild(typeDiv);
        parentDiv.appendChild(rightDiv);

        parentDiv.addEventListener("click", () => {
            state.status = expense.Status;
            goToForm(
                expense.Antall,
                expense.Valuta,
                expense.Type,
                expense.Dato,
                expense.Beskrivelse,
                expense.Deltagere,
                expense.Land,
                expense.id,
            );
        });

        document.getElementById("historikk").appendChild(parentDiv);
    });
}
async function loadDrafts() {
    let response = await apiCall("/drafts/Timur", "GET");
    document.getElementById("drafts").innerHTML = "";

    response.data.forEach((expense) => {
        console.log("test");

        let parentDiv = document.createElement("div");
        let draftDiv = document.createElement("div");
        let iconDiv = document.createElement("div");
        let typeDiv = document.createElement("div");
        let rightDiv = document.createElement("div");

        iconDiv.innerHTML = `<svg viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>`;
        typeDiv.innerHTML = `      
    <div class="exp-name">${expense.Type}</div>
    <span class="draft-badge">Draft</span>`;
        rightDiv.innerHTML = `
    <div class="exp-date"><svg viewBox="0 0 24 24"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49"/></svg>${expense.Dato}</div>
        <div class="exp-amount">${expense.Antall}<span>${expense.Valuta}</span></div>
    `;
        parentDiv.setAttribute("class", "exp-item");

        iconDiv.setAttribute("class", "exp-icon");
        typeDiv.setAttribute("class", "exp-info");
        rightDiv.setAttribute("class", "exp-right");

        parentDiv.appendChild(draftDiv);
        parentDiv.appendChild(iconDiv);
        parentDiv.appendChild(typeDiv);
        parentDiv.appendChild(rightDiv);

        parentDiv.addEventListener("click", () => {
            state.status = "Draft";
            goToForm(
                expense.Antall,
                expense.Valuta,
                expense.Type,
                expense.Dato,
                expense.Beskrivelse,
                expense.Deltagere,
                expense.Land,
                expense.id,
            );
        });

        document.getElementById("drafts").appendChild(parentDiv);
    });
}
loadHistory();
loadDrafts();
fields.forEach((f) => {
    const row = document.getElementById(f.row);
    const inp = document.getElementById(f.inp);
    function toggle() {
        if (state.status == "Godkjent") {
            return;
        }
        const isOpen = inp.classList.contains("open");
        closeAll(isOpen ? "" : f.id);
        inp.classList.toggle("open", !isOpen);
        row.classList.toggle("active", !isOpen);
        row.setAttribute("aria-expanded", String(!isOpen));
        if (!isOpen) {
            const el = inp.querySelector("input,select");
            if (el) setTimeout(() => el.focus(), 50);
        }
    }
    row.addEventListener("click", toggle);
    row.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
        }
    });
    const sel = inp.querySelector("select");
    if (sel) sel.addEventListener("change", () => applyField(f.id));
    const dateEl = inp.querySelector('input[type="date"]');
    if (dateEl) dateEl.addEventListener("change", () => applyField(f.id));
    const txt = inp.querySelector('input[type="text"]');
    if (txt) {
        txt.addEventListener("blur", () => {
            if (txt.value.trim()) applyField(f.id);
        });
        txt.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                applyField(f.id);
            }
        });
    }
});

document.getElementById("amount-input").addEventListener("input", (e) => {
    state.amount = e.target.value;
});

const currencyToggle = document.getElementById("currency-toggle");
const currencyMenu = document.getElementById("currency-menu");
currencyToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    currencyMenu.classList.toggle("open");
});
document.querySelectorAll(".currency-opt").forEach((opt) => {
    opt.addEventListener("click", () => {
        document
            .querySelectorAll(".currency-opt")
            .forEach((o) => o.classList.remove("selected"));
        opt.classList.add("selected");
        state.currency = opt.dataset.val;
        document.getElementById("currency-label").textContent = opt.dataset.val;
        currencyMenu.classList.remove("open");
    });
});
document.addEventListener("click", () => currencyMenu.classList.remove("open"));

document
    .getElementById("save-btn")
    .addEventListener("click", () => showToast("Draft saved ✓"));

// Submit funkction
document.getElementById("submit-btn").addEventListener("click", async () => {
    console.log("function");

    try {
        if (!state.amount || parseFloat(state.amount) <= 0) {
            showToast("Please enter an amount.");
            return;
        }
        if (!state.type) {
            showToast("Expense type is required.");
            return;
        }
        if (!state.date) {
            showToast("Date is required.");
            return;
        }
        const formatted =
            String(state.date.getDate()).padStart(2, "0") +
            "." +
            String(state.date.getMonth() + 1).padStart(2, "0") +
            "." +
             state.date.getFullYear();
        const data = {
            navn: "Timur",
            antall: state.amount,
            valuta: state.currency,
            dato: formatted,
            beskrivelse: state.desc,
            deltagere: state.att,
            land: state.country,
            type: state.type,
        };
        let response = await apiCall("/send/soknad", "POST", data);
        console.log(response);

        showToast("Expense submitted! ✓");
        setTimeout(() => goBack(), 1200);
    } catch (error) {
        console.log(error);
        showToast("Critical error occured, try again later");
    }
});

function showToast(msg) {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 3000);
}

document.getElementById("input-date").value = new Date()
    .toISOString()
    .split("T")[0];

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
