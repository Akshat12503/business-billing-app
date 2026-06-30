// ===== App Entry Point =====
// All event listeners are registered here exactly ONCE.
// Business logic lives in billing.js, products.js, pdf.js, storage.js.

document.addEventListener("DOMContentLoaded", () => {

    // Boot the UI
    loadCategories();
    loadProductTable();
    initProductSearch();
    initSellerTypeSegment();


    // ── Drawer (mobile/desktop menu) ───────────────────────

    const drawer        = document.getElementById("drawer");
    const drawerOverlay  = document.getElementById("drawerOverlay");

    function openDrawer() {
        drawer.classList.add("open");
        drawerOverlay.classList.add("open");
    }

    function closeDrawer() {
        drawer.classList.remove("open");
        drawerOverlay.classList.remove("open");
    }

    document.getElementById("menuToggle").addEventListener("click", openDrawer);
    document.getElementById("drawerClose").addEventListener("click", closeDrawer);
    drawerOverlay.addEventListener("click", closeDrawer);

    // Close drawer whenever a drawer link is clicked (so modal isn't hidden behind it)
    document.querySelectorAll(".drawer-link").forEach(link => {
        link.addEventListener("click", closeDrawer);
    });


    // ── Product Entry ─────────────────────────────────────

    document
        .getElementById("categorySelect")
        .addEventListener("change", loadProducts);

    document
        .getElementById("addItemBtn")
        .addEventListener("click", addItemToBill);

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

            document.getElementById("newProductName").value = "";
            document.getElementById("localRate").value      = "";
            document.getElementById("generalRate").value    = "";
            document.getElementById("retailRate").value     = "";

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
            event.target.value = "";
        });

});


// ===== Seller Type Segmented Control =====
// Keeps the hidden <select id="sellerType"> in sync so existing billing.js logic
// (which reads sellerType.value) keeps working unmodified.

function initSellerTypeSegment() {

    const segButtons = document.querySelectorAll("#sellerTypeSegment .seg-btn");
    const hiddenSelect = document.getElementById("sellerType");

    segButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            segButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            hiddenSelect.value = btn.dataset.value;

            // Trigger change so any other listeners (e.g. live search rates) refresh
            hiddenSelect.dispatchEvent(new Event("change"));
        });
    });

}