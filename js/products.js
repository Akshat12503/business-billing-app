// ===== Load Category Dropdowns =====

function loadCategories() {

    const categorySelect     = document.getElementById("categorySelect");
    const newProductCategory = document.getElementById("newProductCategory");

    categorySelect.innerHTML     = '<option value="">Select Category</option>';
    newProductCategory.innerHTML = "";

    const sortedCategories = [...getCategories()].sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: "base" })
    );

    sortedCategories.forEach(category => {

        const opt1       = document.createElement("option");
        opt1.value       = category;
        opt1.textContent = category;
        categorySelect.appendChild(opt1);

        const opt2       = document.createElement("option");
        opt2.value       = category;
        opt2.textContent = category;
        newProductCategory.appendChild(opt2);

    });

    loadCategoryTable();

}


// ===== Category Management Table =====

function loadCategoryTable() {

    const tbody = document.getElementById("categoryTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    const categories = getCategories();

    if (categories.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="2" class="text-center text-muted py-2">
                    No categories yet.
                </td>
            </tr>`;
        return;
    }

    // Sort alphabetically for display, but keep track of each category's
    // real index in the underlying array so rename/delete still target
    // the correct entry.
    const sortedWithIndex = categories
        .map((category, index) => ({ category, index }))
        .sort((a, b) => a.category.localeCompare(b.category, undefined, { sensitivity: "base" }));

    sortedWithIndex.forEach(({ category, index }) => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>
                <input class="form-control form-control-sm"
                    id="cat-${index}"
                    value="${escapeHtml(category)}">
            </td>
            <td style="white-space:nowrap; width:1%; padding:4px 8px;">
                <button class="btn btn-success btn-sm me-1"
                    title="Save"
                    onclick="renameCategory(${index})">
                    ✓
                </button>
                <button class="btn btn-danger btn-sm"
                    title="Delete"
                    onclick="deleteCategory(${index})">
                    🗑
                </button>
            </td>
        `;

        tbody.appendChild(row);

    });

}


// ===== Rename Category =====

function renameCategory(index) {

    const newName = document.getElementById(`cat-${index}`).value.trim();

    if (!newName) {
        alert("Category name cannot be empty.");
        return;
    }

    const categories = getCategories();
    const oldName    = categories[index];

    if (newName === oldName) return;

    const duplicate = categories.some(
        (c, i) => i !== index && c.toLowerCase() === newName.toLowerCase()
    );

    if (duplicate) {
        alert("A category with that name already exists.");
        return;
    }

    categories[index] = newName;
    saveCategories(categories);

    const products = getProducts().map(p => {
        if (p.category === oldName) p.category = newName;
        return p;
    });
    saveProducts(products);

    loadCategories();
    loadProductTable();

    alert(`Category renamed to "${newName}".`);

}


// ===== Delete Category =====

function deleteCategory(index) {

    const categories = getCategories();
    const name       = categories[index];

    const hasProducts = getProducts().some(p => p.category === name);

    if (hasProducts) {
        if (!confirm(`"${name}" has products assigned to it. Deleting it will also delete those products. Continue?`)) return;
        const products = getProducts().filter(p => p.category !== name);
        saveProducts(products);
    } else {
        if (!confirm(`Delete category "${name}"?`)) return;
    }

    categories.splice(index, 1);
    saveCategories(categories);

    loadCategories();
    loadProductTable();

}


// ===== Load Products Dropdown =====

function loadProducts() {

    const category      = document.getElementById("categorySelect").value;
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


// ===== Render Product Management Table + Cards =====

function loadProductTable() {

    const tbody         = document.getElementById("productTableBody");
    const cardContainer = document.getElementById("productCardContainer");

    tbody.innerHTML = "";
    if (cardContainer) cardContainer.innerHTML = "";

    const products = getProducts();

    if (products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted py-3">
                    No products yet. Add one above.
                </td>
            </tr>`;
        if (cardContainer) {
            cardContainer.innerHTML = `
                <p class="text-center text-muted py-3">
                    No products yet. Add one above.
                </p>`;
        }
        return;
    }

    // Group products by category (in the order categories were created),
    // then alphabetically by name within each category — so all products
    // in the same category always sit together.
    const categoryOrder = getCategories();
    const sortedProducts = [...products].sort((a, b) => {
        const catA = categoryOrder.indexOf(a.category);
        const catB = categoryOrder.indexOf(b.category);
        if (catA !== catB) return catA - catB;
        return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    });

    sortedProducts.forEach((product, displayIndex) => {

        const categoryOptions = getCategories().map(cat =>
            `<option value="${escapeHtml(cat)}" ${cat === product.category ? "selected" : ""}>${escapeHtml(cat)}</option>`
        ).join("");

        // Text used for search matching (name + category), lowercased
        const searchText = `${product.name} ${product.category}`.toLowerCase();

        // ── Desktop: table row ──────────────────────────────

        const row = document.createElement("tr");
        row.dataset.searchText = searchText;

        row.innerHTML = `
            <td>${displayIndex + 1}</td>
            <td>
                <input class="form-control form-control-sm"
                    id="name-${product.id}"
                    value="${escapeHtml(product.name)}">
            </td>
            <td>
                <select class="form-select form-select-sm" id="category-${product.id}">
                    ${categoryOptions}
                </select>
            </td>
            <td>
                <select class="form-select form-select-sm" id="unit-${product.id}">
                    <option value="kg"     ${product.unit === "kg"     ? "selected" : ""}>kg</option>
                    <option value="piece"  ${product.unit === "piece"  ? "selected" : ""}>piece</option>
                    <option value="packet" ${product.unit === "packet" ? "selected" : ""}>packet</option>
                    <option value="pair"   ${product.unit === "pair"   ? "selected" : ""}>pair</option>
                    <option value="dozen"  ${product.unit === "dozen"  ? "selected" : ""}>dozen</option>
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
            <td style="white-space:nowrap; width:1%; padding:4px 8px;">
                <button class="btn btn-success btn-sm me-1"
                    title="Save"
                    onclick="saveProductChanges(${product.id})">
                    ✓
                </button>
                <button class="btn btn-danger btn-sm"
                    title="Delete"
                    onclick="deleteProduct(${product.id})">
                    🗑
                </button>
            </td>
        `;

        tbody.appendChild(row);

        // ── Mobile: card ────────────────────────────────────

        if (!cardContainer) return;

        const card = document.createElement("div");
        card.className = "product-card";
        card.dataset.searchText = searchText;

        card.innerHTML = `
            <div class="pc-header">
                <input class="pc-name-input"
                    id="card-name-${product.id}"
                    value="${escapeHtml(product.name)}"
                    placeholder="Product name">
                <div class="pc-actions">
                    <button class="btn btn-success btn-sm"
                        title="Save"
                        onclick="saveProductChangesCard(${product.id})">
                        ✓
                    </button>
                    <button class="btn btn-danger btn-sm"
                        title="Delete"
                        onclick="deleteProduct(${product.id})">
                        🗑
                    </button>
                </div>
            </div>
            <div class="pc-row">
                <div class="pc-field">
                    <label>Category</label>
                    <select class="input" id="card-category-${product.id}">
                        ${categoryOptions}
                    </select>
                </div>
                <div class="pc-field">
                    <label>Unit</label>
                    <select class="input" id="card-unit-${product.id}">
                        <option value="kg"     ${product.unit === "kg"     ? "selected" : ""}>kg</option>
                        <option value="piece"  ${product.unit === "piece"  ? "selected" : ""}>piece</option>
                        <option value="packet" ${product.unit === "packet" ? "selected" : ""}>packet</option>
                        <option value="pair"   ${product.unit === "pair"   ? "selected" : ""}>pair</option>
                        <option value="dozen"  ${product.unit === "dozen"  ? "selected" : ""}>dozen</option>
                    </select>
                </div>
            </div>
            <div class="pc-row">
                <div class="pc-field">
                    <label>Local</label>
                    <input type="number" class="input"
                        id="card-local-${product.id}"
                        value="${product.localRate}">
                </div>
                <div class="pc-field">
                    <label>General</label>
                    <input type="number" class="input"
                        id="card-general-${product.id}"
                        value="${product.generalRate}">
                </div>
                <div class="pc-field">
                    <label>Retail</label>
                    <input type="number" class="input"
                        id="card-retail-${product.id}"
                        value="${product.retailRate}">
                </div>
            </div>
        `;

        cardContainer.appendChild(card);

    });

    // Re-apply whatever search term is currently typed (e.g. after adding
    // a new product while a filter is active, or on first render).
    filterProductManageList();

}


// ===== Search / Filter the Product Management list =====
// Filters both the desktop table rows and mobile cards live as you type,
// matching against product name or category.

function filterProductManageList() {

    const input = document.getElementById("productManageSearch");
    if (!input) return;

    const query = input.value.trim().toLowerCase();

    document.querySelectorAll("#productTableBody tr[data-search-text]").forEach(row => {
        row.style.display = row.dataset.searchText.includes(query) ? "" : "none";
    });

    document.querySelectorAll(".product-card[data-search-text]").forEach(card => {
        card.style.display = card.dataset.searchText.includes(query) ? "" : "none";
    });

}

// Wire up the search input once, when the DOM is ready.
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("productManageSearch");
    if (searchInput) {
        searchInput.addEventListener("input", filterProductManageList);
    }
});


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


// ===== Save Product Changes (desktop table) =====

function saveProductChanges(productId) {

    const name        = document.getElementById(`name-${productId}`).value.trim();
    const category    = document.getElementById(`category-${productId}`).value;
    const unit        = document.getElementById(`unit-${productId}`).value;
    const localRate   = Number(document.getElementById(`local-${productId}`).value);
    const generalRate = Number(document.getElementById(`general-${productId}`).value);
    const retailRate  = Number(document.getElementById(`retail-${productId}`).value);

    if (!name || !category || isNaN(localRate) || isNaN(generalRate) || isNaN(retailRate)) {
        alert("All fields are required.");
        return;
    }

    const allowsNegative = category === "Difference";

    if (!allowsNegative && (localRate < 0 || generalRate < 0 || retailRate < 0)) {
        alert("Negative rates are only allowed for the 'Difference' category.");
        return;
    }

    updateProduct(productId, name, category, unit, localRate, generalRate, retailRate);

    loadProductTable();
    loadCategories();
    loadProducts();

    alert("Product updated.");

}


// ===== Save Product Changes (mobile card) =====

function saveProductChangesCard(productId) {

    const name        = document.getElementById(`card-name-${productId}`).value.trim();
    const category    = document.getElementById(`card-category-${productId}`).value;
    const unit        = document.getElementById(`card-unit-${productId}`).value;
    const localRate   = Number(document.getElementById(`card-local-${productId}`).value);
    const generalRate = Number(document.getElementById(`card-general-${productId}`).value);
    const retailRate  = Number(document.getElementById(`card-retail-${productId}`).value);

    if (!name || !category || isNaN(localRate) || isNaN(generalRate) || isNaN(retailRate)) {
        alert("All fields are required.");
        return;
    }

    const allowsNegative = category === "Difference";

    if (!allowsNegative && (localRate < 0 || generalRate < 0 || retailRate < 0)) {
        alert("Negative rates are only allowed for the 'Difference' category.");
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

    const products = getProducts().filter(p => p.id != productId);
    saveProducts(products);
    loadProductTable();

}


// ===== Utility =====

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}