export interface IndividualItem {
  user: string; // Rovi, Erwy, Widy, Didik, Sholeh, Kholid
  category: "Pokok" | "Sekunder";
  subcategory: string; // Perlengkapan Dasar, Pakaian, Makan dan Minum, Bacaan/Dokumen/Alat Tulis, Perlengkapan Mandi, Peralatan Sekunder
  itemName: string;
  status: boolean; // true = Ready, false = Not Ready
  notes: string;
  lastUpdated: string;
  rowIndex?: number; // to allow updating specific row in Sheets
}

export interface TeamItem {
  itemName: string;
  status: boolean; // true = Ready, false = Not Ready
  pic: string; // Responsible person
  notes: string;
  lastUpdated: string;
  rowIndex?: number; // to allow updating specific row in Sheets
}

export const MEMBERS = ["Rovi", "Erwin", "Widy", "Didik", "Sholeh", "Kholid"] as const;

export type MemberName = typeof MEMBERS[number];

export const INDIVIDUAL_ITEMS_TEMPLATE: { category: "Pokok" | "Sekunder"; subcategory: string; itemName: string }[] = [
  // POKOK - Perlengkapan Dasar
  { category: "Pokok", subcategory: "Perlengkapan Dasar", itemName: "Carrier / ransel kapasitas 40 atau 60 liter (1 buah)" },
  { category: "Pokok", subcategory: "Perlengkapan Dasar", itemName: "Matras / alas tidur (1 lembar)" },
  { category: "Pokok", subcategory: "Perlengkapan Dasar", itemName: "Kantong tidur (sleeping bag) (1 buah)" },
  { category: "Pokok", subcategory: "Perlengkapan Dasar", itemName: "Kantong plastik besar (trash bag) (2 lembar)" },
  { category: "Pokok", subcategory: "Perlengkapan Dasar", itemName: "Kantong plastik ukuran ½ atau 1 kg (10 lembar)" },
  { category: "Pokok", subcategory: "Perlengkapan Dasar", itemName: "Tali Pramuka (1 gulung)" },
  { category: "Pokok", subcategory: "Perlengkapan Dasar", itemName: "Lampu senter (1 buah)" },
  { category: "Pokok", subcategory: "Perlengkapan Dasar", itemName: "Pisau" },

  // POKOK - Pakaian
  { category: "Pokok", subcategory: "Pakaian", itemName: "Pakaian dalam" },
  { category: "Pokok", subcategory: "Pakaian", itemName: "Kaos olahraga" },
  { category: "Pokok", subcategory: "Pakaian", itemName: "Celana olahraga" },
  { category: "Pokok", subcategory: "Pakaian", itemName: "Jaket" },
  { category: "Pokok", subcategory: "Pakaian", itemName: "Ponco / mantel hujan (yang bisa dibuka/digelar) (1 helai)" },
  { category: "Pokok", subcategory: "Pakaian", itemName: "Sepatu lapangan (1 pasang)" },
  { category: "Pokok", subcategory: "Pakaian", itemName: "Kaos kaki (2 pasang)" },
  { category: "Pokok", subcategory: "Pakaian", itemName: "Topi rimba (1 buah)" },

  // POKOK - Makan dan Minum
  { category: "Pokok", subcategory: "Makan dan Minum", itemName: "Piring plastik / melamin" },
  { category: "Pokok", subcategory: "Makan dan Minum", itemName: "Botol tumbler / botol minum" },
  { category: "Pokok", subcategory: "Makan dan Minum", itemName: "Makanan untuk 2 hari" },

  // POKOK - Bacaan, Dokumen, dan Alat Tulis
  { category: "Pokok", subcategory: "Bacaan, Dokumen, Alat Tulis", itemName: "Mushaf Al-Qur'an (1 buah)" },
  { category: "Pokok", subcategory: "Bacaan, Dokumen, Alat Tulis", itemName: "Buku tulis (1 buah)" },
  { category: "Pokok", subcategory: "Bacaan, Dokumen, Alat Tulis", itemName: "Pulpen (1 buah)" },
  { category: "Pokok", subcategory: "Bacaan, Dokumen, Alat Tulis", itemName: "Obat-obatan pribadi" },
  { category: "Pokok", subcategory: "Bacaan, Dokumen, Alat Tulis", itemName: "Kartu identitas (1 lembar)" },
  { category: "Pokok", subcategory: "Bacaan, Dokumen, Alat Tulis", itemName: "Fotokopi kartu identitas (2 lembar)" },

  // POKOK - Perlengkapan Mandi
  { category: "Pokok", subcategory: "Perlengkapan Mandi", itemName: "Sabun mandi" },
  { category: "Pokok", subcategory: "Perlengkapan Mandi", itemName: "Sikat gigi" },
  { category: "Pokok", subcategory: "Perlengkapan Mandi", itemName: "Pasta gigi" },
  { category: "Pokok", subcategory: "Perlengkapan Mandi", itemName: "Handuk" },

  // SEKUNDER
  { category: "Sekunder", subcategory: "Peralatan Sekunder", itemName: "Jam tangan" },
  { category: "Sekunder", subcategory: "Peralatan Sekunder", itemName: "Kaos Pandu Keadilan" },
  { category: "Sekunder", subcategory: "Peralatan Sekunder", itemName: "Kain sarung" },
  { category: "Sekunder", subcategory: "Peralatan Sekunder", itemName: "Sandal jepit" },
  { category: "Sekunder", subcategory: "Peralatan Sekunder", itemName: "Skebo / kupluk" },
  { category: "Sekunder", subcategory: "Peralatan Sekunder", itemName: "Baterai cadangan (4 buah)" },
  { category: "Sekunder", subcategory: "Peralatan Sekunder", itemName: "Bola lampu baterai cadangan (1 buah)" },
  { category: "Sekunder", subcategory: "Peralatan Sekunder", itemName: "Sarung tangan (1 pasang)" },
  { category: "Sekunder", subcategory: "Peralatan Sekunder", itemName: "Kertas tisu (1 bungkus)" },
  { category: "Sekunder", subcategory: "Peralatan Sekunder", itemName: "Suplemen dan makanan ringan (vitamin, roti, kue)" },
];

export const TEAM_ITEMS_TEMPLATE: { itemName: string; notes: string }[] = [
  { itemName: "Tenda regu untuk kembara", notes: "Panitia menyewakan tenda untuk regu. Jika membutuhkan, silakan menghubungi Kusbiantoro: +62 857-7696-0436" },
  { itemName: "Flysheet ukuran 3 × 4 meter (2 buah)", notes: "" },
  { itemName: "Peluit", notes: "" },
  { itemName: "Lampu badai (1 buah)", notes: "" },
  { itemName: "Korek api (2 buah)", notes: "" },
  { itemName: "P3K (minimal Betadine, Hansaplast, dan Counterpain)", notes: "" },
  { itemName: "Kompor parafin / gas portabel (1 buah)", notes: "" },
  { itemName: "Nesting / panci kecil (1 set)", notes: "" },
  { itemName: "Bendera PKS dan Merah Putih", notes: "" },
  { itemName: "Tali prusik dan webbing", notes: "" },
  { itemName: "Tongkat bambu / rotan / kayu panjang 160 cm (4 batang)", notes: "" },
];
