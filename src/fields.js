// ============================================================
// 画面項目定義
//   データ連携（ECC,LMS,KIN).xlsx / kintone_案件管理 シートより抽出
//   分類「商品情報」        → 画面上部の共通エリア（productInfoFields）
//   商品規格設定            → 販売形態(ピース/ボール/ケース)のON/OFF＋上限数
//   分類「商品規格情報」    → ＋ボタンで増やす明細（1:多）。基本/抽選/アンケートに細分類
//
//   type: text | number | checkbox | select | datetime | checkboxGroup
//   ここを編集するだけで項目の増減・並び替えができます。
// ============================================================

// 汎用コードマスタ.単位区分
const UNITS = ['本','杯','箱','個','袋','食','枚','包','日','粒','種類','セット','100g','人前','なし']

// --- 分類：商品情報（共通・1件）--------------------------------
export const productInfoFields = [
  { key: 'jan',              label: 'JAN',                   type: 'text',   note: '商品マスタ／JAN基本情報マスタから参照' },
  { key: 'alcohol',          label: '酒類',                   type: 'checkbox' },
  { key: 'medicine',         label: '医薬',                   type: 'checkbox' },
  { key: 'categoryCode',     label: 'カテゴリーコード',           type: 'text' },
  { key: 'categoryName',     label: 'カテゴリ名',              type: 'text' },
  { key: 'makerCode',        label: 'メーカーコード',           type: 'text' },
  { key: 'maker',            label: 'メーカー',                type: 'text' },
  { key: 'provideCount',     label: '提供数',                  type: 'number', note: '現行：セット数' },
  { key: 'salePieceCount',   label: '販売ピース数',            type: 'number', note: '現行：商品個数' },
  { key: 'salePieceUnit',    label: '販売ピース単位',           type: 'select', options: UNITS },
  { key: 'childSpec',        label: '子商品規格',              type: 'text',   note: 'セット商品の場合のみ' },
  { key: 'childSpecUnit',    label: '子商品規格販売ピース単位',   type: 'select', options: UNITS },
  { key: 'pieceInCount',     label: '販売ピース入数',           type: 'number' },
  { key: 'pieceInUnit',      label: 'ピース入数単位',           type: 'select', options: UNITS },
  { key: 'minTotal',         label: '最小単位総数（単価計算用）',  type: 'number', readOnly: true, note: '販売ピース数×ピース入数（自動）' },
]

// --- 商品規格設定：販売形態ごとの ON/OFF ＋上限数 ----------------
//   1つの商品発注を起点に、販売したい販売形態のみONにし、必要なものだけ上限数を指定
export const salesFormRows = [
  { key: 'piece', label: 'ピース' },
  { key: 'ball',  label: 'ボール' },
  { key: 'case',  label: 'ケース' },
]

// --- 分類：商品規格情報（明細・1:多） ---------------------------
//   基本 / 抽選 / アンケート のサブ分類でグループ化
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
      { key: 'newSpecCatFlag', label: '規格分類新規作成フラグ',   type: 'checkbox' },
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

// 全明細フィールドを平坦化
export const allSpecFields = specGroups.flatMap((g) => g.fields)

// 明細1行分の初期値
export function makeEmptySpec() {
  const row = {}
  for (const f of allSpecFields) {
    row[f.key] = f.type === 'checkbox' ? false : f.type === 'checkboxGroup' ? [] : ''
  }
  return row
}

// 共通エリア（商品情報）の初期値
export function makeEmptyProductInfo() {
  const obj = {}
  for (const f of productInfoFields) {
    obj[f.key] = f.type === 'checkbox' ? false : ''
  }
  return obj
}

// 商品規格設定の初期値
export function makeEmptySalesForm() {
  const obj = {}
  for (const sf of salesFormRows) obj[sf.key] = { enabled: false, limit: '' }
  return obj
}
