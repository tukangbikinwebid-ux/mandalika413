# Toast Notification System

Sistem toast notification yang dapat digunakan di seluruh aplikasi untuk memberikan feedback kepada pengguna tentang hasil operasi CRUD.

## Fitur

- ✅ 4 jenis toast: Success, Error, Warning, Info
- ✅ Animasi smooth dengan Framer Motion (spring animation)
- ✅ Posisi kanan atas untuk UX yang lebih baik
- ✅ Auto-close dengan progress bar yang smooth (60fps)
- ✅ Pause progress saat hover dan resume dari posisi sebelumnya
- ✅ Manual close dengan tombol X yang beranimasi dan berfungsi
- ✅ Hover effects dengan scale dan shadow
- ✅ Icon animation saat hover
- ✅ Responsive design
- ✅ Konsisten dengan tema gaming store
- ✅ TypeScript support

## Komponen

### 1. Toast Component (`components/ui/toast.tsx`)

Komponen utama untuk menampilkan toast notification.

### 2. Toast Provider (`components/providers/toast-provider.tsx`)

Context provider untuk mengelola state toast secara global.

### 3. Toast Demo (`components/ui/toast-demo.tsx`)

Komponen demo untuk testing berbagai jenis toast.

## Cara Penggunaan

### 1. Import Hook

```tsx
import { useToast } from "@/components/providers/toast-provider";
```

### 2. Gunakan dalam Komponen

```tsx
function MyComponent() {
  const { success, error, warning, info } = useToast();

  const handleSubmit = async () => {
    try {
      await saveData();
      success("Berhasil!", "Data berhasil disimpan");
    } catch (err) {
      error("Gagal!", "Terjadi kesalahan saat menyimpan");
    }
  };

  return <button onClick={handleSubmit}>Simpan Data</button>;
}
```

### 3. Metode yang Tersedia

#### `success(title, description?, duration?)`

Menampilkan toast sukses (hijau)

#### `error(title, description?, duration?)`

Menampilkan toast error (merah)

#### `warning(title, description?, duration?)`

Menampilkan toast warning (kuning)

#### `info(title, description?, duration?)`

Menampilkan toast info (biru)

#### `showToast(toast)`

Metode umum untuk menampilkan toast dengan konfigurasi lengkap

#### `hideToast(id)`

Menyembunyikan toast berdasarkan ID

#### `clearAllToasts()`

Menyembunyikan semua toast

### 4. Parameter

- `title` (string): Judul toast (required)
- `description` (string): Deskripsi toast (optional)
- `duration` (number): Durasi auto-close dalam milidetik (default: 5000ms)

## Contoh Penggunaan Lengkap

```tsx
import { useToast } from "@/components/providers/toast-provider";

function ProductForm() {
  const { success, error, warning, info } = useToast();

  const handleCreate = async (data) => {
    try {
      await createProduct(data);
      success(
        "Produk Berhasil Ditambahkan",
        `Produk "${data.name}" berhasil ditambahkan ke katalog`,
        4000
      );
    } catch (err) {
      error(
        "Gagal Menambahkan Produk",
        "Terjadi kesalahan saat menyimpan produk. Silakan coba lagi."
      );
    }
  };

  const handleUpdate = async (data) => {
    try {
      await updateProduct(data);
      success("Produk Berhasil Diupdate", "Data produk berhasil diperbarui");
    } catch (err) {
      error(
        "Gagal Mengupdate Produk",
        "Terjadi kesalahan saat mengupdate produk"
      );
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Yakin ingin menghapus produk ini?")) {
      try {
        await deleteProduct(id);
        success("Produk Berhasil Dihapus", "Produk telah dihapus dari katalog");
      } catch (err) {
        error(
          "Gagal Menghapus Produk",
          "Terjadi kesalahan saat menghapus produk"
        );
      }
    }
  };

  const handleValidation = () => {
    warning("Data Tidak Valid", "Mohon periksa kembali data yang dimasukkan");
  };

  const handleInfo = () => {
    info("Informasi", "Sistem akan maintenance pada pukul 02:00 WIB");
  };

  return <div>{/* Form components */}</div>;
}
```

## Styling

Toast menggunakan tema gaming store dengan:

- Warna hijau untuk success (emerald)
- Warna merah untuk error
- Warna kuning untuk warning
- Warna biru untuk info
- Backdrop blur effect
- Smooth animations
- Responsive design

## Integrasi

Toast provider sudah terintegrasi di `components/providers.tsx` dan dapat digunakan di seluruh aplikasi tanpa setup tambahan.

## Demo

Gunakan komponen `ToastDemo` untuk melihat semua jenis toast dalam aksi:

```tsx
import { ToastDemo } from "@/components/ui/toast-demo";

function TestPage() {
  return <ToastDemo />;
}
```
