import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import {
    IconShoppingCart,
    IconWallet,
    IconBuildingWarehouse,
    IconReceiptTax,
    IconChartBar,
    IconReportMoney,
    IconUsers,
    IconBrandWhatsapp,
    IconShieldLock,
    IconCloudOff,
    IconBrandGithub,
    IconStar,
    IconArrowRight,
    IconDeviceMobile,
    IconTerminal2,
    IconQrcode,
    IconApi,
} from '@tabler/icons-react';

const GITHUB_URL = 'https://github.com/ridhoauliama97/larapos';
const DOCS_URL = `${GITHUB_URL}/blob/main/docs/getting-started.md`;
const GALLERY_URL = `${GITHUB_URL}/blob/main/docs/screenshots.md`;

const stats = [
    { value: '200+', label: 'GitHub Stars' },
    { value: '44+', label: 'Fitur Lengkap' },
    { value: 'MIT', label: 'Open Source' },
    { value: '8', label: 'Modul Terintegrasi' },
];

const features = [
    {
        icon: IconShoppingCart,
        title: 'POS Cepat & Mudah',
        desc: 'Cari produk via barcode atau keyboard, scan pakai kamera (PWA), cart hold/resume, dan checkout dalam hitungan detik.',
    },
    {
        icon: IconWallet,
        title: 'Multi-Payment',
        desc: 'Tunai, transfer bank, QRIS (Midtrans), Xendit, hingga pay later (piutang) — semua dalam satu kasir.',
    },
    {
        icon: IconBuildingWarehouse,
        title: 'Multi-Warehouse',
        desc: 'Stok terpisah per gudang/cabang, transfer antar gudang, stock opname, dan tracking batch/expiry (FEFO).',
    },
    {
        icon: IconReceiptTax,
        title: 'PPN & Pajak',
        desc: 'Dukungan PPN 11% (exclusive/inclusive), data NPWP pelanggan, dan laporan pajak yang rapi.',
    },
    {
        icon: IconChartBar,
        title: 'Laporan & Insight',
        desc: 'Laporan penjualan, profit & margin, performa per kasir, jam sibuk, dan repeat customer.',
    },
    {
        icon: IconReportMoney,
        title: 'Piutang & Hutang',
        desc: 'Kelola piutang pelanggan & hutang supplier dengan aging analysis dan partial payment.',
    },
    {
        icon: IconUsers,
        title: 'CRM & Loyalty',
        desc: 'Member tiers, poin loyalty, voucher, segmentasi pelanggan otomatis, dan campaign marketing.',
    },
    {
        icon: IconBrandWhatsapp,
        title: 'WhatsApp Gateway',
        desc: 'Kirim struk, reminder piutang, dan promo via WhatsApp jika service Node dan perangkat sudah terhubung.',
    },
    {
        icon: IconShieldLock,
        title: 'RBAC & Audit Log',
        desc: 'Kontrol akses per role (admin/kasir), persetujuan diskon, dan jejak audit before/after setiap perubahan.',
    },
    {
        icon: IconCloudOff,
        title: 'Offline Mode',
        desc: 'Checkout yang sudah disiapkan dapat masuk antrean offline dan tersinkron saat koneksi kembali.',
    },
    {
        icon: IconQrcode,
        title: 'Dine-in QR Menu',
        desc: 'Pelanggan scan QR meja, melihat menu, membuat pesanan, dan memantau status sampai diproses staff.',
    },
    {
        icon: IconApi,
        title: 'API & Integrasi',
        desc: 'API terautentikasi untuk master data, POS, checkout, shift, transaksi, dan sinkronisasi offline.',
    },
];

const techStack = [
    { name: 'Laravel 13', color: 'bg-red-500' },
    { name: 'Inertia.js 3', color: 'bg-purple-500' },
    { name: 'React 19', color: 'bg-cyan-500' },
    { name: 'Tailwind CSS', color: 'bg-sky-500' },
    { name: 'MySQL', color: 'bg-orange-500' },
    { name: 'PWA', color: 'bg-emerald-500' },
];

const screenshots = [
    {
        src: '/screenshots/01-dashboard.png',
        title: 'Dashboard',
        span: 'col-span-2 row-span-2',
    },
    { src: '/screenshots/02-pos-checkout.png', title: 'POS Checkout' },
    { src: '/screenshots/06-stock-opnames.png', title: 'Stock Opname' },
    { src: '/screenshots/12-receivables.png', title: 'Receivables' },
    { src: '/screenshots/15-sales-report.png', title: 'Sales Report' },
];

const faqs = [
    {
        q: 'Apakah Larapos benar-benar gratis?',
        a: 'Ya. Larapos dirilis di bawah lisensi MIT, sehingga bebas digunakan, dimodifikasi, dan didistribusikan. Hosting, hardware, biaya payment gateway, dan layanan pihak ketiga tetap menjadi tanggung jawab pengguna.',
    },
    {
        q: 'Bisakah dipakai untuk bisnis multi-cabang?',
        a: 'Bisa. Larapos mendukung multi-warehouse dengan stok terpisah per gudang/cabang, transfer stok antar gudang, dan laporan per gudang.',
    },
    {
        q: 'Bagaimana kalau internet di toko mati?',
        a: 'Checkout yang sudah disiapkan dapat masuk antrean lokal dan tersinkron otomatis saat koneksi kembali. Menambahkan produk baru ke cart saat offline masih memiliki keterbatasan karena cart berbasis server.',
    },
    {
        q: 'Apa saja yang dibutuhkan untuk instalasi?',
        a: 'PHP 8.3+, MySQL/MariaDB, Composer, Node.js 18+, dan npm. Untuk WhatsApp Gateway, siapkan Chrome/Chromium dan service Node terpisah. Semua panduan ada di dokumentasi getting-started.',
    },
    {
        q: 'Bagaimana cara berkontribusi?',
        a: 'Fork repository, buat branch dari development (feature/nama-fitur), lalu buat Pull Request ke development. Pastikan php artisan test lulus sebelum submit.',
    },
];

const quickStart = `git clone https://github.com/ridhoauliama97/larapos
cd point-of-sales
composer install
PUPPETEER_SKIP_DOWNLOAD=true npm install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan storage:link

# Jalankan server, queue, logs, dan Vite
composer run dev

# Buka http://localhost:8000 dan selesaikan wizard /setup`;

export default function Welcome() {
    return (
        <PublicLayout>
            <Head title="Larapos — Sistem Kasir Open Source untuk UMKM" />

            {/* ============ HERO ============ */}
            <section className="px-6 pb-16 pt-28">
                <div className="mx-auto max-w-7xl">
                    <div className="mx-auto max-w-4xl text-center">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-600 dark:border-primary-900 dark:bg-primary-950/50 dark:text-primary-400">
                            <IconBrandGithub size={16} />
                            Open Source · MIT License
                        </div>

                        <h1 className="text-5xl font-extrabold leading-tight text-slate-900 dark:text-white md:text-6xl">
                            Sistem Kasir Modern
                            <span className="mt-2 block bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
                                Gratis &amp; Open Source
                            </span>
                        </h1>

                        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
                            Larapos adalah aplikasi point of sale lengkap untuk warung, toko, dan
                            UMKM Indonesia — multi-warehouse, PPN, loyalty &amp; CRM, WhatsApp
                            gateway, hingga offline mode. Self-hosted, data 100% milik Anda.
                        </p>

                        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <a
                                href={GITHUB_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-primary-500/30 transition-all hover:from-primary-600 hover:to-primary-700 sm:w-auto"
                            >
                                <IconStar size={20} />
                                Star di GitHub
                                <IconArrowRight size={18} />
                            </a>
                            <Link
                                href="/login"
                                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-8 py-4 text-base font-semibold text-slate-700 transition-all hover:border-primary-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-primary-700 sm:w-auto"
                            >
                                <IconDeviceMobile size={20} />
                                Coba Demo
                            </Link>
                        </div>
                    </div>

                    {/* App preview */}
                    <div className="relative mt-16">
                        <div className="pointer-events-none absolute inset-0 bottom-0 top-auto z-10 h-32 bg-gradient-to-t from-slate-50 to-transparent dark:from-slate-950" />
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex items-center gap-2 bg-slate-100 px-4 py-3 dark:bg-slate-800">
                                <div className="flex gap-2">
                                    <div className="h-3 w-3 rounded-full bg-red-400" />
                                    <div className="h-3 w-3 rounded-full bg-yellow-400" />
                                    <div className="h-3 w-3 rounded-full bg-green-400" />
                                </div>
                                <div className="flex-1 text-center text-xs text-slate-500">
                                    Larapos.web.id
                                </div>
                            </div>
                            <img
                                src="/media/revamp-pos.png"
                                alt="Preview POS Larapos"
                                className="w-full"
                                loading="lazy"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ============ STATS ============ */}
            <section className="border-y border-slate-200 bg-white px-6 py-12 dark:border-slate-800 dark:bg-slate-900/50">
                <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4">
                    {stats.map((stat) => (
                        <div key={stat.label} className="text-center">
                            <div className="text-3xl font-extrabold text-primary-600 dark:text-primary-400 md:text-4xl">
                                {stat.value}
                            </div>
                            <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ============ SCREENSHOTS ============ */}
            <section id="screenshot" className="px-6 py-20">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-14 text-center">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white md:text-4xl">
                            Tampilan Aplikasi
                        </h2>
                        <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-400">
                            Dari kasir harian hingga laporan manajemen — semua dalam satu aplikasi
                            yang rapi dan cepat.
                        </p>
                    </div>

                    <div className="grid auto-rows-[140px] grid-cols-2 gap-4 md:auto-rows-[180px] md:grid-cols-3">
                        {screenshots.map((shot) => (
                            <div
                                key={shot.title}
                                className={`${shot.span || ''} group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800`}
                            >
                                <img
                                    src={shot.src}
                                    alt={shot.title}
                                    className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                                    loading="lazy"
                                />
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
                                    <span className="text-xs font-medium text-white">
                                        {shot.title}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 text-center">
                        <a
                            href={GALLERY_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400"
                        >
                            Lihat galeri lengkap (33 screenshot)
                            <IconArrowRight size={16} />
                        </a>
                    </div>
                </div>
            </section>

            {/* ============ FEATURES ============ */}
            <section
                id="fitur"
                className="border-y border-slate-200 bg-white px-6 py-20 dark:border-slate-800 dark:bg-slate-900/50"
            >
                <div className="mx-auto max-w-7xl">
                    <div className="mb-16 text-center">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white md:text-4xl">
                            Fitur Lengkap untuk Bisnis Nyata
                        </h2>
                        <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-400">
                            44+ modul terintegrasi — dari transaksi harian sampai analitik lanjutan,
                            dirancang untuk kebutuhan UMKM Indonesia.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature) => (
                            <div
                                key={feature.title}
                                className="group rounded-2xl border border-slate-100 bg-slate-50 p-6 transition-all hover:border-primary-200 hover:shadow-lg hover:shadow-primary-500/5 dark:border-slate-800 dark:bg-slate-800/50 dark:hover:border-primary-800"
                            >
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 transition-transform group-hover:scale-110">
                                    <feature.icon size={24} className="text-white" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
                                    {feature.title}
                                </h3>
                                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 text-center">
                        <Link
                            href="/fitur"
                            className="inline-flex items-center gap-2 rounded-xl border border-primary-200 px-6 py-3 text-sm font-semibold text-primary-600 transition-colors hover:bg-primary-50 dark:border-primary-800 dark:text-primary-400 dark:hover:bg-primary-950/40"
                        >
                            Jelajahi semua fitur
                            <IconArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ============ TECH STACK ============ */}
            <section className="px-6 py-16">
                <div className="mx-auto max-w-4xl text-center">
                    <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white">
                        Tech Stack Modern
                    </h2>
                    <p className="mb-10 text-slate-600 dark:text-slate-400">
                        Dibangun dengan teknologi yang teruji, cepat, dan mudah dikembangkan
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        {techStack.map((tech) => (
                            <div
                                key={tech.name}
                                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-3 dark:border-slate-700 dark:bg-slate-800"
                            >
                                <div className={`h-3 w-3 rounded-full ${tech.color}`} />
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                    {tech.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============ INSTALLATION ============ */}
            <section
                id="instalasi"
                className="border-y border-slate-200 bg-white px-6 py-20 dark:border-slate-800 dark:bg-slate-900/50"
            >
                <div className="mx-auto max-w-4xl">
                    <div className="mb-12 text-center">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white md:text-4xl">
                            Instalasi dalam Hitungan Menit
                        </h2>
                        <p className="mt-4 text-slate-600 dark:text-slate-400">
                            Clone, install, lalu buka wizard setup untuk membuat akun admin, profil
                            toko, kategori, dan gudang utama.
                        </p>
                    </div>

                    <div className="overflow-hidden rounded-2xl bg-slate-900 p-6 dark:bg-slate-800">
                        <div className="mb-4 flex items-center gap-2">
                            <IconTerminal2 size={16} className="text-slate-500" />
                            <span className="font-mono text-xs text-slate-500">bash</span>
                        </div>
                        <pre className="overflow-x-auto font-mono text-sm leading-relaxed text-slate-300">
                            {quickStart}
                        </pre>
                    </div>

                    <div className="mt-6 text-center">
                        <a
                            href={DOCS_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400"
                        >
                            Baca dokumentasi lengkap
                            <IconArrowRight size={16} />
                        </a>
                    </div>
                </div>
            </section>

            {/* ============ DEMO ============ */}
            <section className="px-6 py-16">
                <div className="mx-auto max-w-3xl">
                    <div className="rounded-2xl border border-primary-200 bg-primary-50/50 p-8 text-center dark:border-primary-900 dark:bg-primary-950/30">
                        <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">
                            Ingin Coba Langsung?
                        </h2>
                        <p className="mb-6 text-slate-600 dark:text-slate-400">
                            Untuk mencoba aplikasi, jalankan instalasi lokal dan selesaikan wizard
                            setup. Seeder utama tidak membuat akun demo atau sample data.
                        </p>
                        <Link
                            href="/setup"
                            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 px-8 py-4 font-semibold text-white shadow-lg shadow-primary-500/25 transition-all hover:from-primary-600 hover:to-primary-700"
                        >
                            Mulai Setup
                            <IconArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ============ FAQ ============ */}
            <section
                id="faq"
                className="border-y border-slate-200 bg-white px-6 py-20 dark:border-slate-800 dark:bg-slate-900/50"
            >
                <div className="mx-auto max-w-3xl">
                    <div className="mb-12 text-center">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white md:text-4xl">
                            Pertanyaan Umum
                        </h2>
                    </div>
                    <div className="space-y-4">
                        {faqs.map((faq) => (
                            <details
                                key={faq.q}
                                className="group rounded-xl border border-slate-200 bg-slate-50 transition-all open:shadow-md dark:border-slate-700 dark:bg-slate-800/50"
                            >
                                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4">
                                    <span className="font-medium text-slate-900 dark:text-white">
                                        {faq.q}
                                    </span>
                                    <span className="text-lg text-primary-500 transition-transform group-open:rotate-45">
                                        +
                                    </span>
                                </summary>
                                <p className="px-5 pb-5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                                    {faq.a}
                                </p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============ CTA ============ */}
            <section className="px-6 py-20">
                <div className="mx-auto max-w-4xl">
                    <div className="rounded-3xl bg-gradient-to-r from-primary-500 to-primary-600 p-12 text-center text-white">
                        <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                            Siap Kelola Bisnis dengan Larapos?
                        </h2>
                        <p className="mx-auto mb-8 max-w-xl text-lg opacity-90">
                            Gratis digunakan dan dimodifikasi di bawah lisensi MIT, dengan data
                            tetap berada di infrastruktur Anda.
                        </p>
                        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <a
                                href={GITHUB_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 font-semibold text-primary-600 transition-colors hover:bg-slate-50"
                            >
                                <IconBrandGithub size={20} />
                                Star di GitHub
                            </a>
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 rounded-2xl border border-white/40 px-8 py-4 font-semibold text-white transition-colors hover:bg-white/10"
                            >
                                Coba Demo
                                <IconArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
