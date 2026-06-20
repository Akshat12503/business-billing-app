function generatePDF() {

    if (currentBill.length === 0) {

        alert("Bill is empty.");

        return;

    }

    const customerName =
        document.getElementById("customerName")
        .value
        .trim();

    if (customerName === "") {

        alert("Enter customer name.");

        return;

    }

    const sellerType =
        document.getElementById("sellerType")
        .value;

    const now = new Date();

    const date =
        now.toLocaleDateString("en-GB");

    const time =
        now.toLocaleTimeString();

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF();


    // Header

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");

    doc.text("BILL RECEIPT", 80, 15);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    doc.text(`Date : ${date}`, 14, 30);

    doc.text(`Time : ${time}`, 14, 38);

    doc.text(
        `Customer : ${customerName}`,
        14,
        46
    );

    doc.text(
        `Seller Type : ${sellerType}`,
        14,
        54
    );


    // Table

    const rows = [];

    let grandTotal = 0;


    currentBill.forEach((item, index) => {

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

        startY: 65,

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


    // Grand Total

    doc.setFontSize(14);

    doc.setFont("helvetica", "bold");

    doc.text(

        `Grand Total : Rs ${grandTotal.toFixed(2)}`,

        130,

        doc.lastAutoTable.finalY + 15

    );


    // Filename

    const formattedDate =
        date.replaceAll("/", "-");

    const fileName =
        `${customerName}_${formattedDate}.pdf`;

    doc.save(fileName);

}