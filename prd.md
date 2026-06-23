prd_content = """# PRODUCT REQUIREMENTS DOCUMENT (PRD)

**Nama Proyek:** Integrasi Backend & Database Admin-Member Panel  
**Arsitek Sistem:** Software Architect  
**Teknologi Utama:** React JS (JSX), Supabase (Auth & Database), Tailwind CSS, Shadcn UI  
**Status Dokumen:** Final / Siap Implementasi  

---

## 1. PENGINDUKSIAN & RUANG LINGKUP PROYEK

### 1.1 Latar Belakang & Masalah
Saat ini, antarmuka pengguna (UI) untuk modul Admin (Dashboard, Customers, Produk, Login, dan Register) telah selesai dibangun menggunakan React JS, Tailwind CSS, dan komponen eksklusif dari Shadcn UI. Namun, seluruh fungsionalitas backend masih bersifat statis (menggunakan mock data). Belum terdapat skema database riil di Supabase, belum ada sistem otentikasi yang mengunci halaman, serta logika bisnis krusial seperti manajemen role pengguna, transaksi pesanan, dan sistem loyalitas member belum terintegrasi.

### 1.2 Tujuan Integrasi
Dokumen ini disusun untuk menjadi panduan blueprint teknis tunggal dalam mentransformasikan aplikasi dari status *UI-only* menjadi aplikasi *full-stack* fungsional dengan mengintegrasikan layanan **Supabase BaaS**. Seluruh pengerjaan berfokus penuh pada penyuntikan logika backend tanpa merubah estetika atau tata letak visual komponen UI yang sudah mapan.

---

## 2. ATURAN KESELAMATAN ARSITEKTUR (*STRICT SAFETY RULES*)

Arsitek menetapkan 4 aturan mutlak yang wajib dipatuhi oleh tim pengembang atau AI Agent dalam fase integrasi ini:

1. **Anti Over-Engineering (KISS Principle):** Gunakan fungsi bawaan dari SDK `@supabase/supabase-js` secara langsung pada level komponen utama atau melalui sebuah React Context sederhana untuk distribusi session auth. Dilarang keras membuat layer abstraksi berlapis, custom hooks yang rumit, atau memasukkan state management pihak ketiga (seperti Redux, Zustand, dll.) jika state internal React (`useState`, `useEffect`) sudah memadai.
2. **Kesesuaian Pola Kode Eksisting:** Penamaan variabel state baru, metode penanganan event (handler), dan tata cara penulisan fungsi asynchronous wajib meniru dan menyesuaikan dengan gaya penulisan (*code style*) yang dominan pada file UI eksisting.
3. **Isolasi Berkas & Cakupan Kerja:** Dilarang keras memodifikasi, menyentuh, atau melakukan refaktorisasi pada file layout global, berkas konfigurasi utility, CSS, atau komponen visual yang tidak berkaitan langsung dengan proses data binding Supabase.
4. **Preservasi Kode UI & Layout:** Jangan pernah menimpa, menghapus, atau memodifikasi susunan class Tailwind CSS dan struktur pohon DOM/JSX bawaan dari Shadcn UI. Modifikasi kode hanya diizinkan untuk menyisipkan ekspresi JavaScript seperti mapping array data (`.map()`), penambahan properti interaktif form (`value`, `onChange`, `onSubmit`), serta pengaturan visual state transisi seperti status *loading* dan penanganan *error*.

---

## 3. SPESIFIKASI MANAJEMEN ROLE & LOGIKA BISNIS

Sistem memisahkan pengguna ke dalam 3 tingkatan akses (Role) dengan matriks kemampuan fungsional sebagai berikut:

### 3.1 Matriks Hak Akses Pengguna
* **Guest (Pengguna Belum Terautentikasi):**
  * Hanya diizinkan mengakses halaman Login dan Register.
  * Jika mencoba mengakses halaman berproteksi, sistem secara otomatis akan me-redirect pengguna kembali ke halaman Login.
* **Member (Pelanggan Terdaftar):**
  * Dapat mengakses halaman Dashboard Member khusus (menampilkan status keanggotaan pribadi).
  * Dapat melihat daftar katalog produk yang tersedia.
  * Dapat membuat transaksi/pesanan baru secara mandiri.
  * Dapat melacak dan melihat riwayat (history) pesanan pribadi mereka sendiri.
* **Admin (Pengelola Sistem):**
  * Memiliki akses penuh ke Admin Dashboard (Statistik agregat global).
  * Memiliki kontrol penuh (Operasi CRUD) terhadap master data Produk.
  * Memiliki kontrol penuh (Operasi CRUD) terhadap master data Pelanggan (Customers).
  * Dapat melihat, memantau, dan memperbarui status seluruh pesanan dari semua member di dalam sistem.

### 3.2 Logika Bisnis: Sistem Poin & Tiering Member
Setiap pengguna dengan role `Member` akan memiliki akumulasi nilai internal berupa `points`. Berdasarkan jumlah poin tersebut, sistem secara otomatis mengklasifikasikan member ke dalam 4 tingkatan (Tiering) yang berimplikasi langsung terhadap perolehan diskon harga disetiap pembuatan pesanan baru:

| Tier | Rentang Akumulasi Poin | Keuntungan Potongan Harga (Diskon) |
| :--- | :--- | :--- |
| **Bronze** | 0 s/d 499 Poin | **5%** Potongan dari Total Belanja |
| **Silver** | 500 s/d 1.499 Poin | **10%** Potongan dari Total Belanja |
| **Gold** | 1.500 s/d 4.999 Poin | **15%** Potongan dari Total Belanja |
| **Platinum** | $\ge$ 5.000 Poin | **20%** Potongan dari Total Belanja |

*Mekanisme Validasi:* Perhitungan nilai diskon dilakukan di sisi frontend saat kalkulasi checkout untuk memberikan pengalaman interaktif bagi user, namun nilai akhir transaksi tetap wajib diverifikasi terhadap master data tiering pengguna yang tercatat aman di database.

---

## 4. ARSITEKTUR DAN DESAIN SKEMA DATABASE

Rancangan database relasional di bawah ini disusun secara optimal memanfaatkan tipe data native PostgreSQL di Supabase untuk mendukung efisiensi query dan integritas data.

### 4.1 Tabel: `public.profiles`
Berfungsi mengekstensi tabel otentikasi internal Supabase (`auth.users`) untuk kebutuhan manajemen profile, role, poin, dan tiering.

| Nama Kolom | Tipe Data | Aturan & Properti | Deskripsi Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | Primary Key, FK ke `auth.users(id)` ON DELETE CASCADE | ID unik pengguna, sinkron dengan ID Auth. |
| `name` | `VARCHAR` | NOT NULL | Nama lengkap pengguna. |
| `email` | `VARCHAR` | NOT NULL, UNIQUE | Alamat email aktif pengguna. |
| `role` | `VARCHAR` | NOT NULL, DEFAULT 'Member' | Nilai: 'Admin', 'Member' |
| `points` | `INTEGER` | NOT NULL, DEFAULT 0 | Jumlah akumulasi poin member. |
| `tier` | `VARCHAR` | NOT NULL, DEFAULT 'Bronze' | Nilai: 'Bronze', 'Silver', 'Gold', 'Platinum' |
| `created_at` | `TIMESTAMPTZ`| DEFAULT `now()` | Tanggal dan waktu akun dibuat. |

### 4.2 Tabel: `public.products`
Menyimpan entitas data katalog produk komersial.

| Nama Kolom | Tipe Data | Aturan & Properti | Deskripsi Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | Primary Key, DEFAULT `gen_random_uuid()` | ID unik produk. |
| `name` | `VARCHAR` | NOT NULL | Nama item produk. |
| `description`| `TEXT` | Nullable | Deskripsi atau spesifikasi produk. |
| `price` | `NUMERIC` | NOT NULL, CHECK (`price` >= 0) | Harga retail produk (sebelum diskon). |
| `stock` | `INTEGER` | NOT NULL, DEFAULT 0, CHECK (`stock` >= 0) | Jumlah sisa ketersediaan barang di gudang. |
| `image_url` | `TEXT` | Nullable | Alamat URL berkas gambar produk. |
| `created_at` | `TIMESTAMPTZ`| DEFAULT `now()` | Tanggal produk dimasukkan ke sistem. |

### 4.3 Tabel: `public.orders`
Menampung data ringkasan (summary) transaksi pesanan yang dilakukan oleh pengguna.

| Nama Kolom | Tipe Data | Aturan & Properti | Deskripsi Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | Primary Key, DEFAULT `gen_random_uuid()` | ID unik nota transaksi pesanan. |
| `member_id` | `UUID` | FK ke `public.profiles(id)` ON DELETE RESTRICT | ID member pelaku transaksi. |
| `total_original`| `NUMERIC`| NOT NULL | Total akumulasi harga produk kotor (awal). |
| `discount_amount`| `NUMERIC`| NOT NULL, DEFAULT 0 | Nilai potongan harga yang didapat dari tier. |
| `total_final` | `NUMERIC` | NOT NULL | Total bersih yang wajib dibayarkan member. |
| `status` | `VARCHAR` | NOT NULL, DEFAULT 'Pending' | Status: 'Pending', 'Completed', 'Cancelled'. |
| `created_at` | `TIMESTAMPTZ`| DEFAULT `now()` | Waktu transaksi diinisialisasi. |

### 4.4 Tabel: `public.order_items`
Tabel detail persilangan (*junction table*) yang mencatat rincian kuantitas produk dalam satu nomor pesanan tertentu.

| Nama Kolom | Tipe Data | Aturan & Properti | Deskripsi Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | Primary Key, DEFAULT `gen_random_uuid()` | ID unik baris item detail. |
| `order_id` | `UUID` | FK ke `public.orders(id)` ON DELETE CASCADE | ID nota pesanan induk. |
| `product_id` | `UUID` | FK ke `public.products(id)` ON DELETE RESTRICT | ID item produk yang dibeli. |
| `quantity` | `INTEGER` | NOT NULL, CHECK (`quantity` > 0) | Jumlah kuantitas produk yang dibeli. |
| `price_at_purchase`| `NUMERIC`| NOT NULL | Harga produk per item saat transaksi terjadi. |

---

## 5. SPESIFIKASI KEAMANAN DATA: ROW LEVEL SECURITY (RLS)

Untuk menjamin kepatuhan hak akses di level database (bypassing Client API Manipulation), aturan keamanan wajib diaktifkan pada setiap tabel dengan rincian kebijakan (policies) sebagai berikut:

### 5.1 Aturan RLS pada Tabel `profiles`
* **SELECT (Read):** Diizinkan jika ID pengguna yang login cocok dengan baris ID profil (`auth.uid() = id`), atau jika pengguna yang login memiliki role sebagai 'Admin'.
* **INSERT (Create):** Diizinkan melalui mekanisme internal database trigger (Security Definer) saat proses registrasi akun baru di modul Auth.
* **UPDATE (Write):** Pengguna dengan role 'Admin' dapat mengupdate seluruh field. Pengguna dengan role 'Member' hanya diizinkan mengupdate kolom informasi dasar seperti `name`, dan dilarang memanipulasi kolom `role`, `points`, ataupun `tier` miliknya sendiri secara ilegal melalui REST API client.

### 5.2 Aturan RLS pada Tabel `products`
* **SELECT (Read):** Terbuka untuk umum (*Public* / *Anonymous*). Seluruh user termasuk Guest dapat melihat list produk agar katalog dapat tampil di frontend sebelum login.
* **INSERT / UPDATE / DELETE:** Hak eksklusif hanya diberikan kepada pengguna yang terotentikasi dan memiliki record role bernilai 'Admin'.

### 5.3 Aturan RLS pada Tabel `orders` dan `order_items`
* **SELECT (Read):** Admin dapat membaca seluruh baris data pesanan global. Member hanya diizinkan membaca data transaksi yang memiliki keterikatan relasi dengan ID miliknya sendiri (`member_id = auth.uid()`).
* **INSERT (Create):** Hanya diizinkan bagi pengguna terotentikasi yang membuat pesanan atas namanya sendiri (`member_id = auth.uid()`).
* **UPDATE / DELETE:** Hak eksklusif penuh dikunci hanya untuk user dengan role 'Admin' guna memperbarui status pengiriman/pembayaran (e.g., merubah status dari 'Pending' menjadi 'Completed').

---

## 6. PANDUAN INTEGRASI UTAMA DI LEVEL FRONTEND (REACT)

1. **Pencegahan Reload Halaman:** Di setiap interaksi form (Login, Register, Tambah Produk, Tambah Pelanggan, Buat Pesanan), pastikan fungsi handler utama memanggil parameter `e.preventDefault()` untuk mempertahankan kestabilan state SPA (Single Page Application).
2. **Inisialisasi Client Tunggal:** Buat satu file konfigurasi tunggal di direktori proyek Anda (misalnya `src/lib/supabase.js`) untuk memuat inisialisasi client: