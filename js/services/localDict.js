// Local HSK 1-6 Vocabulary & Trie Data Structure with Forward Maximum Matching (FMM)

// High-frequency HSK 1-4 vocabulary database with rich linguistic metadata
export const HSK_LOCAL_DATA = {
  "我": { pinyin: "wǒ", chars: [{ char: "我", pinyin: "wǒ" }], meaningTh: "ฉัน / ผม", pos: "สรรพนาม", role: "subject", hsk: 1 },
  "你": { pinyin: "nǐ", chars: [{ char: "你", pinyin: "nǐ" }], meaningTh: "คุณ / เธอ", pos: "สรรพนาม", role: "subject", hsk: 1 },
  "他": { pinyin: "tā", chars: [{ char: "他", pinyin: "tā" }], meaningTh: "เขา (ผู้ชาย)", pos: "สรรพนาม", role: "subject", hsk: 1 },
  "她": { pinyin: "tā", chars: [{ char: "她", pinyin: "tā" }], meaningTh: "เธอ (ผู้หญิง)", pos: "สรรพนาม", role: "subject", hsk: 1 },
  "我们": { pinyin: "wǒ men", chars: [{ char: "我", pinyin: "wǒ" }, { char: "们", pinyin: "men" }], meaningTh: "พวกเรา", pos: "สรรพนาม", role: "subject", hsk: 1 },
  "学": { pinyin: "xué", chars: [{ char: "学", pinyin: "xué" }], meaningTh: "เรียน", pos: "กริยา", role: "predicate", hsk: 1 },
  "学习": { pinyin: "xué xí", chars: [{ char: "学", pinyin: "xué" }, { char: "习", pinyin: "xí" }], meaningTh: "เรียนรู้ / ศึกษา", pos: "กริยา", role: "predicate", hsk: 1 },
  "汉语": { pinyin: "hàn yǔ", chars: [{ char: "汉", pinyin: "hàn" }, { char: "语", pinyin: "yǔ" }], meaningTh: "ภาษาจีน", pos: "คำนาม", role: "object", hsk: 1 },
  "中文": { pinyin: "zhōng wén", chars: [{ char: "中", pinyin: "zhōng" }, { char: "文", pinyin: "wén" }], meaningTh: "ภาษาจีน", pos: "คำนาม", role: "object", hsk: 1 },
  "看": { pinyin: "kàn", chars: [{ char: "看", pinyin: "kàn" }], meaningTh: "ดู / อ่าน / มอง", pos: "กริยา", role: "predicate", hsk: 1 },
  "书": { pinyin: "shū", chars: [{ char: "书", pinyin: "shū" }], meaningTh: "หนังสือ", pos: "คำนาม", role: "object", hsk: 1 },
  "吃": { pinyin: "chī", chars: [{ char: "吃", pinyin: "chī" }], meaningTh: "กิน / รับประทาน", pos: "กริยา", role: "predicate", hsk: 1 },
  "喝": { pinyin: "hē", chars: [{ char: "喝", pinyin: "hē" }], meaningTh: "ดื่ม", pos: "กริยา", role: "predicate", hsk: 1 },
  "水": { pinyin: "shuǐ", chars: [{ char: "水", pinyin: "shuǐ" }], meaningTh: "น้ำ", pos: "คำนาม", role: "object", hsk: 1 },
  "茶": { pinyin: "chá", chars: [{ char: "茶", pinyin: "chá" }], meaningTh: "ชา", pos: "คำนาม", role: "object", hsk: 1 },
  "苹果": { pinyin: "píng guǒ", chars: [{ char: "苹", pinyin: "píng" }, { char: "果", pinyin: "guǒ" }], meaningTh: "แอปเปิ้ล", pos: "คำนาม", role: "object", hsk: 1 },
  "米饭": { pinyin: "mǐ fàn", chars: [{ char: "米", pinyin: "mǐ" }, { char: "饭", pinyin: "fàn" }], meaningTh: "ข้าวสวย", pos: "คำนาม", role: "object", hsk: 1 },
  "去": { pinyin: "qù", chars: [{ char: "去", pinyin: "qù" }], meaningTh: "ไป", pos: "กริยา", role: "predicate", hsk: 1 },
  "来": { pinyin: "lái", chars: [{ char: "来", pinyin: "lái" }], meaningTh: "มา", pos: "กริยา", role: "predicate", hsk: 1 },
  "北京": { pinyin: "běi jīng", chars: [{ char: "北", pinyin: "běi" }, { char: "京", pinyin: "jīng" }], meaningTh: "ปักกิ่ง", pos: "คำนามเฉพาะ", role: "time_location", hsk: 1 },
  "学校": { pinyin: "xué xiào", chars: [{ char: "学", pinyin: "xué" }, { char: "校", pinyin: "xiào" }], meaningTh: "โรงเรียน", pos: "คำนาม", role: "time_location", hsk: 1 },
  "中国": { pinyin: "zhōng guó", chars: [{ char: "中", pinyin: "zhōng" }, { char: "国", pinyin: "guó" }], meaningTh: "ประเทศจีน", pos: "คำนามเฉพาะ", role: "time_location", hsk: 1 },
  "老师": { pinyin: "lǎo shī", chars: [{ char: "老", pinyin: "lǎo" }, { char: "师", pinyin: "shī" }], meaningTh: "คุณครู / อาจารย์", pos: "คำนาม", role: "subject", hsk: 1 },
  "学生": { pinyin: "xué sheng", chars: [{ char: "学", pinyin: "xué" }, { char: "生", pinyin: "sheng" }], meaningTh: "นักเรียน", pos: "คำนาม", role: "subject", hsk: 1 },
  "朋友": { pinyin: "péng you", chars: [{ char: "朋", pinyin: "péng" }, { char: "友", pinyin: "you" }], meaningTh: "เพื่อน", pos: "คำนาม", role: "subject", hsk: 1 },
  "爸爸": { pinyin: "bà ba", chars: [{ char: "爸", pinyin: "bà" }, { char: "爸", pinyin: "ba" }], meaningTh: "พ่อ", pos: "คำนาม", role: "subject", hsk: 1 },
  "妈妈": { pinyin: "mā ma", chars: [{ char: "妈", pinyin: "mā" }, { char: "妈", pinyin: "ma" }], meaningTh: "แม่", pos: "คำนาม", role: "subject", hsk: 1 },
  "弟弟": { pinyin: "dì di", chars: [{ char: "弟", pinyin: "dì" }, { char: "弟", pinyin: "di" }], meaningTh: "น้องชาย", pos: "คำนาม", role: "subject", hsk: 2 },
  "哥哥": { pinyin: "gē ge", chars: [{ char: "哥", pinyin: "gē" }, { char: "哥", pinyin: "ge" }], meaningTh: "พี่ชาย", pos: "คำนาม", role: "subject", hsk: 2 },
  "谢谢": { pinyin: "xiè xie", chars: [{ char: "谢", pinyin: "xiè" }, { char: "谢", pinyin: "xie" }], meaningTh: "ขอบคุณ", pos: "คำกริยา/คำสุภาพ", role: "predicate", hsk: 1 },
  "不客气": { pinyin: "bù kè qi", chars: [{ char: "不", pinyin: "bù" }, { char: "客", pinyin: "kè" }, { char: "气", pinyin: "qi" }], meaningTh: "ไม่เป็นไร / ด้วยความยินดี", pos: "สำนวน", role: "predicate", hsk: 1 },
  "对不起": { pinyin: "duì bu qǐ", chars: [{ char: "对", pinyin: "duì" }, { char: "不", pinyin: "bu" }, { char: "起", pinyin: "qǐ" }], meaningTh: "ขอโทษ", pos: "สำนวน", role: "predicate", hsk: 1 },
  "喜欢": { pinyin: "xǐ huan", chars: [{ char: "喜", pinyin: "xǐ" }, { char: "欢", pinyin: "huan" }], meaningTh: "ชอบ", pos: "กริยา", role: "predicate", hsk: 1 },
  "爱": { pinyin: "ài", chars: [{ char: "爱", pinyin: "ài" }], meaningTh: "รัก", pos: "กริยา", role: "predicate", hsk: 1 },
  "认识": { pinyin: "rèn shi", chars: [{ char: "认", pinyin: "rèn" }, { char: "识", pinyin: "shi" }], meaningTh: "รู้จัก", pos: "กริยา", role: "predicate", hsk: 1 },
  "高兴": { pinyin: "gāo xìng", chars: [{ char: "高", pinyin: "gāo" }, { char: "兴", pinyin: "xìng" }], meaningTh: "ดีใจ / มีความสุข", pos: "คุณศัพท์", role: "predicate", hsk: 1 },
  "今天": { pinyin: "jīn tiān", chars: [{ char: "今", pinyin: "jīn" }, { char: "天", pinyin: "tiān" }], meaningTh: "วันนี้", pos: "คำบอกเวลา", role: "time_location", hsk: 1 },
  "明天": { pinyin: "míng tiān", chars: [{ char: "明", pinyin: "míng" }, { char: "天", pinyin: "tiān" }], meaningTh: "พรุ่งนี้", pos: "คำบอกเวลา", role: "time_location", hsk: 1 },
  "昨天": { pinyin: "zuó tiān", chars: [{ char: "昨", pinyin: "zuó" }, { char: "天", pinyin: "tiān" }], meaningTh: "เมื่อวานนี้", pos: "คำบอกเวลา", role: "time_location", hsk: 1 },
  "飞机": { pinyin: "fēi jī", chars: [{ char: "飞", pinyin: "fēi" }, { char: "机", pinyin: "jī" }], meaningTh: "เครื่องบิน", pos: "คำนาม", role: "object", hsk: 1 },
  "天气": { pinyin: "tiān qì", chars: [{ char: "天", pinyin: "tiān" }, { char: "气", pinyin: "qì" }], meaningTh: "สภาพอากาศ", pos: "คำนาม", role: "subject", hsk: 1 },
  "冷": { pinyin: "lěng", chars: [{ char: "冷", pinyin: "lěng" }], meaningTh: "หนาว / เย็น", pos: "คุณศัพท์", role: "predicate", hsk: 1 },
  "热": { pinyin: "rè", chars: [{ char: "热", pinyin: "rè" }], meaningTh: "ร้อน", pos: "คุณศัพท์", role: "predicate", hsk: 1 },
  "大": { pinyin: "dà", chars: [{ char: "大", pinyin: "dà" }], meaningTh: "ใหญ่", pos: "คุณศัพท์", role: "predicate", hsk: 1 },
  "小": { pinyin: "xiǎo", chars: [{ char: "小", pinyin: "xiǎo" }], meaningTh: "เล็ก", pos: "คุณศัพท์", role: "predicate", hsk: 1 },
  "好": { pinyin: "hǎo", chars: [{ char: "好", pinyin: "hǎo" }], meaningTh: "ดี", pos: "คุณศัพท์", role: "predicate", hsk: 1 },
  "很多": { pinyin: "hěn duō", chars: [{ char: "很", pinyin: "hěn" }, { char: "多", pinyin: "duō" }], meaningTh: "เยอะมาก / จำนวนมาก", pos: "คุณศัพท์", role: "predicate", hsk: 1 }
};

// Trie Node Implementation for Fast Prefix & Exact Lookup
class TrieNode {
  constructor() {
    this.children = {};
    this.isEnd = false;
    this.data = null;
  }
}

export class TrieDictionary {
  constructor() {
    this.root = new TrieNode();
    this.maxWordLen = 5;
    this.init();
  }

  init() {
    for (const [word, data] of Object.entries(HSK_LOCAL_DATA)) {
      this.insert(word, data);
    }
  }

  insert(word, data) {
    let node = this.root;
    for (const char of word) {
      if (!node.children[char]) {
        node.children[char] = new TrieNode();
      }
      node = node.children[char];
    }
    node.isEnd = true;
    node.data = data;
    if (word.length > this.maxWordLen) {
      this.maxWordLen = word.length;
    }
  }

  searchExact(word) {
    let node = this.root;
    for (const char of word) {
      if (!node.children[char]) return null;
      node = node.children[char];
    }
    return node.isEnd ? node.data : null;
  }

  /**
   * Check if text is a single dictionary entry (0 API)
   */
  isSingleWord(text) {
    const clean = (text || "").trim();
    if (!clean || clean.length > 5) return false;
    return this.searchExact(clean) !== null;
  }

  /**
   * Build structured analysis AST from local entry
   */
  buildLocalAnalysis(word) {
    const clean = word.trim();
    const entry = this.searchExact(clean);
    if (!entry) return null;

    return {
      originalText: clean,
      sentenceType: "คำศัพท์เดี่ยว (Single Word Vocabulary)",
      naturalThaiTranslation: `"${entry.meaningTh}"`,
      literalThaiTranslation: `[${entry.meaningTh}]`,
      grammarSummaryTh: `คำศัพท์เดี่ยวระดับ HSK ${entry.hsk} ชนิดคำ: ${entry.pos} ทำหน้าที่หลักเป็น ${entry.role}`,
      isLocal: true,
      tokens: [
        {
          id: "t_local_1",
          word: clean,
          pinyin: entry.pinyin,
          chars: entry.chars || [{ char: clean, pinyin: entry.pinyin }],
          pos: entry.pos,
          syntacticRole: entry.role,
          roleLabelTh: entry.pos,
          contextualMeaningTh: entry.meaningTh,
          hskLevel: entry.hsk
        }
      ],
      grammarPoints: [
        {
          id: "gp_local_1",
          titleTh: `คำศัพท์ระดับ HSK ${entry.hsk}`,
          pattern: `คำศัพท์: ${clean} (${entry.pinyin})`,
          explanationTh: `เป็นคำประเภท ${entry.pos} ในภาษาจีน มีความหมายหลักในภาษาไทยว่า "${entry.meaningTh}" (ดึงข้อมูลจาก Local Dictionary ในเครื่อง 0 API Request)`,
          associatedTokenIds: ["t_local_1"]
        }
      ]
    };
  }
}

export const localDict = new TrieDictionary();
