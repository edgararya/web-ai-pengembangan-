# Web AI (DeepSeek + Ollama)

Web ini adalah interface chat sederhana (mirip ChatGPT) yang terhubung ke AI yang berjalan di komputer Anda sendiri (Ollama). Bisa diakses secara lokal atau via Internet (Vercel).

## 1. Persiapan Awal
Pastikan Anda sudah menginstall:
-   **[Ollama](https://ollama.com/)** (Untuk menjalankan AI).
-   **Model DeepSeek**: Buka terminal dan jalankan `ollama run deepseek-r1`.
-   **[Ngrok](https://ngrok.com/)** (Hanya jika ingin akses dari Vercel/Internet).

---

## 2. Cara Menjalankan (Localhost / Laptop Sendiri)
Jika hanya ingin dipakai di laptop sendiri tanpa internet.

1.  **Nyalakan Ollama**: Buka aplikasi Ollama.
2.  **Jalankan Web Server**:
    Di dalam folder project ini, buka Terminal/PowerShell dan ketik:
    ```powershell
    python -m http.server 8000
    ```
3.  **Buka Browser**: Akses `http://localhost:8000`.

---

## 3. Cara Menjalankan di Internet (Vercel + Ngrok)
Jika ingin webnya di-host di Vercel tapi tetap pakai AI di laptop.

### A. Di Laptop Anda (Server AI)
Ollama dan Ngrok harus **selalu menyala** di laptop Anda agar web Vercel bisa connect.

1.  **Matikan Ollama** yang sedang jalan (Quit dari icon tray).
2.  **Nyalakan Ollama (Mode Publik)**:
    Buka PowerShell baru, copy-paste perintah ini:
    ```powershell
    $env:OLLAMA_ORIGINS="*"; ollama serve
    ```
3.  **Nyalakan Ngrok (Tunneling)**:
    Buka Terminal baru, jalankan perintah ini (PENTING: pakai `--host-header`):
    ```powershell
    ngrok http --host-header="localhost:11434" 11434
    ```
4.  **Copy URL Ngrok**: Cari alamat yang berakhiran `.ngrok-free.app` (contoh: `https://abcd-123.ngrok-free.app`).

### B. Di Web Vercel (Client)
1.  Buka website Anda yang sudah di-deploy di Vercel.
2.  Klik tombol **Settings** (ikon gerigi) di pojok kiri.
3.  Paste **URL Ngrok** tadi ke kolom input.
4.  Klik **Save**.
5.  Selesai! Sekarang Anda bisa chatting.

---

## Troubleshooting
-   **Error merah di chat**: Cek apakah Ngrok masih jalan? Apakah URL Ngrok berubah (Ngrok gratis ganti URL tiap restart)? Pastikan update URL di Settings.
-   **403 Forbidden**: Pastikan saat menyalakan Ngrok pakai setting `--host-header="localhost:11434"`.

## Update Web
Jika Anda mengubah kode, upload update ke Vercel dengan:
```bash
git add .
git commit -m "pesan update"
git push
```
Vercel akan otomatis meng-update website dalam 1-2 menit.
