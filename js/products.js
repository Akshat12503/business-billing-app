// ===== Load Category Dropdowns =====
// Populates both the main bill form and the product modal

function loadCategories() {

    const categorySelect    = document.getElementById("categorySelect");
    const newProductCategory = document.getElementById("newProductCategory");

    // Reset
    categorySelect.innerHTML     = '<option value="">Select Category</option>';
    newProductCategory.innerHTML = "";

    const categories = getCategories();

    categories.forEach(category => {

        // Main bill dropdown
        const opt1       = document.createElement("option");
        opt1.value       = category;
        opt1.textContent = category;
        categorySelect.appendChild(opt1);

        // Modal dropdown
        const opt2       = document.createElement("option");
        opt2.value       = category;
        opt2.textContent = category;
        newProductCategory.appendChild(opt2);

    });

}


// ===== Load Products Dropdown =====
// Filters by selected category

function loadProducts() {

    const category     = document.getElementById("categorySelect").value;
    const productSelect = document.getElementById("productSelect");

    productSelect.innerHTML = '<option value="">Select Product</option>';

    if (!category) return;

    getProducts()
        .filter(p => p.category === category)
        .forEach(product => {
            const opt       = document.createElement("option");
            opt.value       = product.id;
            opt.textContent = product.name;
            productSelect.appendChild(opt);
        });

}


// ===== Render Product Management Table =====

function loadProductTable() {

    const tbody = document.getElementById("productTableBody");
    tbody.innerHTML = "";

    const products = getProducts();

    if (products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted py-3">
                    No products yet. Add one above.
                </td>
            </tr>`;
        return;
    }

    products.forEach(product => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${product.id}</td>

            <td>
                <input class="form-control form-control-sm"
                    id="name-${product.id}"
                    value="${escapeHtml(product.name)}">
            </td>

            <td>
                <input class="form-control form-control-sm"
                    id="category-${product.id}"
                    value="${escapeHtml(product.category)}">
            </td>

            <td>
                <select class="form-select form-select-sm" id="unit-${product.id}">
                    <option value="kg"    ${product.unit === "kg"    ? "selected" : ""}>kg</option>
                    <option value="piece" ${product.unit === "piece" ? "selected" : ""}>piece</option>
                </select>
            </td>

            <td>
                <input type="number" class="form-control form-control-sm"
                    id="local-${product.id}"
                    value="${product.localRate}">
            </td>

            <td>
                <input type="number" class="form-control form-control-sm"
                    id="general-${product.id}"
                    value="${product.generalRate}">
            </td>

            <td>
                <input type="number" class="form-control form-control-sm"
                    id="retail-${product.id}"
                    value="${product.retailRate}">
            </td>

            <td>
                <button class="btn btn-success btn-sm mb-1"
                    onclick="saveProductChanges(${product.id})">
                    Save
                </button>
                <button class="btn btn-danger btn-sm"
                    onclick="deleteProduct(${product.id})">
                    Delete
                </button>
            </td>
        `;

        tbody.appendChild(row);

    });

}


// ===== Get Single Product by ID =====

function getProductById(productId) {
    return getProducts().find(p => p.id == productId);
}


// ===== Add Category =====

function addCategory(categoryName) {

    categoryName = categoryName.trim();

    if (!categoryName) {
        alert("Enter a category name.");
        return;
    }

    const categories = getCategories();

    if (categories.map(c => c.toLowerCase()).includes(categoryName.toLowerCase())) {
        alert("Category already exists.");
        return;
    }

    categories.push(categoryName);
    saveCategories(categories);
    loadCategories();
    loadProductTable();

    alert(`Category "${categoryName}" added.`);

}


// ===== Add Product =====

function addProduct(name, category, unit, localRate, generalRate, retailRate) {

    const products = getProducts();

    products.push({
        id:          generateProductId(),
        name:        name.trim(),
        category,
        unit,
        localRate:   Number(localRate),
        generalRate: Number(generalRate),
        retailRate:  Number(retailRate)
    });

    saveProducts(products);
    loadProductTable();

}


// ===== Save Product Changes (inline edit) =====

function saveProductChanges(productId) {

    const name        = document.getElementById(`name-${productId}`).value.trim();
    const category    = document.getElementById(`category-${productId}`).value.trim();
    const unit        = document.getElementById(`unit-${productId}`).value;
    const localRate   = Number(document.getElementById(`local-${productId}`).value);
    const generalRate = Number(document.getElementById(`general-${productId}`).value);
    const retailRate  = Number(document.getElementById(`retail-${productId}`).value);

    if (!name || !category || isNaN(localRate) || isNaN(generalRate) || isNaN(retailRate)) {
        alert("All fields are required.");
        return;
    }

    updateProduct(productId, name, category, unit, localRate, generalRate, retailRate);

    loadProductTable();
    loadCategories();
    loadProducts();

    alert("Product updated.");

}


// ===== Delete Product =====

function deleteProduct(productId) {

    if (!confirm("Delete this product?")) return;

    let products = getProducts().filter(p => p.id != productId);
    saveProducts(products);
    loadProductTable();

}


// ===== Utility: Escape HTML to prevent XSS in inline inputs =====

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}