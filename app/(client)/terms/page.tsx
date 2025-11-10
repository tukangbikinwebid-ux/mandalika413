// app/terms/page.tsx
import Link from "next/link";

export const metadata = {
  title: "Syarat & Ketentuan | PSAK-413",
  description:
    "Syarat dan Ketentuan penggunaan situs dan layanan PSAK-413: lisensi, cookies, komentar, tautan, penafian, hukum yang berlaku, dan kontak.",
};

export default function TermsPage() {
  const updated = "3 Nov 2025";

  return (
    <main id="top" className="min-h-screen bg-[#1f1f24] text-white">
      {/* Hero */}
      <section className="border-b border-white/10 bg-[#26262b]">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <p className="text-center text-xs font-semibold tracking-widest text-rose-300">
            TERMS & CONDITIONS
          </p>
          <h1 className="mx-auto mt-2 max-w-3xl text-center text-2xl font-extrabold md:text-3xl">
            Syarat & Ketentuan Penggunaan{" "}
            <span className="text-rose-300">PSAK-413</span>
          </h1>
          <p className="mt-3 text-center text-sm text-white/70">
            Terakhir diperbarui: {updated}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-4xl px-4 py-10">
        <Block id="welcome" title="Selamat Datang">
          <p>
            Syarat & Ketentuan ini mengatur penggunaan situs web dan layanan{" "}
            <b>PSAK-413</b> (“kami”). Dengan mengakses atau menggunakan
            situs/layanan, Anda menyetujui ketentuan ini. Bila Anda tidak
            setuju, mohon hentikan penggunaan layanan kami.
          </p>
        </Block>

        <Block id="cookies" title="Cookies">
          <p>
            Kami menggunakan cookies untuk meningkatkan pengalaman, keamanan,
            dan analitik. Dengan memakai situs ini, Anda menyetujui penggunaan
            cookies sesuai Kebijakan Privasi kami. Anda dapat mengatur cookies
            melalui pengaturan peramban masing-masing.
          </p>
        </Block>

        <Block id="license" title="Lisensi">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Kecuali dinyatakan lain, seluruh materi (teks, grafis, antarmuka)
              adalah milik atau berlisensi kepada PSAK-413.
            </li>
            <li>
              Anda diberikan lisensi terbatas untuk mengakses dan menggunakan
              situs hanya untuk tujuan pribadi dan non-komersial.
            </li>
            <li>
              Dilarang menyalin, memodifikasi, menjual kembali, mengunduh
              massal, atau mendistribusikan ulang konten tanpa izin tertulis.
            </li>
          </ul>
        </Block>

        <Block id="comments" title="Komentar Pengguna">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Anda bertanggung jawab atas komentar/ulasan yang dipublikasikan.
              Konten tidak boleh melanggar hukum, hak kekayaan intelektual, atau
              berisi ujaran kebencian, pelecehan, maupun spam.
            </li>
            <li>
              Kami berhak memoderasi, menolak, atau menghapus komentar yang
              melanggar ketentuan ini atau kebijakan kami.
            </li>
            <li>
              Dengan mengirimkan komentar, Anda memberi kami lisensi
              non-eksklusif untuk menampilkan dan mereproduksi konten tersebut
              di platform kami.
            </li>
          </ul>
        </Block>

        <Block id="links" title="Hyperlink ke Situs Kami">
          <p>
            Organisasi seperti lembaga pemerintah, mesin pencari, media,
            direktori online, dan mitra tepercaya dapat menautkan ke situs kami
            selama tautan tersebut tidak menyesatkan dan sesuai konteks. Kami
            dapat mencabut izin kapan saja. Penggunaan logo/brand kami
            memerlukan perjanjian lisensi tertulis.
          </p>
        </Block>

        <Block id="iframes" title="iFrames">
          <p>
            Tanpa izin tertulis, Anda tidak boleh membuat frame yang mengubah
            tampilan visual atau presentasi situs kami dengan cara apa pun.
          </p>
        </Block>

        <Block id="content-liability" title="Tanggung Jawab Konten">
          <p>
            Kami tidak bertanggung jawab atas konten di situs pihak ketiga yang
            menautkan ke kami. Anda setuju membebaskan kami dari klaim yang
            timbul dari tautan pada situs Anda.
          </p>
        </Block>

        <Block id="privacy" title="Privasi Anda">
          <p>
            Silakan tinjau{" "}
            <Link href="/privacy" className="text-rose-300 hover:underline">
              Kebijakan Privasi
            </Link>{" "}
            untuk detail mengenai pemrosesan data pribadi.
          </p>
        </Block>

        <Block id="rights" title="Penyimpanan Hak">
          <p>
            Kami berhak meminta penghapusan tautan apa pun ke situs kami. Dengan
            terus menautkan ke situs kami, Anda menyetujui terikat pada
            ketentuan tautan ini.
          </p>
        </Block>

        <Block id="remove-links" title="Penghapusan Tautan">
          <p>
            Jika Anda menemukan tautan yang ofensif atau melanggar, beri tahu
            kami. Kami akan meninjau permintaan namun tidak berkewajiban untuk
            menanggapi secara langsung.
          </p>
        </Block>

        <Block id="disclaimer" title="Disclaimer">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Layanan disediakan “sebagaimana adanya” tanpa jaminan tersurat
              maupun tersirat mengenai ketersediaan, keakuratan, atau kesesuaian
              untuk tujuan tertentu.
            </li>
            <li>
              Sepanjang diizinkan hukum, kami tidak bertanggung jawab atas
              kerugian tidak langsung/konsekuensial yang timbul dari penggunaan
              situs/layanan.
            </li>
            <li>
              Ketentuan pembatasan tanggung jawab tidak berlaku jika dilarang
              oleh hukum yang berlaku.
            </li>
          </ul>
        </Block>

        <Block id="law" title="Hukum yang Berlaku">
          <p>
            Ketentuan ini diatur oleh hukum Republik Indonesia. Sengketa akan
            diselesaikan di yurisdiksi pengadilan yang berwenang di Indonesia.
          </p>
        </Block>

        <Block id="contact" title="Kontak Kami">
          <p>Untuk pertanyaan terkait ketentuan ini:</p>
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
          </ul>
        </Block>

        <div className="mt-10 flex justify-end">
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

function Block({
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
