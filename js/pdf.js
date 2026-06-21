// ===== Core PDF Builder =====
// Accepts a bill object and generates + downloads a PDF
// File name format: CustomerName_DD-MM-YYYY.pdf

function createBillPDF(bill) {

    const { jsPDF } = window.jspdf;
    const doc       = new jsPDF({ unit: "mm", format: "a4" });

    const pageWidth  = doc.internal.pageSize.getWidth();
    const margin     = 14;
    const centerX    = pageWidth / 2;

    // ── Header ──────────────────────────────────────────────

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("BILL RECEIPT", centerX, 18, { align: "center" });

    // Divider line under title
    doc.setLineWidth(0.5);
    doc.line(margin, 22, pageWidth - margin, 22);

    // Bill info block
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    doc.text(`Date     : ${bill.date}`,         margin, 30);
    doc.text(`Time     : ${bill.time}`,         margin, 37);
    doc.text(`Customer : ${bill.customerName}`, margin, 44);

    // ── Items Table ──────────────────────────────────────────

    const rows = bill.items.map((item, index) => [
        index + 1,
        item.name,
        `${item.quantity.toFixed(3)} ${item.unit}`,
        `Rs ${item.rate.toFixed(2)}`,
        `Rs ${item.total.toFixed(2)}`
    ]);

    doc.autoTable({
        startY: 52,
        head: [["S.No", "Item", "Qty / Weight", "Rate", "Total"]],
        body: rows,
        theme: "grid",
        headStyles: {
            fillColor:  [30, 30, 30],
            textColor:  255,
            fontStyle:  "bold",
            fontSize:   10,
            halign:     "center"
        },
        bodyStyles: {
            fontSize:   10,
            textColor:  [20, 20, 20]
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

    // Divider line above grand total
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

    // ── Footer ───────────────────────────────────────────────

    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(120);
    doc.text("Thank you for your purchase!", centerX, finalY + 16, { align: "center" });
    doc.setTextColor(0);

    // ── Save ─────────────────────────────────────────────────

    // File name: CustomerName_DD-MM-YYYY.pdf
    const safeName    = bill.customerName.replace(/\s+/g, "");
    const formattedDate = bill.date.replaceAll("/", "-");
    const fileName    = `${safeName}_${formattedDate}.pdf`;

    doc.save(fileName);

}


// ===== Generate PDF from Current Bill =====

function generatePDF() {

    if (currentBill.length === 0) {
        alert("Bill is empty.");
        return;
    }

    const customerName = document.getElementById("customerName").value.trim();

    if (!customerName) {
        alert("Enter customer name.");
        return;
    }

    const now = new Date();

    const bill = {
        date:         now.toLocaleDateString("en-GB"),
        time:         now.toLocaleTimeString(),
        customerName,
        items:        currentBill,
        grandTotal:   parseFloat(
                          document.getElementById("grandTotal").innerText
                      )
    };

    createBillPDF(bill);

}


// ===== Generate PDF from History =====

function generatePDFFromHistory() {

    if (selectedHistoryBillIndex === null) return;

    const bill = getBills()[selectedHistoryBillIndex];
    createBillPDF(bill);

}