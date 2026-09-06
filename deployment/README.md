# Panduan Deployment Insurance App (`insurance-app`)

Repositori ini mendukung deployment berbasis container Docker dengan pendekatan **Two-Tier Docker Build** untuk efisiensi caching layer `node_modules` dan image runner yang sangat ramping.

---

## 1. Arsitektur Docker Image

1. **Base Layer (`insurance-app-base:latest`)**:
   - Berisi dependensi npm hasil `npm ci` di atas image `node:20-alpine`.
   - Hanya perlu di-build ulang ketika `package.json` atau `package-lock.json` berubah.
2. **App Layer (`insurance-app:latest`)**:
   - Mengompilasi aplikasi Next.js menggunakan mode `output: standalone`.
   - Mengemas output minimal ke dalam runner `node:20-alpine` dengan user non-root (`app`).

---

## 2. Cara Menjalankan

### A. Build Base Image
```bash
./deployment/build-base.sh
```

### B. Build App Image
```bash
./deployment/build-app.sh
```

### C. Menjalankan Container
```bash
docker compose -f deployment/docker-compose.yaml up -d
```

Aplikasi customer portal akan aktif melayani trafik pada port **`3001`**:
- Portal Web: `http://localhost:3001`
- Health Endpoint: `http://localhost:3001/health`
