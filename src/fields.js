// ============================================================
// 画面項目定義
//   データ連携（ECC,LMS,KIN).xlsx / kintone_案件管理 シート＋添付モックより
//   商品情報（共通） / 商品規格設定 / 商品規格情報（明細） / 掲載履歴情報
//   type: text | number | checkbox | select | datetime | checkboxGroup | textarea
// ============================================================

const UNITS = ['本','杯','箱','個','袋','食','枚','包','日','粒','種類','セット','100g','人前','なし']

// --- 商品情報（共通・1件）--------------------------------------
export const productInfoFields = [
  { key: 'jan',              label: 'JAN',                   type: 'text',   note: '商品マスタ／JAN基本情報マスタから参照' },
  { key: 'alcohol',          label: '酒類',                   type: 'checkbox' },
  { key: 'medicine',         label: '医薬',                   type: 'checkbox' },
  { key: 'categoryCode',     label: 'カテゴリーコード',           type: 'text' },
  { key: 'categoryName',     label: 'カテゴリ名',              type: 'text' },
  { key: 'makerCode',        label: 'メーカーコード',           type: 'text' },
  { key: 'maker',            label: 'メーカー',                type: 'text' },
  { key: 'provideCount',     label: '提供数',                  type: 'number', note: '現行：セット数' },
  { key: 'childSpec',        label: '子商品規格',              type: 'text',   note: 'セット商品の場合のみ' },
  { key: 'pieceInCount',     label: '販売ピース入数',           type: 'number' },
  { key: 'pieceInUnit',      label: 'ピース入数単位',           type: 'select', options: UNITS },
  { key: 'minTotal',         label: '最小単位総数（単価計算用）',  type: 'number', readOnly: true, note: '販売ピース数×ピース入数（自動）' },
]

// --- 商品規格設定：販売形態ごとの ON/OFF ＋上限数 ----------------
export const salesFormRows = [
  { key: 'piece', label: 'ピース' },
  { key: 'ball',  label: 'ボール' },
  { key: 'case',  label: 'ケース' },
]

// --- 商品規格情報（明細・1:多）--------------------------------
export const specGroups = [
  {
    title: '基本',
    fields: [
      {
        key: 'saleType', label: '販売区分', type: 'select', required: true,
        options: ['通常','わけあり（B品）','わけあり（期限）','抽選・発送あり','抽選・発送なし','先着・発送あり','先着・発送なし','イベント・発送あり','イベント・発送なし','代品','初試し','企画1','企画2','企画3'],
      },
      {
        key: 'choppleType', label: 'ちょっプル種別', type: 'select',
        options: ['通常','仕入（通常）','仕入（プロパー）','仕入（アウトレット）','直送MD（通常）','直送MD（プロパー）','直送PF','受発注（通常）','受発注（プロパー）'],
      },
      { key: 'autoOrder',      label: '自動発注フラグ',        type: 'checkbox' },
      { key: 'specProductName',label: '商品規格名',            type: 'text',   note: '現行：掲載名' },
      { key: 'applyLimit',     label: '申込み回数制限',         type: 'number' },
      { key: 'applyCount',     label: '申込み可能数',           type: 'number' },
      { key: 'memberOnly',     label: '会員限定（会員のみ）',    type: 'checkbox' },
      { key: 'advTicketFlag',  label: '先行チケット利用フラグ',   type: 'checkbox' },
      { key: 'noSearchFlag',   label: '検索対象外フラグ',       type: 'checkbox' },
      { key: 'notifyFlag',     label: '通知フラグ',            type: 'checkbox' },
      { key: 'targetChannel',  label: '対象チャネル', type: 'checkboxGroup', options: ['web','アプリ','実店舗'] },
      {
        key: 'postChannel', label: '掲載チャンネル', type: 'checkboxGroup', required: true,
        options: ['本店','d店','d払い店','うま博','バリューマルシェ','生活市場','社販.com','Y店'],
      },
    ],
  },
  {
    title: '抽選',
    fields: [
      { key: 'autoLottery',   label: '自動抽選フラグ',   type: 'checkbox' },
      { key: 'lotteryPeople', label: '抽選人数',        type: 'number' },
      { key: 'lotteryTotal',  label: '抽選合計',        type: 'number' },
      { key: 'winConfirmAt',  label: '当選確定日時',     type: 'datetime' },
      { key: 'lotteryScope',  label: '抽選対象範囲区分', type: 'select', options: ['会員','非会員','会員/非会員'] },
    ],
  },
  {
    title: 'アンケート',
    fields: [
      { key: 'preSurvey',      label: '事前アンケート',       type: 'select', options: ['有','無'] },
      { key: 'preSurveyCode',  label: '事前アンケートコード',   type: 'text' },
      { key: 'postSurvey',     label: '事後アンケート',       type: 'select', options: ['有','無'] },
      { key: 'postSurveyCode', label: '事後アンケートコード',   type: 'text' },
    ],
  },
]

// ============================================================
// 掲載履歴情報（一番下・添付3枚を参照）
// ============================================================
export const postChannelOptions   = ['Web', 'アプリ', '実店舗']
export const postAttrOptions      = ['うま博フラグ', 'イチオシフラグ', '日替わり限定フラグ', 'CM掲載フラグ']
export const bestBeforeTypeOptions = ['賞味期限', '消費期限', '製造日', 'なし']
export const tagOptions           = ['キャンペーン', '季節限定', 'おすすめ', 'セール']
export const priceChannels        = ['本店', 'dショッピング店', 'd払い店', 'Yahoo店', '外部1', '外部2', '外部3']

export function makeEmptyPostHistory() {
  const prices = {}
  for (const ch of priceChannels) prices[ch] = { salePrice: '', offFlag: false, baseProfit: '' }
  return {
    postPeriodFrom: '', postPeriodTo: '',
    salePeriodFrom: '', salePeriodTo: '',
    targetChannel: [],
    premiumFlag: false, firstLimitFlag: false, timeSaleFlag: false, reserveFlag: false,
    postAttr: [],
    noticeLimitFlag: false,
    applyCountLimit: false, applyableCount: '',
    postName: '', subtitle1: '', subtitle2: '', catchCopy: '',
    bestBeforeExcluded: false, bestBeforeType: '賞味期限', bestBeforeDate: '',
    displayProvideCount: '', ecStock: '',
    prices,
    tags: [{ tag: '', from: '', to: '' }],
    segmentOn: false, segmentType: 'セグメント', segmentValue: '',
    weight1: '', weight2: '', memo: '',
  }
}

// --- 各種初期値 -----------------------------------------------
export const allSpecFields = specGroups.flatMap((g) => g.fields)

export function makeEmptySpec() {
  const row = {}
  for (const f of allSpecFields) {
    row[f.key] = f.type === 'checkbox' ? false : f.type === 'checkboxGroup' ? [] : ''
  }
  return row
}

export function makeEmptyProductInfo() {
  const obj = {}
  for (const f of productInfoFields) obj[f.key] = f.type === 'checkbox' ? false : ''
  return obj
}

export function makeEmptySalesForm() {
  const obj = {}
  for (const sf of salesFormRows) obj[sf.key] = { enabled: false, limit: '' }
  return obj
}
