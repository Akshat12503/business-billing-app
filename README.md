# BillBook

A fast, offline-capable billing app built for small businesses. Create bills, manage products, track history, and share or print receipts — all from your browser, no internet required after first load.

---

## Features

**Billing**
- Add items to a bill by searching products or selecting by category
- Three seller-type pricing tiers — Local, General, Retail — switchable per bill
- Inline editing of item name, quantity, and rate directly in the bill table
- Negative rates supported exclusively for the "Difference" category (for adjustments/discounts)
- Auto-generated bill numbers (A1 → A100, then B1 → B100, and so on)
- Customer name field per bill

**Sharing & Export**
- Generate a PDF (A4, formatted with customer name, date, item table, grand total)
- Thermal receipt print layout for compatible printers
- WhatsApp share — opens a pre-filled WhatsApp message with bill summary

**Product Management**
- Add and organize products into categories
- Each product has three rates: Local, General, Retail
- Supported units: `kg`, `piece`, `packet`
- Inline editing and deletion from the product management table
- Category rename (auto-updates all products in that category) and deletion

**Bill History**
- All saved bills stored locally on the device
- Search bills by customer name or date
- View, reprint, re-export PDF, or delete any past bill
- WhatsApp share from history

**Data Backup**
- Export all data (products, categories, bills) as a single JSON backup file
- Import a backup file to restore data on any device

---

## Data & Privacy

All data is stored in your browser's `localStorage`. There is no server, no account, no cloud sync. Each device has its own completely separate data — two businesses using the same URL will never see each other's products or bills.

---

## File Structure

```
billbook/
├── index.html              # Main UI
├── manifest.json           # PWA manifest (installable app)
├── service-worker.js       # Offline caching
├── css/
│   └── style.css           # All custom styles
├── js/
│   ├── storage.js          # localStorage CRUD, export/import
│   ├── products.js         # Category & product management UI
│   ├── billing.js          # Bill logic, history, print, WhatsApp
│   ├── pdf.js              # PDF generation (jsPDF + autoTable)
│   └── app.js              # Entry point — all event listeners
└── icons/
    ├── icon-192.png
    ├── icon-512.png
    └── icon-512-maskable.png
```

---

## Tech Stack

- **HTML / CSS / JavaScript** — no build step, no framework
- **Bootstrap 5** — UI components and layout
- **jsPDF + jspdf-autotable** — PDF generation
- **Service Worker** — offline support after first load

All external libraries are loaded from CDN and cached by the service worker on first visit.

---

## Deployment (Netlify)

1. Go to [netlify.com](https://netlify.com) and sign up.
2. On your dashboard, drag and drop the entire project folder onto the deploy zone.
3. Netlify gives you a live URL instantly (e.g. `https://your-app.netlify.app`).
4. To update: drag and drop the updated folder again — same URL, everyone gets the update.

For a custom name: **Site Settings → Change site name**.

---

## Install as App (PWA)

Once deployed, users can install BillBook as a standalone app:

- **Android (Chrome):** Open the URL → tap the install icon in the address bar or menu → "Add to Home Screen"
- **iPhone (Safari):** Open the URL → tap Share → "Add to Home Screen"
- **Desktop (Chrome/Edge):** Open the URL → click the install icon (⊕) in the address bar

After installing, the app opens in its own window without the browser UI and works fully offline.

---

## Important Notes

- **Negative rates** are only allowed for products under the `Difference` category. All other categories reject negative values at both the product creation and edit stages.
- **Bill number counter** is stored per device. If you reset or clear browser data, the counter resets too.
- **Backup regularly** using the Export button (Settings menu), especially before clearing browser data or switching devices.
- The WhatsApp share feature sends a text summary — due to browser security restrictions, the PDF cannot be automatically attached. Users need to attach the downloaded PDF manually if needed.

---

## Backup & Restore

**Export:** Open the app → menu → Export → saves a `Backup_DD-MM-YYYY.json` file.

**Import:** Open the app → menu → Import → select the backup JSON file → app reloads with restored data.

> Import overwrites existing data. Export a backup first if you don't want to lose current data.

---

## License

Private / personal use. Not for redistribution.
