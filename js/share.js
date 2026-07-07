// ===== Smart Bill Sharing =====
//
// On devices/browsers that support the Web Share API with files
// (most Android Chrome, some newer mobile browsers), this renders the
// bill as an image matching the PDF's "Rough Estimate" layout and opens
// the native share sheet — same experience as a payment app's
// "Share Receipt", where you just tap WhatsApp and the image is already
// attached.
//
// On devices that don't support file sharing (mainly desktop/laptop
// browsers, and some older mobile browsers), it falls back to the
// original behavior: download the PDF, then open WhatsApp with a
// pre-filled message so the file can be attached manually.

async function shareBillSmart(bill) {

    const canNativeShareFiles =
        typeof navigator.share === "function" &&
        typeof navigator.canShare === "function";

    if (canNativeShareFiles) {
        try {
            const file = await renderBillAsImageFile(bill);

            if (navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: "Bill",
                    text: `Bill for ${bill.customerName || "your order"}`
                });
                return; // shared successfully, nothing else to do
            }
        } catch (err) {
            // AbortError = user simply closed the share sheet, not a real failure
            if (err && err.name === "AbortError") return;
            console.warn("Native share failed, falling back to download:", err);
        }
    }

    // ── Fallback: download PDF + open WhatsApp with a message ──
    fallbackDownloadAndOpenWhatsapp(bill);

}

function fallbackDownloadAndOpenWhatsapp(bill) {

    createBillPDF(bill);

    const name    = bill.customerName || "your order";
    const message = `Hi, please find the bill for ${name} attached.`;

    setTimeout(() => {
        window.open(
            "https://wa.me/?text=" + encodeURIComponent(message),
            "_blank"
        );
    }, 800);

}


// ===== Render the bill as a PNG image, styled like the PDF =====

async function renderBillAsImageFile(bill) {

    const container = document.getElementById("pdfStyleReceipt");
    container.innerHTML = buildPdfStyleReceiptHTML(bill);

    // html2canvas needs the element actually laid out (not display:none),
    // so it's positioned off-screen instead — see CSS in index.html.
    const canvas = await html2canvas(container, {
        scale: 2,          // sharper image
        backgroundColor: "#ffffff",
        useCORS: true
    });

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));

    const safeName      = (bill.customerName || "Bill").replace(/\s+/g, "");
    const formattedDate = bill.date.replaceAll("/", "-");

    return new File([blob], `${safeName}_${formattedDate}.png`, { type: "image/png" });

}

function buildPdfStyleReceiptHTML(bill) {

    let rows = "";

    bill.items.forEach((item, i) => {
        rows += `
            <tr>
                <td class="psr-center">${i + 1}</td>
                <td class="psr-left">${escapeHtml(item.name)}</td>
                <td class="psr-center">${item.quantity.toFixed(3)} ${item.unit}</td>
                <td class="psr-right">Rs ${item.rate.toFixed(2)}</td>
                <td class="psr-right">Rs ${item.total.toFixed(2)}</td>
            </tr>`;
    });

    const billNoLine = bill.billNumber
        ? `<div class="psr-bill-no">Bill No : ${bill.billNumber}</div>`
        : "";

    const customerLine = bill.customerName
        ? `<div class="psr-customer">Customer : ${escapeHtml(bill.customerName)}</div>`
        : "";

    return `
        <div class="psr-page">
            <div class="psr-title">ROUGH ESTIMATE</div>
            <hr class="psr-divider">

            ${billNoLine}

            <div class="psr-meta-row">
                <div>${customerLine}</div>
                <div class="psr-meta-right">
                    <div>Date : ${bill.date}</div>
                    <div>Time : ${bill.time}</div>
                </div>
            </div>

            <table class="psr-table">
                <thead>
                    <tr>
                        <th class="psr-center">S.No</th>
                        <th class="psr-left">Item</th>
                        <th class="psr-center">Qty / Weight</th>
                        <th class="psr-right">Rate</th>
                        <th class="psr-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>

            <hr class="psr-divider">
            <div class="psr-grand-total">Grand Total : Rs ${bill.grandTotal.toFixed(2)}</div>
        </div>
    `;

}