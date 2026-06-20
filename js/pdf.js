function createBillPDF(bill) {

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF();

    // Header

    doc.setFontSize(18);

    doc.setFont("helvetica", "bold");

    doc.text("BILL RECEIPT", 80, 15);

    doc.setFontSize(11);

    doc.setFont("helvetica", "normal");

    doc.text(`Date : ${bill.date}`, 14, 30);

    doc.text(`Time : ${bill.time}`, 14, 38);

    doc.text(
        `Customer : ${bill.customerName}`,
        14,
        46
    );


    // Table

    const rows = [];

    let grandTotal = 0;

    bill.items.forEach((item, index) => {

        rows.push([

            index + 1,

            item.name,

            `${item.quantity.toFixed(3)} ${item.unit}`,

            item.rate.toFixed(2),

            item.total.toFixed(2)

        ]);

        grandTotal += item.total;

    });


    doc.autoTable({

        startY: 60,

        head: [[

            "S.No",

            "Item",

            "Qty/Weight",

            "Rate",

            "Total"

        ]],

        body: rows,

        theme: "grid",

        styles: {

            fontSize: 10

        }

    });


    doc.setFontSize(14);

    doc.setFont("helvetica", "bold");

    doc.text(

        `Grand Total : ₹ ${grandTotal.toFixed(2)}`,

        120,

        doc.lastAutoTable.finalY + 15

    );


    const formattedDate =
        bill.date.replaceAll("/", "-");

    const fileName =
        `${bill.customerName}_${formattedDate}.pdf`;

    doc.save(fileName);

}

function generatePDF() {

    if (currentBill.length === 0) {

        alert("Bill is empty.");

        return;

    }

    const customerName =
        document
        .getElementById("customerName")
        .value
        .trim();

    if (customerName === "") {

        alert("Enter customer name.");

        return;

    }


    const now = new Date();

    const bill = {

        date:
            now.toLocaleDateString("en-GB"),

        time:
            now.toLocaleTimeString(),

        customerName,

        items: currentBill,

        grandTotal:
            Number(
                document
                .getElementById("grandTotal")
                .innerText
            )

    };


    createBillPDF(bill);

}

// ===== Generate PDF From History =====

function generatePDFFromHistory() {

    if (

        selectedHistoryBillIndex === null

    ) return;


    const bill =

        getBills()[
            selectedHistoryBillIndex
        ];


    createBillPDF(bill);

}