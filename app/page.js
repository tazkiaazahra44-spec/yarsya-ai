import Image from "next/image";
import { FiCpu, FiZap, FiShield, FiBox } from "react-icons/fi";

export default function Home() {
  return (
    <div className="font-sans min-h-screen bg-gradient-to-b from-black/[.02] to-transparent dark:from-white/[.03]">
      <header className="sticky top-0 bg-background/70 backdrop-blur border-b border-black/10 dark:border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Image src="/next.svg" alt="logo" width={28} height={28} className="dark:invert" />
            <span className="text-sm font-semibold tracking-tight">YARSYA-AI</span>
          </div>
          <nav className="ml-auto hidden sm:flex items-center gap-6 text-sm text-black/70 dark:text-white/70">
            <a href="#fitur" className="hover:underline">Fitur</a>
            <a href="#demo" className="hover:underline">Demo</a>
            <a href="#faq" className="hover:underline">FAQ</a>
            <a href="/chat" className="rounded-full bg-foreground text-background px-4 py-2 font-medium hover:opacity-90">Mulai Chat</a>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 py-14 sm:py-20 flex flex-col items-center text-center">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">
            Asisten AI Modern untuk Semua Kebutuhanmu
          </h1>
          <p className="mt-4 max-w-2xl text-black/70 dark:text-white/70">
            YARSYA-AI adalah profesor virtual yang super cerdas. Tanyakan apa saja, dari sains hingga kode.
            Mendukung LaTeX, Markdown, dan blok kode untuk jawaban yang rapi dan lengkap.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <a href="/chat" className="rounded-full bg-foreground text-background px-6 py-3 font-medium hover:opacity-90">Coba Sekarang</a>
            <a href="#fitur" className="rounded-full border border-black/10 dark:border-white/10 px-6 py-3 font-medium hover:bg-black/[.03] dark:hover:bg-white/[.06]">Lihat Fitur</a>
          </div>
          <div className="mt-10 w-full max-w-3xl rounded-2xl border border-black/10 dark:border-white/10 p-4">
            <div className="aspect-video w-full rounded-lg bg-black/5 dark:bg-white/10 grid place-items-center text-sm text-black/60 dark:text-white/60">
              Demo placeholder — buka halaman chat untuk mencoba langsung.
            </div>
            <div className="text-xs text-black/60 dark:text-white/60 mt-2">Tidak ada video demo. Klik Mulai Chat untuk interaksi langsung.</div>
          </div>
        </section>

        <section id="fitur" className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-xl sm:text-2xl font-semibold text-center mb-8">Fitur Unggulan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Feature icon={<FiCpu />} title="Cerdas" desc="Jawaban berkualitas tinggi dengan dukungan LaTeX/Markdown/kode." />
            <Feature icon={<FiZap />} title="Cepat" desc="Respons cepat, pengalaman mulus dengan UI modern." />
            <Feature icon={<FiShield />} title="Aman" desc="Rate limit server-side 3 rps melindungi backend Anda." />
            <Feature icon={<FiBox />} title="Siap Pakai" desc="Full stack, tinggal jalankan dan gunakan." />
          </div>
        </section>

        <section id="demo" className="mx-auto max-w-6xl px-4 py-12">
          <div className="rounded-2xl border border-black/10 dark:border-white/10 p-6">
            <h3 className="text-lg font-semibold mb-2">Demo Cepat</h3>
            <p className="text-sm text-black/70 dark:text-white/70 mb-4">Buka halaman chat dan kirim pertanyaan pertama Anda.</p>
            <a href="/chat" className="inline-block rounded-full bg-foreground text-background px-5 py-2 font-medium hover:opacity-90">Mulai Chat</a>
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-6xl px-4 py-12">
          <h3 className="text-lg font-semibold mb-4">FAQ</h3>
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="font-medium">Apakah mendukung simbol/LaTeX/kode?</dt>
              <dd className="text-black/70 dark:text-white/70">Ya. Semua jawaban AI dapat dirender dengan Markdown, LaTeX/KaTeX, dan highlight kode.</dd>
            </div>
            <div>
              <dt className="font-medium">Bagaimana dengan batasan request?</dt>
              <dd className="text-black/70 dark:text-white/70">Server membatasi 3 request per detik untuk stabilitas, diterapkan via token bucket limiter.</dd>
            </div>
          </dl>
        </section>
      </main>

      <footer className="border-t border-black/10 dark:border-white/10 py-6">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center gap-2 justify-between text-sm">
          <div className="flex items-center gap-2">
            <Image src="/next.svg" alt="logo" width={20} height={20} className="dark:invert" />
            <span className="text-black/60 dark:text-white/60">© {new Date().getFullYear()} YARSYA-AI</span>
          </div>
          <a className="text-black/70 dark:text-white/70 hover:underline" href="/chat">Mulai Chat</a>
        </div>
      </footer>
    </div>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <div className="rounded-2xl border border-black/10 dark:border-white/10 p-4 bg-white dark:bg-black/30">
      <div className="h-9 w-9 rounded-lg bg-black/5 dark:bg-white/10 flex items-center justify-center mb-3">
        {icon}
      </div>
      <div className="font-medium">{title}</div>
      <div className="text-sm text-black/70 dark:text-white/70">{desc}</div>
    </div>
  );
}
