// ===== Load Category Dropdowns =====

function loadCategories() {

    const categorySelect     = document.getElementById("categorySelect");
    const newProductCategory = document.getElementById("newProductCategory");

    categorySelect.innerHTML     = '<option value="">Select Category</option>';
    newProductCategory.innerHTML = "";

    getCategories().forEach(category => {

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

    categories.forEach((category, index) => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>
                <input class="form-control form-control-sm"
                    id="cat-${index}"
                    value="${escapeHtml(category)}">
            </td>
            <td style="white-space:nowrap">
                <button class="btn btn-success btn-sm me-1"
                    onclick="renameCategory(${index})">
                    Save
                </button>
                <button class="btn btn-danger btn-sm"
                    onclick="deleteCategory(${index})">
                    Delete
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

    // Rename the category
    categories[index] = newName;
    saveCategories(categories);

    // Also update all products that had the old category name
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
        // Remove all products in this category
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

    const category    = document.getElementById("categorySelect").value;
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

        // Build category options dynamically so dropdown reflects current categories
        const categoryOptions = getCategories().map(cat =>
            `<option value="${escapeHtml(cat)}" ${cat === product.category ? "selected" : ""}>${escapeHtml(cat)}</option>`
        ).join("");

        row.innerHTML = `
            <td>${product.id}</td>

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

            <td style="white-space:nowrap">
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
    const category    = document.getElementById(`category-${productId}`).value;
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