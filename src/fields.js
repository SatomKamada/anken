// ============================================================
// 画面項目定義（案件）
//   商品情報（共通） / 商品規格設定 / 商品規格情報（共通） / 商品規格・掲載履歴（個別）
//   type: text | number | checkbox | select | datetime | checkboxGroup | textarea
// ============================================================

const UNITS = ['本','杯','箱','個','袋','食','枚','包','日','粒','種類','セット','100g','人前','なし']

// ============================================================
// 商品情報（共通）※先頭に商品コード。
// ============================================================
export const makerOptions          = ['よつ葉乳業', '伊藤園', '明治']
export const medicineTypeOptions   = ['対象外','要指導医薬品','第1類医薬品','第2類医薬品','第3類医薬品','医薬部外品','医薬品未分類']
export const questionnaireOptions  = ['問診票A', '問診票B']
export const alcoholOptions        = ['対象外','お酒','ノンアルコール','みりん']
export const brandOptions          = ['ブランドA','ブランドB','ブランドC']
export const seriesOptions         = ['シリーズA','シリーズB','シリーズC']
export const genderOptions         = ['対象外','WOMEN','UNISEX','MEN','KIDS','BABY']
export const productUnitOptions    = UNITS
export const productTagOptions     = ['タグA','タグB','タグC','季節限定']
export const taxTypeOptions        = ['基本税率','軽減税率','非課税']
export const productTempZoneOptions = ['未設定','常温','冷蔵','冷凍','チルド','超冷凍','その他']
export const allergyMainOptions    = ['卵','乳','小麦','えび','かに','くるみ','そば','落花生','カシューナッツ']
export const allergySubOptions     = ['アーモンド','あわび','いか','いくら','オレンジ','キウイフルーツ','牛肉','ごま','さけ','さば','大豆','鶏肉','バナナ','豚肉','マカダミアナッツ','もも','やまいも','りんご','ゼラチン','ピスタチオ']

export function makeEmptyProductInfo() {
  return {
    recordId: '',             // 内部ID（参照時にセット）
    productCode: '',           // 商品コード（先頭）
    janCode: '', maker: '', companyUrl: '',
    productName: '', subtitle: '', catchCopy: '',
    medicineOn: false, medicineType: '対象外', questionnaire: '',
    alcohol: '対象外', brand: '', series: '', gender: '対象外',
    jicfsCode: '', jicfsKanji: '', jicfsKana: '', jicfsAbbr: '', itfCode: '',
    caseQty: '0', bowlQty: '0', netContent: '', unit: '',
    tags: [],
    keyword: '',
    taxType: '基本税率', tempZone: '未設定', dryIce: false,
    allergyMain: [], allergySub: [],
    makerPrice: '',
    // カテゴリ情報
    categoryCode: '', categoryL: '', categoryM: '', categoryS: '',
    bestChoice: false, functionalFood: false, specificHealthFood: false,
  }
}

// ============================================================
// 商品属性情報（商品情報の直下）
// ============================================================
export const productAttrFields = [
  { key: 'newFlag',     label: '新規作成フラグ',     type: 'checkbox', boolLabel: 'ON' },
  { key: 'defaultFlag', label: 'デフォルトフラグ',   type: 'checkbox', boolLabel: 'ON' },
]

export function makeEmptyProductAttr() {
  const o = {}
  for (const f of productAttrFields) o[f.key] = f.type === 'checkbox' ? false : ''
  o.promoDesc = '' // プロモーション説明（新規作成フラグON時のみ活性）
  return o
}

// ============================================================
// 商品規格設定：販売形態ごとの ON/OFF ＋上限数
// ============================================================
export const salesFormRows = [
  { key: 'piece', label: 'ピース' },
  { key: 'ball',  label: 'ボール' },
  { key: 'case',  label: 'ケース' },
]

export function makeEmptySalesForm() {
  const obj = {}
  for (const sf of salesFormRows) obj[sf.key] = { enabled: false, limit: '' }
  return obj
}

// ============================================================
// 商品規格・掲載履歴（個別）明細（1:多）
//   基本 ＋ 抽選 ＋ アンケート。先頭に商品規格コード。
// ============================================================
export const choppleTypeOptions = ['通常','仕入（通常）','仕入（プロパー）','仕入（アウトレット）','直送MD（通常）','直送MD（プロパー）','直送PF','受発注（通常）','受発注（プロパー）']

export const specGroups = [
  {
    title: '基本',
    fields: [
      { key: 'autoOrder',      label: '自動発注フラグ',        type: 'checkbox' },
      { key: 'specProductName',label: '商品規格名',            type: 'text',   note: '現行：掲載名' },
      { key: 'applyLimit',     label: '申込み回数制限',         type: 'number' },
      { key: 'applyCount',     label: '申込み可能数',           type: 'number' },
      { key: 'targetChannel',  label: '対象チャネル', type: 'checkboxGroup', options: ['web','アプリ','実店舗'] },
      {
        key: 'postChannel', label: '掲載チャンネル', type: 'checkboxGroup', required: true, vertical: true,
        options: ['本店','d店','d払い店','うま博','バリューマルシェ','生活市場','社販.com','Y店'],
      },
    ],
  },
]

// 抽選・アンケート（各掲載履歴に内包：チャネル別価格の下に表示）
export const lotteryFields = [
  { key: 'lotteryPeople', label: '抽選人数',        type: 'number' },
  { key: 'lotteryTotal',  label: '抽選合計',        type: 'number' },
  { key: 'winConfirmAt',  label: '当選確定日時',     type: 'datetime' },
  { key: 'lotteryScope',  label: '抽選対象範囲区分', type: 'select', options: ['会員','非会員','会員/非会員'] },
]
export const surveyFields = [
  { key: 'preSurvey',      label: '事前アンケート',       type: 'select', options: ['有','無'] },
  { key: 'preSurveyCode',  label: '事前アンケートコード',   type: 'text' },
  { key: 'postSurvey',     label: '事後アンケート',       type: 'select', options: ['有','無'] },
  { key: 'postSurveyCode', label: '事後アンケートコード',   type: 'text' },
]

// ============================================================
// 掲載履歴（各規格に内包）
// ============================================================
export const postChannelOptions    = ['Web', 'アプリ', '実店舗']
export const postAttrOptions       = ['うま博フラグ', 'イチオシフラグ', '日替わり限定フラグ', 'CM掲載フラグ']
export const bestBeforeTypeOptions = ['賞味期限', '消費期限', '製造日', 'なし']
export const tagOptions            = ['キャンペーン', '季節限定', 'おすすめ', 'セール']
export const priceChannels         = ['本店', 'dショッピング店', 'd払い店', 'Yahoo店', '外部1', '外部2', '外部3']

export function makeEmptyPostHistory() {
  const prices = {}
  for (const ch of priceChannels) prices[ch] = { salePrice: '', unitPrice: '', offFlag: false, offRate: '', baseProfit: '' }
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
    displayProvideCount: '',
    sellOutDate: '',            // 完売想定日（表示提供数の下）
    prices,
    baseCost: '',              // 基準原価（チャネル別価格の下・単一）
    // チャネル別価格の下：当月出荷見込み数・総売上
    shipForecastHonten: '', shipForecastDsample: '', shipForecastDpay: '',
    totalSalesInTax: '',
    // 抽選（掲載履歴内・チャネル別価格の下）
    lotteryPeople: '', lotteryTotal: '', winConfirmAt: '', lotteryScope: '',
    // アンケート（掲載履歴内・チャネル別価格の下）
    preSurvey: '', preSurveyCode: '', postSurvey: '', postSurveyCode: '',
    // アンケートの下：ショッピング広告掲載・PV出し・過去実績
    shoppingAd: '', pvNeeded: '', pastResult: '',
    segmentOn: false, segmentType: 'セグメント', segmentValue: '',
    memo: '',
  }
}

// ============================================================
// 商品規格情報（共通）※商品規格の直上
// ============================================================
export const salesRepOptions        = ['担当A', '担当B', '担当C']
export const companyCodeOptions      = ['C001 / 花王株式会社', 'C002 / ○○商事', 'C003 / △△食品']
export const tempZoneOptions         = ['未設定', '常温', '冷蔵', '冷凍', 'チルド', '超冷凍', 'その他']
export const noticeInfoOptions       = ['告知A', '告知B', '告知C']
export const deliveryMethodOptions   = ['通常', 'ゆうパケット', 'ゆうメール', 'メール便', 'クール便']
export const deliveryExcludeOptions  = ['北海道', '東北', '中国', '四国', '九州', '沖縄', '離島']
export const deliveryFeeTypeOptions  = ['10kg未満', '10kg以上', '60', '80', '100', '100以上']
export const shippingLeadOptions     = ['即日', '1日', '2日', '3日', '5日', '1週間']
export const cautionPresetOptions    = ['なし', '要冷蔵', '割れ物注意', '熨斗対応不可']
// 企業名サジェスト候補（受発注型のみ選択可）
export const companyNameOptions      = ['花王株式会社', '○○商事', '△△食品', 'ユースキン製薬株式会社', 'アサヒグループ食品株式会社']
// 受発注型（企業選択を許可するちょっプル種別）
export const jufuchuChoppleTypes     = ['受発注（通常）', '受発注（プロパー）']

export function makeEmptySpecCommon() {
  return {
    specCode: '',                 // 商品規格コード（先頭・参照ボタン対象）
    choppleType: '',              // ちょっプル種別（基本から移動）
    salesRep: '', companyName: '', ownItemNo: '',
    tempZone: '未設定', dryIce: false,
    noticeInfo: '',
    deliveryMethod: '', deliveryExcludeArea: '', deliveryFeeType: '',
    firstShipDate: '', shippingLead: '3日',
    cautionPreset: '', cautionText: '',
    memberOnlyFlag: false, advTicketFlag: false,
    noSearchFlag: false, autoLotteryFlag: false, notifyFlag: false,
  }
}

// --- 明細（商品規格）初期値 -----------------------------------
// 個別明細の先頭に「縦並び」で表示する主要3項目（規格区分・販売形態・販売数）
export const specTopFields = [
  {
    key: 'saleType', label: '規格区分', type: 'select', required: true,
    options: ['通常','わけあり（B品）','わけあり（期限）','抽選・発送あり','抽選・発送なし','先着・発送あり','先着・発送なし','イベント・発送あり','イベント・発送なし','代品','初試し','企画1','企画2','企画3'],
  },
  { key: 'salesForm', label: '販売形態', type: 'select', options: ['ケース売り','ボール売り','ピース売り'] },
  { key: 'salesQty',  label: '販売数',   type: 'number' },
]

export const allSpecFields = [...specTopFields, ...specGroups.flatMap((g) => g.fields)]

// 掲載履歴・価格情報（複製単位）：上代〜試算(finance) ＋ 掲載履歴1件(post)
export function makeEmptyPriceInfo() {
  return { finance: {}, post: makeEmptyPostHistory() }
}

export function makeEmptySpec() {
  const row = { specCode: '' } // 商品規格コード（先頭）
  for (const f of allSpecFields) {
    row[f.key] = f.type === 'checkbox' ? false : f.type === 'checkboxGroup' ? [] : ''
  }
  row.priceInfos = [makeEmptyPriceInfo()] // 掲載履歴・価格情報（複製可・1:多）
  return row
}

// ============================================================
// 案件ヘッダー（基本情報の上・アコーディオンなし）
// ============================================================
export const caseTypeOptions = ['新規', '商品規格追加', '掲載履歴追加', '商品規格修正', '掲載履歴修正']
export const approvalFlowOptions = ['通常', 'Eソリ']
export const caseStatusOptions = ['試算中', '承認待', '承認済', '差戻し', '確定済', '再申請', 'NG']

export function makeEmptyCaseHead() {
  return {
    caseType: '',           // 案件種別
    approvalFlow: '',       // 承認フロー
    caseStatus: '',         // 案件ステータス
    setProductFlag: false,  // セット商品フラグ
    choppleBarterFlag: false, // ちょっプルバーターフラグ
  }
}
