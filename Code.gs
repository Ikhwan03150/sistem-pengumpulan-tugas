/**
 * 1. FUNGSI OTOMATISASI DATABASE (VERSI FULL DINAMIS)
 */
function setupDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // A. Setup Sheet Config_Tugas (Format Baru Semua Hari & Durasi Bebas)
  var sheetConfig = ss.getSheetByName("Config_Tugas") || ss.insertSheet("Config_Tugas");
  sheetConfig.clear();
  sheetConfig.getRange("A1:H1").setValues([[
    "Tugas", "Durasi (Hari)", "Tgl Senin", "Tgl Selasa", "Tgl Rabu", "Tgl Kamis", "Tgl Jumat", "Tgl Sabtu"
  ]]).setFontWeight("bold");
  
  // Contoh isian: Tugas 11, durasi 5 hari. (Hanya diisi untuk hari Rabu, Jumat, Sabtu)
  sheetConfig.getRange("A2:H2").setValues([[
    11, 5, "", "", "2026-06-17", "", "2026-06-19", "2026-06-20"
  ]]);
  
  // B. Setup Sheet Data_Mahasiswa 
  var sheetMhs = ss.getSheetByName("Data_Mahasiswa") || ss.insertSheet("Data_Mahasiswa");
  if (sheetMhs.getLastRow() === 0 || sheetMhs.getRange("B1").getValue() !== "Hari") {
    sheetMhs.clear();
    sheetMhs.getRange("A1:E1").setValues([["Reguler", "Hari", "Kelas", "NIM", "Nama Mahasiswa"]]).setFontWeight("bold");
    sheetMhs.appendRow(["Reguler A", "Rabu", "DM-01 (R. 101)", "23010101", "Andi Wijaya"]);
    sheetMhs.appendRow(["Reguler C", "Sabtu", "DM-02 (R. 202)", "23010102", "Budi Santoso"]);
  }
  
  // C. Setup Sheet Pengumpulan 
  var sheetKumpul = ss.getSheetByName("Pengumpulan") || ss.insertSheet("Pengumpulan");
  if (sheetKumpul.getLastRow() === 0) {
    sheetKumpul.clear();
    sheetKumpul.getRange("A1:H1").setValues([[
      "Waktu", "NIM", "Nama Mahasiswa", "Reguler", "Hari", "Kelas", "Tugas Pertemuan", "Link Tugas"
    ]]).setFontWeight("bold");
  }
  
  Logger.log("Selesai! Struktur Config_Tugas dinamis berhasil dibuat.");
}

/**
 * 2. LOGIKA INTERNAL VALIDASI NIM DAN DEADLINE (BERDASARKAN DURASI & HARI DINAMIS)
 */
function cekNimDanDeadlineInternal(nim) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Ambil data konfigurasi
  var sheetConfig = ss.getSheetByName("Config_Tugas");
  var configData = sheetConfig.getRange("A2:H2").getValues()[0];
  
  var tugasNum = configData[0];
  var durasiHari = parseInt(configData[1]) || 0; // Mengambil angka durasi
  
  // Mapping tanggal berdasarkan kolom hari
  var tglMap = {
    "Senin": configData[2],
    "Selasa": configData[3],
    "Rabu": configData[4],
    "Kamis": configData[5],
    "Jumat": configData[6],
    "Sabtu": configData[7]
  };
  
  // Cari data mahasiswa berdasarkan NIM
  var sheetMhs = ss.getSheetByName("Data_Mahasiswa");
  var dataMhs = sheetMhs.getDataRange().getValues();
  var mhs = null;
  
  for (var i = 1; i < dataMhs.length; i++) {
    if (dataMhs[i][3].toString().trim() === nim.toString().trim()) {
      mhs = {
        reguler: dataMhs[i][0], 
        hari: dataMhs[i][1],    
        kelas: dataMhs[i][2],   
        nim: dataMhs[i][3],     
        nama: dataMhs[i][4]     
      };
      break;
    }
  }
  
  if (!mhs) {
    return { status: "not_found", message: "NIM tidak terdaftar dalam database Anda!" };
  }
  
  // Cek apakah tanggal untuk hari mahasiswa tersebut sudah diisi oleh Dosen
  var tglMulai = tglMap[mhs.hari];
  if (!tglMulai || tglMulai === "") {
    return { status: "error", message: "Jadwal/Tanggal pertemuan untuk Kelas " + mhs.hari + " belum diatur oleh Dosen di sistem." };
  }
  
  // Hitung batas waktu (Deadline)
  // Rumus: Tanggal Mulai + Durasi Hari
  var deadline = new Date(tglMulai);
  deadline.setDate(deadline.getDate() + durasiHari);
  deadline.setHours(23, 59, 59, 999); // Toleransi sampai akhir hari jam 23:59
  
  var now = new Date();
  
  // Validasi keterlambatan
  if (now > deadline) {
    var formattedDeadline = Utilities.formatDate(deadline, Session.getScriptTimeZone(), "dd MMM yyyy, HH:mm");
    return {
      status: "deadline_passed",
      message: "Maaf, batas waktu pengumpulan Tugas " + tugasNum + " untuk Kelas " + mhs.hari + " telah berakhir pada " + formattedDeadline + ". Form ditutup."
    };
  }
  
  return {
    status: "allowed",
    tugas: tugasNum,
    mahasiswa: mhs
  };
}

/**
 * 3. HANDLER GET REQUEST 
 */
function doGet(e) {
  var action = e.parameter.action;
  
  if (action === "getConfig") {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetConfig = ss.getSheetByName("Config_Tugas");
    var tugasNum = sheetConfig.getRange("A2").getValue();
    return jsonResponse({ status: "success", tugas: tugasNum });
  }
  
  if (action === "checkNIM") {
    var nim = e.parameter.nim;
    var hasilCek = cekNimDanDeadlineInternal(nim);
    return jsonResponse(hasilCek);
  }
  
  return jsonResponse({ status: "error", message: "Aksi tidak dikenali." });
}

/**
 * 4. HANDLER POST REQUEST 
 */
function doPost(e) {
  try {
    var data;
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      data = e.parameter;
    }
    
    var nim = data.nim;
    var linkTugas = data.linkTugas;
    
    if (!nim || !linkTugas) {
      return jsonResponse({ status: "error", message: "NIM dan Link Tugas tidak boleh kosong!" });
    }
    
    var verifikasi = cekNimDanDeadlineInternal(nim);
    if (verifikasi.status !== "allowed") {
      return jsonResponse({ status: "error", message: verifikasi.message });
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetKumpul = ss.getSheetByName("Pengumpulan");
    sheetKumpul.appendRow([
      new Date(), 
      verifikasi.mahasiswa.nim,
      verifikasi.mahasiswa.nama,
      verifikasi.mahasiswa.reguler,
      verifikasi.mahasiswa.hari,
      verifikasi.mahasiswa.kelas,
      verifikasi.tugas,
      linkTugas
    ]);
    
    return jsonResponse({ 
      status: "success", 
      message: "Terima kasih, Tugas Pertemuan " + verifikasi.tugas + " atas nama " + verifikasi.mahasiswa.nama + " berhasil dikirim." 
    });
    
  } catch (err) {
    return jsonResponse({ status: "error", message: "Terjadi gangguan sistem: " + err.message });
  }
}

/**
 * UTILITY
 */
function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
