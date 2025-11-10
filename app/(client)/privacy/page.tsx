import Link from "next/link";

export const metadata = {
  title: "Kebijakan Privasi | PSAK-413",
  description:
    "Kebijakan Privasi PSAK-413: jenis data yang kami kumpulkan, cara penggunaan, cookies, hak pengguna (GDPR/CCPA), dan informasi kontak.",
};
export default function PrivacyPolicyPage() {
  const updated = "3 Nov 2025";

  return (
    <main id="top" className="min-h-screen bg-[#1f1f24] text-white">
      {/* Hero */}
      <section className="border-b border-white/10 bg-[#26262b]">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <p className="text-center text-xs font-semibold tracking-widest text-rose-300">
            PRIVACY POLICY
          </p>
          <h1 className="mx-auto mt-2 max-w-3xl text-center text-2xl font-extrabold md:text-3xl">
            Kebijakan Privasi <span className="text-rose-300">PSAK-413</span>
          </h1>
          <p className="mt-3 text-center text-sm text-white/70">
            Terakhir diperbarui: {updated}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-4xl px-4 py-10">
        <PolicySection id="consent" title="Persetujuan">
          <p>
            Dengan menggunakan website kami, Anda menyetujui Kebijakan Privasi
            ini dan setuju terhadap syarat-syaratnya. Jika Anda tidak setuju,
            mohon hentikan penggunaan layanan.
          </p>
        </PolicySection>

        <PolicySection id="collect" title="Informasi yang Kami Kumpulkan">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Informasi akun (nama, email, nomor WhatsApp, alamat/penagihan jika
              diperlukan).
            </li>
            <li>
              Data transaksi (produk, nominal, metode pembayaran, waktu dan
              status).
            </li>
            <li>
              Data teknis (IP, user agent, halaman, referrer, timestamp) untuk
              keamanan & analitik.
            </li>
            <li>
              Riwayat dukungan (chat/email) guna penyelesaian kendala layanan.
            </li>
          </ul>
          <p className="mt-3 text-white/70 text-sm">
            Bila kami meminta data, tujuan pengumpulan akan dijelaskan pada saat
            itu.
          </p>
        </PolicySection>

        <PolicySection id="use" title="Cara Kami Menggunakan Informasi">
          <ul className="list-disc space-y-2 pl-5">
            <li>Menyediakan & memelihara layanan top-up/voucher.</li>
            <li>
              Memproses pesanan, pembayaran, dan pengembalian dana (jika
              berlaku).
            </li>
            <li>
              Komunikasi layanan (status pesanan, pemberitahuan penting,
              dukungan).
            </li>
            <li>
              Personalisasi & peningkatan pengalaman pengguna, pencegahan
              penipuan.
            </li>
            <li>Analitik & pelaporan agregat untuk peningkatan kualitas.</li>
            <li>
              Pemasaran yang sah dengan opsi berhenti berlangganan (opt-out).
            </li>
          </ul>
        </PolicySection>

        <PolicySection id="log" title="Log Files">
          <p>
            Kami menggunakan log files untuk keamanan dan pemeliharaan. Data ini
            tidak secara langsung mengidentifikasi individu.
          </p>
        </PolicySection>

        <PolicySection id="cookies" title="Cookies & Web Beacons">
          <p>
            Kami memakai cookies untuk sesi login, preferensi, dan pengukuran
            performa. Anda bisa mengatur cookies di peramban. Menonaktifkan
            cookies tertentu dapat membatasi fungsi situs.
          </p>
        </PolicySection>

        <PolicySection id="ads" title="Partner Periklanan">
          <p>
            Partner periklanan/pengukuran mungkin menempatkan cookies/pixel.
            Masing-masing punya kebijakan privasi sendiri; tautannya akan
            disediakan jika digunakan.
          </p>
        </PolicySection>

        <PolicySection id="thirdparty" title="Privasi Pihak Ketiga">
          <p>
            Kebijakan ini tidak berlaku untuk situs/layanan pihak ketiga (mis.
            payment gateway, media sosial). Bacalah kebijakan privasi mereka
            sebelum penggunaan.
          </p>
        </PolicySection>

        <PolicySection id="ccpa" title="Hak CCPA (Jangan Jual Data Saya)">
          <p>
            Pengguna yang dilindungi CCPA dapat meminta pengungkapan kategori &
            potongan data yang dikumpulkan, penghapusan data, serta memilih agar
            data tidak dijual. Hubungi kami melalui bagian Kontak untuk
            menggunakan hak Anda.
          </p>
        </PolicySection>

        <PolicySection id="gdpr" title="Hak Perlindungan Data GDPR">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <b>Hak akses</b> – menolak salinan data pribadi Anda.
            </li>
            <li>
              <b>Hak koreksi</b> – memperbaiki data yang tidak akurat.
            </li>
            <li>
              <b>Hak penghapusan</b> – meminta penghapusan data pada kondisi
              tertentu.
            </li>
            <li>
              <b>Hak pembatasan</b> – membatasi pemrosesan pada kondisi
              tertentu.
            </li>
            <li>
              <b>Hak keberatan</b> – menolak pemrosesan tertentu, termasuk
              marketing langsung.
            </li>
            <li>
              <b>Hak portabilitas</b> – meminta data dalam format terstruktur
              yang umum.
            </li>
          </ul>
          <p className="mt-3 text-white/70 text-sm">
            Kami akan menanggapi permintaan sah sesuai hukum yang berlaku.
          </p>
        </PolicySection>

        <PolicySection id="children" title="Privasi Anak-Anak">
          <p>
            Layanan tidak ditujukan untuk anak di bawah 13 tahun. Jika anak di
            bawah 13 tahun memberi data, hubungi kami untuk penghapusan segera.
          </p>
        </PolicySection>

        <PolicySection id="contact" title="Kontak Kami">
          <p>
            Untuk permintaan akses/penghapusan data atau pertanyaan privasi:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              Email:{" "}
              <Link
                href="mailto:support@kiostetta.com"
                className="text-rose-300 hover:underline"
              >
                support@kiostetta.com
              </Link>
            </li>
            <li>
              WhatsApp CS:{" "}
              <span className="text-white/85">+62-8xx-xxxx-xxxx</span>
            </li>
            <li>
              Subjek:{" "}
              <span className="text-white/85">
                [Privacy Request] Nama – Permintaan
              </span>
            </li>
          </ul>
        </PolicySection>

        <div className="mt-10 flex justify-end">
          {/* anchor ke #top, tanpa JS */}
          <a
            href="#top"
            className="rounded-full bg-[#2b2a30] px-4 py-2 text-sm ring-1 ring-white/10 hover:bg-[#34333a]"
          >
            Kembali ke atas
          </a>
        </div>
      </section>
    </main>
  );
}

function PolicySection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-lg font-bold text-white">
        <span className="mr-2 inline-block h-2 w-2 translate-y-[-2px] rounded-full bg-rose-500" />
        {title}
      </h2>
      <div className="prose prose-invert prose-sm mt-3 max-w-none text-white/85">
        {children}
      </div>
      <div className="my-6 h-px w-full bg-white/10" />
    </section>
  );
}
