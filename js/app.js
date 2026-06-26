// ===== App Entry Point =====
// All event listeners are registered here exactly ONCE.
// Business logic lives in billing.js, products.js, pdf.js, storage.js.

document.addEventListener("DOMContentLoaded", () => {

    // Boot the UI
    loadCategories();
    loadProductTable();
    initProductSearch();

    // ── Product Entry ─────────────────────────────────────

    // When category changes, populate the product dropdown
    document
        .getElementById("categorySelect")
        .addEventListener("change", loadProducts);

    // Add item to current bill
    document
        .getElementById("addItemBtn")
        .addEventListener("click", addItemToBill);

    // Also allow pressing Enter in the quantity field to add item
    document
        .getElementById("quantity")
        .addEventListener("keydown", (e) => {
            if (e.key === "Enter") addItemToBill();
        });


    // ── Bill Actions ──────────────────────────────────────

    document
        .getElementById("saveBillBtn")
        .addEventListener("click", saveBill);

    document
        .getElementById("pdfBtn")
        .addEventListener("click", generatePDF);

    document
        .getElementById("printBtn")
        .addEventListener("click", () => window.print());

    document
        .getElementById("whatsappBtn")
        .addEventListener("click", shareCurrentBillOnWhatsapp);

    document
        .getElementById("clearBillBtn")
        .addEventListener("click", () => {
            if (confirm("Clear the current bill?")) clearBill();
        });


    // ── Bill History ──────────────────────────────────────

    document
        .getElementById("billHistoryBtn")
        .addEventListener("click", () => {
            loadBillHistory();
            new bootstrap.Modal(
                document.getElementById("billHistoryModal")
            ).show();
        });

    document
        .getElementById("billSearch")
        .addEventListener("keyup", searchBills);

    document
        .getElementById("historyDeleteBtn")
        .addEventListener("click", deleteBillFromModal);

    document
        .getElementById("historyPdfBtn")
        .addEventListener("click", generatePDFFromHistory);

    document
        .getElementById("historyWhatsappBtn")
        .addEventListener("click", shareBillOnWhatsapp);


    // ── Product Management ────────────────────────────────

    document
        .getElementById("manageProductsBtn")
        .addEventListener("click", () => {
            loadCategories();
            loadProductTable();
            new bootstrap.Modal(
                document.getElementById("productModal")
            ).show();
        });

    document
        .getElementById("addCategoryBtn")
        .addEventListener("click", () => {
            const input = document.getElementById("newCategory");
            addCategory(input.value);
            input.value = "";
        });

    document
        .getElementById("addProductBtn")
        .addEventListener("click", () => {

            const name        = document.getElementById("newProductName").value.trim();
            const category    = document.getElementById("newProductCategory").value;
            const unit        = document.getElementById("newProductUnit").value;
            const localRate   = document.getElementById("localRate").value;
            const generalRate = document.getElementById("generalRate").value;
            const retailRate  = document.getElementById("retailRate").value;

            if (!name || !category || !localRate || !generalRate || !retailRate) {
                alert("Please fill in all product fields.");
                return;
            }

            addProduct(name, category, unit, localRate, generalRate, retailRate);

            // Clear product form
            document.getElementById("newProductName").value = "";
            document.getElementById("localRate").value      = "";
            document.getElementById("generalRate").value    = "";
            document.getElementById("retailRate").value     = "";

            // Refresh main bill dropdowns in case category was new
            loadProducts();

        });


    // ── Export / Import ───────────────────────────────────

    document
        .getElementById("exportBtn")
        .addEventListener("click", exportData);

    document
        .getElementById("importBtn")
        .addEventListener("click", () => {
            document.getElementById("importFile").click();
        });

    document
        .getElementById("importFile")
        .addEventListener("change", (event) => {
            const file = event.target.files[0];
            if (file) importData(file);
            // Reset so same file can be re-imported if needed
            event.target.value = "";
        });

});