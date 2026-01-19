# MamaStoria — Webtoons-like Frontend Demo

Demo UI yang meniru tampilan Webtoons, dibangun dengan HTML, Tailwind (CDN) dan sedikit JavaScript.

Quick start

- Buka folder projek di terminal.
- Jalankan simple HTTP server (disarankan) agar `fetch` bekerja dengan baik:

```powershell
python -m http.server 8000
```

- Lalu buka browser: http://localhost:8000

Kenapa pakai HTTP server?

- Membuka `index.html` lewat `file://` akan membatasi `fetch` karena kebijakan CORS dan origin. Menjalankan server lokal sederhana memungkinkan contoh integrasi API bekerja.

Integrasi dengan backend API

- Demo membaca `window.API_BASE` yang didefinisikan di `index.html`. Secara default demo menggunakan:

```
https://nanobanana-backend-1089713441636.asia-southeast2.run.app/api/v1/
```

- Untuk mengganti endpoint, edit `window.API_BASE` di bagian bawah `index.html`.
- Jika backend memerlukan otorisasi, kirim header `Authorization: Bearer <token>`.
- Pastikan backend mengizinkan CORS untuk origin tempat frontend berjalan (mis. `http://localhost:8000`).

Contoh fetch (JS)

```js
async function fetchComicsFromApi() {
  const res = await fetch("http://localhost:8080/api/v1/comics", {
    headers: {
      Accept: "application/json" /*, 'Authorization': 'Bearer <token>' */,
    },
  });
  const json = await res.json();
  // Sesuaikan mapping sesuai struktur respons backend
  // jika paginated: json.data -> array
  return (json.data || json).map((item) => ({
    id: item.id,
    title: item.title || item.name,
    author: item.author_name || item.author || "Unknown",
    cover: item.cover_url || item.thumbnail || "https://picsum.photos/200/300",
    views: item.views || 0,
    likes: item.likes || 0,
  }));
}
```

File penting

- [index.html](index.html)
- [src/main.js](src/main.js)
- [src/styles.css](src/styles.css)

Next steps

- Hilangkan sample data dan sesuaikan mapping respons API jika diperlukan.
- Tambahkan autentikasi, paging, dan caching untuk performa.

Infinite scroll / pagination

- Demo sekarang mendukung infinite scroll yang otomatis memanggil `?page=` pada backend jika tersedia.
- Jika backend mengembalikan objek `pagination` dalam respons, frontend akan menggunakan `pagination.page` dan `pagination.total_pages` untuk menentukan apakah masih ada halaman berikutnya.
- Untuk development tanpa backend, frontend mensimulasikan paging dari `sampleComics`.

Settings panel

- Demo ini mencakup panel pengaturan kecil (tombol gear di samping `Sign In`) di mana Anda dapat mengubah `API Base URL` saat runtime dan mengaktifkan atau menonaktifkan infinite scroll. Setelah menerapkan pengaturan, grid akan dimuat ulang menggunakan basis baru.

Empty state & search

- Jika pencarian tidak menghasilkan item, demo menampilkan pesan "No comics found". Ini juga berlaku ketika filter genre menghasilkan nol hasil.
- Pencarian sudah menggunakan debounce 300ms untuk mengurangi jumlah render saat mengetik.

Results count

- The demo shows a small results counter above the grid (e.g. "Showing 12 · Page 1"). It updates as more pages load or when filtering/searching.
