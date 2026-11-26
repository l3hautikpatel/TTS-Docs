// TopKnotch Trade Services - Letter Pad Module (Faithful to LaTeX Specification)
(function () {
    function escapeHtml(str) {
        if (!str) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function buildLetterRef() {
        const dVal = document.getElementById("letterDate")?.value || "2026-11-25";
        const parts = dVal.split("-");
        const yr = parts[0] ? parts[0].slice(-2) : "26";
        const mo = parts[1] || "11";
        const day = parts[2] || "25";
        const serial = (document.getElementById("letterSerial")?.value || "01").padStart(2, "0");
        return `TK-MEMO-${yr}-${day}${mo}${serial}`;
    }

    function getFormattedLetterDate() {
        const dVal = document.getElementById("letterDate")?.value || "2026-11-25";
        const parts = dVal.split("-");
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const mIdx = parseInt(parts[1], 10) - 1;
        const monthName = months[mIdx] || "November";
        const day = parseInt(parts[2], 10) || 25;
        const year = parts[0] || "2026";
        return `${monthName} ${day}, ${year}`;
    }

    function onLetterFieldChange() {
        const refNo = buildLetterRef();
        const refEl = document.getElementById("letterRefDisplay");
        if (refEl) refEl.value = refNo;
        syncLetterpadPreview();
    }

    function syncLetterpadPreview() {
        const refNo = buildLetterRef();
        const letterDate = getFormattedLetterDate();

        const salutation = document.getElementById("letterSalutation")?.value || "Dear Avetta Compliance Team,";
        const bodyContent = document.getElementById("letterBody")?.value || "";

        const showSign = document.querySelector('input[name="letterSignOption"]:checked')?.value === "sign";
        const signName = document.getElementById("letterSignName")?.value || "Nirav Radadiya";
        const signTitle = document.getElementById("letterSignTitle")?.value || "Director, TopKnotch Trade Services Inc.";
        const signEmail = document.getElementById("letterSignEmail")?.value || "nirav@topknotchtrade.com";

        const container = document.getElementById("letterSheetsContainer");
        if (!container) return;
        container.innerHTML = "";

        const sheetWrapper = document.createElement("div");
        sheetWrapper.className = "sheet-wrapper";

        const sheetEl = document.createElement("div");
        sheetEl.className = "a4-sheet";

        const formattedBody = escapeHtml(bodyContent)
            .split("\n\n")
            .map(p => `<p style="margin-bottom: 4mm;">${p.replace(/\n/g, "<br>")}</p>`)
            .join("");

        sheetEl.innerHTML = `
            <!-- Corner Angled Header Decor -->
            <svg class="corner-decor" viewBox="0 0 49 15" preserveAspectRatio="none">
                <polygon points="49,0 0,0 49,15" fill="#F09A36"/>
                <polygon points="49,0 3,0 49,13.5" fill="#1A3651"/>
            </svg>

            <!-- Header (Exact LaTeX Structure) -->
            <div class="sheet-header">
                <img class="sheet-header-logo" src="data:image/png;base64,${DARK_LOGO_B64}" alt="Logo">
                <div class="sheet-header-text">
                    <div class="sheet-header-title">
                        <span class="navy">TOPKNOTCH</span> <span class="black">TRADE SERVICES</span>
                    </div>
                    <div class="sheet-header-slogan">WHERE TRADES MEET EXCELLENCE</div>
                    <div class="sheet-header-cbca">Federally Incorporated | Canada Business Corporations Act (CBCA)</div>
                </div>
            </div>
            <div class="sheet-header-rule"></div>

            <!-- Centered 45deg Watermark -->
            <div class="sheet-watermark">
                <img src="data:image/png;base64,${LIGHT_LOGO_B64}" alt="Watermark">
            </div>

            <!-- Body Flow -->
            <div class="sheet-body">
                <!-- Date & Reference Header Line -->
                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-top: 1.5mm; margin-bottom: 6mm;">
                    <div style="font-size: 9.8pt; color: var(--tktext); font-weight: 500;">${escapeHtml(letterDate)}</div>
                    <div style="font-size: 8.5pt; color: #64748B;">Ref: <strong>${escapeHtml(refNo)}</strong></div>
                </div>

                <!-- Salutation -->
                <div style="font-size: 11.5pt; font-weight: bold; color: var(--tknavy); margin-bottom: 5mm;">
                    ${escapeHtml(salutation)}
                </div>

                <!-- Letter Body -->
                <div class="letterpad-body-text">
                    ${formattedBody}
                </div>

                <!-- Closing & Signature Block -->
                <div style="margin-top: 6mm; font-size: 9.6pt;">
                    <div style="margin-bottom: 3mm;">Sincerely,</div>
                    ${showSign && typeof NIRAV_SIGN_B64 !== "undefined" ? `
                        <div style="margin-top: 1mm; margin-bottom: 2.5mm;">
                            <img src="data:image/png;base64,${NIRAV_SIGN_B64}" alt="Signature" style="height: 15mm; width: 20.8mm; object-fit: contain; display: block;">
                        </div>
                    ` : ""}
                    <div style="font-size: 11pt; font-weight: bold; color: var(--tknavy);">${escapeHtml(signName)}</div>
                    <div style="color: var(--tktext); font-size: 8.8pt; margin-top: 1.5pt;">${escapeHtml(signTitle)}</div>
                    <div style="color: var(--tktext); font-size: 8.8pt; margin-top: 1.5pt;">${escapeHtml(signEmail)}</div>
                </div>
            </div>

            <!-- Page Number -->
            <div class="sheet-page-num">
                Ref ${escapeHtml(refNo)} | Page 1 of 1
            </div>

            <!-- Footer (Exact LaTeX Structure) -->
            <div class="sheet-footer-wrap">
                <div class="sheet-footer-amber-rule"></div>
                <div class="sheet-footer-content">
                    <div><span class="tag">Phone</span>+1 (226) 759-2210</div>
                    <div><span class="tag">Web</span>www.topknotchtrade.com</div>
                    <div><span class="tag">Email</span>info@topknotchtrade.com</div>
                    <div><span class="tag">Address</span>Toronto, Ontario, Canada</div>
                </div>
            </div>
        `;

        sheetWrapper.appendChild(sheetEl);
        container.appendChild(sheetWrapper);

        if (typeof updatePreviewScale === "function") {
            updatePreviewScale();
        }
    }

    function createLetterpadPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
        });

        const tknavy = BRAND_COLORS.tknavy;
        const tknavydark = BRAND_COLORS.tknavydark;
        const tkamber = BRAND_COLORS.tkamber;
        const tkgray = BRAND_COLORS.tkgray;
        const tktext = BRAND_COLORS.tktext;

        const refNo = buildLetterRef();
        const letterDate = getFormattedLetterDate();

        const salutation = document.getElementById("letterSalutation")?.value || "Dear Avetta Compliance Team,";
        const bodyContent = document.getElementById("letterBody")?.value || "";

        const showSign = document.querySelector('input[name="letterSignOption"]:checked')?.value === "sign";
        const signName = document.getElementById("letterSignName")?.value || "Nirav Radadiya";
        const signTitle = document.getElementById("letterSignTitle")?.value || "Director, TopKnotch Trade Services Inc.";
        const signEmail = document.getElementById("letterSignEmail")?.value || "nirav@topknotchtrade.com";

        // Date (Left) & Ref (Right)
        let curY = 44;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(tktext[0], tktext[1], tktext[2]);
        doc.text(letterDate, 18, curY);

        doc.setFontSize(8.5);
        doc.setTextColor(100, 116, 139);
        doc.text(`Ref: ${refNo}`, 192, curY, { align: "right" });
        curY += 9;

        // Salutation
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(tknavy[0], tknavy[1], tknavy[2]);
        doc.text(salutation, 18, curY);
        curY += 8;

        // Body Paragraphs (Matching LaTeX 0.82\textwidth = ~172mm)
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(tktext[0], tktext[1], tktext[2]);

        const paragraphs = bodyContent.split("\n\n");
        paragraphs.forEach(p => {
            const lines = doc.splitTextToSize(p.trim(), 174);
            doc.text(lines, 18, curY);
            curY += lines.length * 5 + 4;
        });

        curY += 4;

        // Sincerely
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(tktext[0], tktext[1], tktext[2]);
        doc.text("Sincerely,", 18, curY);
        curY += 5;

        // Signature Image (If Radio Option is 'sign')
        if (showSign && typeof NIRAV_SIGN_B64 !== "undefined") {
            try {
                // Natural aspect ratio: 800x578 (~1.384). Height 15mm (1.5cm) -> Width 20.8mm
                const signH = 15;
                const signW = 15 * (800 / 578); // ~20.76mm
                doc.addImage("data:image/png;base64," + NIRAV_SIGN_B64, "PNG", 18, curY, signW, signH, undefined, "FAST");
                curY += signH + 3;
            } catch (e) {
                console.warn("Signature image embed warning:", e);
                curY += 4;
            }
        } else {
            curY += 3;
        }

        // Signer Name
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(tknavy[0], tknavy[1], tknavy[2]);
        doc.text(signName, 18, curY);
        curY += 5;

        // Signer Title
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(tktext[0], tktext[1], tktext[2]);
        doc.text(signTitle, 18, curY);
        curY += 4.5;

        // Signer Email
        doc.text(signEmail, 18, curY);

        // Header, Footer & Watermark
        const pageCount = doc.internal.getNumberOfPages();
        for (let p = 1; p <= pageCount; p++) {
            doc.setPage(p);

            // Watermark: Rotated 45deg, Exact Centering at (105mm, 148.5mm)
            const wmWidth = 200;
            const wmHeight = wmWidth / 3.252032520325203; // 61.50mm
            const wmAngle = 45 * Math.PI / 180;
            const wmCos = Math.cos(wmAngle);
            const wmSin = Math.sin(wmAngle);
            const wmDx = (wmWidth / 2) * wmCos - (wmHeight / 2) * wmSin;
            const wmDy = (wmWidth / 2) * wmSin + (wmHeight / 2) * wmCos;
            const targetWmX = 105 - wmDx; // 56.03mm
            const targetWmY = 148.5 - wmHeight + wmDy; // 179.45mm

            try {
                doc.saveGraphicsState();
                doc.setGState(new doc.GState({ opacity: 0.042 }));
                doc.addImage("data:image/png;base64," + LIGHT_LOGO_B64, "PNG", targetWmX, targetWmY, wmWidth, wmHeight, undefined, "FAST", 45);
                doc.restoreGraphicsState();
            } catch (e) {
                console.warn("Watermark render warning:", e);
            }

            // Corner Top-Right Decor
            doc.setFillColor(tknavy[0], tknavy[1], tknavy[2]);
            doc.triangle(210, 0, 164, 0, 210, 13.5, "F");
            doc.setFillColor(tkamber[0], tkamber[1], tkamber[2]);
            doc.triangle(164, 0, 161, 0, 210, 15, "F");

            // Header Logo & Branding
            doc.addImage("data:image/png;base64," + DARK_LOGO_B64, "PNG", 18, 11, 17, 17);

            doc.setFont("helvetica", "bold");
            doc.setFontSize(14);
            doc.setTextColor(tknavy[0], tknavy[1], tknavy[2]);
            doc.text("TOPKNOTCH", 39, 17);

            const topknotchW = doc.getTextWidth("TOPKNOTCH");
            doc.setTextColor(0, 0, 0);
            doc.text(" TRADE SERVICES", 39 + topknotchW, 17);

            doc.setFontSize(8.2);
            doc.setTextColor(tkamber[0], tkamber[1], tkamber[2]);
            doc.text("WHERE TRADES MEET EXCELLENCE", 39, 21.5);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.2);
            doc.setTextColor(tktext[0], tktext[1], tktext[2]);
            doc.text("Federally Incorporated | Canada Business Corporations Act (CBCA)", 39, 26);

            // Amber Rule
            doc.setDrawColor(tkamber[0], tkamber[1], tkamber[2]);
            doc.setLineWidth(0.4);
            doc.line(18, 31, 192, 31);

            // Page Number
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(tktext[0], tktext[1], tktext[2]);
            doc.text(`Ref ${refNo} | Page ${p} of ${pageCount}`, 192, 266.5, { align: "right" });

            // Dark Navy Footer
            doc.setFillColor(tknavydark[0], tknavydark[1], tknavydark[2]);
            doc.rect(0, 270, 210, 27, "F");
            doc.setFillColor(tkamber[0], tkamber[1], tkamber[2]);
            doc.rect(0, 269.2, 210, 0.8, "F");

            // Footer Contact Line
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.2);
            doc.setTextColor(255, 255, 255);
            const footerY = 284;
            let fx = 18;
            const printContactItem = (label, val, spacing) => {
                doc.setFont("helvetica", "bold");
                doc.setTextColor(tkamber[0], tkamber[1], tkamber[2]);
                doc.text(label, fx, footerY);
                fx += doc.getTextWidth(label) + 1.5;

                doc.setFont("helvetica", "normal");
                doc.setTextColor(255, 255, 255);
                doc.text(val, fx, footerY);
                fx += doc.getTextWidth(val) + spacing;
            };

            printContactItem("Phone", "+1 (226) 759-2210", 7);
            printContactItem("Web", "www.topknotchtrade.com", 7);
            printContactItem("Email", "info@topknotchtrade.com", 7);
            printContactItem("Address", "Toronto, Ontario, Canada", 0);
        }

        return { doc, refNo, pageCount };
    }

    function downloadLetterpadPDF() {
        try {
            const res = createLetterpadPDF();
            if (res && res.doc) {
                const filename = `Memo-${res.refNo}.pdf`;
                res.doc.save(filename);
                if (typeof showToast === "function") {
                    showToast(`Downloaded ${filename}`);
                }
            }
        } catch (err) {
            console.error("Letterpad PDF Error:", err);
            alert("Error creating Letter Pad PDF: " + err.message);
        }
    }

    function resetLetterpadDefaults() {
        if (!confirm("Reset all letter pad fields to TopKnotch default values?")) return;

        document.getElementById("letterDate").value = "2026-11-25";
        document.getElementById("letterSerial").value = "01";
        document.getElementById("letterSalutation").value = "Dear Avetta Compliance Team,";
        document.getElementById("letterBody").value = 
`We are writing to formally address the outstanding requirement on our Avetta profile regarding the submission of the 2025 Ontario Workplace Injury Summary Report (WISR) for TopKnotch Trade Services Inc. Because our company was newly established in 2026, we do not have operational or safety records for the 2025 calendar year.

We recently contacted the Ontario Workplace Safety and Insurance Board (WSIB) directly to request the 2025 WISR. Their representative confirmed that no such report can be generated since the company was not registered with them during that year. Therefore, we kindly request that this specific requirement for 2025 be waived or marked as non-applicable on our account due to our recent incorporation.

We are fully committed to maintaining the highest safety standards. Please let us know if you require any additional information, or if there is a specific exemption form within the Avetta portal that we need to complete to resolve this item.

Thank you for your time and assistance.`;

        const signRadio = document.querySelector('input[name="letterSignOption"][value="sign"]');
        if (signRadio) signRadio.checked = true;

        document.getElementById("letterSignName").value = "Nirav Radadiya";
        document.getElementById("letterSignTitle").value = "Director, TopKnotch Trade Services Inc.";
        document.getElementById("letterSignEmail").value = "nirav@topknotchtrade.com";

        onLetterFieldChange();
        if (typeof showToast === "function") {
            showToast("Letter Pad defaults restored successfully");
        }
    }

    window.LetterpadModule = {
        onLetterFieldChange,
        syncLetterpadPreview,
        downloadLetterpadPDF,
        resetLetterpadDefaults
    };
})();
