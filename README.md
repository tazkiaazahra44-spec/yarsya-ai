# YARSYA-AI

Aplikasi Chat AI modern full-stack berbasis Next.js (App Router) dengan UI/UX premium, dukungan Markdown + LaTeX (KaTeX), highlight kode (Prism), OCR (image to text) via Tesseract.js, voice (STT/TTS) gratis via Web Speech API, Web Push notifikasi, dan rate limit 3 rps untuk proteksi API upstream.

## Fitur
- UI/UX chat modern: bubble elegan, copy cepat, timestamp, regenerate, stop (abort), export percakapan (JSON), new chat
- Markdown + LaTeX/Math (KaTeX) + code highlight (Prism One Dark)
- OCR (Image → Text) menggunakan Tesseract.js (lokal, client-side)
- Voice:
  - STT (speech-to-text) gratis via Web Speech API (browser support diperlukan)
  - TTS (text-to-speech) gratis via SpeechSynthesis
- Web Push Notifikasi dengan VAPID
- Landing page profesional
- Rate limiter 3 rps di server untuk semua request API upstream

## Prasyarat
- Node.js 18+
- VAPID keys untuk Web Push
- Akun Supabase (opsional tapi direkomendasikan untuk menyimpan subscription push)

## Menjalankan Secara Lokal
1. Install dependencies
   ```bash
   npm ci
   ```
2. Siapkan environment variable di `.env.local` (contoh di bawah)
3. Jalankan dev server
   ```bash
   npm run dev
   ```
4. Buka `http://localhost:3000`

## Environment Variables
Buat file `.env.local` di root proyek.

Wajib untuk Web Push:
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=YOUR_PUBLIC_VAPID_KEY
VAPID_PRIVATE_KEY=YOUR_PRIVATE_VAPID_KEY
VAPID_SUBJECT=mailto:admin@example.com
```

Opsional (untuk menyimpan push subscription di Supabase; jika tidak diisi, fallback ke in-memory):
```
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

Catatan: gunakan SERVICE ROLE KEY hanya di server (route handler). Di proyek ini digunakan hanya pada server route (App Router). Jangan expose di client.

## Membuat VAPID Key (sekali saja)
```js
node -e "const w=require('web-push');const v=w.generateVAPIDKeys();console.log(v)"
```
Salin `publicKey` ke `NEXT_PUBLIC_VAPID_PUBLIC_KEY` dan `privateKey` ke `VAPID_PRIVATE_KEY`.

## Skema Supabase
Jalankan SQL ini di Supabase (SQL Editor):

```
-- file: supabase_schema.sql
create table if not exists public.push_subscriptions (
  endpoint text primary key,
  subscription jsonb not null,
  updated_at timestamptz not null default now()
);
create index if not exists push_subscriptions_updated_idx on public.push_subscriptions (updated_at desc);
```

## Struktur Penting
- API
  - `app/api/chat/route.js`: Proxy ke `https://api.ryzumi.vip/api/ai/chatgpt` dengan rate limit 3 rps. Prompt dikunci server-side.
  - `app/api/push/keys/route.js`: Kirim public VAPID key
  - `app/api/push/subscribe/route.js`: Simpan subscription push (Supabase atau memory fallback)
  - `app/api/push/send/route.js`: Kirim push ke semua subscription
- Client/UI
  - `app/chat/page.js`: Halaman chat modern (Markdown, LaTeX, kode, OCR, STT/TTS, push)
  - `app/chat/registerPush.js`: Utility registrasi service worker dan subscribe push
  - `public/sw.js`: Service worker untuk menerima push dan handle klik notifikasi
  - `app/page.js`: Landing page profesional
- Util
  - `lib/rateLimiter.js`: Token bucket 3 rps
  - `lib/supabaseServer.js`: Client Supabase server-side

## Cara Kerja Push
- Client mendaftarkan service worker dan meminta izin notifikasi
- Client mengambil public VAPID key dari `/api/push/keys`, subscribe ke PushManager, dan kirim subscription ke `/api/push/subscribe`
- Saat balasan AI diterima, client memanggil `/api/push/send` (best-effort)
- Service worker menampilkan notifikasi; klik notifikasi membuka `/chat`

## Catatan Browser
- STT/TTS Web Speech API didukung di browser tertentu (Chromium-based direkomendasikan)
- Web Push memerlukan HTTPS (kecuali localhost)

## Build & Deploy
- Build produksi
  ```bash
  npm run build
  npm run start
  ```
- Deploy ke layanan hosting Next.js/Node. Pastikan environment variables terpasang dan file `public/sw.js` tersedia.

## Kustomisasi
- Ubah prompt default (server-side) di `app/api/chat/route.js` (konstan `DEFAULT_PROMPT`)
- Sesuaikan tampilan di `app/chat/page.js` dan `app/page.js`
- Tambah bahasa OCR: ubah `ind+eng` pada inisialisasi Tesseract dan pastikan bahasa tersedia

## Lisensi
Proyek ini menggunakan sumber daya pihak ketiga (Next.js, KaTeX, Tesseract.js, dll) sesuai lisensi masing-masing. Anda bebas memodifikasi untuk kebutuhan Anda.
