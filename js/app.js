// TopKnotch Portal Application Hub & Mode Switcher
(function () {
    let currentDocMode = "quotation"; // 'quotation' | 'invoice' | 'letterpad'

    function switchDocMode(mode) {
        currentDocMode = mode;

        // Update tab buttons
        document.querySelectorAll(".doc-tab-btn").forEach(btn => {
            btn.classList.toggle("active", btn.dataset.mode === mode);
        });

        // Switch workspace container visibility
        document.getElementById("workspaceQuotation").classList.toggle("active", mode === "quotation");
        document.getElementById("workspaceInvoice").classList.toggle("active", mode === "invoice");
        document.getElementById("workspaceLetterpad").classList.toggle("active", mode === "letterpad");

        // Update Nav Brand Subtitle
        const sub = document.getElementById("navBrandSub");
        if (sub) {
            if (mode === "quotation") {
                sub.innerHTML = `WHERE TRADES MEET EXCELLENCE &bull; MULTI-PAGE QUOTATION GENERATOR`;
            } else if (mode === "invoice") {
                sub.innerHTML = `WHERE TRADES MEET EXCELLENCE &bull; OFFICIAL INVOICE GENERATOR`;
            } else if (mode === "letterpad") {
                sub.innerHTML = `WHERE TRADES MEET EXCELLENCE &bull; OFFICIAL LETTERHEAD &amp; MEMO`;
            }
        }

        // Trigger corresponding preview sync
        if (mode === "quotation") {
            if (typeof syncLivePreviewSheet === "function") syncLivePreviewSheet();
        } else if (mode === "invoice") {
            if (window.InvoiceModule && typeof window.InvoiceModule.syncInvoicePreview === "function") {
                window.InvoiceModule.syncInvoicePreview();
            }
        } else if (mode === "letterpad") {
            if (window.LetterpadModule && typeof window.LetterpadModule.syncLetterpadPreview === "function") {
                window.LetterpadModule.syncLetterpadPreview();
            }
        }

        if (typeof updatePreviewScale === "function") {
            updatePreviewScale();
        }
    }

    function handleNavDownload() {
        if (currentDocMode === "quotation") {
            if (typeof downloadPDF === "function") downloadPDF();
        } else if (currentDocMode === "invoice") {
            if (window.InvoiceModule && typeof window.InvoiceModule.downloadInvoicePDF === "function") {
                window.InvoiceModule.downloadInvoicePDF();
            }
        } else if (currentDocMode === "letterpad") {
            if (window.LetterpadModule && typeof window.LetterpadModule.downloadLetterpadPDF === "function") {
                window.LetterpadModule.downloadLetterpadPDF();
            }
        }
    }

    function handleNavReset() {
        if (currentDocMode === "quotation") {
            if (typeof resetDefaults === "function") resetDefaults();
        } else if (currentDocMode === "invoice") {
            if (window.InvoiceModule && typeof window.InvoiceModule.resetInvoiceDefaults === "function") {
                window.InvoiceModule.resetInvoiceDefaults();
            }
        } else if (currentDocMode === "letterpad") {
            if (window.LetterpadModule && typeof window.LetterpadModule.resetLetterpadDefaults === "function") {
                window.LetterpadModule.resetLetterpadDefaults();
            }
        }
    }

    // Expose helpers globally
    window.AppHub = {
        switchDocMode,
        handleNavDownload,
        handleNavReset,
        getCurrentDocMode: () => currentDocMode
    };

    // Initialize all modules on DOM ready
    window.addEventListener("DOMContentLoaded", () => {
        // Inject brand logo into top nav and auth modal
        const navLogo = document.getElementById("navBrandLogo");
        if (navLogo && typeof DARK_LOGO_B64 !== "undefined") {
            navLogo.src = "data:image/png;base64," + DARK_LOGO_B64;
        }

        const authLogo = document.getElementById("authModalLogo");
        if (authLogo && typeof DARK_LOGO_B64 !== "undefined") {
            authLogo.src = "data:image/png;base64," + DARK_LOGO_B64;
        }

        // Initialize Quotation
        if (typeof renderItemsTable === "function") renderItemsTable();
        if (typeof calculateTotals === "function") calculateTotals();
        if (typeof onDateOrSerialChange === "function") onDateOrSerialChange();

        // Initialize Invoice
        if (window.InvoiceModule) {
            window.InvoiceModule.renderInvItemsTable();
            window.InvoiceModule.onInvDateOrSerialChange();
        }

        // Initialize Letterpad
        if (window.LetterpadModule) {
            window.LetterpadModule.onLetterFieldChange();
        }

        // Start on Quotation mode
        switchDocMode("quotation");
    });
})();

// Mobile Section Smooth Scroll
AppHub.scrollToPanel = function (type) {
    const mode = AppHub.getCurrentDocMode();
    let targetId = "";
    if (type === "form") {
        if (mode === "quotation") targetId = "formPanel";
        else if (mode === "invoice") targetId = "invFormPanel";
        else if (mode === "letterpad") targetId = "letterFormPanel";
    } else {
        if (mode === "quotation") targetId = "previewPanel";
        else if (mode === "invoice") targetId = "invPreviewPanel";
        else if (mode === "letterpad") targetId = "letterPreviewPanel";
    }

    const el = document.getElementById(targetId);
    if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        const formBtn = document.getElementById("tabBtnForm");
        const prevBtn = document.getElementById("tabBtnPreview");
        if (formBtn) formBtn.classList.toggle("active", type === "form");
        if (prevBtn) prevBtn.classList.toggle("active", type === "preview");
    }
};

window.scrollToSection = function (id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
};
