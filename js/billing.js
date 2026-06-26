// ===== State =====

let currentBill = [];
let selectedHistoryBillIndex = null;


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
            <td id="rate-cell-${index}">
                <div class="d-flex align-items-center justify-content-center gap-1">
                    <span id="rate-display-${index}">₹ ${item.rate.toFixed(2)}</span>
                    <button
                        class="btn btn-sm btn-outline-secondary p-0 px-1"
                        style="line-height:1.2; font-size:12px;"
                        title="Edit rate"
                        onclick="startEditRate(${index})">
                        ✏️
                    </button>
                </div>
            </td>
            <td id="total-cell-${index}">₹ ${item.total.toFixed(2)}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="removeItem(${index})">✕</button>
            </td>
        `;

        tbody.appendChild(row);

    });

    document.getElementById("grandTotal").innerText = grandTotal.toFixed(2);

}


// ===== Edit Rate Inline =====

function startEditRate(index) {

    const item    = currentBill[index];
    const rateCell = document.getElementById(`rate-cell-${index}`);

    // Replace cell content with an input + confirm button
    rateCell.innerHTML = `
        <div class="d-flex align-items-center justify-content-center gap-1">
            <input
                type="number"
                step="0.01"
                id="rate-input-${index}"
                class="form-control form-control-sm"
                style="width: 90px;"
                value="${item.rate.toFixed(2)}">
            <button
                class="btn btn-sm btn-success p-0 px-1"
                style="line-height:1.4; font-size:14px;"
                title="Confirm"
                onclick="confirmEditRate(${index})">
                ✓
            </button>
            <button
                class="btn btn-sm btn-secondary p-0 px-1"
                style="line-height:1.4; font-size:14px;"
                title="Cancel"
                onclick="renderBill()">
                ✕
            </button>
        </div>
    `;

    // Focus and select the input
    const input = document.getElementById(`rate-input-${index}`);
    input.focus();
    input.select();

    // Allow pressing Enter to confirm
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter")  confirmEditRate(index);
        if (e.key === "Escape") renderBill();
    });

}


function confirmEditRate(index) {

    const input   = document.getElementById(`rate-input-${index}`);
    const newRate = parseFloat(input.value);

    if (isNaN(newRate) || newRate < 0) {
        alert("Enter a valid rate.");
        return;
    }

    currentBill[index].rate  = newRate;
    currentBill[index].total = parseFloat(
        (currentBill[index].quantity * newRate).toFixed(2)
    );

    renderBill();

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
        itemLines += `${i + 1}. ${item.name} - ${item.quantity.toFixed(3)} ${item.unit} x Rs${item.rate.toFixed(2)} = Rs${item.total.toFixed(2)}\n`;
    });

    const message =
`BILL RECEIPT
--------------------
Date     : ${dateStr}
Time     : ${timeStr}
Customer : ${customerName}
--------------------
Items :
${itemLines}--------------------
Grand Total : Rs ${grandTotal}
--------------------
Thank you for your purchase!`;

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
        itemLines += `${i + 1}. ${item.name} - ${item.quantity.toFixed(3)} ${item.unit} x Rs${item.rate.toFixed(2)} = Rs${item.total.toFixed(2)}\n`;
    });

    const message =
`BILL RECEIPT
--------------------
Date     : ${bill.date}
Time     : ${bill.time}
Customer : ${bill.customerName}
--------------------
Items :
${itemLines}--------------------
Grand Total : Rs ${bill.grandTotal.toFixed(2)}
--------------------
Thank you for your purchase!`;

    window.open(
        "https://wa.me/?text=" + encodeURIComponent(message),
        "_blank"
    );

}