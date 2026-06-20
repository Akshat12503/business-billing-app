// ===== Current Bill =====

let currentBill = [];


// ===== Add Item =====

function addItemToBill() {

    const sellerType =
        document.getElementById("sellerType").value;

    const productId =
        document.getElementById("productSelect").value;

    const quantity =
        parseFloat(document.getElementById("quantity").value);

    if (!productId || !quantity || quantity <= 0) {

        alert("Please select product and enter quantity.");

        return;

    }


    const product = getProductById(productId);

    let rate = 0;

    switch (sellerType) {

        case "local":
            rate = product.localRate;
            break;

        case "general":
            rate = product.generalRate;
            break;

        case "retail":
            rate = product.retailRate;
            break;

    }


    const total = quantity * rate;


    currentBill.push({

        productId: product.id,

        name: product.name,

        unit: product.unit,

        quantity: quantity,

        rate: rate,

        total: total

    });


    renderBill();


    document.getElementById("quantity").value = "";

}



// ===== Render Bill Table =====

function renderBill() {

    const tbody =
        document.getElementById("billTableBody");

    tbody.innerHTML = "";

    let grandTotal = 0;


    currentBill.forEach((item, index) => {

        grandTotal += item.total;

        tbody.innerHTML += `
        <tr>

            <td>${index + 1}</td>

            <td>${item.name}</td>

            <td>
                ${item.quantity.toFixed(3)}
                ${item.unit}
            </td>

            <td>
                ₹ ${item.rate.toFixed(2)}
            </td>

            <td>
                ₹ ${item.total.toFixed(2)}
            </td>

            <td>

                <button
                    class="btn btn-danger btn-sm"
                    onclick="removeItem(${index})">

                    X

                </button>

            </td>

        </tr>
        `;

    });


    document.getElementById("grandTotal").innerText =
        grandTotal.toFixed(2);

}



// ===== Remove Item =====

function removeItem(index) {

    currentBill.splice(index, 1);

    renderBill();

}



// ===== Clear Bill =====

function clearBill() {

    currentBill = [];

    renderBill();

}



// ===== Save Bill =====

function saveBill() {

    const customerName =
        document.getElementById("customerName").value.trim();

    if (customerName === "") {

        alert("Enter customer name.");

        return;

    }


    const bills = getBills();

    const now = new Date();


    const bill = {

        date: now.toLocaleDateString(),

        time: now.toLocaleTimeString(),

        customerName: customerName,

        items: currentBill,

        grandTotal: Number(
            document.getElementById("grandTotal").innerText
        )

    };


    bills.push(bill);

    saveBills(bills);


    alert("Bill saved successfully.");

}
// ===== Bill History =====

function loadBillHistory() {

    const bills = getBills();

    const tbody =
        document.getElementById(
            "billHistoryTable"
        );

    tbody.innerHTML = "";


    bills
        .slice()
        .reverse()
        .forEach(bill => {

            tbody.innerHTML += `

            <tr>

                <td>${bill.date}</td>

                <td>${bill.time}</td>

                <td>${bill.customerName}</td>

                <td>
                    ₹ ${bill.grandTotal.toFixed(2)}
                </td>

            </tr>

            `;

        });

}
function searchBills() {

    const text =
        document
        .getElementById("billSearch")
        .value
        .toLowerCase();

    const rows =
        document.querySelectorAll(
            "#billHistoryTable tr"
        );

    rows.forEach(row => {

        row.style.display =
            row.innerText
            .toLowerCase()
            .includes(text)

            ? ""

            : "none";

    });

}

// ===== Load Bill History =====

function loadBillHistory() {

    const bills = getBills();

    const tbody =
        document.getElementById("billHistoryTable");

    tbody.innerHTML = "";


    bills
        .slice()
        .reverse()
        .forEach((bill, reverseIndex) => {

            const actualIndex =
                bills.length - 1 - reverseIndex;

            tbody.innerHTML += `

            <tr>

                <td>${bill.date}</td>

                <td>${bill.time}</td>

                <td>${bill.customerName}</td>

                <td>
                    ₹ ${bill.grandTotal.toFixed(2)}
                </td>

                <td>

                    <button
                        class="btn btn-primary btn-sm"
                        onclick="viewBill(${actualIndex})">

                        View

                    </button>


                    <button
                        class="btn btn-danger btn-sm"
                        onclick="deleteBill(${actualIndex})">

                        Delete

                    </button>

                </td>

            </tr>

            `;

        });

}

// ===== View Bill =====

function viewBill(index) {

    selectedHistoryBillIndex = index;

    const bill = getBills()[index];

    document.getElementById("billCustomer").innerText =
        "Customer : " + bill.customerName;

    document.getElementById("billDate").innerText =
        "Date : " + bill.date;

    document.getElementById("billTime").innerText =
        "Time : " + bill.time;


    const tbody =
        document.getElementById(
            "billDetailsTable"
        );

    tbody.innerHTML = "";


    bill.items.forEach((item, i) => {

        tbody.innerHTML += `

        <tr>

            <td>${i + 1}</td>

            <td>${item.name}</td>

            <td>

                ${item.quantity.toFixed(3)}

                ${item.unit}

            </td>

            <td>

                ₹ ${item.rate.toFixed(2)}

            </td>

            <td>

                ₹ ${item.total.toFixed(2)}

            </td>

        </tr>

        `;

    });


    document.getElementById(
        "billDetailsGrandTotal"
    ).innerText =
        bill.grandTotal.toFixed(2);


    const modal = new bootstrap.Modal(

        document.getElementById(
            "billDetailsModal"
        )

    );

    modal.show();

}

// ===== Delete Bill From Modal =====

function deleteBillFromModal() {

    if (

        selectedHistoryBillIndex === null

    ) return;


    if (

        !confirm("Delete this bill ?")

    ) return;


    const bills = getBills();

    bills.splice(

        selectedHistoryBillIndex,

        1

    );

    saveBills(bills);

    selectedHistoryBillIndex = null;

    loadBillHistory();

    bootstrap.Modal
        .getInstance(
            document.getElementById(
                "billDetailsModal"
            )
        )
        .hide();

}

// ===== WhatsApp Share =====

function shareBillOnWhatsapp() {

    if (selectedHistoryBillIndex === null)
        return;

    const bill =
        getBills()[selectedHistoryBillIndex];

    let message =

`Hello ${bill.customerName},

Thank you for your purchase.

Bill Date : ${bill.date}
Bill Time : ${bill.time}

Bill Amount : ₹${bill.grandTotal.toFixed(2)}

Please find your invoice attached.

Thank you.`;

    const url =

        "https://wa.me/?text=" +

        encodeURIComponent(message);

    window.open(
        url,
        "_blank"
    );

}