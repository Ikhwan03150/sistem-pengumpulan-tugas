# Sistem Pengumpulan Tugas Mahasiswa Terintegrasi

Sistem automasi pengumpulan tugas mahasiswa berbasis web yang menghubungkan halaman statis (Blogger/HTML) dengan basis data Google Sheets menggunakan Google Apps Script (Web App). Sistem ini dirancang untuk mata kuliah Data Mining dengan jadwal dan tenggat waktu yang dinamis.

## 🌟 Fitur Utama
* **Validasi NIM Otomatis:** Mahasiswa wajib memasukkan NIM yang terdaftar untuk membuka form pengumpulan.
* **Tenggat Waktu Dinamis (Dynamic Deadline):** Batas waktu pengumpulan dihitung otomatis secara spesifik berdasarkan hari kelas mahasiswa (Senin-Sabtu) dan durasi hari yang ditentukan oleh dosen.
* **Auto-fill Data:** Nama, jenis kelas (Reguler A/C), dan kode ruangan otomatis terisi untuk mencegah kesalahan input.
* **Sistem Kunci Otomatis:** Jika waktu pengumpulan melewati tenggat waktu (deadline), form akan menolak input dan memblokir pengiriman secara otomatis dari sisi *frontend* maupun *backend*.

---

## 📂 Struktur Repositori
* `Code.gs`: Skrip *backend* (Google Apps Script) yang bertindak sebagai Web App, mengatur logika penutupan form, auto-fill, dan menulis data ke Google Sheets.
* `form-blogger.html`: Skrip *frontend* (HTML/CSS/JS) antarmuka pengguna yang dipasang di platform Blogger.

---

## 🗄️ Struktur Basis Data (Google Sheets)
Sistem ini menggunakan 3 *sheet* (tab) utama:

### 1. `Config_Tugas`
Digunakan oleh dosen untuk mengatur tugas mingguan.
* **Kolom:** `Tugas` | `Durasi (Hari)` | `Tgl Senin` | `Tgl Selasa` | `Tgl Rabu` | `Tgl Kamis` | `Tgl Jumat` | `Tgl Sabtu`
* *Catatan:* Kosongkan kolom tanggal pada hari yang tidak ada jadwal kelas di minggu tersebut.

### 2. `Data_Mahasiswa`
Basis data *master* mahasiswa.
* **Kolom:** `Reguler` | `Hari` | `Kelas` | `NIM` | `Nama Mahasiswa`
* *Contoh Isian:* Reguler A | Rabu | DM-01 (R. 101) | 23010101 | Andi Wijaya

### 3. `Pengumpulan`
Tempat masuknya rekap tugas mahasiswa (terisi otomatis oleh sistem).
* **Kolom:** `Waktu` | `NIM` | `Nama Mahasiswa` | `Reguler` | `Hari` | `Kelas` | `Tugas Pertemuan` | `Link Tugas`

---

## 🚀 Panduan Instalasi & Penggunaan

### Tahap 1: Persiapan Database
1. Buka Google Sheets kosong.
2. Buka **Extensions** > **Apps Script**.
3. Salin seluruh isi file `Code.gs` dari repositori ini ke dalam editor Apps Script.
4. Pilih fungsi `setupDatabase` dari menu *dropdown* di atas, lalu klik **Run**.
5. Berikan izin akses (otorisasi) yang diminta. Sistem akan otomatis membuat tiga *sheet* dengan *header* yang sesuai.
6. Masukkan data mahasiswa ke dalam sheet `Data_Mahasiswa`.

### Tahap 2: Deployment Web App
1. Di editor Apps Script, klik **Deploy** > **New deployment**.
2. Pilih tipe **Web app**.
3. Atur **Execute as** menjadi `Me`.
4. Atur **Who has access** menjadi `Anyone`.
5. Klik **Deploy** dan salin **Web app URL** yang diberikan.

### Tahap 3: Pemasangan Antarmuka (Frontend)
1. Salin seluruh isi file `form-blogger.html`.
2. Buka Blogger > Buat Halaman Baru > Ubah ke mode **HTML View**.
3. Tempelkan kode HTML.
4. Cari variabel `WEB_APP_URL` di bagian `<script>` dan ganti nilainya dengan URL Web App dari Tahap 2.
5. Publikasikan halaman.

---

## 📅 Panduan Operasional Mingguan (Dosen)
Untuk memberikan tugas baru kepada mahasiswa, Anda **tidak perlu** mengedit kode sama sekali. Cukup lakukan langkah berikut:
1. Buka Google Sheets.
2. Buka tab `Config_Tugas`.
3. Ubah nomor tugas di kolom **Tugas** (Misal: 12).
4. Tentukan batas waktu pengerjaan di kolom **Durasi (Hari)** (Misal: 5 atau 6).
5. Masukkan tanggal rilis/pertemuan tugas tersebut di bawah kolom hari yang sesuai (Misal isi `2026-06-24` di kolom **Tgl Rabu**).
6. Selesai. Sistem akan otomatis membuka form dan mulai menghitung mundur penutupan form secara mandiri untuk masing-masing kelas.

---

## 🔗 Tautan Penting
* **Halaman Rekap Tugas:** [https://www.sketzhbook.com/p/rekap-tugas-data-mining.html](https://www.sketzhbook.com/p/rekap-tugas-data-mining.html)
