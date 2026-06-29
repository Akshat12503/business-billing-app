// ===== Core PDF Builder =====

function createBillPDF(bill) {

    const { jsPDF } = window.jspdf;
    const doc       = new jsPDF({ unit: "mm", format: "a4" });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin    = 14;
    const centerX   = pageWidth / 2;

    // ── Header ──────────────────────────────────────────────

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("ROUGH ESTIMATE", centerX, 18, { align: "center" });

    doc.setLineWidth(0.5);
    doc.line(margin, 22, pageWidth - margin, 22);

    // ── Info Row: Customer (left) | Date + Time (right) ─────

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    const rightX = pageWidth - margin;
    let   infoY  = 30;

    // Bill number — small, top left
    if (bill.billNumber) {
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(`Bill No : ${bill.billNumber}`, margin, infoY);
        doc.setTextColor(0);
        doc.setFontSize(11);
        infoY = 37;
    }

    // Customer name on the left
    if (bill.customerName) {
        doc.setFont("helvetica", "bold");
        doc.text(`Customer : ${bill.customerName}`, margin, infoY);
        doc.setFont("helvetica", "normal");
    }

    // Date on the right, same line as customer
    doc.text(`Date : ${bill.date}`, rightX, infoY, { align: "right" });

    // Time on the right, one line below
    doc.text(`Time : ${bill.time}`, rightX, infoY + 7, { align: "right" });

    const tableStartY = infoY + 16;

    // ── Items Table ──────────────────────────────────────────

    const rows = bill.items.map((item, index) => [
        index + 1,
        item.name,
        `${item.quantity.toFixed(3)} ${item.unit}`,
        `Rs ${item.rate.toFixed(2)}`,
        `Rs ${item.total.toFixed(2)}`
    ]);

    doc.autoTable({
        startY: tableStartY,
        head: [["S.No", "Item", "Qty / Weight", "Rate", "Total"]],
        body: rows,
        theme: "grid",
        headStyles: {
            fillColor: [30, 30, 30],
            textColor: 255,
            fontStyle:  "bold",
            fontSize:   10,
            halign:     "center"
        },
        bodyStyles: {
            fontSize:  10,
            textColor: [20, 20, 20]
        },
        columnStyles: {
            0: { halign: "center", cellWidth: 14 },
            1: { halign: "left"                  },
            2: { halign: "center", cellWidth: 38 },
            3: { halign: "right",  cellWidth: 32 },
            4: { halign: "right",  cellWidth: 32 }
        },
        margin: { left: margin, right: margin },
        styles: {
            lineColor: [80, 80, 80],
            lineWidth: 0.3
        }
    });

    // ── Grand Total ──────────────────────────────────────────

    const finalY = doc.lastAutoTable.finalY + 8;

    doc.setLineWidth(0.4);
    doc.line(margin, finalY - 2, pageWidth - margin, finalY - 2);

    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(
        `Grand Total : Rs ${bill.grandTotal.toFixed(2)}`,
        pageWidth - margin,
        finalY + 5,
        { align: "right" }
    );

    // ── Save ─────────────────────────────────────────────────

    const safeName      = (bill.customerName || "Bill").replace(/\s+/g, "");
    const formattedDate = bill.date.replaceAll("/", "-");
    doc.save(`${safeName}_${formattedDate}.pdf`);

}


// ===== Generate PDF from Current Bill =====

function generatePDF() {

    if (currentBill.length === 0) {
        alert("Bill is empty.");
        return;
    }

    const now = new Date();

    const bill = {
        date:         now.toLocaleDateString("en-GB"),
        time:         now.toLocaleTimeString(),
        customerName: document.getElementById("customerName").value.trim(),
        items:        currentBill,
        grandTotal:   parseFloat(document.getElementById("grandTotal").innerText)
    };

    createBillPDF(bill);

}


// ===== Generate PDF from History =====

function generatePDFFromHistory() {

    if (selectedHistoryBillIndex === null) return;

    const bill = getBills()[selectedHistoryBillIndex];
    createBillPDF(bill);

}