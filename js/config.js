// HanziGrammar - Global Configuration & Constants (Bidirectional Chinese <-> Thai)

export const CONFIG = {
  GEMINI_MODEL: "gemini-1.5-flash",
  GEMINI_ENDPOINT_BASE: "https://generativelanguage.googleapis.com/v1beta/models/",
  CLOUDFLARE_PROXY_ENDPOINT: "/api/analyze",
  DEFAULT_SPEECH_RATE: 0.85,
  MAX_RPM: 15,
  STORAGE_KEYS: {
    API_KEY: "hanzi_gemini_api_key",
    CUSTOM_ENDPOINT: "hanzi_custom_endpoint",
    SETTINGS: "hanzi_settings",
    HISTORY: "hanzi_history_v2",
    BOOKMARKS: "hanzi_bookmarks_v2"
  }
};

export const ROLE_DEFINITIONS = {
  subject: {
    nameTh: "ประธาน / คำนาม (Subject)",
    badgeTh: "ประธาน",
    colorClass: "role-subject",
    bgLight: "bg-sky-100",
    textLight: "text-sky-900",
    borderLight: "border-sky-300",
    dotColor: "bg-sky-500",
    descriptionTh: "ผู้กระทำหรือหัวข้อหลักของประโยค"
  },
  predicate: {
    nameTh: "ภาคแสดง / กริยา (Predicate/Verb)",
    badgeTh: "กริยา",
    colorClass: "role-predicate",
    bgLight: "bg-emerald-100",
    textLight: "text-emerald-900",
    borderLight: "border-emerald-300",
    dotColor: "bg-emerald-500",
    descriptionTh: "การกระทำ การเคลื่อนไหว หรือสภาพที่เป็นอยู่"
  },
  object: {
    nameTh: "กรรม / ส่วนรับกรรม (Object)",
    badgeTh: "กรรม",
    colorClass: "role-object",
    bgLight: "bg-amber-100",
    textLight: "text-amber-900",
    borderLight: "border-amber-300",
    dotColor: "bg-amber-500",
    descriptionTh: "ผู้ถูกกระทำหรือเป้าหมายของการกระทำ"
  },
  attributive: {
    nameTh: "ส่วนขยายคำนาม (Attributive / 定语)",
    badgeTh: "ขยายนาม",
    colorClass: "role-attributive",
    bgLight: "bg-yellow-100",
    textLight: "text-yellow-900",
    borderLight: "border-yellow-300",
    dotColor: "bg-yellow-500",
    descriptionTh: "คุณลักษณะที่วางหน้านาม เช่น '我的', '漂亮的'"
  },
  adverbial: {
    nameTh: "ส่วนขยายกริยา (Adverbial / 状语)",
    badgeTh: "ขยายกริยา",
    colorClass: "role-adverbial",
    bgLight: "bg-indigo-100",
    textLight: "text-indigo-900",
    borderLight: "border-indigo-300",
    dotColor: "bg-indigo-500",
    descriptionTh: "ขยายลักษณะการกระทำ เช่น '慢慢地', '非常'"
  },
  complement: {
    nameTh: "ส่วนเติมเต็ม (Complement / 补语)",
    badgeTh: "ส่วนเติมเต็ม",
    colorClass: "role-complement",
    bgLight: "bg-teal-100",
    textLight: "text-teal-900",
    borderLight: "border-teal-300",
    dotColor: "bg-teal-500",
    descriptionTh: "บอกผลลัพธ์ ทิศทาง หรือระดับที่ตามหลังกริยา เช่น '完', '懂', '出来'"
  },
  grammar_marker: {
    nameTh: "ไวยากรณ์พิเศษ / คำช่วย (Grammar Marker)",
    badgeTh: "ไวยากรณ์",
    colorClass: "role-grammar-marker",
    bgLight: "bg-purple-100",
    textLight: "text-purple-900",
    borderLight: "border-purple-300",
    dotColor: "bg-purple-500",
    descriptionTh: "คำกำหนดโครงสร้างพิเศษ เช่น '把', '被', '比', '是...的', '着/了/过'"
  },
  time_location: {
    nameTh: "เวลา / สถานที่ (Time & Location)",
    badgeTh: "เวลา/สถานที่",
    colorClass: "role-time-location",
    bgLight: "bg-rose-100",
    textLight: "text-rose-900",
    borderLight: "border-rose-300",
    dotColor: "bg-rose-500",
    descriptionTh: "บริบทด้านเวลาหรือสถานที่ของเหตุการณ์"
  }
};

export const DEMO_PRESETS = [
  // Chinese -> Thai Presets
  {
    title: "🇨🇳 โครงสร้าง 把",
    text: "我昨天把那本书看完了。",
    lang: "zh"
  },
  {
    title: "🇨🇳 ประโยคกรรม ถูกกระทำ (被)",
    text: "桌子上的苹果被弟弟吃掉了。",
    lang: "zh"
  },
  {
    title: "🇨🇳 เน้นย้ำ (是...的)",
    text: "他是去年坐飞机去北京学习汉语的。",
    lang: "zh"
  },
  // Thai -> Chinese Presets
  {
    title: "🇹🇭 ฉันอ่านหนังสือจบแล้วเมื่อวานนี้",
    text: "เมื่อวานนี้ฉันอ่านหนังสือเล่มนั้นจบแล้ว",
    lang: "th"
  },
  {
    title: "🇹🇭 แอปเปิ้ลถูกน้องกินไปแล้ว",
    text: "แอปเปิ้ลบนโต๊ะถูกน้องชายกินหมดแล้ว",
    lang: "th"
  },
  {
    title: "🇹🇭 อากาศวันนี้หนาวกว่าเมื่อวานมาก",
    text: "สภาพอากาศของปักกิ่งวันนี้หนาวกว่าเมื่อวานมาก",
    lang: "th"
  }
];

export const GEMINI_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    sourceLang: { type: "STRING", enum: ["zh", "th"] },
    originalText: { type: "STRING" },
    sentenceType: { type: "STRING" },
    naturalThaiTranslation: { type: "STRING" },
    literalThaiTranslation: { type: "STRING" },
    grammarSummaryTh: { type: "STRING" },
    tokens: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          id: { type: "STRING" },
          word: { type: "STRING" },
          pinyin: { type: "STRING" },
          chars: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                char: { type: "STRING" },
                pinyin: { type: "STRING" }
              },
              required: ["char", "pinyin"]
            }
          },
          pos: { type: "STRING" },
          syntacticRole: {
            type: "STRING",
            enum: [
              "subject",
              "predicate",
              "object",
              "attributive",
              "adverbial",
              "complement",
              "grammar_marker",
              "time_location"
            ]
          },
          roleLabelTh: { type: "STRING" },
          contextualMeaningTh: { type: "STRING" },
          hskLevel: { type: "INTEGER" }
        },
        required: ["id", "word", "pinyin", "chars", "pos", "syntacticRole", "roleLabelTh", "contextualMeaningTh"]
      }
    },
    grammarPoints: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          id: { type: "STRING" },
          titleTh: { type: "STRING" },
          pattern: { type: "STRING" },
          explanationTh: { type: "STRING" },
          associatedTokenIds: {
            type: "ARRAY",
            items: { type: "STRING" }
          }
        },
        required: ["id", "titleTh", "pattern", "explanationTh", "associatedTokenIds"]
      }
    }
  },
  required: [
    "sourceLang",
    "originalText",
    "sentenceType",
    "naturalThaiTranslation",
    "literalThaiTranslation",
    "grammarSummaryTh",
    "tokens",
    "grammarPoints"
  ]
};
