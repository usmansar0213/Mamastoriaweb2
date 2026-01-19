# MamaStoria Comics API Documentation

Versi API: 2.0.1
Base URL: `http://localhost:8080` (Local) / `https://your-production-url.com` (Production)

## Ringkasan

Dokumentasi ini mencakup seluruh endpoint API yang tersedia di backend MamaStoria Comics yang dikonversi dari Laravel (PHP) ke FastAPI (Python).

---

## Daftar Isi

- [Health Check](#health-check)
- [Authentication](#authentication)
- [Users & Profile](#users--profile)
- [Master Data](#master-data)
- [Comics Management](#comics-management)
- [Comic Generator (AI)](#comic-generator-ai)
- [Social Features (Comments, Likes, Follows)](#social-features)
- [Subscriptions & Payments](#subscriptions--payments)
- [Financial (Commissions & Withdrawals)](#financial)
- [Referrals](#referrals)
- [Notifications](#notifications)
- [Analytics & Stats](#analytics--stats)
- [Downloads & Configs](#downloads--configs)
- [Public Endpoints](#public-endpoints)
- [Admin & Worker](#admin--worker)

---

## Health Check

Sistem menyediakan endpoint untuk monitoring kesehatan aplikasi.

| Method | Endpoint     | Description                            |
| ------ | ------------ | -------------------------------------- |
| GET    | `/`          | Root endpoint - Cek versi & sapaan API |
| GET    | `/health`    | Status kesehatan aplikasi secara umum  |
| GET    | `/health/db` | Status koneksi database                |

---

## Authentication

Base prefix: `/api/v1/auth`

| Method | Endpoint               | Description                             |
| ------ | ---------------------- | --------------------------------------- |
| POST   | `/register`            | Registrasi user baru                    |
| POST   | `/login`               | Login dengan email/phone & password     |
| GET    | `/login`               | Info halaman login (GET)                |
| POST   | `/verify-otp`          | Verifikasi nomor HP dengan kode OTP     |
| POST   | `/resend-verification` | Kirim ulang kode verifikasi             |
| POST   | `/refresh-token`       | Refresh access token (JWT)              |
| POST   | `/logout`              | Logout (Token invalidation side-effect) |
| POST   | `/update-fcm-token`    | Update token FCM untuk push notif       |
| GET    | `/google/redirect`     | Redirect ke Google OAuth consent screen |
| GET    | `/google/callback`     | Callback handler untuk Google OAuth     |
| POST   | `/google/verify`       | Verifikasi Google ID token dari client  |

---

## Users & Profile

Base prefix: `/api/v1`

| Method | Endpoint                         | Description                                       |
| ------ | -------------------------------- | ------------------------------------------------- |
| GET    | `/profile`                       | Ambil data profil user saat ini                   |
| POST   | `/profile/update-details`        | Update nama, username, email                      |
| POST   | `/profile/update-photo`          | Upload foto profil baru                           |
| POST   | `/profile/update-watermark`      | Update preferensi watermark                       |
| POST   | `/password/change-password`      | Ganti password lama ke baru                       |
| POST   | `/password/send-reset-token`     | Kirim kode reset password ke email                |
| POST   | `/password/verify-reset-token`   | Verifikasi kode reset password                    |
| POST   | `/password/reset-password`       | Reset password dengan token terverifikasi         |
| POST   | `/users/check-verification-code` | Cek validitas kode verifikasi email               |
| POST   | `/users/send-otp`                | Kirim OTP verifikasi ke email                     |
| POST   | `/profile/update-kredit`         | Update kredit (Admin/Self-service)                |
| POST   | `/profile/kredit/add`            | Tambah kredit ke user tertentu (Query: `user_id`) |
| POST   | `/profile/kredit/subtract`       | Potong kredit user saat ini                       |
| GET    | `/profile/referral-code`         | Ambil kode referral dan statistik                 |
| GET    | `/profile/rating`                | Ambil rating dan statistik profil (likes, views)  |
| GET    | `/profile/update-quota`          | Cek sisa kuota update profil                      |

---

## Master Data

Base prefix: `/api/v1`

| Method | Endpoint       | Description                                |
| ------ | -------------- | ------------------------------------------ |
| GET    | `/styles`      | Daftar style komik yang tersedia           |
| GET    | `/genres`      | Daftar genre komik yang tersedia           |
| GET    | `/characters`  | Daftar template karakter (Alias: `/chars`) |
| GET    | `/backgrounds` | Daftar template background (Alias: `/bg`)  |

---

## Comics Management

Base prefix: `/api/v1`

| Method | Endpoint                   | Description                                            |
| ------ | -------------------------- | ------------------------------------------------------ |
| GET    | `/comics`                  | Daftar komik yang sudah dipublish (Paginated)          |
| GET    | `/comics/{id}`             | Detail komik berdasarkan ID (Alias: `/comics/id/{id}`) |
| POST   | `/comics/create-story`     | Step 1: Buat draft komik dari ide cerita               |
| POST   | `/comics/{id}/summary`     | Update ringkasan/summary komik                         |
| POST   | `/comics/{id}/character`   | Step 2: Pilih karakter untuk draft                     |
| POST   | `/comics/{id}/backgrounds` | Step 3: Pilih background untuk draft                   |
| GET    | `/comics/drafts`           | Daftar draft komik milik user                          |
| GET    | `/comics/draft/{id}`       | Cek status generasi draft komik                        |
| POST   | `/comics/{id}/publish`     | Publish komik menjadi publik                           |
| POST   | `/comics/{id}/status`      | Update status komik (aktif/nonaktif)                   |
| POST   | `/comics/{id}/read`        | Track view/baca komik                                  |
| POST   | `/comics/{id}/share`       | Track share komik                                      |
| GET    | `/comics/{id}/share-count` | Ambil jumlah share komik                               |
| GET    | `/comics/{id}/similar`     | Daftar komik serupa                                    |
| GET    | `/comics/last-read`        | Histori bacaan terakhir user                           |

---

## Comic Generator (AI)

Base prefix: `/api`

| Method | Endpoint                         | Description                                        |
| ------ | -------------------------------- | -------------------------------------------------- |
| GET    | `/health-ai`                     | Diagnosis konfigurasi AI & API Key                 |
| GET    | `/styles`                        | Style AI untuk generasi komik                      |
| GET    | `/nuances`                       | Opsi nuansa AI (Funny, Sad, etc)                   |
| POST   | `/script`                        | Generasi script komik dari story idea (OpenAI)     |
| POST   | `/render-part`                   | Render satu part komik secara sinkron (Admin Only) |
| POST   | `/render-all`                    | Mulai proses rendering full komik (Asinkron)       |
| GET    | `/job/{job_id}`                  | Cek status rendering job (Internal State)          |
| GET    | `/read/{job_id}`                 | Data job untuk viewer mobile/web                   |
| GET    | `/pdf/{job_id}`                  | Generate/Download komik versi PDF                  |
| GET    | `/preview/{id}/{part}`           | Lihat gambar preview full page sebelum split       |
| GET    | `/preview-panel/{id}/{pt}/{idx}` | Lihat preview individual panel                     |
| GET    | `/viewer/{job_id}`               | Halaman viewer komik (HTML)                        |

---

## Social Features

Base prefix: `/api/v1`

### Comments & Likes

| Method | Endpoint                 | Description                         |
| ------ | ------------------------ | ----------------------------------- |
| GET    | `/comments/{comic}`      | Daftar komentar pada komik          |
| POST   | `/comments/{comic}`      | Tambah komentar/review              |
| DELETE | `/comments/{comment_id}` | Hapus komentar                      |
| GET    | `/likes/{comic}`         | Daftar user yang menyukai komik     |
| POST   | `/likes/{comic}`         | Like/Favoritkan komik               |
| DELETE | `/likes/{comic}`         | Unlike komik                        |
| GET    | `/likes/{comic}/status`  | Cek apakah user saat ini sudah like |

### Follows

| Method | Endpoint                         | Description                        |
| ------ | -------------------------------- | ---------------------------------- |
| POST   | `/users/{user_id}/follow`        | Follow user lain                   |
| DELETE | `/users/{user_id}/follow`        | Unfollow user lain                 |
| GET    | `/users/{user_id}/followers`     | Daftar followers user              |
| GET    | `/users/{user_id}/following`     | Daftar user yang diikuti           |
| GET    | `/users/{user_id}/is-following`  | Cek status follow ke user tertentu |
| GET    | `/users/{user_id}/follow-counts` | Ambil jumlah follower & following  |

---

## Subscriptions & Payments

Base prefix: `/api/v1`

| Method | Endpoint                           | Description                           |
| ------ | ---------------------------------- | ------------------------------------- |
| GET    | `/subscriptions/packages`          | Daftar paket langganan/topup          |
| GET    | `/subscriptions/payment-methods`   | Daftar metode pembayaran (Doku)       |
| POST   | `/subscriptions/purchase`          | Beli paket (Generate payment URL)     |
| POST   | `/subscriptions/callback`          | Callback webhook dari payment gateway |
| GET    | `/subscriptions/status`            | Cek status langganan user saat ini    |
| GET    | `/subscriptions/status/{invoice}`  | Cek status transaksi by invoice       |
| GET    | `/subscriptions/history`           | Histori transaksi pembayaran user     |
| GET    | `/subscriptions/mock-payment/{id}` | Halaman mock payment (Dev Only)       |

---

## Financial

Base prefix: `/api/v1`

| Method | Endpoint       | Description                     |
| ------ | -------------- | ------------------------------- |
| GET    | `/commissions` | Daftar komisi yang didapat user |
| POST   | `/commissions` | Tambah komisi ke user (Admin)   |
| GET    | `/withdrawals` | Daftar penarikan saldo user     |
| POST   | `/withdrawals` | Ajukan penarikan saldo baru     |

---

## Referrals

Base prefix: `/api/v1`

| Method | Endpoint                  | Description                                        |
| ------ | ------------------------- | -------------------------------------------------- |
| GET    | `/referrals`              | Daftar user yang direferensikan (Query: `user_id`) |
| POST   | `/referrals`              | Klaim/Gunakan kode referral                        |
| GET    | `/referrals/check-parent` | Cek siapa yang mereferensikan user ini             |
| GET    | `/referrals/check-code`   | Validasi apakah kode referral aktif                |

---

## Notifications

Base prefix: `/api/v1`

| Method | Endpoint                        | Description                             |
| ------ | ------------------------------- | --------------------------------------- |
| GET    | `/notifications`                | Daftar notifikasi user                  |
| GET    | `/notifications/unread-count`   | Jumlah notifikasi yang belum dibaca     |
| POST   | `/notifications/mark-read`      | Tandai notifikasi tertentu sudah dibaca |
| POST   | `/notifications/mark-all-read`  | Tandai semua notifikasi sudah dibaca    |
| POST   | `/notifications/{id}/mark-read` | Tandai satu notifikasi sudah dibaca     |
| DELETE | `/notifications/{id}`           | Hapus notifikasi                        |
| POST   | `/notifications/send-email`     | Kirim email kustom via SMTP             |

---

## Analytics & Stats

Base prefix: `/api/v1`

| Method | Endpoint                  | Description                          |
| ------ | ------------------------- | ------------------------------------ |
| GET    | `/analytics/dashboard`    | Ringkasan statistik dashboard user   |
| GET    | `/analytics/daily`        | Statistik harian (Views, Likes, dll) |
| GET    | `/analytics/monthly`      | Statistik bulanan                    |
| GET    | `/analytics/yearly`       | Statistik tahunan                    |
| GET    | `/analytics/transactions` | Histori transaksi kredit user        |

---

## Downloads & Configs

Base prefix: `/api/v1`

| Method | Endpoint          | Description                                  |
| ------ | ----------------- | -------------------------------------------- |
| GET    | `/download/video` | Download video (dengan/tanpa watermark)      |
| GET    | `/download/file`  | Download file umum dari Google Cloud Storage |
| GET    | `/config/{name}`  | Ambil nilai konfigurasi aplikasi             |

---

## Public Endpoints

Base prefix: `/api/v1/public`

_Endpoint ini tidak memerlukan token/login._

| Method | Endpoint               | Description                       |
| ------ | ---------------------- | --------------------------------- |
| GET    | `/comics`              | Daftar komik publik untuk sharing |
| GET    | `/comics/{id}`         | Detail komik publik               |
| GET    | `/comics/{id}/similar` | Daftar komik serupa (publik)      |

---

## Admin & Worker

Prefix khusus untuk management internal.

### Admin Tools (`/api/v1/admin`)

| Method | Endpoint       | Description                          |
| ------ | -------------- | ------------------------------------ |
| GET    | `/logs`        | Tarik logs dari Google Cloud Logging |
| GET    | `/performance` | Analisis performa generasi komik     |
| GET    | `/video-logs`  | Logs spesifik untuk video generation |

### Worker Tasks (`/tasks`)

| Method | Endpoint          | Description                          |
| ------ | ----------------- | ------------------------------------ |
| POST   | `/generate-comic` | Handler untuk Cloud Tasks (Asinkron) |

---

## Informasi Tambahan

### Request Headers

Sebagian besar endpoint (kecuali [Public Endpoints](#public-endpoints)) memerlukan header Authorization:
`Authorization: Bearer <your_jwt_token>`

### Struktur Response Umum

Semua response mengikut standar JSON:

```json
{
  "ok": true,
  "message": "Optional message string",
  "data": { ... }
}
```

Atau untuk Paginated Response:

```json
{
  "ok": true,
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "per_page": 20,
    "total_pages": 5
  }
}
```
