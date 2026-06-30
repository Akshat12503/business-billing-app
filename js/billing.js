// ===== State =====

let currentBill = [];
let selectedHistoryBillIndex = null;


// ===== Product Search =====

function initProductSearch() {

    const input   = document.getElementById("productSearch");
    const results = document.getElementById("searchResults");
    let activeIndex = -1;

    input.addEventListener("input", () => {

        const query = input.value.trim().toLowerCase();
        activeIndex = -1;

        if (!query) {
            results.innerHTML = "";
            results.classList.remove("open");
            return;
        }

        const sellerType = document.getElementById("sellerType").value;
        const matches    = getProducts().filter(p =>
            p.name.toLowerCase().includes(query)
        );

        if (matches.length === 0) {
            results.innerHTML = `<div class="search-no-results">No products found</div>`;
            results.classList.add("open");
            return;
        }

        results.innerHTML = matches.map((p, i) => {
            const rate = sellerType === "local"   ? p.localRate
                       : sellerType === "general" ? p.generalRate
                       : p.retailRate;
            return `
                <div class="search-result-item"
                    data-id="${p.id}"
                    data-index="${i}"
                    onmousedown="selectSearchProduct(${p.id})">
                    <span class="item-name">${escapeHtml(p.name)}</span>
                    <span class="item-meta">${p.category} &nbsp;|&nbsp; ₹${rate.toFixed(2)} / ${p.unit}</span>
                </div>
            `;
        }).join("");

        results.classList.add("open");

    });

    // Keyboard navigation
    input.addEventListener("keydown", (e) => {

        const items = results.querySelectorAll(".search-result-item");
        if (!items.length) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            activeIndex = Math.min(activeIndex + 1, items.length - 1);
            items.forEach((el, i) => el.classList.toggle("active", i === activeIndex));
            items[activeIndex]?.scrollIntoView({ block: "nearest" });
        }

        if (e.key === "ArrowUp") {
            e.preventDefault();
            activeIndex = Math.max(activeIndex - 1, 0);
            items.forEach((el, i) => el.classList.toggle("active", i === activeIndex));
            items[activeIndex]?.scrollIntoView({ block: "nearest" });
        }

        if (e.key === "Enter" && activeIndex >= 0) {
            e.preventDefault();
            const id = parseInt(items[activeIndex].dataset.id);
            selectSearchProduct(id);
        }

        if (e.key === "Escape") {
            closeSearch();
        }

    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
        if (!input.contains(e.target) && !results.contains(e.target)) {
            closeSearch();
        }
    });

}

function selectSearchProduct(productId) {

    const product    = getProductById(productId);
    const sellerType = document.getElementById("sellerType").value;

    if (!product) return;

    const rate = sellerType === "local"   ? product.localRate
               : sellerType === "general" ? product.generalRate
               : product.retailRate;

    // Show a small prompt for quantity
    const qtyInput = document.getElementById("searchQtyInput");
    const searchBox = document.getElementById("productSearch");
    const results   = document.getElementById("searchResults");

    // Fill the name in search bar as confirmation, close dropdown
    searchBox.value = product.name;
    results.innerHTML = "";
    results.classList.remove("open");

    // Highlight and focus quantity field
    const qty = document.getElementById("quantity");
    qty.value = "";
    qty.focus();

    // Store selected product id so Add Item button / Enter can use it
    searchBox.dataset.selectedId = productId;

}

function closeSearch() {
    const results = document.getElementById("searchResults");
    results.innerHTML = "";
    results.classList.remove("open");
}

// ===== Add Item (supports both search and dropdown) =====

function addItemToBill() {

    const sellerType  = document.getElementById("sellerType").value;
    const searchInput = document.getElementById("productSearch");
    const searchId    = searchInput.dataset.selectedId;
    const dropdownId  = document.getElementById("productSelect").value;

    // Search bar takes priority if a product was selected from it
    const productId = searchId || dropdownId;
    const quantity  = parseFloat(document.getElementById("quantity").value);

    if (!productId) {
        alert("Please search or select a product.");
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

    // Clear search bar selection
    searchInput.value = "";
    delete searchInput.dataset.selectedId;
    closeSearch();

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
            <td id="name-cell-${index}" class="text-start">
                <div class="d-flex align-items-center justify-content-start gap-1">
                    <span id="name-display-${index}">${escapeHtml(item.name)}</span>
                    <button
                        class="btn btn-sm btn-outline-secondary p-0 px-1"
                        style="line-height:1.2; font-size:12px;"
                        title="Edit name"
                        onclick="startEditName(${index})">
                        ✏️
                    </button>
                </div>
            </td>
            <td id="qty-cell-${index}">
                <div class="d-flex align-items-center justify-content-center gap-1">
                    <span>${item.quantity.toFixed(3)} ${item.unit}</span>
                    <button
                        class="btn btn-sm btn-outline-secondary p-0 px-1"
                        style="line-height:1.2; font-size:12px;"
                        title="Edit quantity"
                        onclick="startEditQty(${index})">
                        ✏️
                    </button>
                </div>
            </td>
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

    // Toggle empty state and update item count pill
    const emptyState = document.getElementById("billEmptyState");
    const countPill   = document.getElementById("itemCountPill");

    if (emptyState) {
        emptyState.classList.toggle("show", currentBill.length === 0);
    }

    if (countPill) {
        countPill.innerText = `${currentBill.length} item${currentBill.length === 1 ? "" : "s"}`;
    }

}

// ===== Edit Name Inline =====

function startEditName(index) {

    const item     = currentBill[index];
    const nameCell = document.getElementById(`name-cell-${index}`);

    nameCell.innerHTML = `
        <div class="d-flex align-items-center justify-content-start gap-1">
            <input
                type="text"
                id="name-input-${index}"
                class="form-control form-control-sm"
                style="width: 150px;"
                value="${escapeHtml(item.name)}">
            <button
                class="btn btn-sm btn-success p-0 px-1"
                style="line-height:1.4; font-size:14px;"
                title="Confirm"
                onclick="confirmEditName(${index})">
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

    const input = document.getElementById(`name-input-${index}`);
    input.focus();
    input.select();

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter")  confirmEditName(index);
        if (e.key === "Escape") renderBill();
    });

}


function confirmEditName(index) {

    const input   = document.getElementById(`name-input-${index}`);
    const newName = input.value.trim();

    if (!newName) {
        alert("Item name cannot be empty.");
        return;
    }

    currentBill[index].name = newName;

    renderBill();

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

    const item            = currentBill[index];
    const product         = getProductById(item.productId);
    const allowsNegative  = product && product.category === "Difference";

    if (isNaN(newRate) || (newRate < 0 && !allowsNegative)) {
        alert("Enter a valid rate.");
        return;
    }

    currentBill[index].rate  = newRate;
    currentBill[index].total = parseFloat(
        (currentBill[index].quantity * newRate).toFixed(2)
    );

    renderBill();

}


// ===== Edit Qty Inline =====

function startEditQty(index) {

    const item    = currentBill[index];
    const qtyCell = document.getElementById(`qty-cell-${index}`);

    qtyCell.innerHTML = `
        <div class="d-flex align-items-center justify-content-center gap-1">
            <input
                type="number"
                step="0.001"
                id="qty-input-${index}"
                class="form-control form-control-sm"
                style="width: 90px;"
                value="${item.quantity.toFixed(3)}">
            <button
                class="btn btn-sm btn-success p-0 px-1"
                style="line-height:1.4; font-size:14px;"
                title="Confirm"
                onclick="confirmEditQty(${index})">
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

    const input = document.getElementById(`qty-input-${index}`);
    input.focus();
    input.select();

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter")  confirmEditQty(index);
        if (e.key === "Escape") renderBill();
    });

}

function confirmEditQty(index) {

    const input  = document.getElementById(`qty-input-${index}`);
    const newQty = parseFloat(input.value);

    if (isNaN(newQty) || newQty <= 0) {
        alert("Enter a valid quantity.");
        return;
    }

    currentBill[index].quantity = newQty;
    currentBill[index].total    = parseFloat(
        (newQty * currentBill[index].rate).toFixed(2)
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

    if (currentBill.length === 0) {
        alert("Add at least one item before saving.");
        return;
    }

    const bills      = getBills();
    const now        = new Date();
    const billNumber = generateBillNumber();

    const bill = {
        billNumber,
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

    alert(`Bill saved successfully. Bill No: ${billNumber}`);

}


// ===== WhatsApp Share (current bill) =====

function shareCurrentBillOnWhatsapp() {

    const customerName = document.getElementById("customerName").value.trim();

    if (currentBill.length === 0) {
        alert("Bill is empty.");
        return;
    }

    const now = new Date();

    const bill = {
        date:         now.toLocaleDateString("en-GB"),
        time:         now.toLocaleTimeString(),
        customerName,
        items:        currentBill,
        grandTotal:   parseFloat(document.getElementById("grandTotal").innerText)
    };

    // Step 1: Download the PDF
    createBillPDF(bill);

    // Step 2: Open WhatsApp after a short delay so the download starts first
    const name    = customerName || "your order";
    const message = `Hi, please find the bill for ${name} attached.`;

    setTimeout(() => {
        window.open(
            "https://wa.me/?text=" + encodeURIComponent(message),
            "_blank"
        );
    }, 800);

}


// ===== Load Bill History =====

function loadBillHistory() {

    const bills = getBills();
    const tbody = document.getElementById("billHistoryTable");
    tbody.innerHTML = "";

    if (bills.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-3">
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
                <td><strong>${bill.billNumber || "—"}</strong></td>
                <td>${bill.date}</td>
                <td>${bill.time}</td>
                <td>${escapeHtml(bill.customerName || "—")}</td>
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

    document.getElementById("billCustomer").innerText =
        bill.customerName ? "Customer : " + bill.customerName : "";
    document.getElementById("billNumber").innerText =
        "Bill No : " + (bill.billNumber || "—");
    document.getElementById("billDate").innerText = "Date : " + bill.date;
    document.getElementById("billTime").innerText = "Time : " + bill.time;

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

    // Step 1: Download the PDF
    createBillPDF(bill);

    // Step 2: Open WhatsApp after a short delay so the download starts first
    const name    = bill.customerName || "your order";
    const message = `Hi, please find the bill for ${name} attached.`;

    setTimeout(() => {
        window.open(
            "https://wa.me/?text=" + encodeURIComponent(message),
            "_blank"
        );
    }, 800);

}


// ===== Thermal Receipt Print (Rough Estimate layout) =====
// Builds a minimal receipt — Rough Estimate heading, bill no + customer on
// the left, date + time on the right, items table, grand total.
// Works for both A4 and thermal printers since it has no fixed width.

function buildThermalReceiptHTML(bill) {

    let rows = "";

    bill.items.forEach((item, i) => {
        rows += `
            <tr>
                <td class="num">${i + 1}</td>
                <td class="col-item">${escapeHtml(item.name)}</td>
                <td class="num">${item.quantity.toFixed(3)} ${item.unit}</td>
                <td class="right">${item.rate.toFixed(2)}</td>
                <td class="right">${item.total.toFixed(2)}</td>
            </tr>`;
    });

    const billNoLine   = bill.billNumber   ? `<span>Bill No : ${bill.billNumber}</span>` : "";
    const customerLine = bill.customerName ? `<span>${escapeHtml(bill.customerName)}</span>` : "";

    return `
        <div class="tr-title">Rough Estimate</div>
        <hr class="tr-divider">

        <div class="tr-meta-row">
            <div class="tr-meta-left">
                ${billNoLine}
                ${customerLine}
            </div>
            <div class="tr-meta-right">
                <span>${bill.date}</span>
                <span>${bill.time}</span>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th class="num">S.No</th>
                    <th class="col-item">Item</th>
                    <th class="num">Qty/Wt</th>
                    <th class="right">Price</th>
                    <th class="right">Total</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>

        <div class="tr-grand-total">
            <span>Grand Total :</span>
            <span>Rs ${bill.grandTotal.toFixed(2)}</span>
        </div>
    `;

}

function printCurrentBillThermal() {

    if (currentBill.length === 0) {
        alert("Bill is empty.");
        return;
    }

    const now = new Date();

    const bill = {
        billNumber:   null, // not assigned until saved
        date:         now.toLocaleDateString("en-GB"),
        time:         now.toLocaleTimeString(),
        customerName: document.getElementById("customerName").value.trim(),
        items:        currentBill,
        grandTotal:   parseFloat(document.getElementById("grandTotal").innerText)
    };

    document.getElementById("thermalReceipt").innerHTML = buildThermalReceiptHTML(bill);

    printWithFileName(bill);

}

function printBillFromHistoryThermal(bill) {

    document.getElementById("thermalReceipt").innerHTML = buildThermalReceiptHTML(bill);
    printWithFileName(bill);

}

// Temporarily renames the document title so "Save as PDF" suggests
// CustomerName_DD-MM-YYYY as the file name, then restores the original title.
function printWithFileName(bill) {

    const safeName      = (bill.customerName || "Bill").replace(/\s+/g, "");
    const formattedDate = bill.date.replaceAll("/", "-");
    const originalTitle = document.title;

    document.title = `${safeName}_${formattedDate}`;

    window.print();

    setTimeout(() => {
        document.title = originalTitle;
    }, 500);

}