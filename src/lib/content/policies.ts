/** Owner confirmation status for legal/business content — never invent final policies. */
export const BUSINESS_CONFIRMATION_REQUIRED = "BUSINESS_CONFIRMATION_REQUIRED" as const;

export type PolicySection = {
  headingAr: string;
  headingEn: string;
  bodyAr: string;
  bodyEn: string;
};

export type PolicyDefinition = {
  slug: string;
  confirmationStatus: typeof BUSINESS_CONFIRMATION_REQUIRED;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  sections: PolicySection[];
};

export const policies: Record<string, PolicyDefinition> = {
  shipping: {
    slug: "shipping",
    confirmationStatus: BUSINESS_CONFIRMATION_REQUIRED,
    titleAr: "سياسة الشحن | اصول التميز",
    titleEn: "Shipping Policy | Osool Altamaioz",
    descriptionAr: "معلومات الشحن والتوصيل — قيد التأكيد الرسمي.",
    descriptionEn: "Shipping and delivery information — pending official confirmation.",
    sections: [
      {
        headingAr: "نطاق التوصيل",
        headingEn: "Delivery coverage",
        bodyAr: "تفاصيل المدن والمناطق المشمولة بالتوصيل ستُنشر بعد التأكيد الرسمي من إدارة اصول التميز.",
        bodyEn: "Eligible cities and delivery zones will be published after official confirmation from Osool Altamaioz management.",
      },
      {
        headingAr: "مدة التوصيل",
        headingEn: "Delivery times",
        bodyAr: "المدد التقديرية للتوصيل المحلي وداخل المملكة ودول الخليج — BUSINESS_CONFIRMATION_REQUIRED.",
        bodyEn: "Estimated local, Saudi, and GCC delivery times — BUSINESS_CONFIRMATION_REQUIRED.",
      },
      {
        headingAr: "تكلفة الشحن",
        headingEn: "Shipping costs",
        bodyAr: "أسعار الشحن الرسمية للمتجر الإلكتروني — BUSINESS_CONFIRMATION_REQUIRED.",
        bodyEn: "Official online shipping rates — BUSINESS_CONFIRMATION_REQUIRED.",
      },
    ],
  },
  returns: {
    slug: "returns",
    confirmationStatus: BUSINESS_CONFIRMATION_REQUIRED,
    titleAr: "سياسة الاسترجاع والاستبدال | اصول التميز",
    titleEn: "Returns & Exchange Policy | Osool Altamaioz",
    descriptionAr: "شروط الاسترجاع والاستبدال — قيد التأكيد الرسمي.",
    descriptionEn: "Returns and exchange terms — pending official confirmation.",
    sections: [
      {
        headingAr: "الأهلية",
        headingEn: "Eligibility",
        bodyAr: "شروط قبول المرتجعات والاستبدال — BUSINESS_CONFIRMATION_REQUIRED.",
        bodyEn: "Conditions for accepting returns and exchanges — BUSINESS_CONFIRMATION_REQUIRED.",
      },
      {
        headingAr: "الإجراءات",
        headingEn: "Process",
        bodyAr: "خطوات طلب الاسترجاع أو الاستبدال — BUSINESS_CONFIRMATION_REQUIRED.",
        bodyEn: "Steps to request a return or exchange — BUSINESS_CONFIRMATION_REQUIRED.",
      },
    ],
  },
  warranty: {
    slug: "warranty",
    confirmationStatus: BUSINESS_CONFIRMATION_REQUIRED,
    titleAr: "سياسة الضمان | اصول التميز",
    titleEn: "Warranty Policy | Osool Altamaioz",
    descriptionAr: "شروط الضمان على المنتجات — قيد التأكيد الرسمي.",
    descriptionEn: "Product warranty terms — pending official confirmation.",
    sections: [
      {
        headingAr: "نطاق الضمان",
        headingEn: "Warranty scope",
        bodyAr: "تفاصيل الضمان حسب نوع المنتج والسلسلة — BUSINESS_CONFIRMATION_REQUIRED.",
        bodyEn: "Warranty details by product type and series — BUSINESS_CONFIRMATION_REQUIRED.",
      },
      {
        headingAr: "المطالبة بالضمان",
        headingEn: "Warranty claims",
        bodyAr: "إجراءات تقديم مطالبة ضمان — BUSINESS_CONFIRMATION_REQUIRED.",
        bodyEn: "How to submit a warranty claim — BUSINESS_CONFIRMATION_REQUIRED.",
      },
    ],
  },
  privacy: {
    slug: "privacy",
    confirmationStatus: BUSINESS_CONFIRMATION_REQUIRED,
    titleAr: "سياسة الخصوصية | اصول التميز",
    titleEn: "Privacy Policy | Osool Altamaioz",
    descriptionAr: "كيفية التعامل مع بيانات العملاء — قيد التأكيد الرسمي.",
    descriptionEn: "How customer data is handled — pending official confirmation.",
    sections: [
      {
        headingAr: "البيانات التي نجمعها",
        headingEn: "Data we collect",
        bodyAr: "أنواع البيانات الشخصية في الحساب والطلبات — BUSINESS_CONFIRMATION_REQUIRED.",
        bodyEn: "Personal data collected for accounts and orders — BUSINESS_CONFIRMATION_REQUIRED.",
      },
      {
        headingAr: "استخدام البيانات",
        headingEn: "How data is used",
        bodyAr: "أغراض المعالجة والاحتفاظ — BUSINESS_CONFIRMATION_REQUIRED.",
        bodyEn: "Processing purposes and retention — BUSINESS_CONFIRMATION_REQUIRED.",
      },
    ],
  },
  terms: {
    slug: "terms",
    confirmationStatus: BUSINESS_CONFIRMATION_REQUIRED,
    titleAr: "الشروط والأحكام | اصول التميز",
    titleEn: "Terms & Conditions | Osool Altamaioz",
    descriptionAr: "شروط استخدام المتجر — قيد التأكيد الرسمي.",
    descriptionEn: "Store terms of use — pending official confirmation.",
    sections: [
      {
        headingAr: "استخدام الموقع",
        headingEn: "Use of the website",
        bodyAr: "شروط التصفح والشراء — BUSINESS_CONFIRMATION_REQUIRED.",
        bodyEn: "Browsing and purchase terms — BUSINESS_CONFIRMATION_REQUIRED.",
      },
      {
        headingAr: "الطلبات والدفع",
        headingEn: "Orders and payment",
        bodyAr: "شروط تأكيد الطلبات وطرق الدفع — BUSINESS_CONFIRMATION_REQUIRED.",
        bodyEn: "Order confirmation and payment terms — BUSINESS_CONFIRMATION_REQUIRED.",
      },
    ],
  },
};

export function getPolicy(slug: string): PolicyDefinition | null {
  return policies[slug] ?? null;
}
