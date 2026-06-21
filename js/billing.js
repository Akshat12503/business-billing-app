// ===== State =====

let currentBill = [];
let selectedHistoryBillIndex = null;   // tracks which saved bill is open in details modal


// ===== Add Item to Current Bill =====

function addItemToBill() {

    const sellerType = document.getElementById("sellerType").value;
    const productId  = document.getElementById("productSelect").value;
    const quantity   = parseFloat(document.getElementById("quantity").value);

    if (!productId) {
        alert("Please select a product.");
        return;
    }

    if (!quantity || quantity <= 0) {
        alert("Please enter a valid quantity.");
        return;
    }

    const product = getProductById(productId);

    if (!product) {
        alert("Product not found.");
        return;
    }

    let rate = 0;
    switch (sellerType) {
        case "local":   rate = product.localRate;   break;
        case "general": rate = product.generalRate; break;
        case "retail":  rate = product.retailRate;  break;
    }

    const total = parseFloat((quantity * rate).toFixed(2));

    currentBill.push({
        productId: product.id,
        name:      product.name,
        unit:      product.unit,
        quantity,
        rate,
        total
    });

    renderBill();

    // Clear only the quantity field, keep category/product selected for fast repeat entry
    document.getElementById("quantity").value = "";
    document.getElementById("quantity").focus();

}


// ===== Render Bill Table =====

function renderBill() {

    const tbody = document.getElementById("billTableBody");
    tbody.innerHTML = "";

    let grandTotal = 0;

    currentBill.forEach((item, index) => {

        grandTotal += item.total;

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${index + 1}</td>
            <td class="text-start">${escapeHtml(item.name)}</td>
            <td>${item.quantity.toFixed(3)} ${item.unit}</td>
            <td>₹ ${item.rate.toFixed(2)}</td>
            <td>₹ ${item.total.toFixed(2)}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="removeItem(${index})">✕</button>
            </td>
        `;

        tbody.appendChild(row);

    });

    document.getElementById("grandTotal").innerText = grandTotal.toFixed(2);

}


// ===== Remove Item =====

function removeItem(index) {
    currentBill.splice(index, 1);
    renderBill();
}


// ===== Clear Bill =====

function clearBill() {
    currentBill = [];
    document.getElementById("customerName").value = "";
    renderBill();
}


// ===== Save Bill =====

function saveBill() {

    const customerName = document.getElementById("customerName").value.trim();

    if (!customerName) {
        alert("Enter customer name before saving.");
        return;
    }

    if (currentBill.length === 0) {
        alert("Add at least one item before saving.");
        return;
    }

    const bills = getBills();
    const now   = new Date();

    const bill = {
        date:         now.toLocaleDateString("en-GB"),
        time:         now.toLocaleTimeString(),
        customerName,
        items:        currentBill,
        grandTotal:   parseFloat(
                          document.getElementById("grandTotal").innerText
                      )
    };

    bills.push(bill);
    saveBills(bills);

    alert("Bill saved successfully.");

}


// ===== WhatsApp Share (current bill) =====

function shareCurrentBillOnWhatsapp() {

    const customerName = document.getElementById("customerName").value.trim();

    if (!customerName) {
        alert("Enter customer name first.");
        return;
    }

    if (currentBill.length === 0) {
        alert("Bill is empty.");
        return;
    }

    const now        = new Date();
    const dateStr    = now.toLocaleDateString("en-GB");
    const timeStr    = now.toLocaleTimeString();
    const grandTotal = document.getElementById("grandTotal").innerText;

    let itemLines = "";
    currentBill.forEach((item, i) => {
        itemLines += `${i + 1}. ${item.name} — ${item.quantity.toFixed(3)} ${item.unit} × ₹${item.rate.toFixed(2)} = ₹${item.total.toFixed(2)}\n`;
    });

    const message =
`*BILL RECEIPT*
━━━━━━━━━━━━━━━━━━━━
📅 Date : ${dateStr}
🕐 Time : ${timeStr}
👤 Customer : ${customerName}
━━━━━━━━━━━━━━━━━━━━
*Items :*
${itemLines}━━━━━━━━━━━━━━━━━━━━
*Grand Total : ₹${grandTotal}*
━━━━━━━━━━━━━━━━━━━━
Thank you for your purchase! 🙏`;

    window.open(
        "https://wa.me/?text=" + encodeURIComponent(message),
        "_blank"
    );

}


// ===== Load Bill History =====

function loadBillHistory() {

    const bills = getBills();
    const tbody = document.getElementById("billHistoryTable");
    tbody.innerHTML = "";

    if (bills.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-3">
                    No bills saved yet.
                </td>
            </tr>`;
        return;
    }

    bills
        .slice()
        .reverse()
        .forEach((bill, reverseIndex) => {

            const actualIndex = bills.length - 1 - reverseIndex;

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${bill.date}</td>
                <td>${bill.time}</td>
                <td>${escapeHtml(bill.customerName)}</td>
                <td>₹ ${bill.grandTotal.toFixed(2)}</td>
                <td>
                    <button class="btn btn-primary btn-sm me-1"
                        onclick="viewBill(${actualIndex})">
                        View
                    </button>
                    <button class="btn btn-danger btn-sm"
                        onclick="deleteBill(${actualIndex})">
                        Delete
                    </button>
                </td>
            `;

            tbody.appendChild(row);

        });

}


// ===== Search Bills =====

function searchBills() {

    const text = document.getElementById("billSearch").value.toLowerCase();

    document
        .querySelectorAll("#billHistoryTable tr")
        .forEach(row => {
            row.style.display =
                row.innerText.toLowerCase().includes(text) ? "" : "none";
        });

}


// ===== View Bill Details =====

function viewBill(index) {

    selectedHistoryBillIndex = index;

    const bill = getBills()[index];

    document.getElementById("billCustomer").innerText = "Customer : " + bill.customerName;
    document.getElementById("billDate").innerText     = "Date : "     + bill.date;
    document.getElementById("billTime").innerText     = "Time : "     + bill.time;

    const tbody = document.getElementById("billDetailsTable");
    tbody.innerHTML = "";

    bill.items.forEach((item, i) => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${i + 1}</td>
            <td class="text-start">${escapeHtml(item.name)}</td>
            <td>${item.quantity.toFixed(3)} ${item.unit}</td>
            <td>₹ ${item.rate.toFixed(2)}</td>
            <td>₹ ${item.total.toFixed(2)}</td>
        `;

        tbody.appendChild(row);

    });

    document.getElementById("billDetailsGrandTotal").innerText =
        bill.grandTotal.toFixed(2);

    const modal = new bootstrap.Modal(
        document.getElementById("billDetailsModal")
    );
    modal.show();

}


// ===== Delete Bill (from history list) =====

function deleteBill(index) {

    if (!confirm("Delete this bill?")) return;

    const bills = getBills();
    bills.splice(index, 1);
    saveBills(bills);
    loadBillHistory();

}


// ===== Delete Bill (from details modal) =====

function deleteBillFromModal() {

    if (selectedHistoryBillIndex === null) return;
    if (!confirm("Delete this bill?")) return;

    const bills = getBills();
    bills.splice(selectedHistoryBillIndex, 1);
    saveBills(bills);

    selectedHistoryBillIndex = null;
    loadBillHistory();

    bootstrap.Modal
        .getInstance(document.getElementById("billDetailsModal"))
        .hide();

}


// ===== WhatsApp Share (from history modal) =====

function shareBillOnWhatsapp() {

    if (selectedHistoryBillIndex === null) return;

    const bill = getBills()[selectedHistoryBillIndex];

    let itemLines = "";
    bill.items.forEach((item, i) => {
        itemLines += `${i + 1}. ${item.name} — ${item.quantity.toFixed(3)} ${item.unit} × ₹${item.rate.toFixed(2)} = ₹${item.total.toFixed(2)}\n`;
    });

    const message =
`*BILL RECEIPT*
━━━━━━━━━━━━━━━━━━━━
📅 Date : ${bill.date}
🕐 Time : ${bill.time}
👤 Customer : ${bill.customerName}
━━━━━━━━━━━━━━━━━━━━
*Items :*
${itemLines}━━━━━━━━━━━━━━━━━━━━
*Grand Total : ₹${bill.grandTotal.toFixed(2)}*
━━━━━━━━━━━━━━━━━━━━
Thank you for your purchase! 🙏`;

    window.open(
        "https://wa.me/?text=" + encodeURIComponent(message),
        "_blank"
    );

}