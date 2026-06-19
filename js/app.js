document.addEventListener("DOMContentLoaded", () => {

    loadCategories();

    loadProductTable();

});




// Category Change

document
    .getElementById("categorySelect")
    .addEventListener("change", loadProducts);




// Add Item

document
    .getElementById("addItemBtn")
    .addEventListener("click", addItemToBill);




// Save Bill

document
    .getElementById("saveBillBtn")
    .addEventListener("click", saveBill);




// Clear Bill

document
    .getElementById("clearBillBtn")
    .addEventListener("click", () => {

        if (confirm("Clear bill ?")) {

            clearBill();

        }

    });




// Product Management Modal

document
    .getElementById("manageProductsBtn")
    .addEventListener("click", () => {

        const modal =
            new bootstrap.Modal(
                document.getElementById("productModal")
            );

        loadCategories();

        loadProductTable();

        modal.show();

    });




// Add Category

document
    .getElementById("addCategoryBtn")
    .addEventListener("click", () => {

        const categoryName =
            document.getElementById("newCategory").value;

        addCategory(categoryName);

        document.getElementById("newCategory").value = "";

    });




// Add Product

document
    .getElementById("addProductBtn")
    .addEventListener("click", () => {

        const name =
            document.getElementById("newProductName").value;

        const category =
            document.getElementById("newProductCategory").value;

        const unit =
            document.getElementById("newProductUnit").value;

        const localRate =
            document.getElementById("localRate").value;

        const generalRate =
            document.getElementById("generalRate").value;

        const retailRate =
            document.getElementById("retailRate").value;


        if (
            !name ||
            !category ||
            !localRate ||
            !generalRate ||
            !retailRate
        ) {

            alert("Fill all fields");

            return;

        }


        addProduct(
            name,
            category,
            unit,
            localRate,
            generalRate,
            retailRate
        );


        document.getElementById("newProductName").value = "";
        document.getElementById("localRate").value = "";
        document.getElementById("generalRate").value = "";
        document.getElementById("retailRate").value = "";

        loadProducts();

    });




// Export

document
    .getElementById("exportBtn")
    .addEventListener("click", () => {

        alert("Coming soon");

    });




// Import

document
    .getElementById("importBtn")
    .addEventListener("click", () => {

        alert("Coming soon");

    });




// PDF

document
    .getElementById("pdfBtn")
    .addEventListener("click", () => {

        alert("Coming soon");

    });




// WhatsApp

document
    .getElementById("whatsappBtn")
    .addEventListener("click", () => {

        alert("Coming soon");

    });




// Print

document
    .getElementById("printBtn")
    .addEventListener("click", () => {

        window.print();

    });