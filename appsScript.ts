// Kode Google Apps Script yang ditempel admin ke spreadsheet
// "DATABASE PENJUALAN BANANAMOO" (Extensions > Apps Script).
export const APPS_SCRIPT_CODE = `// ===== DATABASE PENJUALAN BANANAMOO =====
// 1. Buat Google Spreadsheet baru, beri nama: DATABASE PENJUALAN BANANAMOO
// 2. Menu Extensions > Apps Script, hapus isi editor, tempel kode ini
// 3. Ganti SHEET_ID dengan ID spreadsheet Anda (bagian akhir URL spreadsheet)
// 4. Deploy > New deployment > Web app:
//    - Execute as: Me
//    - Who has access: Anyone
// 5. Salin URL Web app, tempel di halaman Admin BananaMoo > Koneksi Database

var SHEET_ID = 'GANTI_DENGAN_ID_SPREADSHEET';
var SS = SpreadsheetApp.openById(SHEET_ID);

function sheet(name, headers) {
  var sh = SS.getSheetByName(name);
  if (!sh) {
    sh = SS.insertSheet(name);
    sh.appendRow(headers);
  }
  return sh;
}

function pesananSheet() {
  return sheet('Pesanan', ['ID Pesanan','Tanggal','Nama Pelanggan','Nomor WhatsApp','Total','Ongkir','Total Pembayaran','Metode','Alamat','Catatan','Status Pembayaran','Status Pesanan']);
}

function detailSheet() {
  return sheet('Detail Pesanan', ['ID Pesanan','Varian','Ukuran Cup','Jumlah','Harga Satuan','Subtotal']);
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var body = JSON.parse(e.postData.contents);
  if (body.action === 'createOrder') return createOrder(body.order);
  return json({ ok: false, error: 'Aksi tidak dikenal' });
}

function createOrder(order) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var ps = pesananSheet();
    var last = ps.getLastRow();
    var ids = last > 1
      ? ps.getRange(2, 1, last - 1, 1).getValues().map(function (r) { return String(r[0]); })
      : [];
    // Cegah pesanan tercatat dua kali saat pengiriman berulang
    if (ids.indexOf(String(order.id)) !== -1) return json({ ok: true, duplicate: true });
    ps.appendRow([
      order.id, order.createdAt, order.customerName, order.whatsapp,
      order.total, order.ongkir || 0, order.totalPembayaran || order.total,
      order.metode || 'pickup', order.alamat || '', order.catatan || '',
      order.paymentStatus, order.orderStatus
    ]);
    var ds = detailSheet();
    (order.items || []).forEach(function (it) {
      ds.appendRow([order.id, it.product, it.size, it.qty, it.price, it.qty * it.price]);
    });
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  if (e && e.parameter.action === 'getOrders') {
    return json({ ok: true, orders: getOrders() });
  }
  return json({ ok: false });
}

function getOrders() {
  var ps = pesananSheet();
  var ds = detailSheet();
  var last = ps.getLastRow();
  var rows = last > 1 ? ps.getRange(2, 1, last - 1, 12).getValues() : [];
  var details = {};
  var dlast = ds.getLastRow();
  var drows = dlast > 1 ? ds.getRange(2, 1, dlast - 1, 6).getValues() : [];
  drows.forEach(function (r) {
    var id = String(r[0]);
    if (!details[id]) details[id] = [];
    details[id].push({ product: r[1], size: r[2], qty: Number(r[3]), price: Number(r[4]) });
  });
  return rows.map(function (r) {
    var id = String(r[0]);
    return {
      id: id,
      createdAt: new Date(r[1]).toISOString(),
      customerName: r[2],
      whatsapp: String(r[3]),
      total: Number(r[4]),
      ongkir: Number(r[5]),
      totalPembayaran: Number(r[6]),
      metode: r[7],
      alamat: r[8],
      catatan: r[9],
      paymentStatus: r[10],
      orderStatus: r[11],
      items: details[id] || []
    };
  });
}
`;
