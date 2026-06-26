// ===== Load Stock Overview Modal =====

function loadStockOverview() {

    const tbody    = document.getElementById("stockTableBody");
    const products = getProducts();
    tbody.innerHTML = "";

    if (products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-muted py-3">
                    No products found. Add products first.
                </td>
            </tr>`;
        return;
    }

    products.forEach(product => {

        const current = getStockById(product.id);
        const isLow   = current <= 0;

        const row = document.createElement("tr");

        row.innerHTML = `
            <td class="text-start">${escapeHtml(product.name)}</td>
            <td>${escapeHtml(product.category)}</td>
            <td class="${isLow ? "text-danger fw-bold" : ""}">
                ${current.toFixed(3)} ${product.unit}
            </td>
            <td>
                <div class="d-flex align-items-center gap-1 justify-content-center">
                    <input
                        type="number"
                        step="0.001"
                        min="0"
                        id="stock-add-${product.id}"
                        class="form-control form-control-sm"
                        style="width: 100px;"
                        placeholder="0.000">
                    <button
                        class="btn btn-success btn-sm"
                        onclick="handleAddStock(${product.id})">
                        + Add
                    </button>
                    <button
                        class="btn btn-outline-secondary btn-sm"
                        onclick="handleSetStock(${product.id})">
                        Set
                    </button>
                </div>
            </td>
        `;

        tbody.appendChild(row);

    });

}


// ===== Add Stock (accumulate) =====

function handleAddStock(productId) {

    const input = document.getElementById(`stock-add-${productId}`);
    const qty   = parseFloat(input.value);

    if (isNaN(qty) || qty <= 0) {
        alert("Enter a valid quantity to add.");
        return;
    }

    addStock(productId, qty);
    input.value = "";
    loadStockOverview();

}


// ===== Set Stock (overwrite to exact value) =====

function handleSetStock(productId) {

    const input = document.getElementById(`stock-add-${productId}`);
    const qty   = parseFloat(input.value);

    if (isNaN(qty) || qty < 0) {
        alert("Enter a valid stock value.");
        return;
    }

    if (!confirm(`Set stock to exactly ${qty.toFixed(3)}?`)) return;

    setStock(productId, qty);
    input.value = "";
    loadStockOverview();

}


// ===== Stock Search Filter =====

function filterStockTable() {

    const text = document.getElementById("stockSearch").value.toLowerCase();

    document
        .querySelectorAll("#stockTableBody tr")
        .forEach(row => {
            row.style.display =
                row.innerText.toLowerCase().includes(text) ? "" : "none";
        });

}