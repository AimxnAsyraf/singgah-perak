// SinggahPerak: shared data + trip builder.
// Train durations are approximate and seller names are SAMPLE data for the prototype.
// Verify timetables with KTMB before using them in any real plan.

const LANGS = ["en", "ms", "th", "id", "zh"];

// --- Community sellers (all fictional sample data) --------------------------
const SELLERS = {
  guide_ipoh:    { name: "Pemandu Warisan Ipoh", district: "Kinta" },
  night_kinta:   { name: "Gerai Malam Komuniti Kinta", district: "Kinta" },
  stay_ipoh:     { name: "Homestay Warisan Ipoh", district: "Kinta" },
  craft_sayong:  { name: "Kraf Labu Sayong", district: "Kuala Kangsar" },
  stay_sayong:   { name: "Homestay Kampung Sayong", district: "Kuala Kangsar" },
  guide_lenggong:{ name: "Pemandu Komuniti Lenggong", district: "Hulu Perak" },
  eco_gopeng:    { name: "Eko-Komuniti Gopeng", district: "Kampar" },
  stay_gopeng:   { name: "Eko-Homestay Gopeng", district: "Kampar" },
  pomelo_tambun: { name: "Kebun Limau Bali Tambun", district: "Kinta" },
  boat_pangkor:  { name: "Bot Nelayan Komuniti Pangkor", district: "Manjung" },
  stay_pangkor:  { name: "Chalet Kampung Pangkor", district: "Manjung" },
};

// Approximate district centres for the dashboard map.
const DISTRICTS = {
  "Kinta":         [4.5975, 101.0901],
  "Kuala Kangsar": [4.7731, 100.9417],
  "Hulu Perak":    [5.1023, 100.9706],
  "Kampar":        [4.4717, 101.1667],
  "Manjung":       [4.2167, 100.5667],
};

// --- Origins: how visitors get to Ipoh by rail --------------------------------
const ORIGINS = {
  th: {
    flag: "🇹🇭",
    name: { en: "Thailand (Hat Yai)", ms: "Thailand (Hat Yai)", th: "ไทย (หาดใหญ่)", id: "Thailand (Hat Yai)", zh: "泰国（合艾）" },
    arrive: {
      time: "07:00–15:00",
      title: { en: "Hat Yai → Padang Besar → Ipoh", ms: "Hat Yai → Padang Besar → Ipoh", th: "หาดใหญ่ → ปาดังเบซาร์ → อิโปห์", id: "Hat Yai → Padang Besar → Ipoh", zh: "合艾 → 巴东勿刹 → 怡保" },
      desc: {
        en: "SRT shuttle train to Padang Besar, clear immigration at the station, then KTM ETS south to Ipoh.",
        ms: "Kereta api ulang-alik SRT ke Padang Besar, lepasi imigresen di stesen, kemudian ETS KTM ke Ipoh.",
        th: "นั่งรถไฟรับส่ง (SRT) ไปปาดังเบซาร์ ผ่านตรวจคนเข้าเมืองที่สถานี แล้วต่อรถไฟ ETS ของ KTM ลงใต้สู่อิโปห์",
        id: "Kereta ulang-alik SRT ke Padang Besar, lewati imigrasi di stasiun, lalu ETS KTM ke Ipoh.",
        zh: "乘坐泰国铁路接驳火车至巴东勿刹，在车站办理出入境，再转乘KTM ETS南下怡保。",
      },
    },
    depart: {
      title: { en: "Ipoh → Padang Besar → Hat Yai", ms: "Ipoh → Padang Besar → Hat Yai", th: "อิโปห์ → ปาดังเบซาร์ → หาดใหญ่", id: "Ipoh → Padang Besar → Hat Yai", zh: "怡保 → 巴东勿刹 → 合艾" },
    },
    pay: {
      en: "Thai banking apps (PromptPay) can scan DuitNow QR at participating Malaysian sellers.",
      ms: "Aplikasi bank Thailand (PromptPay) boleh imbas DuitNow QR di peniaga Malaysia yang menyertai.",
      th: "แอปธนาคารไทย (พร้อมเพย์) สแกน DuitNow QR ที่ร้านค้ามาเลเซียที่ร่วมรายการได้",
      id: "Aplikasi bank Thailand (PromptPay) dapat memindai DuitNow QR di penjual Malaysia yang berpartisipasi.",
      zh: "泰国银行App（PromptPay）可在参与的马来西亚商家扫描DuitNow QR付款。",
    },
  },
  sg: {
    flag: "🇸🇬",
    name: { en: "Singapore (via JB Sentral)", ms: "Singapura (melalui JB Sentral)", th: "สิงคโปร์ (ผ่าน JB Sentral)", id: "Singapura (via JB Sentral)", zh: "新加坡（经JB Sentral）" },
    arrive: {
      time: "07:30–15:00",
      title: { en: "JB Sentral → Ipoh (direct ETS)", ms: "JB Sentral → Ipoh (ETS terus)", th: "JB Sentral → อิโปห์ (ETS ตรง)", id: "JB Sentral → Ipoh (ETS langsung)", zh: "JB Sentral → 怡保（ETS直达）" },
      desc: {
        en: "Cross the Causeway to JB Sentral, then ride the direct ETS to Ipoh (~7 h). From 2027 the RTS Link cuts the border crossing to ~5 minutes.",
        ms: "Seberangi Tambak ke JB Sentral, kemudian naik ETS terus ke Ipoh (~7 jam). Mulai 2027, RTS Link memendekkan lintasan sempadan kepada ~5 minit.",
        th: "ข้ามสะพานคอสเวย์ไป JB Sentral แล้วนั่ง ETS ตรงไปอิโปห์ (~7 ชม.) ตั้งแต่ปี 2027 RTS Link จะทำให้การข้ามแดนใช้เวลาเพียง ~5 นาที",
        id: "Seberangi Causeway ke JB Sentral, lalu naik ETS langsung ke Ipoh (~7 jam). Mulai 2027, RTS Link mempersingkat penyeberangan perbatasan menjadi ~5 menit.",
        zh: "经新柔长堤前往JB Sentral，再搭乘ETS直达怡保（约7小时）。2027年起，RTS捷运系统将使过境仅需约5分钟。",
      },
    },
    depart: {
      title: { en: "Ipoh → JB Sentral → Singapore", ms: "Ipoh → JB Sentral → Singapura", th: "อิโปห์ → JB Sentral → สิงคโปร์", id: "Ipoh → JB Sentral → Singapura", zh: "怡保 → JB Sentral → 新加坡" },
    },
    pay: {
      en: "Participating Singapore banking apps can scan DuitNow QR at Malaysian sellers.",
      ms: "Aplikasi bank Singapura yang menyertai boleh imbas DuitNow QR di peniaga Malaysia.",
      th: "แอปธนาคารสิงคโปร์ที่ร่วมรายการสแกน DuitNow QR ที่ร้านค้ามาเลเซียได้",
      id: "Aplikasi bank Singapura yang berpartisipasi dapat memindai DuitNow QR di penjual Malaysia.",
      zh: "参与的新加坡银行App可在马来西亚商家扫描DuitNow QR付款。",
    },
  },
  id: {
    flag: "🇮🇩",
    name: { en: "Indonesia (fly to KL)", ms: "Indonesia (terbang ke KL)", th: "อินโดนีเซีย (บินมา KL)", id: "Indonesia (terbang ke KL)", zh: "印尼（飞抵吉隆坡）" },
    arrive: {
      time: "08:00–14:30",
      title: { en: "KLIA → KL Sentral → Ipoh", ms: "KLIA → KL Sentral → Ipoh", th: "KLIA → KL Sentral → อิโปห์", id: "KLIA → KL Sentral → Ipoh", zh: "KLIA → KL Sentral → 怡保" },
      desc: {
        en: "Fly into Kuala Lumpur, take the airport rail link to KL Sentral, then ETS north to Ipoh (~2.5 h).",
        ms: "Terbang ke Kuala Lumpur, naik rel lapangan terbang ke KL Sentral, kemudian ETS ke Ipoh (~2.5 jam).",
        th: "บินมากัวลาลัมเปอร์ นั่งรถไฟสนามบินไป KL Sentral แล้วต่อ ETS ขึ้นเหนือสู่อิโปห์ (~2.5 ชม.)",
        id: "Terbang ke Kuala Lumpur, naik kereta bandara ke KL Sentral, lalu ETS ke Ipoh (~2,5 jam).",
        zh: "飞抵吉隆坡，乘机场快铁至KL Sentral，再转ETS北上怡保（约2.5小时）。",
      },
    },
    depart: {
      title: { en: "Ipoh → KL Sentral → KLIA", ms: "Ipoh → KL Sentral → KLIA", th: "อิโปห์ → KL Sentral → KLIA", id: "Ipoh → KL Sentral → KLIA", zh: "怡保 → KL Sentral → KLIA" },
    },
    pay: {
      en: "Indonesian QRIS apps can scan DuitNow QR at participating Malaysian sellers.",
      ms: "Aplikasi QRIS Indonesia boleh imbas DuitNow QR di peniaga Malaysia yang menyertai.",
      th: "แอป QRIS ของอินโดนีเซียสแกน DuitNow QR ที่ร้านค้ามาเลเซียที่ร่วมรายการได้",
      id: "Aplikasi QRIS Indonesia dapat memindai DuitNow QR di penjual Malaysia yang berpartisipasi.",
      zh: "印尼QRIS App可在参与的马来西亚商家扫描DuitNow QR付款。",
    },
  },
};

// --- Stops -------------------------------------------------------------------
// spend = rough RM estimate per person; seller = community seller key or null.
const STOPS = {
  oldtown: {
    name: "Ipoh Old Town & Concubine Lane", district: "Kinta", spend: 30, seller: "guide_ipoh",
    desc: {
      en: "Guided walk past heritage shophouses, murals and Concubine Lane.",
      ms: "Jalan berpandu melihat rumah kedai warisan, mural dan Lorong Panglima.",
      th: "เดินเที่ยวพร้อมไกด์ ชมตึกแถวเก่า ภาพจิตรกรรมฝาผนัง และ Concubine Lane",
      id: "Jalan-jalan berpemandu melihat ruko warisan, mural, dan Concubine Lane.",
      zh: "导游带领漫步老街店屋、壁画与二奶巷。",
    },
  },
  food_ipoh: {
    name: "Ipoh white coffee & bean sprout chicken", district: "Kinta", spend: 25, seller: null,
    desc: {
      en: "Taste Ipoh's signature white coffee and bean sprout chicken.",
      ms: "Rasa kopi putih dan ayam tauge Ipoh yang terkenal.",
      th: "ลิ้มรสกาแฟขาวและไก่ถั่วงอกขึ้นชื่อของอิโปห์",
      id: "Cicipi kopi putih dan ayam tauge khas Ipoh.",
      zh: "品尝怡保招牌白咖啡与芽菜鸡。",
    },
  },
  food_ipoh_halal: {
    name: "Nasi ganja & Ipoh white coffee", district: "Kinta", spend: 20, seller: null, halal: true,
    desc: {
      en: "Muslim-friendly dinner: Ipoh's famous nasi kandar-style 'nasi ganja' and white coffee.",
      ms: "Makan malam mesra Muslim: 'nasi ganja' Ipoh yang terkenal dan kopi putih.",
      th: "มื้อค่ำฮาลาล: 'นาซิกันจา' ข้าวราดแกงชื่อดังของอิโปห์ กับกาแฟขาว",
      id: "Makan malam ramah Muslim: 'nasi ganja' khas Ipoh dan kopi putih.",
      zh: "穆斯林友好晚餐：怡保著名的“nasi ganja”咖喱饭与白咖啡。",
    },
  },
  night_kinta: {
    name: "Kinta Riverwalk & night stalls", district: "Kinta", spend: 40, seller: "night_kinta",
    desc: {
      en: "Evening by the river with snacks and crafts from small local traders.",
      ms: "Malam di tepi sungai dengan makanan ringan dan kraf daripada peniaga kecil tempatan.",
      th: "ยามเย็นริมแม่น้ำ กับของกินและงานฝีมือจากพ่อค้าแม่ค้ารายย่อย",
      id: "Malam di tepi sungai dengan jajanan dan kerajinan dari pedagang kecil lokal.",
      zh: "傍晚漫步河畔，品尝本地小贩的小吃与手工艺品。",
    },
  },
  stay_ipoh: {
    name: "Overnight: Ipoh heritage homestay", district: "Kinta", spend: 120, seller: "stay_ipoh", stay: true,
    desc: {
      en: "Family-run homestay in town.", ms: "Homestay keluarga di bandar.", th: "โฮมสเตย์ที่ครอบครัวท้องถิ่นดูแลในตัวเมือง",
      id: "Homestay keluarga di kota.", zh: "市区家庭经营的民宿。",
    },
  },

  // Full day: heritage
  kk_royal: {
    name: "Ubudiah Mosque & Royal Museum, Kuala Kangsar", district: "Kuala Kangsar", spend: 15, seller: null, halal: true,
    desc: {
      en: "Perak's royal town: the golden-domed Ubudiah Mosque and the old palace museum.",
      ms: "Bandar diraja Perak: Masjid Ubudiah berkubah emas dan muzium istana lama.",
      th: "เมืองแห่งราชวงศ์เประ: มัสยิดอูบูดียาห์โดมทองคำ และพิพิธภัณฑ์พระราชวังเก่า",
      id: "Kota kerajaan Perak: Masjid Ubudiah berkubah emas dan museum istana lama.",
      zh: "霹雳皇城：金顶乌布迪亚清真寺与旧皇宫博物馆。",
    },
  },
  sayong: {
    name: "Labu Sayong pottery workshop, Kampung Sayong", district: "Kuala Kangsar", spend: 50, seller: "craft_sayong",
    desc: {
      en: "Make your own black clay 'labu' gourd with village potters.",
      ms: "Hasilkan labu tanah liat hitam sendiri bersama tukang tembikar kampung.",
      th: "ปั้นคนโทดินเผาสีดำ 'ลาบู' กับช่างปั้นในหมู่บ้าน",
      id: "Buat kendi tanah liat hitam 'labu' bersama perajin desa.",
      zh: "与村里的陶艺师一起制作黑陶葫芦“Labu”。",
    },
  },
  lenggong: {
    name: "Lenggong Valley archaeological heritage (UNESCO)", district: "Hulu Perak", spend: 60, seller: "guide_lenggong",
    desc: {
      en: "Community guide through the UNESCO-listed valley, home of Perak Man.",
      ms: "Pemandu komuniti di lembah tapak warisan UNESCO, tempat ditemui Orang Perak.",
      th: "ไกด์ชุมชนพาชมหุบเขาเล็งกงซึ่งเป็นมรดกโลก UNESCO แหล่งค้นพบ 'มนุษย์เประ'",
      id: "Pemandu komunitas di lembah warisan UNESCO, tempat ditemukannya Manusia Perak.",
      zh: "社区导游带您游览联合国教科文组织世界遗产玲珑谷——“霹雳人”的故乡。",
    },
  },
  stay_sayong: {
    name: "Overnight: Kampung Sayong homestay", district: "Kuala Kangsar", spend: 110, seller: "stay_sayong", stay: true,
    desc: {
      en: "Riverside village homestay.", ms: "Homestay kampung di tepi sungai.", th: "โฮมสเตย์หมู่บ้านริมแม่น้ำ",
      id: "Homestay desa di tepi sungai.", zh: "河畔乡村民宿。",
    },
  },

  // Full day: nature
  tempurung: {
    name: "Gua Tempurung cave tour", district: "Kampar", spend: 40, seller: null,
    desc: {
      en: "One of Peninsular Malaysia's largest limestone caves.",
      ms: "Antara gua batu kapur terbesar di Semenanjung Malaysia.",
      th: "หนึ่งในถ้ำหินปูนที่ใหญ่ที่สุดในคาบสมุทรมาเลเซีย",
      id: "Salah satu gua kapur terbesar di Semenanjung Malaysia.",
      zh: "马来西亚半岛最大的石灰岩溶洞之一。",
    },
  },
  gopeng: {
    name: "Gopeng river & waterfall with village hosts", district: "Kampar", spend: 80, seller: "eco_gopeng",
    desc: {
      en: "River and waterfall trail run by local eco-community operators.",
      ms: "Aktiviti sungai dan air terjun dikendalikan pengusaha eko-komuniti tempatan.",
      th: "เส้นทางแม่น้ำและน้ำตกที่ดำเนินการโดยชุมชนท้องถิ่น",
      id: "Wisata sungai dan air terjun yang dikelola komunitas eko lokal.",
      zh: "由本地生态社区经营的河流与瀑布路线。",
    },
  },
  tambun_springs: {
    name: "Tambun hot springs evening", district: "Kinta", spend: 60, seller: null,
    desc: {
      en: "Soak in natural hot springs surrounded by limestone hills.",
      ms: "Berendam di kolam air panas semula jadi dikelilingi bukit batu kapur.",
      th: "แช่น้ำพุร้อนธรรมชาติท่ามกลางภูเขาหินปูน",
      id: "Berendam di pemandian air panas alami dikelilingi bukit kapur.",
      zh: "在石灰岩山环绕中享受天然温泉。",
    },
  },
  stay_gopeng: {
    name: "Overnight: Gopeng eco-homestay", district: "Kampar", spend: 110, seller: "stay_gopeng", stay: true,
    desc: {
      en: "Kampung eco-homestay near the river.", ms: "Eko-homestay kampung berhampiran sungai.", th: "โฮมสเตย์เชิงนิเวศใกล้แม่น้ำ",
      id: "Eco-homestay kampung dekat sungai.", zh: "河边的乡村生态民宿。",
    },
  },

  // Full day: food
  breakfast_trail: {
    name: "Ipoh breakfast trail", district: "Kinta", spend: 30, seller: "guide_ipoh",
    desc: {
      en: "Dim sum, roti canai and nasi lemak with a local host (Muslim-friendly route available).",
      ms: "Dim sum, roti canai dan nasi lemak bersama hos tempatan (laluan mesra Muslim tersedia).",
      th: "ติ่มซำ โรตีจาไน และนาซิเลอมัก กับโฮสต์ท้องถิ่น (มีเส้นทางฮาลาล)",
      id: "Dim sum, roti canai, dan nasi lemak bersama tuan rumah lokal (tersedia rute ramah Muslim).",
      zh: "与本地向导品尝点心、印度煎饼和椰浆饭（可选穆斯林友好路线）。",
    },
  },
  pomelo: {
    name: "Tambun pomelo farm", district: "Kinta", spend: 30, seller: "pomelo_tambun",
    desc: {
      en: "Meet the growers behind Perak's famous pomelo and buy direct.",
      ms: "Bertemu penanam limau bali Tambun yang terkenal dan beli terus.",
      th: "พบเกษตรกรผู้ปลูกส้มโอทัมบุนขึ้นชื่อ และซื้อตรงจากสวน",
      id: "Bertemu petani jeruk bali Tambun yang terkenal dan beli langsung.",
      zh: "拜访著名的打扪柚子果农，直接购买。",
    },
  },
  cafe_murals: {
    name: "Ipoh cafés & murals afternoon", district: "Kinta", spend: 30, seller: null,
    desc: {
      en: "Slow afternoon in heritage cafés and mural lanes.",
      ms: "Petang santai di kafe warisan dan lorong mural.",
      th: "บ่ายสบาย ๆ ในคาเฟ่เก่าและตรอกภาพวาดฝาผนัง",
      id: "Sore santai di kafe warisan dan gang mural.",
      zh: "在老式咖啡馆和壁画小巷度过悠闲午后。",
    },
  },
  night_food: {
    name: "Night market food tour", district: "Kinta", spend: 50, seller: "night_kinta",
    desc: {
      en: "Hosted tasting walk through local night stalls.",
      ms: "Lawatan rasa berpandu di gerai malam tempatan.",
      th: "เดินชิมอาหารตลาดกลางคืนพร้อมโฮสต์",
      id: "Tur cicip jajanan pasar malam bersama pemandu.",
      zh: "由向导带领的夜市美食之旅。",
    },
  },

  // Full day: island
  pangkor_ferry: {
    name: "Lumut jetty → Pangkor Island ferry", district: "Manjung", spend: 30, seller: null,
    desc: {
      en: "Short ferry ride from Lumut to Pangkor Island.",
      ms: "Perjalanan feri singkat dari Lumut ke Pulau Pangkor.",
      th: "นั่งเรือเฟอร์รี่ระยะสั้นจากลูมุตไปเกาะปังกอร์",
      id: "Naik feri singkat dari Lumut ke Pulau Pangkor.",
      zh: "从红土坎搭乘短程渡轮前往邦咯岛。",
    },
  },
  pangkor_boat: {
    name: "Pangkor fishing village & beaches by local boat", district: "Manjung", spend: 80, seller: "boat_pangkor",
    desc: {
      en: "Island hop with a fisherman's family boat and see the dried-fish trade.",
      ms: "Jelajah pulau dengan bot keluarga nelayan dan lihat industri ikan kering.",
      th: "ล่องเรือของครอบครัวชาวประมง และชมการทำปลาแห้ง",
      id: "Jelajah pulau dengan perahu keluarga nelayan dan lihat usaha ikan asin.",
      zh: "乘渔民家庭的船跳岛游，参观咸鱼作坊。",
    },
  },
  pangkor_dinner: {
    name: "Pangkor seafood & satay ikan", district: "Manjung", spend: 60, seller: null,
    desc: {
      en: "Fresh seafood dinner and Pangkor's sweet fish satay.",
      ms: "Makan malam makanan laut segar dan satay ikan Pangkor.",
      th: "มื้อค่ำซีฟู้ดสด และสะเต๊ะปลาหวานของปังกอร์",
      id: "Makan malam hidangan laut segar dan sate ikan Pangkor.",
      zh: "新鲜海鲜晚餐与邦咯特产鱼沙爹。",
    },
  },
  stay_pangkor: {
    name: "Overnight: Pangkor village chalet", district: "Manjung", spend: 130, seller: "stay_pangkor", stay: true,
    desc: {
      en: "Family chalet by the beach.", ms: "Chalet keluarga di tepi pantai.", th: "ชาเลต์ครอบครัวริมชายหาด",
      id: "Chalet keluarga di tepi pantai.", zh: "海边的家庭木屋。",
    },
  },

  // Last morning
  kellie: {
    name: "Kellie's Castle, Batu Gajah", district: "Kinta", spend: 15, seller: null,
    desc: {
      en: "The unfinished mansion of a Scottish planter, set in old rubber estates.",
      ms: "Rumah agam tidak siap milik peladang Scotland di tengah ladang getah lama.",
      th: "คฤหาสน์ที่สร้างไม่เสร็จของเจ้าของสวนชาวสกอต กลางสวนยางเก่า",
      id: "Rumah megah belum selesai milik pekebun Skotlandia di tengah kebun karet lama.",
      zh: "苏格兰园主未完工的古堡，坐落于旧橡胶园中。",
    },
  },
  souvenirs: {
    name: "Souvenirs: pomelo & kampung crafts", district: "Kinta", spend: 40, seller: "pomelo_tambun",
    desc: {
      en: "Take home Tambun pomelo and handmade crafts, bought straight from the makers.",
      ms: "Bawa pulang limau bali Tambun dan kraf tangan, dibeli terus daripada pembuat.",
      th: "ซื้อส้มโอทัมบุนและงานหัตถกรรมกลับบ้าน ตรงจากผู้ผลิต",
      id: "Bawa pulang jeruk bali Tambun dan kerajinan tangan, langsung dari pembuatnya.",
      zh: "直接向生产者购买打扪柚子和手工艺品带回家。",
    },
  },
};

// Full-day blocks, keyed by interest. Each ends with an overnight stay.
const DAY_BLOCKS = {
  heritage: ["kk_royal", "sayong", "lenggong", "stay_sayong"],
  nature:   ["tempurung", "gopeng", "tambun_springs", "stay_gopeng"],
  food:     ["breakfast_trail", "pomelo", "cafe_murals", "night_food", "stay_ipoh"],
  beach:    ["pangkor_ferry", "pangkor_boat", "pangkor_dinner", "stay_pangkor"],
};
const INTERESTS = ["heritage", "nature", "food", "beach"];
const ARRIVAL_DAY = ["oldtown", "food_ipoh", "night_kinta", "stay_ipoh"];
const LAST_MORNING = ["kellie", "souvenirs"];

const TIMES_ARRIVAL = ["15:30", "18:00", "20:00", "22:00"];
const TIMES_FULL = ["09:00", "11:30", "14:30", "18:30", "21:30"];
const TIMES_LAST = ["08:30", "10:30"];

// Build a plan: { origin, days, nights, items: [{day, time, kind, ...}], totals }
function buildPlan(originKey, days, interests, halal) {
  const order = interests.length ? interests.slice() : [];
  for (const i of INTERESTS) if (!order.includes(i)) order.push(i);

  const items = [];
  const push = (day, time, key) => {
    let k = key;
    if (halal && k === "food_ipoh") k = "food_ipoh_halal";
    items.push({ day, time, kind: "stop", key: k, ...STOPS[k] });
  };

  // Day 1: arrive + Ipoh evening
  items.push({ day: 1, time: ORIGINS[originKey].arrive.time, kind: "rail", leg: "arrive" });
  ARRIVAL_DAY.forEach((k, i) => push(1, TIMES_ARRIVAL[i], k));

  // Middle full days
  const fullDays = days - 2;
  for (let d = 0; d < fullDays; d++) {
    const block = DAY_BLOCKS[order[d % order.length]];
    const times = block.length === 5 ? TIMES_FULL : [TIMES_FULL[0], TIMES_FULL[1], TIMES_FULL[2], TIMES_FULL[4]];
    block.forEach((k, i) => push(d + 2, times[i], k));
  }

  // Last day: short morning, then rail home
  LAST_MORNING.forEach((k, i) => push(days, TIMES_LAST[i], k));
  items.push({ day: days, time: "12:30", kind: "rail", leg: "depart" });

  const stops = items.filter((x) => x.kind === "stop");
  const total = stops.reduce((s, x) => s + x.spend, 0);
  const kampung = stops.filter((x) => x.seller).reduce((s, x) => s + x.spend, 0);
  const byDistrict = {};
  for (const s of stops) byDistrict[s.district] = (byDistrict[s.district] || 0) + s.spend;
  const sellers = [...new Set(stops.filter((x) => x.seller).map((x) => x.seller))];

  return { origin: originKey, days, nights: days - 1, items, total, kampung, byDistrict, sellers };
}

// --- Bookings (demo) -------------------------------------------------------------
const BOOKINGS_KEY = "singgahperak_bookings";

function loadBookings() {
  try {
    return JSON.parse(localStorage.getItem(BOOKINGS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveBooking(plan) {
  const list = loadBookings();
  list.push({
    ts: Date.now(), origin: plan.origin, nights: plan.nights,
    total: plan.total, kampung: plan.kampung, byDistrict: plan.byDistrict, live: true,
  });
  try {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable: booking just won't persist */
  }
}

function clearBookings() {
  try {
    localStorage.removeItem(BOOKINGS_KEY);
  } catch {
    /* ignore */
  }
}

// Deterministic sample bookings so the dashboard never starts empty.
function sampleBookings(n = 60) {
  let seed = 2026;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const originWeights = [["th", 0.4], ["sg", 0.35], ["id", 0.25]];
  const pick = (pairs) => {
    let r = rand();
    for (const [v, w] of pairs) if ((r -= w) <= 0) return v;
    return pairs[pairs.length - 1][0];
  };
  const out = [];
  const now = Date.now();
  for (let i = 0; i < n; i++) {
    const origin = pick(originWeights);
    const days = Number(pick([["2", 0.35], ["3", 0.45], ["4", 0.2]]));
    const interest = INTERESTS[Math.floor(rand() * INTERESTS.length)];
    const plan = buildPlan(origin, days, [interest], origin === "id" && rand() < 0.8);
    out.push({
      ts: now - Math.floor(rand() * 60) * 86400000, origin, nights: plan.nights,
      total: plan.total, kampung: plan.kampung, byDistrict: plan.byDistrict, live: false,
    });
  }
  return out;
}
