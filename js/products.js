// ===== Main Category Dropdown =====

function loadCategories() {

    const categorySelect = document.getElementById("categorySelect");
    const newProductCategory = document.getElementById("newProductCategory");

    categorySelect.innerHTML =
        '<option value="">Select Category</option>';

    newProductCategory.innerHTML = "";

    const categories = getCategories();

    categories.forEach(category => {

        // Main Category Dropdown
        const option1 = document.createElement("option");

        option1.value = category;
        option1.textContent = category;

        categorySelect.appendChild(option1);

        // Product Modal Category Dropdown
        const option2 = document.createElement("option");

        option2.value = category;
        option2.textContent = category;

        newProductCategory.appendChild(option2);

    });

}




// ===== Load Products =====

function loadProducts() {

    const category = document.getElementById("categorySelect").value;

    const productSelect = document.getElementById("productSelect");

    productSelect.innerHTML =
        '<option value="">Select Product</option>';

    const products = getProducts();

    products
        .filter(product => product.category === category)
        .forEach(product => {

            const option = document.createElement("option");

            option.value = product.id;
            option.textContent = product.name;

            productSelect.appendChild(option);

        });

}




// ===== Product Table =====

function loadProductTable() {

    const tbody = document.getElementById("productTableBody");

    tbody.innerHTML = "";

    const products = getProducts();

    products.forEach(product => {

        tbody.innerHTML += `

        <tr>

            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${product.unit}</td>
            <td>${product.localRate.toFixed(2)}</td>
            <td>${product.generalRate.toFixed(2)}</td>
            <td>${product.retailRate.toFixed(2)}</td>

            <td>

                <button
                    class="btn btn-danger btn-sm"
                    onclick="deleteProduct(${product.id})">

                    Delete

                </button>

            </td>

        </tr>

        `;

    });

}




// ===== Product By ID =====

function getProductById(productId) {

    return getProducts().find(
        p => p.id == productId
    );

}




// ===== Add Category =====

function addCategory(categoryName) {

    if (categoryName.trim() === "") {

        alert("Enter category name");

        return;

    }

    const categories = getCategories();

    if (categories.includes(categoryName)) {

        alert("Category already exists");

        return;

    }

    categories.push(categoryName);

    saveCategories(categories);

    loadCategories();

}




// ===== Add Product =====

function addProduct(
    name,
    category,
    unit,
    localRate,
    generalRate,
    retailRate
) {

    const products = getProducts();

    products.push({

        id: generateProductId(),

        name,

        category,

        unit,

        localRate: Number(localRate),

        generalRate: Number(generalRate),

        retailRate: Number(retailRate)

    });

    saveProducts(products);

    loadProductTable();

}




// ===== Delete Product =====

function deleteProduct(productId) {

    if (!confirm("Delete this product?"))
        return;

    let products = getProducts();

    products = products.filter(
        p => p.id != productId
    );

    saveProducts(products);

    loadProductTable();

}