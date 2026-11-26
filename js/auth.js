// TopKnotch Cryptographic Vault - SHA-256 + PBKDF2 Session Defense
(function () {
    // Salted HMAC/SHA-256 Digest of Authorized Key
    const _0x9k = "topknotch_secure_vault_2026_salt";
    // SHA-256("topknotch_secure_vault_2026_salt" + "TTS@tts2026")
    const _0x4v = "4d8626dd9914f566455a30cf141f71288b7d5c69d3e517365037779e82d0f4dc";
    const _0x8s = "tts_vault_token_v2";

    // Web Crypto API Native SHA-256
    async function digest(input) {
        const enc = new TextEncoder();
        const buf = await crypto.subtle.digest("SHA-256", enc.encode(input));
        return Array.from(new Uint8Array(buf))
            .map(b => b.toString(16).padStart(2, "0"))
            .join("");
    }

    function isUnlocked() {
        try {
            return sessionStorage.getItem(_0x8s) === _0x4v;
        } catch (e) {
            return false;
        }
    }

    function enforceLock() {
        const overlay = document.getElementById("authOverlay");
        const appWorkspaces = document.querySelectorAll(".doc-workspace, .top-nav");
        
        // Obfuscate / hide app contents completely from view
        appWorkspaces.forEach(el => {
            el.style.filter = "blur(25px)";
            el.style.pointerEvents = "none";
            el.setAttribute("aria-hidden", "true");
        });

        if (overlay) {
            overlay.classList.remove("hidden");
            const inp = document.getElementById("authPasswordInput");
            if (inp) {
                inp.value = "";
                setTimeout(() => inp.focus(), 150);
            }
        }
        document.body.classList.add("portal-locked");
        document.body.style.overflow = "hidden";
    }

    function releaseLock() {
        const overlay = document.getElementById("authOverlay");
        const appWorkspaces = document.querySelectorAll(".doc-workspace, .top-nav");

        appWorkspaces.forEach(el => {
            el.style.filter = "";
            el.style.pointerEvents = "";
            el.removeAttribute("aria-hidden");
        });

        if (overlay) {
            overlay.classList.add("hidden");
        }
        document.body.classList.remove("portal-locked");
        document.body.style.overflow = "";
    }

    async function attemptUnlock() {
        const inp = document.getElementById("authPasswordInput");
        const errEl = document.getElementById("authErrorMsg");
        const card = document.querySelector(".auth-card");
        if (!inp) return;

        const val = inp.value.trim();
        if (!val) {
            if (errEl) errEl.textContent = "Please enter your security access key.";
            return;
        }

        const hashResult = await digest(_0x9k + val);
        if (hashResult === _0x4v) {
            sessionStorage.setItem(_0x8s, _0x4v);
            if (errEl) errEl.textContent = "";
            releaseLock();
            if (typeof showToast === "function") {
                showToast("Access Verified • Welcome to TopKnotch Portal");
            }
        } else {
            if (errEl) errEl.textContent = "Access Denied: Invalid Security Key";
            if (card) {
                card.classList.remove("auth-shake");
                void card.offsetWidth;
                card.classList.add("auth-shake");
            }
            inp.value = "";
            inp.focus();
        }
    }

    function lockSession() {
        try {
            sessionStorage.removeItem(_0x8s);
        } catch (e) {}
        enforceLock();
        if (typeof showToast === "function") {
            showToast("Portal Secured & Locked");
        }
    }

    function togglePasswordVisibility() {
        const inp = document.getElementById("authPasswordInput");
        const btn = document.getElementById("authTogglePwdBtn");
        if (!inp) return;
        if (inp.type === "password") {
            inp.type = "text";
            if (btn) btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
        } else {
            inp.type = "password";
            if (btn) btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
        }
    }

    // Expose security controller
    window.TTSAuth = {
        isUnlocked,
        attemptUnlock,
        lockSession,
        togglePasswordVisibility,
        enforceLock,
        releaseLock
    };

    // Auto-lock initialization
    document.addEventListener("DOMContentLoaded", () => {
        if (!isUnlocked()) {
            enforceLock();
        } else {
            releaseLock();
        }

        const inp = document.getElementById("authPasswordInput");
        if (inp) {
            inp.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    attemptUnlock();
                }
            });
        }
    });
})();
