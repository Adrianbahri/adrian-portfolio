export interface Article {
  id: number;
  slug: string;
  title: string;
  desc: string;
  date: string;
  category: string;
  content: string; // Markdown or simple HTML
  author: string;
  tags: string[];
}

export const articles: Article[] = [
  {
    id: 1,
    slug: 'masa-depan-flutter-2026',
    title: 'Masa Depan Pengembangan Mobile dengan Flutter di Tahun 2026',
    desc: 'Eksplorasi mendalam tentang bagaimana Flutter terus mendominasi pasar pengembangan lintas platform dan apa yang baru di ekosistem Dart.',
    date: 'March 15, 2026',
    category: 'Technology',
    author: 'Drian',
    tags: ['FLUTTER', 'MOBILE', 'DART', 'TECH-TRENDS'],
    content: `
      <h2>Kenapa Flutter Masih Relevan?</h2>
      <p>Meskipun banyak framework baru bermunculan, Flutter tetap menjadi pilihan utama bagi developer yang menginginkan performa native dengan satu codebase. Kecepatan iterasi dengan fitur Hot Reload tetap tidak terkalahkan.</p>
      
      <h2>Integrasi AI dalam Ekosistem Flutter</h2>
      <p>Di tahun 2026, kita melihat pergeseran besar di mana Flutter tidak hanya digunakan untuk UI, tetapi juga integrasi mendalam dengan model AI lokal melalui paket ffi yang semakin matang.</p>
      
      <ul>
        <li>Performa grafis yang lebih mulus dengan Impeller engine.</li>
        <li>Dukungan WebAssembly (Wasm) yang kini mencapai status stabil penuh.</li>
        <li>Ekosistem paket yang kini mencapai lebih dari 50,000 paket di pub.dev.</li>
      </ul>

      <h2>Kesimpulan</h2>
      <p>Bagi mahasiswa atau developer profesional, menguasai Flutter di tahun ini masih merupakan investasi yang sangat berharga untuk karir di bidang kreatif teknologi.</p>
    `
  }
];
