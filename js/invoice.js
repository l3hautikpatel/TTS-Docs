// TopKnotch Trade Services - Invoice Module (Faithful to LaTeX Specification)
(function () {
    let invItems = [
        {
            title: "MAINTENANCE TECHNICIAN SUPPORT",
            details: "PO Line 10 | Material No: 8802182013\nSunday shift, November 15, 2026, 4:30 AM start, 12 hours (12 hrs @ $70.00/hr)",
            qty: 1,
            unitPrice: 840.00
        }
    ];

    function escapeHtml(str) {
        if (!str) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function formatMoney(num) {
        return "$" + Number(num || 0).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function buildInvoiceNumber() {
        const dVal = document.getElementById("invDate").value || "2026-11-25";
        const parts = dVal.split("-");
        const yr = parts[0] ? parts[0].slice(-2) : "26";
        const mo = parts[1] || "11";
        const day = parts[2] || "25";
        const serial = (document.getElementById("invSerial").value || "01").padStart(2, "0");
        return `INV-${yr}-${day}${mo}${serial}`;
    }

    function getFormattedInvoiceDate() {
        const dVal = document.getElementById("invDate").value || "2026-11-25";
        const parts = dVal.split("-");
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const mIdx = parseInt(parts[1], 10) - 1;
        const monthName = months[mIdx] || "November";
        const day = parseInt(parts[2], 10) || 25;
        const year = parts[0] || "2026";
        return `${monthName} ${day}, ${year}`;
    }

    function onInvDateOrSerialChange() {
        const invNo = buildInvoiceNumber();
        const disp = document.getElementById("invNoDisplay");
        if (disp) disp.value = invNo;
        syncInvoicePreview();
    }

    function renderInvItemsTable() {
        const tbody = document.getElementById("invItemsTableBody");
        if (!tbody) return;
        tbody.innerHTML = "";

        invItems.forEach((it, idx) => {
            const tr = document.createElement("tr");
            const rTotal = (Number(it.qty) || 0) * (Number(it.unitPrice) || 0);

            tr.innerHTML = `
                <td>
                    <input type="text" class="form-control" style="font-weight: 600; margin-bottom: 4px;" value="${escapeHtml(it.title)}" 
                        oninput="InvoiceModule.onInvItemChange(${idx}, 'title', this.value)" placeholder="Item Title">
                    <textarea class="form-control" rows="2" style="font-size: 0.8rem;" 
                        oninput="InvoiceModule.onInvItemChange(${idx}, 'details', this.value)" placeholder="Item Details">${escapeHtml(it.details)}</textarea>
                </td>
                <td style="text-align: center;">
                    <input type="number" class="form-control" style="text-align: center;" value="${it.qty}" min="1" step="any"
                        oninput="InvoiceModule.onInvItemChange(${idx}, 'qty', this.value)">
                </td>
                <td style="text-align: right;">
                    <input type="number" class="form-control" style="text-align: right;" value="${it.unitPrice}" min="0" step="any"
                        oninput="InvoiceModule.onInvItemChange(${idx}, 'unitPrice', this.value)">
                </td>
                <td style="text-align: right; font-weight: 600; padding-top: 1.1rem; color: var(--tknavy);">
                    ${formatMoney(rTotal)}
                </td>
                <td style="text-align: center; padding-top: 0.8rem;">
                    ${invItems.length > 1 ? `
                        <button type="button" class="btn-remove-row" onclick="InvoiceModule.removeInvItemRow(${idx})" title="Remove item">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                    ` : ""}
                </td>
            `;
            tbody.appendChild(tr);
        });

        calculateInvTotals();
    }

    function addInvItemRow() {
        invItems.push({
            title: "MAINTENANCE TECHNICIAN SUPPORT",
            details: "",
            qty: 1,
            unitPrice: 0.00
        });
        renderInvItemsTable();
        syncInvoicePreview();
    }

    function removeInvItemRow(idx) {
        if (invItems.length <= 1) return;
        invItems.splice(idx, 1);
        renderInvItemsTable();
        syncInvoicePreview();
    }

    function onInvItemChange(idx, field, val) {
        if (!invItems[idx]) return;
        invItems[idx][field] = (field === "qty" || field === "unitPrice") ? Number(val) : val;
        renderInvItemsTable();
        syncInvoicePreview();
    }

    function calculateInvTotals() {
        let subtotal = 0;
        invItems.forEach(it => {
            subtotal += (Number(it.qty) || 0) * (Number(it.unitPrice) || 0);
        });
        const hstRate = 0.13;
        const tax = Math.round(subtotal * hstRate * 100) / 100;
        const grandTotal = Math.round((subtotal + tax) * 100) / 100;

        const subEl = document.getElementById("invDisplaySubtotal");
        const taxEl = document.getElementById("invDisplayTax");
        const grandEl = document.getElementById("invDisplayGrandTotal");

        if (subEl) subEl.textContent = formatMoney(subtotal);
        if (taxEl) taxEl.textContent = formatMoney(tax);
        if (grandEl) grandEl.textContent = formatMoney(grandTotal);

        return { subtotal, tax, grandTotal };
    }

    function syncInvoicePreview() {
        const invNo = buildInvoiceNumber();
        const invDate = getFormattedInvoiceDate();
        const gstNo = document.getElementById("invGstNo")?.value || "762024578 RT0001";

        const billName = document.getElementById("invBillName")?.value || "";
        const billAddress = document.getElementById("invBillAddress")?.value || "";
        const billContact = document.getElementById("invBillContact")?.value || "";

        const siteName = document.getElementById("invSiteName")?.value || "";
        const siteAddress = document.getElementById("invSiteAddress")?.value || "";

        const poNumber = document.getElementById("invPoNumber")?.value || "";
        const poDate = document.getElementById("invPoDate")?.value || "";
        const quoteRef = document.getElementById("invQuoteRef")?.value || "";
        const payTerms = document.getElementById("invPayTerms")?.value || "Net Zero Days";
        const serviceDate = document.getElementById("invServiceDate")?.value || "";
        const vendorNo = document.getElementById("invVendorNo")?.value || "114699";

        const totals = calculateInvTotals();
        const container = document.getElementById("invSheetsContainer");
        if (!container) return;
        container.innerHTML = "";

        let rowsHtml = "";
        invItems.forEach(it => {
            const qty = Number(it.qty) || 0;
            const price = Number(it.unitPrice) || 0;
            const amt = qty * price;
            const detailLines = escapeHtml(it.details).replace(/\n/g, "<br>");
            rowsHtml += `
                <tr>
                    <td>
                        <strong>${escapeHtml(it.title)}</strong>
                        ${it.details ? `<div style="font-size: 7.6pt; color: #555555; margin-top: 2pt;">${detailLines}</div>` : ""}
                    </td>
                    <td class="center">${qty}</td>
                    <td class="right">${formatMoney(price)}</td>
                    <td class="right">${formatMoney(amt)}</td>
                </tr>
            `;
        });

        const sheetWrapper = document.createElement("div");
        sheetWrapper.className = "sheet-wrapper";

        const sheetEl = document.createElement("div");
        sheetEl.className = "a4-sheet";

        sheetEl.innerHTML = `
            <!-- Corner Angled Header Decor -->
            <svg class="corner-decor" viewBox="0 0 49 15" preserveAspectRatio="none">
                <polygon points="49,0 0,0 49,15" fill="#F09A36"/>
                <polygon points="49,0 3,0 49,13.5" fill="#1A3651"/>
            </svg>

            <!-- Header -->
            <div class="sheet-header">
                <img class="sheet-header-logo" src="data:image/png;base64,${DARK_LOGO_B64}" alt="Logo">
                <div class="sheet-header-text">
                    <div class="sheet-header-title">
                        <span class="navy">TOPKNOTCH</span> <span class="black">TRADE SERVICES</span>
                    </div>
                    <div class="sheet-header-slogan">WHERE TRADES MEET EXCELLENCE</div>
                    <div class="sheet-header-cbCA">Federally Incorporated | Canada Business Corporations Act (CBCA)</div>
                </div>
            </div>
            <div class="sheet-header-rule"></div>

            <!-- Centered 45deg Watermark -->
            <div class="sheet-watermark">
                <img src="data:image/png;base64,${LIGHT_LOGO_B64}" alt="Watermark">
            </div>

            <!-- Body Flow -->
            <div class="sheet-body">
                <!-- Title + Invoice Info -->
                <div class="sheet-title" style="margin-bottom: 2mm;">INVOICE</div>
                <div style="display: flex; justify-content: flex-end; margin-bottom: 3.5mm;">
                    <table class="sheet-quote-table" style="width: auto;">
                        <tr>
                            <td class="label">Invoice No.:</td>
                            <td class="val"><strong>${invNo}</strong></td>
                        </tr>
                        <tr>
                            <td class="label">Invoice Date:</td>
                            <td class="val">${invDate}</td>
                        </tr>
                        <tr>
                            <td class="label">GST/HST No.:</td>
                            <td class="val">${escapeHtml(gstNo)}</td>
                        </tr>
                    </table>
                </div>

                <!-- Bill To + Service Location Box -->
                <div class="sheet-meta-box">
                    <div class="sheet-receiver" style="width: 48%;">
                        <div class="sheet-receiver-label">BILL TO</div>
                        <div class="sheet-receiver-company">${escapeHtml(billName)}</div>
                        <div>${escapeHtml(billAddress).replace(/\n/g, "<br>")}</div>
                        <div style="margin-top: 2pt;">${escapeHtml(billContact).replace(/\n/g, "<br>")}</div>
                    </div>
                    <div class="sheet-receiver" style="width: 48%;">
                        <div class="sheet-receiver-label">SERVICE LOCATION</div>
                        <div class="sheet-receiver-company">${escapeHtml(siteName)}</div>
                        <div>${escapeHtml(siteAddress).replace(/\n/g, "<br>")}</div>
                    </div>
                </div>

                <!-- PO Strip -->
                <div class="invoice-po-strip">
                    <div class="invoice-po-col">
                        <div class="invoice-po-head">PO NUMBER</div>
                        <div class="invoice-po-val">${escapeHtml(poNumber)}</div>
                    </div>
                    <div class="invoice-po-col">
                        <div class="invoice-po-head">PO DATE</div>
                        <div class="invoice-po-val">${escapeHtml(poDate)}</div>
                    </div>
                    <div class="invoice-po-col">
                        <div class="invoice-po-head">QUOTE REF.</div>
                        <div class="invoice-po-val">${escapeHtml(quoteRef)}</div>
                    </div>
                    <div class="invoice-po-col">
                        <div class="invoice-po-head">TERMS</div>
                        <div class="invoice-po-val">${escapeHtml(payTerms)}</div>
                    </div>
                    <div class="invoice-po-col">
                        <div class="invoice-po-head">SERVICE DATE</div>
                        <div class="invoice-po-val">${escapeHtml(serviceDate)}</div>
                    </div>
                </div>

                <!-- Items Table -->
                <table class="sheet-items-table">
                    <thead>
                        <tr>
                            <th style="width: 55%;">DESCRIPTION</th>
                            <th class="center" style="width: 12%;">QTY</th>
                            <th class="right" style="width: 16%;">UNIT PRICE</th>
                            <th class="right" style="width: 17%;">AMOUNT</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>

                <!-- Totals Box -->
                <div class="sheet-totals-wrap">
                    <table class="sheet-totals-table">
                        <tr>
                            <td class="lbl">Subtotal</td>
                            <td class="num">${formatMoney(totals.subtotal)}</td>
                        </tr>
                        <tr>
                            <td class="lbl">HST (13%)</td>
                            <td class="num">${formatMoney(totals.tax)}</td>
                        </tr>
                        <tr class="grand-row">
                            <td class="lbl">Total Due (CAD)</td>
                            <td class="num">${formatMoney(totals.grandTotal)}</td>
                        </tr>
                    </table>
                </div>

                <!-- Notes & Payment (LaTeX Exact) -->
                <div class="invoice-notes-block">
                    <div class="invoice-notes-title">Notes &amp; Payment</div>
                    <div>Payment terms: ${escapeHtml(payTerms)} (per PO ${escapeHtml(poNumber)}). All amounts are in Canadian dollars.</div>
                    <div class="invoice-rule"></div>
                    <div>Payable to <strong>TopKnotch Trade Services Inc.</strong> Quote ref. ${escapeHtml(quoteRef)}; Vendor No. ${escapeHtml(vendorNo)}.</div>
                    <div class="invoice-rule"></div>
                    <div class="sheet-thank-you" style="text-align: center; margin-top: 2.5mm;">Thank you for your business!</div>
                </div>
            </div>

            <!-- Page Number -->
            <div class="sheet-page-num">
                Invoice ${invNo} | Page 1 of 1
            </div>

            <!-- Footer -->
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

    function createInvoicePDF() {
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
        const tklight = BRAND_COLORS.tklight;

        const invNo = buildInvoiceNumber();
        const invDate = getFormattedInvoiceDate();
        const gstNo = document.getElementById("invGstNo")?.value || "762024578 RT0001";

        const billName = document.getElementById("invBillName")?.value || "";
        const billAddress = document.getElementById("invBillAddress")?.value || "";
        const billContact = document.getElementById("invBillContact")?.value || "";

        const siteName = document.getElementById("invSiteName")?.value || "";
        const siteAddress = document.getElementById("invSiteAddress")?.value || "";

        const poNumber = document.getElementById("invPoNumber")?.value || "";
        const poDate = document.getElementById("invPoDate")?.value || "";
        const quoteRef = document.getElementById("invQuoteRef")?.value || "";
        const payTerms = document.getElementById("invPayTerms")?.value || "Net Zero Days";
        const serviceDate = document.getElementById("invServiceDate")?.value || "";
        const vendorNo = document.getElementById("invVendorNo")?.value || "114699";

        const totals = calculateInvTotals();

        // Title: INVOICE
        doc.setFont("helvetica", "bold");
        doc.setFontSize(23);
        doc.setTextColor(tknavy[0], tknavy[1], tknavy[2]);
        doc.text("INVOICE", 192, 41, { align: "right" });

        // Invoice Meta Table (Top Right)
        let my = 46.5;
        const printInvMeta = (lbl, val, isBold = false) => {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8);
            doc.setTextColor(tknavy[0], tknavy[1], tknavy[2]);
            doc.text(lbl, 155, my, { align: "right" });

            doc.setFont("helvetica", isBold ? "bold" : "normal");
            doc.setTextColor(tktext[0], tktext[1], tktext[2]);
            doc.text(val, 158, my);
            my += 4.5;
        };
        printInvMeta("Invoice No.:", invNo, true);
        printInvMeta("Invoice Date:", invDate);
        printInvMeta("GST/HST No.:", gstNo);

        // Bill To & Service Location Light Box
        doc.setFillColor(tklight[0], tklight[1], tklight[2]);
        doc.rect(18, 59, 174, 30, "F");

        // Bill To (Left)
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.2);
        doc.setTextColor(tkamber[0], tkamber[1], tkamber[2]);
        doc.text("BILL TO", 22, 64.5);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(tknavy[0], tknavy[1], tknavy[2]);
        doc.text(billName || "Client", 22, 69.5);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(tktext[0], tktext[1], tktext[2]);
        const billLines = doc.splitTextToSize((billAddress + "\n" + billContact).trim(), 80);
        doc.text(billLines, 22, 74);

        // Service Location (Right)
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.2);
        doc.setTextColor(tkamber[0], tkamber[1], tkamber[2]);
        doc.text("SERVICE LOCATION", 108, 64.5);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(tknavy[0], tknavy[1], tknavy[2]);
        doc.text(siteName || "Site", 108, 69.5);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(tktext[0], tktext[1], tktext[2]);
        const siteLines = doc.splitTextToSize(siteAddress.trim(), 80);
        doc.text(siteLines, 108, 74);

        // PO Strip Table
        doc.autoTable({
            startY: 93,
            margin: { left: 18, right: 18 },
            head: [["PO NUMBER", "PO DATE", "QUOTE REF.", "TERMS", "SERVICE DATE"]],
            body: [[poNumber, poDate, quoteRef, payTerms, serviceDate]],
            theme: "plain",
            headStyles: {
                fillColor: tknavy,
                textColor: [255, 255, 255],
                fontStyle: "bold",
                fontSize: 8,
                halign: "center",
                cellPadding: 2
            },
            bodyStyles: {
                textColor: tknavy,
                fontStyle: "bold",
                fontSize: 8,
                halign: "center",
                cellPadding: 2.2,
                lineColor: tkgray,
                lineWidth: 0.2
            }
        });

        // Items Table
        const tableRows = invItems.map(it => {
            const desc = it.details ? `${it.title}\n${it.details}` : it.title;
            const amt = (Number(it.qty) || 0) * (Number(it.unitPrice) || 0);
            return [desc, String(it.qty), formatMoney(it.unitPrice), formatMoney(amt)];
        });

        // Only real line items are included in PDF - no empty blank rows in final PDF

        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 4,
            margin: { left: 18, right: 18 },
            head: [["DESCRIPTION", "QTY", "UNIT PRICE", "AMOUNT"]],
            body: tableRows,
            theme: "plain",
            headStyles: {
                fillColor: tknavy,
                textColor: [255, 255, 255],
                fontStyle: "bold",
                fontSize: 8.5,
                cellPadding: 2.5
            },
            bodyStyles: {
                textColor: tktext,
                fontSize: 8.2,
                cellPadding: 2.5,
                lineColor: tkgray,
                lineWidth: 0.2
            },
            columnStyles: {
                0: { cellWidth: 92 },
                1: { cellWidth: 20, halign: "center" },
                2: { cellWidth: 31, halign: "right" },
                3: { cellWidth: 31, halign: "right" }
            }
        });

        let curY = doc.lastAutoTable.finalY + 4;

        // Totals Box (Right Aligned)
        const tLblX = 148;
        const tValX = 192;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(tktext[0], tktext[1], tktext[2]);
        doc.text("Subtotal", tLblX, curY, { align: "right" });
        doc.text(formatMoney(totals.subtotal), tValX, curY, { align: "right" });
        curY += 4.5;

        doc.text("HST (13%)", tLblX, curY, { align: "right" });
        doc.text(formatMoney(totals.tax), tValX, curY, { align: "right" });
        curY += 4.5;

        // Grand Total Solid Box
        doc.setFillColor(tknavy[0], tknavy[1], tknavy[2]);
        doc.rect(106, curY - 3.8, 86, 7.5, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        doc.text("Total Due (CAD)", 148, curY + 1.2, { align: "right" });
        doc.text(formatMoney(totals.grandTotal), tValX, curY + 1.2, { align: "right" });
        curY += 9;

        // Notes & Payment (LaTeX Exact)
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(tknavy[0], tknavy[1], tknavy[2]);
        doc.text("Notes & Payment", 18, curY);
        curY += 4.5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(tktext[0], tktext[1], tktext[2]);
        doc.text(`Payment terms: ${payTerms} (per PO ${poNumber}). All amounts are in Canadian dollars.`, 18, curY);
        curY += 2;

        doc.setDrawColor(tkgray[0], tkgray[1], tkgray[2]);
        doc.setLineWidth(0.2);
        doc.line(18, curY, 192, curY);
        curY += 4;

        doc.text(`Payable to TopKnotch Trade Services Inc. Quote ref. ${quoteRef}; Vendor No. ${vendorNo}.`, 18, curY);
        curY += 2;
        doc.line(18, curY, 192, curY);
        curY += 5;

        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text("Thank you for your business!", 105, curY, { align: "center" });

        // Add Header, Footer & Watermark
        const pageCount = doc.internal.getNumberOfPages();
        for (let p = 1; p <= pageCount; p++) {
            doc.setPage(p);

            // Watermark: Rotated 45deg, Exact Mathematical Centering (105mm, 148.5mm)
            const wmWidth = 200;
            const wmHeight = wmWidth / 3.252032520325203; // 61.50mm
            const wmAngle = 45 * Math.PI / 180;
            const wmCos = Math.cos(wmAngle);
            const wmSin = Math.sin(wmAngle);
            const wmDx = (wmWidth / 2) * wmCos - (wmHeight / 2) * wmSin;
            const wmDy = (wmWidth / 2) * wmSin + (wmHeight / 2) * wmCos;
            const targetWmX = 105 - wmDx; // ~56.03mm
            const targetWmY = 148.5 - wmHeight + wmDy; // ~179.45mm

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
            doc.text(`Invoice ${invNo} | Page ${p} of ${pageCount}`, 192, 266.5, { align: "right" });

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

        return { doc, invNo, pageCount };
    }

    function downloadInvoicePDF() {
        try {
            const res = createInvoicePDF();
            if (res && res.doc) {
                const filename = `Invoice-${res.invNo}.pdf`;
                res.doc.save(filename);
                if (typeof showToast === "function") {
                    showToast(`Downloaded ${filename}`);
                }
            }
        } catch (err) {
            console.error("Invoice PDF Error:", err);
            alert("Error creating Invoice PDF: " + err.message);
        }
    }

    function resetInvoiceDefaults() {
        if (!confirm("Reset all invoice fields to TopKnotch default values?")) return;

        document.getElementById("invDate").value = "2026-11-25";
        document.getElementById("invSerial").value = "01";
        document.getElementById("invGstNo").value = "762024578 RT0001";

        document.getElementById("invPoNumber").value = "4506684676-X02";
        document.getElementById("invPoDate").value = "November 25, 2026";
        document.getElementById("invQuoteRef").value = "TK-26-131101";
        document.getElementById("invPayTerms").value = "Net Zero Days";
        document.getElementById("invServiceDate").value = "November 15, 2026";
        document.getElementById("invVendorNo").value = "114699";

        document.getElementById("invBillName").value = "BDI CANADA INC.";
        document.getElementById("invBillAddress").value = "6235 Tomken Rd\nMississauga, ON L5T 1K2";
        document.getElementById("invBillContact").value = "Attn: Kevin Pelette\nkev@bdi-canada.com";

        document.getElementById("invSiteName").value = "BDI 2002";
        document.getElementById("invSiteAddress").value = "470 Grays Road\nHamilton, ON L8E 2Z4";

        invItems = [
            {
                title: "MAINTENANCE TECHNICIAN SUPPORT",
                details: "PO Line 10 | Material No: 8802182013\nSunday shift, November 15, 2026, 4:30 AM start, 12 hours (12 hrs @ $70.00/hr)",
                qty: 1,
                unitPrice: 840.00
            }
        ];

        renderInvItemsTable();
        onInvDateOrSerialChange();
        if (typeof showToast === "function") {
            showToast("Invoice defaults restored successfully");
        }
    }

    window.InvoiceModule = {
        renderInvItemsTable,
        addInvItemRow,
        removeInvItemRow,
        onInvItemChange,
        onInvDateOrSerialChange,
        syncInvoicePreview,
        downloadInvoicePDF,
        resetInvoiceDefaults
    };
})();
