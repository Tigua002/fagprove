/* ── Eye toggle ── */
const pwInput = document.getElementById("passwordInput");
const eyeToggle = document.getElementById("eyeToggle");
const eyeIcon = document.getElementById("eyeIcon");

const eyeOpen = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
const eyeClosed = `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>`;

let pwVisible = false;
eyeToggle.addEventListener("click", () => {
    pwVisible = !pwVisible;
    pwInput.type = pwVisible ? "text" : "password";
    eyeIcon.innerHTML = pwVisible ? eyeClosed : eyeOpen;
});

/* ── Validation ── */
function validateEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}
function validatePassword(v) {
    return v.length >= 6;
}

function setFieldState(inputEl, errorEl, valid) {
    inputEl.classList.toggle("invalid", !valid);
    errorEl.classList.toggle("show", !valid);
}

const emailInput = document.getElementById("emailInput");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");

emailInput.addEventListener("blur", () => {
    if (emailInput.value)
        setFieldState(emailInput, emailError, validateEmail(emailInput.value));
});
pwInput.addEventListener("blur", () => {
    if (pwInput.value)
        setFieldState(pwInput, passwordError, validatePassword(pwInput.value));
});
emailInput.addEventListener("input", () => {
    if (emailInput.classList.contains("invalid"))
        setFieldState(emailInput, emailError, validateEmail(emailInput.value));
});
pwInput.addEventListener("input", () => {
    if (pwInput.classList.contains("invalid"))
        setFieldState(pwInput, passwordError, validatePassword(pwInput.value));
});

/* ── Submit ── */
const submitBtn = document.getElementById("submitBtn");
submitBtn.addEventListener("click", async () => {
    const emailOk = validateEmail(emailInput.value);
    const pwOk = validatePassword(pwInput.value);
    setFieldState(emailInput, emailError, emailOk);
    setFieldState(pwInput, passwordError, pwOk);
    if (!emailOk || !pwOk) return;

    submitBtn.classList.add("loading");
    submitBtn.disabled = true;

    // Simulate network call
    setTimeout(() => {}, 1600);

    const data = {
        email: emailInput.value,
        password: pwInput.value,
    };
    let loginStatus = await apiCall("/login", "POST", data);
    console.log(loginStatus);

    localStorage.setItem("role", loginStatus.role);
    localStorage.setItem("token", loginStatus.token);

    // Simulate network request — replace with your real auth call
    setTimeout(() => {
        if (loginStatus.code == 200) {
            submitBtn.classList.remove("loading");
            submitBtn.disabled = false;
            document.getElementById("successOverlay").classList.add("show");
            window.location.assign("/");
        } 
    }, 1400);
});

/* ── Toast ── */
let toastTimer;
function showToast(msg) {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2400);
}

/* ── Enter key ── */
document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") submitBtn.click();
});
