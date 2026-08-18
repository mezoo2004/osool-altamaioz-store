export type SpaceKey =
  | "majlis"
  | "living"
  | "bedroom"
  | "kitchen"
  | "office"
  | "restaurant"
  | "retail"
  | "facade"
  | "garden"
  | "outdoor";

export type MoodKey = "warm" | "luxury" | "modern" | "bright" | "practical";
export type CctKey = "3000" | "4000" | "6500";

export type SpaceRecommendation = {
  space: SpaceKey;
  cct: CctKey;
  mood: MoodKey;
  categories: string[];
  route: string;
  ar: string;
  en: string;
  arWhy: string;
  enWhy: string;
  alternative: { cct: CctKey; ar: string; en: string };
};

export const SPACE_LABELS: Record<SpaceKey, { ar: string; en: string }> = {
  majlis: { ar: "المجلس", en: "Majlis" },
  living: { ar: "الصالة", en: "Living room" },
  bedroom: { ar: "غرفة النوم", en: "Bedroom" },
  kitchen: { ar: "المطبخ", en: "Kitchen" },
  office: { ar: "المكتب", en: "Office" },
  restaurant: { ar: "المطعم", en: "Restaurant" },
  retail: { ar: "المتجر", en: "Retail" },
  facade: { ar: "الواجهة", en: "Facade" },
  garden: { ar: "الحديقة", en: "Garden" },
  outdoor: { ar: "الخارجي", en: "Outdoor" },
};

export const SPACE_RECOMMENDATIONS: Record<SpaceKey, SpaceRecommendation> = {
  majlis: {
    space: "majlis",
    cct: "3000",
    mood: "warm",
    categories: ["indoor", "decorative", "cob-spotlights"],
    route: "/spaces/majlis",
    ar: "للمجلس أنصح بإضاءة دافئة 3000K مع سبوتات مخفية وإضاءة جدارية تنعكس على الخشب والجدران — جو ضيافة هادئ وفاخر.\n\nاستكشف: /spaces/majlis",
    en: "For a majlis, I recommend warm 3000K with concealed spots and wall washing on wood and stone — calm, luxurious hospitality.\n\nExplore: /spaces/majlis",
    arWhy:
      "رشحت لك 3000K لأنها تعطي المجلس جواً أدفى وأهدأ وتناسب الضيافة والاسترخاء أكثر من الإضاءة البيضاء القوية.",
    enWhy:
      "I recommended 3000K because it creates a warmer, calmer majlis atmosphere — better for hospitality and relaxation than harsh cool white.",
    alternative: {
      cct: "4000",
      ar: "بديل أنيق: 4000K مع نجفة أو إضاءة تزيينية مركزية — فخامة أوضح مع وضوح أفضل للتفاصيل.",
      en: "Elegant alternative: 4000K with a chandelier or focal decorative fixture — clearer luxury with better detail visibility.",
    },
  },
  living: {
    space: "living",
    cct: "3000",
    mood: "luxury",
    categories: ["indoor", "decorative", "chandeliers"],
    route: "/spaces/living-room",
    ar: "للصالة أنصح بمزيج طبقات: 3000K للجو العام مع إضاءة تزيينية مركزية وخطوط LED غير مباشرة في السقف.\n\nاستكشف: /spaces/living-room",
    en: "For the living room, layer 3000K ambient light with a decorative focal and indirect ceiling LED lines.\n\nExplore: /spaces/living-room",
    arWhy: "اخترت 3000K لأن الصالة تحتاج دفء وعمق بصري — مريحة للجلوس الطويل دون إجهاد العين.",
    enWhy: "I chose 3000K because living rooms need warmth and visual depth — comfortable for long seating without eye strain.",
    alternative: {
      cct: "4000",
      ar: "بديل مودرن: 4000K مع سبوتات نظيفة وإضاءة خطية — مظهر معاصر وأكثر إشراقاً.",
      en: "Modern alternative: 4000K with clean spots and linear accents — contemporary and brighter.",
    },
  },
  bedroom: {
    space: "bedroom",
    cct: "3000",
    mood: "warm",
    categories: ["indoor", "decorative"],
    route: "/spaces/bedroom",
    ar: "لغرفة النوم: 3000K مع إضاءة جانبية خافتة وإضاءة سقف مخفية — أجواء هادئة قبل النوم.\n\nاستكشف: /spaces/bedroom",
    en: "For bedrooms: 3000K with soft bedside accents and concealed ceiling glow — restful pre-sleep ambience.\n\nExplore: /spaces/bedroom",
    arWhy: "3000K مثالية للنوم والراحة — أقل إزعاجاً للإيقاع اليومي من الإضاءة البيضاء.",
    enWhy: "3000K is ideal for rest — less disruptive to your rhythm than cool white light.",
    alternative: {
      cct: "4000",
      ar: "بديل للقراءة: 4000K مع مصباح قراءة موجه — أوضح للكتب دون إفراط في البرودة.",
      en: "Reading alternative: 4000K with a directed reading lamp — clearer for books without excessive coolness.",
    },
  },
  kitchen: {
    space: "kitchen",
    cct: "4000",
    mood: "practical",
    categories: ["indoor", "panel-lights", "cob-spotlights"],
    route: "/spaces/kitchen",
    ar: "للمطبخ: 4000K مع إضاءة تحت الخزائن وسبوتات فوق منطقة العمل — وضوح للتحضير مع مظهر أنيق.\n\nاستكشف: /spaces/kitchen",
    en: "For kitchens: 4000K with under-cabinet and task spots over work zones — prep clarity with refined look.\n\nExplore: /spaces/kitchen",
    arWhy: "4000K توازن مثالي للمطبخ — وضوح للتحضير دون برودة 6500K القاسية.",
    enWhy: "4000K balances kitchen tasks — prep clarity without the harshness of 6500K.",
    alternative: {
      cct: "3000",
      ar: "بديل دافئ: 3000K في مناطق تناول الطعام فقط — جو عائلي أدفى.",
      en: "Warm alternative: 3000K in dining zones only — a softer family mood.",
    },
  },
  office: {
    space: "office",
    cct: "4000",
    mood: "modern",
    categories: ["indoor", "panel-lights"],
    route: "/spaces/office",
    ar: "للمكتب: 4000K مع إضاءة سقف موحدة وسبوتات على مكتب العمل — تركيز وعملية.\n\nاستكشف: /spaces/office",
    en: "For offices: 4000K with uniform ceiling light and desk-focused spots — focus and practicality.\n\nExplore: /spaces/office",
    arWhy: "4000K تدعم التركيز والوضوح في المكتب دون إجهاد مثل الإضاءة البيضاء القوية.",
    enWhy: "4000K supports focus and clarity without the fatigue of strong cool white.",
    alternative: {
      cct: "3000",
      ar: "بديل للاجتماعات: 3000K في غرفة الاجتماعات — أجواء أهدأ للنقاش.",
      en: "Meeting alternative: 3000K in meeting areas — calmer discussion ambience.",
    },
  },
  restaurant: {
    space: "restaurant",
    cct: "3000",
    mood: "luxury",
    categories: ["indoor", "decorative"],
    route: "/spaces/restaurant",
    ar: "للمطعم: 3000K مع إضاءة موجهة على الطاولات وطبقات خافتة في الممرات — تجربة ضيافة فاخرة.\n\nاستكشف: /spaces/restaurant",
    en: "For restaurants: 3000K with table-focused pools and soft aisle layers — premium hospitality.\n\nExplore: /spaces/restaurant",
    arWhy: "3000K تبرز الطعام والجلوس وتخلق أجواء مطعم فاخر دون إضاءة مسرحية قاسية.",
    enWhy: "3000K highlights dining and seating with premium mood — not harsh theatrical light.",
    alternative: {
      cct: "4000",
      ar: "بديل عصري: 4000K في المطبخ المفتوح — وضوح للعرض مع دفء معتدل.",
      en: "Contemporary alternative: 4000K in open kitchens — display clarity with moderate warmth.",
    },
  },
  retail: {
    space: "retail",
    cct: "4000",
    mood: "bright",
    categories: ["indoor", "track-lights", "cob-spotlights"],
    route: "/spaces/retail-store",
    ar: "للمتجر: 4000K مع تراكات وسبوتات موجهة على المنتجات — إبراز العرض باحترافية.\n\nاستكشف: /spaces/retail-store",
    en: "For retail: 4000K with tracks and product-focused spots — professional merchandising.\n\nExplore: /spaces/retail-store",
    arWhy: "4000K تُظهر ألوان المنتجات بدقة دون مبالغة في البرودة.",
    enWhy: "4000K renders product colours accurately without excessive coolness.",
    alternative: {
      cct: "3000",
      ar: "بديل بوتيك فاخر: 3000K في مناطق العرض المميز — جو أكثر دفئاً وفخامة.",
      en: "Boutique alternative: 3000K in premium display zones — warmer luxury mood.",
    },
  },
  facade: {
    space: "facade",
    cct: "3000",
    mood: "luxury",
    categories: ["outdoor", "floodlights"],
    route: "/spaces/facade",
    ar: "للواجهة: إضاءة معمارية دافئة 3000K مع كشافات مخفية وإبراز الحجر والتفاصيل — مظهر ليلي فاخر.\n\nاستكشف: /spaces/facade",
    en: "For facades: warm 3000K architectural uplights highlighting stone and details — premium night presence.\n\nExplore: /spaces/facade",
    arWhy: "3000K على الواجهة تعطي حضوراً فاخراً ودافئاً — أنسب للمعمار السكني والتجاري الراقي.",
    enWhy: "3000K on facades gives warm, premium presence — suited to upscale architecture.",
    alternative: {
      cct: "4000",
      ar: "بديل معاصر: 4000K لخطوط هندسية أوضح — مظهر حديث أكثر حدة.",
      en: "Contemporary alternative: 4000K for sharper geometric lines — a crisper modern look.",
    },
  },
  garden: {
    space: "garden",
    cct: "3000",
    mood: "warm",
    categories: ["outdoor", "floodlights"],
    route: "/spaces/garden",
    ar: "للحديقة: 3000K مع إضاءة أرضية للمسارات وإبراز الأشجار — أجواء مسائية فاخرة.\n\nاستكشف: /spaces/garden",
    en: "For gardens: 3000K with path lighting and tree accents — premium evening ambience.\n\nExplore: /spaces/garden",
    arWhy: "3000K في الحديقة تخلق أجواء مسائية دافئة — مريحة للجلوس الخارجي.",
    enWhy: "3000K outdoors creates warm evening ambience — comfortable for outdoor seating.",
    alternative: {
      cct: "4000",
      ar: "بديل أمني: 4000K في الممرات الخلفية — وضوح أعلى مع مظهر نظيف.",
      en: "Security alternative: 4000K on rear paths — higher visibility with a clean look.",
    },
  },
  outdoor: {
    space: "outdoor",
    cct: "4000",
    mood: "practical",
    categories: ["outdoor"],
    route: "/categories/outdoor",
    ar: "للإضاءة الخارجية: 4000K مع كشافات LED مقاومة للعوامل — وضوح ومتانة.\n\nاستكشف: /categories/outdoor",
    en: "For outdoor lighting: 4000K weather-rated LED floods — clarity and durability.\n\nExplore: /categories/outdoor",
    arWhy: "4000K خارجياً توازن بين الوضوح والمظهر — مناسبة للمساحات الواسعة.",
    enWhy: "4000K outdoors balances visibility and aesthetics — suited to larger areas.",
    alternative: {
      cct: "3000",
      ar: "بديل دافئ: 3000K للواجهات والحدائق — جو أكثر رفاهية.",
      en: "Warm alternative: 3000K for facades and gardens — a more luxurious mood.",
    },
  },
};

export const CCT_EXPLANATIONS = {
  "3000": {
    ar: "3000K إضاءة دافئة — أصفر ذهبي مريح، مثالية للمجالس وغرف النوم والضيافة.",
    en: "3000K is warm light — comfortable golden tone, ideal for majlis, bedrooms and hospitality.",
  },
  "4000": {
    ar: "4000K إضاءة طبيعية — توازن بين الدفء والوضوح، ممتازة للمطابخ والمكاتب والمتاجر.",
    en: "4000K is neutral — balance of warmth and clarity, great for kitchens, offices and retail.",
  },
  "6500": {
    ar: "6500K إضاءة بيضاء باردة — وضوح عالٍ للمساحات التجارية والخارجية، قد تبدو قاسية للمعيشة.",
    en: "6500K is cool white — high visibility for commercial/outdoor, can feel harsh in living spaces.",
  },
} as const;
