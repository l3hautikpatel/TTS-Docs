let items = [
            {
                techs: 2,
                qty: 12,
                unit: "Hours",
                description: "Maintenance Technician Support - Weekend Shift",
                unitPrice: 70.00
            },
            {
                techs: 3,
                qty: 4,
                unit: "Hours",
                description: "General Technical Maintenance Support",
                unitPrice: 60.00
            }
        ];

        let currentZoomMode = window.innerWidth < 840 ? "fit" : "100";

        function setPreviewZoom(mode) {
            currentZoomMode = mode;
            document.getElementById("zoomFitBtn").classList.toggle("active", mode === "fit");
            document.getElementById("zoom100Btn").classList.toggle("active", mode === "100");
            updatePreviewScale();
        }

        function updatePreviewScale() {
            if (typeof document === "undefined" || typeof document.querySelectorAll !== "function") return;
            const isMobile = window.innerWidth < 840;
            const sheets = document.querySelectorAll(".a4-sheet");
            const wrappers = document.querySelectorAll(".sheet-wrapper");

            if (currentZoomMode === "fit" && isMobile) {
                const availWidth = Math.min(window.innerWidth - 32, 794);
                const scale = Math.max(0.35, availWidth / 794);
                sheets.forEach((sheet, idx) => {
                    sheet.style.transform = `scale(${scale})`;
                    sheet.style.transformOrigin = "top center";
                    if (wrappers[idx]) {
                        wrappers[idx].style.height = `${Math.round(297 * 3.7795 * scale + 15)}px`;
                    }
                });
            } else {
                sheets.forEach((sheet, idx) => {
                    sheet.style.transform = "none";
                    if (wrappers[idx]) {
                        wrappers[idx].style.height = "auto";
                    }
                });
            }
        }

        window.addEventListener("resize", () => {
            if (window.innerWidth >= 840 && currentZoomMode === "fit") {
                setPreviewZoom("100");
            } else {
                updatePreviewScale();
            }
        });

        function scrollToSection(sectionId) {
            const el = document.getElementById(sectionId);
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "start" });
            }
            if (sectionId === "formPanel") {
                document.getElementById("tabBtnForm").classList.add("active");
                document.getElementById("tabBtnPreview").classList.remove("active");
            } else {
                document.getElementById("tabBtnPreview").classList.add("active");
                document.getElementById("tabBtnForm").classList.remove("active");
            }
        }

        function escapeHtml(str) {
            if (!str) return "";
            return String(str)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        function formatMoney(amount) {
            return "$" + Number(amount || 0).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        }

        function getFormattedServiceDate() {
            const val = document.getElementById("serviceDate").value;
            if (!val) return "";
            return getFormattedDate(val);
        }

        function getFormattedDate(dateStr) {
            if (!dateStr) return "";
            if (!dateStr.includes("-")) return dateStr;
            const parts = dateStr.split("-");
            if (parts.length < 3) return dateStr;
            const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            const y = parts[0];
            const mIdx = parseInt(parts[1], 10) - 1;
            const m = months[mIdx] || parts[1];
            const d = parseInt(parts[2], 10);
            if (isNaN(d)) return dateStr;
            return `${m} ${d}, ${y}`;
        }

        function onServiceDateChange() {
            syncLivePreviewSheet();
        }

        // Line Item Field Change: Multiplies Techs * Hours * UnitPrice
        function onItemFieldChange(index, field, value) {
            if (!items[index]) return;

            if (field === "techs" || field === "qty" || field === "unitPrice") {
                items[index][field] = parseFloat(value) || 0;
                const techs = Number(items[index].techs) || 1;
                const qty = Number(items[index].qty) || 0;
                const price = Number(items[index].unitPrice) || 0;
                const rowSubtotal = techs * qty * price;
                const subtotalCell = document.getElementById(`row-subtotal-${index}`);
                if (subtotalCell) {
                    subtotalCell.textContent = formatMoney(rowSubtotal);
                }
            } else {
                items[index][field] = value;
            }

            calculateTotals();
            syncLivePreviewSheet();
        }

        function calculateTotals() {
            let subtotal = 0;
            items.forEach(it => {
                const techs = Number(it.techs) || 1;
                const qty = Number(it.qty) || 0;
                const price = Number(it.unitPrice) || 0;
                subtotal += techs * qty * price;
            });

            const tax = subtotal * 0.13;
            const grandTotal = subtotal + tax;

            document.getElementById("displaySubtotal").textContent = formatMoney(subtotal);
            document.getElementById("displayTax").textContent = formatMoney(tax);
            document.getElementById("displayGrandTotal").textContent = formatMoney(grandTotal);

            return { subtotal, tax, grandTotal };
        }

        function renderItemsTable() {
            const tbody = document.getElementById("itemsTableBody");
            tbody.innerHTML = "";

            items.forEach((item, index) => {
                const techs = Number(item.techs) || 1;
                const qty = Number(item.qty) || 0;
                const price = Number(item.unitPrice) || 0;
                const rowSubtotal = techs * qty * price;
                const tr = document.createElement("tr");
                tr.id = `item-row-${index}`;
                tr.innerHTML = `
          <td>
            <input type="number" step="1" min="1" class="form-control" value="${techs}" style="text-align:center; padding: 0.35rem 0.2rem;"
              oninput="onItemFieldChange(${index}, 'techs', this.value)">
          </td>
          <td>
            <input type="number" step="any" min="0" class="form-control" value="${qty}" style="text-align:center; padding: 0.35rem 0.2rem;"
              oninput="onItemFieldChange(${index}, 'qty', this.value)">
          </td>
          <td>
            <input type="text" class="form-control" value="${escapeHtml(item.unit)}" style="padding: 0.35rem 0.4rem;"
              oninput="onItemFieldChange(${index}, 'unit', this.value)">
          </td>
          <td>
            <input type="text" class="form-control" value="${escapeHtml(item.description)}" style="padding: 0.35rem 0.4rem;"
              oninput="onItemFieldChange(${index}, 'description', this.value)">
          </td>
          <td>
            <input type="number" step="0.01" min="0" class="form-control" value="${price}" style="text-align:right; padding: 0.35rem 0.4rem;"
              oninput="onItemFieldChange(${index}, 'unitPrice', this.value)">
          </td>
          <td id="row-subtotal-${index}" style="text-align:right; font-weight:600; color:var(--tknavy); padding-right: 0.4rem;">
            ${formatMoney(rowSubtotal)}
          </td>
          <td style="text-align:center;">
            <button type="button" class="btn btn-danger" onclick="removeItemRow(${index})" title="Remove item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </button>
          </td>
        `;
                tbody.appendChild(tr);
            });
        }

        function addItemRow() {
            items.push({
                techs: 1,
                qty: 4,
                unit: "Hours",
                description: "General Technical Maintenance Support",
                unitPrice: 70.00
            });
            renderItemsTable();
            calculateTotals();
            syncLivePreviewSheet();
        }

        function removeItemRow(index) {
            if (items.length <= 1) {
                showToast("Quote must have at least one line item");
                return;
            }
            items.splice(index, 1);
            renderItemsTable();
            calculateTotals();
            syncLivePreviewSheet();
        }

        function buildQuoteNumber() {
            const d = document.getElementById("qDate").value;
            const serial = (document.getElementById("qSerial").value || "01").padStart(2, "0");
            if (!d) return `TK-26-XXXX${serial}`;
            const parts = d.split("-");
            const yy = parts[0].slice(-2);
            const mm = parts[1];
            const dd = parts[2];
            return `TK-${yy}-${dd}${mm}${serial}`;
        }

        function onDateOrSerialChange() {
            const qNo = buildQuoteNumber();
            document.getElementById("quoteNoDisplay").value = qNo;
            syncLivePreviewSheet();
        }

        // Multi-Page Dynamic Pagination
        function paginateItemsForPreview(itemList, customNoteText) {
            const isLongNote = (customNoteText && customNoteText.length > 250);
            const page1Capacity = isLongNote ? 8 : 13;

            if (itemList.length <= page1Capacity) {
                return [{
                    pageIndex: 1,
                    items: itemList,
                    hasMetaBox: true,
                    hasTotalsAndNotes: true,
                    padCount: Math.max(0, 6 - itemList.length)
                }];
            }

            const pages = [];
            let remaining = [...itemList];
            let p = 1;

            while (remaining.length > 0) {
                if (p === 1) {
                    if (remaining.length <= page1Capacity) {
                        pages.push({
                            pageIndex: p,
                            items: remaining,
                            hasMetaBox: true,
                            hasTotalsAndNotes: true,
                            padCount: 0
                        });
                        remaining = [];
                    } else {
                        const slice = remaining.splice(0, 18);
                        pages.push({
                            pageIndex: p,
                            items: slice,
                            hasMetaBox: true,
                            hasTotalsAndNotes: false,
                            padCount: 0
                        });
                    }
                } else {
                    const pageCap = isLongNote ? 12 : 18;
                    if (remaining.length <= pageCap) {
                        pages.push({
                            pageIndex: p,
                            items: remaining,
                            hasMetaBox: false,
                            hasTotalsAndNotes: true,
                            padCount: 0
                        });
                        remaining = [];
                    } else {
                        const slice = remaining.splice(0, 24);
                        pages.push({
                            pageIndex: p,
                            items: slice,
                            hasMetaBox: false,
                            hasTotalsAndNotes: false,
                            padCount: 0
                        });
                    }
                }
                p++;
            }

            return pages;
        }

        // Render HTML Live Preview Sheets
        function syncLivePreviewSheet() {
            const quoteNo = buildQuoteNumber();
            const issueDate = getFormattedDate(document.getElementById("qDate").value);
            const validThrough = document.getElementById("validThrough").value;
            const serviceDate = getFormattedServiceDate();

            const clientCompany = document.getElementById("clientCompany").value;
            const contactName = document.getElementById("clientContactName").value;
            const contactTitle = document.getElementById("clientContactTitle").value;
            const address1 = document.getElementById("clientAddress1").value;
            const address2 = document.getElementById("clientAddress2").value;
            const email = document.getElementById("clientEmail").value;
            const phone = document.getElementById("clientPhone").value;

            const customNote = document.getElementById("customNote").value.trim();

            const totals = calculateTotals();
            const subtotal = totals.subtotal;
            const tax = totals.tax;
            const grandTotal = totals.grandTotal;

            const pages = paginateItemsForPreview(items, customNote);
            const totalPages = pages.length;

            const badge = document.getElementById("pageCountBadge");
            if (badge) badge.textContent = `Page 1 of ${totalPages} (${totalPages} ${totalPages === 1 ? 'Page' : 'Pages'})`;

            const container = document.getElementById("sheetsContainer");
            container.innerHTML = "";

            pages.forEach(pageInfo => {
                const sheetWrapper = document.createElement("div");
                sheetWrapper.className = "sheet-wrapper";

                const sheetEl = document.createElement("div");
                sheetEl.className = "a4-sheet";

                let rowsHtml = "";
                pageInfo.items.forEach(it => {
                    const techs = Number(it.techs) || 1;
                    const qty = Number(it.qty) || 0;
                    const price = Number(it.unitPrice) || 0;
                    const rSub = techs * qty * price;
                    rowsHtml += `
            <tr>
              <td class="center">${techs}</td>
              <td>${escapeHtml(qty)} ${escapeHtml(it.unit)}</td>
              <td>${escapeHtml(it.description)}</td>
              <td class="right">${formatMoney(price)}</td>
              <td class="right">${formatMoney(rSub)}</td>
            </tr>
          `;
                });

                if (pageInfo.padCount > 0) {
                    for (let k = 0; k < pageInfo.padCount; k++) {
                        rowsHtml += `<tr class="blank-row"><td>&nbsp;</td><td></td><td></td><td></td><td></td></tr>`;
                    }
                }

                let metaBoxHtml = "";
                if (pageInfo.hasMetaBox) {
                    metaBoxHtml = `
            <div class="sheet-title">QUOTATION</div>
            <div class="sheet-meta-box">
              <div class="sheet-receiver">
                <div class="sheet-receiver-label">RECEIVER</div>
                <div class="sheet-receiver-company">${escapeHtml(clientCompany)}</div>
                <div>${escapeHtml(contactName)}${contactTitle ? " | " + escapeHtml(contactTitle) : ""}</div>
                <div>${escapeHtml(address1)}${address2 ? ", " + escapeHtml(address2) : ""}</div>
                <div>${escapeHtml(email)}</div>
                <div>${escapeHtml(phone)}</div>
              </div>
              <div class="sheet-quote-info">
                <table class="sheet-quote-table">
                  <tr>
                    <td class="label">Quote Number:</td>
                    <td class="val"><strong>${quoteNo}</strong></td>
                  </tr>
                  <tr>
                    <td class="label">Date Issued:</td>
                    <td class="val">${issueDate}</td>
                  </tr>
                  <tr>
                    <td class="label">Valid Through:</td>
                    <td class="val">${escapeHtml(validThrough)}</td>
                  </tr>
                  <tr>
                    <td class="label">Service Date:</td>
                    <td class="val">${escapeHtml(serviceDate)}</td>
                  </tr>
                  <tr>
                    <td class="label">GST/HST Reg:</td>
                    <td class="val">762024578 RT0001</td>
                  </tr>
                </table>
              </div>
            </div>
          `;
                }

                let totalsAndNotesHtml = "";
                if (pageInfo.hasTotalsAndNotes) {
                    totalsAndNotesHtml = `
            <div class="sheet-totals-wrap">
              <table class="sheet-totals-table">
                <tr>
                  <td class="lbl">Subtotal:</td>
                  <td class="num">${formatMoney(subtotal)}</td>
                </tr>
                <tr>
                  <td class="lbl">HST (13%):</td>
                  <td class="num">${formatMoney(tax)}</td>
                </tr>
                <tr class="grand-row">
                  <td class="lbl">Total (CAD):</td>
                  <td class="num">${formatMoney(grandTotal)}</td>
                </tr>
              </table>
            </div>

            <div class="sheet-notes">
              <div class="sheet-notes-rule"></div>
              <strong>Notes:</strong><br>
              ${customNote ? escapeHtml(customNote).split("\n").join("<br>") + "<br>" : ""}
              All prices in Canadian dollars. HST (13%) is added as shown.
              <div class="sheet-thank-you">Thank you for your business!</div>
            </div>
          `;
                }

                sheetEl.innerHTML = `
          <!-- Corner Angled Header Decor -->
          <svg class="corner-decor" viewBox="0 0 49 15" preserveAspectRatio="none">
            <polygon points="49,0 0,0 49,15" fill="#F09A36"/>
            <polygon points="49,0 3,0 49,13.5" fill="#1A3651"/>
          </svg>

          <!-- Repeating Header -->
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

          <!-- Sheet Body Content -->
          <div class="sheet-body">
            ${metaBoxHtml}
            <table class="sheet-items-table">
              <thead>
                <tr>
                  <th class="center" style="width: 12%;">TECHS</th>
                  <th style="width: 14%;">QTY</th>
                  <th style="width: 44%;">DESCRIPTION</th>
                  <th class="right" style="width: 15%;">UNIT PRICE (CAD)</th>
                  <th class="right" style="width: 15%;">AMOUNT (CAD)</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
            ${totalsAndNotesHtml}
          </div>

          <!-- Page Number Indicator -->
          <div class="sheet-page-num">
            Quotation ${quoteNo} | Page ${pageInfo.pageIndex} of ${totalPages}
          </div>

          <!-- Repeating Footer -->
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
            });

            updatePreviewScale();
        }

        // Multi-Page Production jsPDF Generation
        function createPDFDocument() {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4"
            });

            const tknavy = [26, 54, 81];
            const tknavydark = [13, 31, 48];
            const tkamber = [240, 154, 54];
            const tkgray = [191, 194, 200];
            const tktext = [68, 68, 68];
            const tklight = [243, 245, 248];

            const quoteNo = buildQuoteNumber();
            const issueDate = getFormattedDate(document.getElementById("qDate").value);
            const validThrough = document.getElementById("validThrough").value;
            const serviceDate = getFormattedServiceDate();

            const clientCompany = document.getElementById("clientCompany").value;
            const contactName = document.getElementById("clientContactName").value;
            const contactTitle = document.getElementById("clientContactTitle").value;
            const address1 = document.getElementById("clientAddress1").value;
            const address2 = document.getElementById("clientAddress2").value;
            const email = document.getElementById("clientEmail").value;
            const phone = document.getElementById("clientPhone").value;

            const customNote = document.getElementById("customNote").value.trim();

            const totals = calculateTotals();
            const subtotal = totals.subtotal;
            const tax = totals.tax;
            const grandTotal = totals.grandTotal;

            // Top Right Section: QUOTATION
            doc.setFont("helvetica", "bold");
            doc.setFontSize(23);
            doc.setTextColor(tknavy[0], tknavy[1], tknavy[2]);
            doc.text("QUOTATION", 192, 42, { align: "right" });

            // Receiver & Metadata Light Box
            doc.setFillColor(tklight[0], tklight[1], tklight[2]);
            doc.rect(18, 45, 174, 34, "F");

            // Receiver (Left Column)
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8.2);
            doc.setTextColor(tkamber[0], tkamber[1], tkamber[2]);
            doc.text("RECEIVER", 22, 50.5);

            doc.setFont("helvetica", "bold");
            doc.setFontSize(9.5);
            doc.setTextColor(tknavy[0], tknavy[1], tknavy[2]);
            doc.text(clientCompany || "Client", 22, 55.5);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(tktext[0], tktext[1], tktext[2]);
            const personLine = contactName + (contactTitle ? " | " + contactTitle : "");
            doc.text(personLine, 22, 60);

            const addrLine = address1 + (address2 ? ", " + address2 : "");
            doc.text(addrLine, 22, 64.5);
            doc.text(email, 22, 69);
            doc.text(phone, 22, 73.5);

            // Metadata (Right Column)
            const metaLabelX = 153;
            const metaValX = 156;
            let my = 50.5;
            const mSpacing = 4.6;

            const printMetaRow = (lbl, val, isBold = false) => {
                doc.setFont("helvetica", "bold");
                doc.setFontSize(8);
                doc.setTextColor(tknavy[0], tknavy[1], tknavy[2]);
                doc.text(lbl, metaLabelX, my, { align: "right" });

                doc.setFont("helvetica", isBold ? "bold" : "normal");
                doc.setTextColor(tktext[0], tktext[1], tktext[2]);
                doc.text(val, metaValX, my);
                my += mSpacing;
            };

            printMetaRow("Quote Number:", quoteNo, true);
            printMetaRow("Date Issued:", issueDate);
            printMetaRow("Valid Through:", validThrough);
            printMetaRow("Service Date:", serviceDate);
            printMetaRow("GST/HST Reg:", "762024578 RT0001");

            // AutoTable Line Items: TECHS | QTY | DESCRIPTION | UNIT PRICE | AMOUNT
            const tableRows = items.map(it => {
                const techs = Number(it.techs) || 1;
                const qty = Number(it.qty) || 0;
                const price = Number(it.unitPrice) || 0;
                const rSub = techs * qty * price;
                return [
                    String(techs),
                    `${qty} ${it.unit}`,
                    it.description,
                    formatMoney(price),
                    formatMoney(rSub)
                ];
            });

            doc.autoTable({
                startY: 85,
                margin: { top: 38, bottom: 38, left: 18, right: 18 },
                showHead: "everyPage",
                head: [["TECHS", "QTY", "DESCRIPTION", "UNIT PRICE (CAD)", "AMOUNT (CAD)"]],
                body: tableRows,
                theme: "plain",
                headStyles: {
                    fillColor: tknavy,
                    textColor: [255, 255, 255],
                    fontStyle: "bold",
                    fontSize: 8.5,
                    cellPadding: 2.2
                },
                bodyStyles: {
                    textColor: tktext,
                    fontSize: 8.5,
                    cellPadding: 2.2,
                    lineColor: tkgray,
                    lineWidth: 0.2
                },
                columnStyles: {
                    0: { cellWidth: 16, halign: "center" },
                    1: { cellWidth: 24 },
                    2: { cellWidth: 80 },
                    3: { cellWidth: 27, halign: "right" },
                    4: { cellWidth: 27, halign: "right" }
                }
            });

            let curY = doc.lastAutoTable.finalY + 4;
            const maxY = 255; // Stop well before footer at 270 and page number at 266.5

            // Check remaining vertical room on last table page for Totals (~25mm needed)
            if (curY + 25 > maxY) {
                doc.addPage();
                curY = 38;
            }

            // Totals Box (Right Aligned)
            const totalLabelX = 164;
            const totalValX = 192;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(8.5);
            doc.setTextColor(tktext[0], tktext[1], tktext[2]);
            doc.text("Subtotal:", totalLabelX, curY, { align: "right" });
            doc.text(formatMoney(subtotal), totalValX, curY, { align: "right" });
            curY += 4.5;

            doc.text("HST (13%):", totalLabelX, curY, { align: "right" });
            doc.text(formatMoney(tax), totalValX, curY, { align: "right" });
            curY += 5;

            // Grand Total Navy Banner
            doc.setFillColor(tknavy[0], tknavy[1], tknavy[2]);
            doc.rect(130, curY, 62, 7.5, "F");
            doc.setFillColor(tkamber[0], tkamber[1], tkamber[2]);
            doc.rect(130, curY, 62, 0.45, "F");

            doc.setFont("helvetica", "bold");
            doc.setFontSize(9.5);
            doc.setTextColor(255, 255, 255);
            doc.text("Total (CAD):", 164, curY + 5.2, { align: "right" });
            doc.text(formatMoney(grandTotal), 190, curY + 5.2, { align: "right" });
            curY += 12;

            // Check space for Notes; if insufficient, start Notes on a fresh page cleanly
            if (curY + 20 > maxY) {
                doc.addPage();
                curY = 38;
            }

            // Notes Section
            doc.setDrawColor(tkgray[0], tkgray[1], tkgray[2]);
            doc.setLineWidth(0.2);
            doc.line(18, curY, 192, curY);
            curY += 4;

            doc.setFont("helvetica", "bold");
            doc.setFontSize(8);
            doc.setTextColor(tktext[0], tktext[1], tktext[2]);
            doc.text("Notes:", 18, curY);
            curY += 4;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);

            const printNoteLine = (txt) => {
                if (curY > maxY) {
                    doc.addPage();
                    curY = 38;
                }
                doc.text(txt, 18, curY);
                curY += 4;
            };

            if (customNote) {
                const paragraphs = customNote.split("\n");
                paragraphs.forEach(para => {
                    if (para.trim()) {
                        const lines = doc.splitTextToSize(para, 174);
                        lines.forEach(l => printNoteLine(l));
                    } else {
                        curY += 2;
                    }
                });
            }

            printNoteLine("All prices in Canadian dollars. HST (13%) is added as shown.");

            if (curY + 6 > maxY) {
                doc.addPage();
                curY = 38;
            }
            curY += 2;
            doc.setFont("helvetica", "italic");
            doc.setTextColor(100, 116, 139);
            doc.text("Thank you for your business!", 18, curY);

            // Multi-Page Header, Watermark & Footer Bands (Exact LaTeX Replica)
            const pageCount = doc.getNumberOfPages();

            // Mathematically Centered Watermark Coords at (105mm, 148.5mm)
            const wmWidth = 200;
            const wmHeight = wmWidth / 3.252032520325203; // 61.50mm
            const wmAngle = 45 * Math.PI / 180;
            const wmCos = Math.cos(wmAngle);
            const wmSin = Math.sin(wmAngle);
            const wmDx = (wmWidth / 2) * wmCos - (wmHeight / 2) * wmSin;
            const wmDy = (wmWidth / 2) * wmSin + (wmHeight / 2) * wmCos;
            const targetWmX = 105 - wmDx; // 56.03mm (Centered at 105mm)
            const targetWmY = 148.5 - wmHeight + wmDy; // 179.45mm (Centered at 148.5mm)

            for (let p = 1; p <= pageCount; p++) {
                doc.setPage(p);

                // Watermark: Rotated 45deg, Centered on Every Page
                try {
                    doc.saveGraphicsState();
                    doc.setGState(new doc.GState({ opacity: 0.04 }));
                    doc.addImage("data:image/png;base64," + LIGHT_LOGO_B64, "PNG", targetWmX, targetWmY, wmWidth, wmHeight, undefined, "FAST", 45);
                    doc.restoreGraphicsState();
                } catch (e) {
                    console.warn("Watermark render notice:", e);
                }

                // Top Right Angled Corner Blocks
                doc.setFillColor(tkamber[0], tkamber[1], tkamber[2]);
                doc.triangle(210, 0, 161, 0, 210, 15, "F");
                doc.setFillColor(tknavy[0], tknavy[1], tknavy[2]);
                doc.triangle(210, 0, 164, 0, 210, 13.5, "F");

                // Header Logo
                doc.addImage("data:image/png;base64," + DARK_LOGO_B64, "PNG", 18, 11, 17, 17);

                // Header Titles
                doc.setFont("helvetica", "bold");
                doc.setFontSize(16);
                doc.setTextColor(tknavy[0], tknavy[1], tknavy[2]);
                doc.text("TOPKNOTCH", 39, 17);

                doc.setTextColor(0, 0, 0);
                const topknotchW = doc.getTextWidth("TOPKNOTCH");
                doc.text(" TRADE SERVICES", 39 + topknotchW, 17);

                doc.setFontSize(8.5);
                doc.setTextColor(tkamber[0], tkamber[1], tkamber[2]);
                doc.text("WHERE TRADES MEET EXCELLENCE", 39, 21.5);

                doc.setFont("helvetica", "normal");
                doc.setFontSize(7.2);
                doc.setTextColor(tktext[0], tktext[1], tktext[2]);
                doc.text("Federally Incorporated | Canada Business Corporations Act (CBCA)", 39, 26);

                // Amber Rule Under Header
                doc.setFillColor(tkamber[0], tkamber[1], tkamber[2]);
                doc.rect(18, 31, 174, 0.45, "F");

                // Page Number Indicator
                doc.setFont("helvetica", "normal");
                doc.setFontSize(7.5);
                doc.setTextColor(tktext[0], tktext[1], tktext[2]);
                doc.text(`Quotation ${quoteNo} | Page ${p} of ${pageCount}`, 192, 266.5, { align: "right" });

                // Bottom Footer Band
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

            return { doc, quoteNo, pageCount };
        }

        function downloadPDF() {
            try {
                const res = createPDFDocument();
                if (res && res.doc) {
                    const filename = `Quotation-${res.quoteNo}.pdf`;
                    res.doc.save(filename);
                    showToast(`Downloaded ${filename} (${res.pageCount} ${res.pageCount === 1 ? 'page' : 'pages'})!`);
                }
            } catch (err) {
                console.error("PDF Download Error:", err);
                alert("Error creating PDF: " + err.message);
            }
        }

        function resetDefaults() {
            if (!confirm("Reset all quotation fields to TopKnotch default values?")) return;

            document.getElementById("qDate").value = "2026-11-19";
            document.getElementById("qSerial").value = "01";
            document.getElementById("validThrough").value = "30 days from issue date";
            document.getElementById("serviceDate").value = "2026-11-21";

            document.getElementById("clientCompany").value = "JLL | Amazon RME";
            document.getElementById("clientContactName").value = "Mitul Barad";
            document.getElementById("clientContactTitle").value = "RME Planner, YHM1";
            document.getElementById("clientAddress1").value = "110 Aeropark Blvd";
            document.getElementById("clientAddress2").value = "Hamilton, ON L0R 1W0";
            document.getElementById("clientEmail").value = "mitubara@amazon.com";
            document.getElementById("clientPhone").value = "+1 (587) 341-0740";
            document.getElementById("customNote").value = "";

            items = [
                {
                    techs: 2,
                    qty: 12,
                    unit: "Hours",
                    description: "Maintenance Technician Support - Weekend Shift",
                    unitPrice: 70.00
                },
                {
                    techs: 3,
                    qty: 4,
                    unit: "Hours",
                    description: "General Technical Maintenance Support",
                    unitPrice: 60.00
                }
            ];

            renderItemsTable();
            calculateTotals();
            onDateOrSerialChange();
            showToast("Defaults restored successfully");
        }

        function showToast(msg) {
            const toast = document.getElementById("toast");
            const toastMsg = document.getElementById("toastMsg");
            toastMsg.textContent = msg;
            toast.classList.add("show");
            setTimeout(() => {
                toast.classList.remove("show");
            }, 3500);
        }

        // Explicitly attach all interactive functions to window
        window.addItemRow = addItemRow;
        window.removeItemRow = removeItemRow;
        window.onItemFieldChange = onItemFieldChange;
        window.calculateTotals = calculateTotals;
        window.onDateOrSerialChange = onDateOrSerialChange;
        window.onServiceDateChange = onServiceDateChange;
        window.syncLivePreviewSheet = syncLivePreviewSheet;
        window.downloadPDF = downloadPDF;
        window.resetDefaults = resetDefaults;
        window.createPDFDocument = createPDFDocument;
        window.setPreviewZoom = setPreviewZoom;
        window.scrollToSection = scrollToSection;

        // Initial Startup
        window.addEventListener("DOMContentLoaded", () => {
            renderItemsTable();
            calculateTotals();
            onDateOrSerialChange();
        });