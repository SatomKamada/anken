// ============================================================
// 掲載ページ変更 項目定義
//   orderFields.js と同様に fields.js から分離
// ============================================================
import {
  productAttrFields, salesFormRows,
  specTopFields, specGroups, lotteryFields, surveyFields,
} from './fields.js'

export const PAGE_CHANGE_TYPE = {
  PAGE:    '掲載ページ変更',
  PERIOD:  '掲載開始終了日/募集開始終了日設定',
  PUBLISH: '公開/非公開設定',
  STOCK:   '在庫移動',
}

// 共通項目（Field.jsx で描画）※レコード番号はヘッダーバーに表示のみ
export const PAGE_CHANGE_FIELDS = [
  { key: 'companyName', label: '企業名', type: 'text' },
  { key: 'productName', label: '商品名', type: 'text' },
  { key: 'changeType',  label: '変更種別', type: 'select', required: true,
    options: Object.values(PAGE_CHANGE_TYPE) },
]
export const PAGE_CHANGE_MEMO_FIELD = { key: 'memo', label: 'メモ', type: 'textarea' }

// 公開/非公開設定の対象チャネル
// ※テーブル定義書の「○○公開状態」列を仮置き。正式な一覧は要確認
export const PUBLISH_CHANNELS = ['本店', 'Yahoo店', 'd店', 'd払い店', '生活市場', 'うま博', '地域創生']
export const PUBLISH_STATUS_OPTIONS = ['公開', '非公開']

// ------------------------------------------------------------
// 変更対象の項目（案件タブで登録できる項目・価格関連以外）
//   除外：表示のみ項目（マスタ参照で自動）、
//         掲載履歴の価格表（販売価格・単位あたりの価格・OFF率・基準粗利）、
//         基準原価、総売上（税込）、上代〜試算（財務系）
// ------------------------------------------------------------
const pick = (fields) => fields.map((f) => ({ key: f.key, label: f.label }))

export const PAGE_CHANGE_TARGET_GROUPS = [
  {
    group: '案件ヘッダー',
    items: [
      { key: 'caseType', label: '案件種別' },
      { key: 'approvalFlow', label: '承認フロー' },
      { key: 'caseStatus', label: '案件ステータス' },
    ],
  },
  {
    group: '商品情報',
    items: [
      { key: 'janCode', label: 'JANコード' },
      { key: 'productCode', label: '商品コード' },
      { key: 'subtitle', label: 'サブタイトル' },
      { key: 'catchCopy', label: 'キャッチコピー' },
      { key: 'medicineType', label: '医薬品' },
      { key: 'tempZone', label: '商品温度帯' },
      { key: 'dryIce', label: 'ドライアイス設定' },
    ],
  },
  {
    group: '商品属性情報',
    items: [...pick(productAttrFields), { key: 'promoDesc', label: 'プロモーション説明' }],
  },
  {
    group: '商品規格設定',
    items: salesFormRows.map((sf) => ({ key: `salesForm_${sf.key}`, label: `${sf.label}（利用・上限数）` })),
  },
  {
    group: '商品規格情報（共通）',
    items: [
      { key: 'specCode', label: '商品規格コード' },
      { key: 'companyCode', label: '企業コード' },
      { key: 'tempZone', label: '温度帯' },
      { key: 'deliveryMethod', label: '配送方法' },
      { key: 'deliveryExcludeArea', label: '配送除外エリア' },
      { key: 'deliveryFeeType', label: '配送料種別' },
      { key: 'dryIce', label: 'ドライアイス' },
      { key: 'memberOnlyFlag', label: '会員限定' },
      { key: 'advTicketFlag', label: '前売り券' },
      { key: 'noSearchFlag', label: '検索非表示' },
      { key: 'autoLotteryFlag', label: '自動抽選' },
      { key: 'notifyFlag', label: '通知' },
    ],
  },
  {
    group: '商品規格（明細）',
    items: [...pick(specTopFields), ...pick(specGroups.flatMap((g) => g.fields))],
  },
  {
    group: '掲載履歴',
    items: [
      { key: 'postCode', label: '掲載履歴コード' },
      { key: 'postPeriodFrom', label: '掲載期間（開始）' },
      { key: 'postPeriodTo', label: '掲載期間（終了）' },
      { key: 'salePeriodFrom', label: '販売期間（開始）' },
      { key: 'salePeriodTo', label: '販売期間（終了）' },
      { key: 'premiumFlag', label: 'プレミアム' },
      { key: 'firstLimitFlag', label: '先着限定' },
      { key: 'timeSaleFlag', label: 'タイムセール' },
      { key: 'reserveFlag', label: '予約' },
      { key: 'noticeLimitFlag', label: '告知制限' },
      { key: 'postAttr', label: '掲載属性' },
      { key: 'postName', label: '掲載名' },
      { key: 'postCatchCopy', label: 'キャッチコピー' },
      { key: 'subtitle1', label: 'サブタイトル1' },
      { key: 'subtitle2', label: 'サブタイトル2' },
      { key: 'bestBeforeType', label: '期限種別' },
      { key: 'bestBeforeDate', label: '期限日' },
      { key: 'displayProvideCount', label: '表示提供数' },
      { key: 'sellOutDate', label: '完売想定日' },
      { key: 'shipForecastHonten', label: '本店当月出荷見込み数' },
      { key: 'shipForecastDsample', label: 'dサンプル当月出荷見込み数' },
      { key: 'shipForecastDpay', label: 'd払い当月出荷見込み数' },
      ...pick(lotteryFields),
      ...pick(surveyFields),
      { key: 'shoppingAd', label: 'ショッピング広告掲載' },
      { key: 'pvNeeded', label: 'PV出し' },
      { key: 'pastResult', label: '過去実績/類似商品実績' },
      { key: 'memo', label: 'メモ' },
    ],
  },
]

// value（"区分.key"）→ 表示ラベル
export const TARGET_LABEL = Object.fromEntries(
  PAGE_CHANGE_TARGET_GROUPS.flatMap((g) => g.items.map((t) => [`${g.group}.${t.key}`, `${t.label}（${g.group}）`])),
)

// ------------------------------------------------------------
// ダミー：商品規格ID → 紐づく掲載履歴（商品規格：掲載履歴＝1：多）
// ------------------------------------------------------------
const pub = (vals) => Object.fromEntries(PUBLISH_CHANNELS.map((c, i) => [c, vals[i] ? '公開' : '非公開']))

export const SPEC_POST_MASTER = {
  '20000001': {
    companyName: '花王株式会社', productName: 'ビオレUV アクアリッチ ウォータリーエッセンス',
    posts: [
      { postCode: '30000001', postName: '夏の日焼け止めフェア', postStart: '2026-07-01', postEnd: '2026-08-31', recruitStart: '2026-07-01', recruitEnd: '2026-08-25', publish: pub([1, 1, 1, 0, 1, 0, 0]) },
      { postCode: '30000003', postName: '秋の再販', postStart: '2026-09-15', postEnd: '2026-10-31', recruitStart: '2026-09-15', recruitEnd: '2026-10-25', publish: pub([1, 0, 1, 1, 0, 0, 0]) },
    ],
  },
  '20000002': {
    companyName: 'よつ葉乳業', productName: 'よつ葉バター 125g',
    posts: [
      { postCode: '30000002', postName: '北海道フェア', postStart: '2026-10-01', postEnd: '2026-10-31', recruitStart: '2026-10-01', recruitEnd: '2026-10-20', publish: pub([1, 1, 1, 1, 1, 1, 0]) },
      { postCode: '30000004', postName: '年末まとめ買い', postStart: '2026-12-01', postEnd: '2026-12-28', recruitStart: '2026-12-01', recruitEnd: '2026-12-20', publish: pub([1, 1, 0, 0, 0, 0, 0]) },
      { postCode: '30000005', postName: '初売りセール', postStart: '2027-01-02', postEnd: '2027-01-10', recruitStart: '2027-01-02', recruitEnd: '2027-01-08', publish: pub([0, 0, 0, 0, 0, 0, 0]) },
    ],
  },
  '20000003': {
    companyName: '△△食品', productName: '国産ちりめんじゃこ 50g',
    posts: [
      { postCode: '30000006', postName: '和の食卓特集', postStart: '2026-11-01', postEnd: '2026-11-30', recruitStart: '2026-11-01', recruitEnd: '2026-11-25', publish: pub([1, 0, 0, 0, 1, 1, 1]) },
    ],
  },
}
export const SPEC_ID_SAMPLES = Object.keys(SPEC_POST_MASTER)

// 掲載履歴の変更対象項目（期間）
export const PERIOD_KEYS = [
  { key: 'postStart', label: '掲載開始日' },
  { key: 'postEnd', label: '掲載終了日' },
  { key: 'recruitStart', label: '募集開始日' },
  { key: 'recruitEnd', label: '募集終了日' },
]

// 商品規格ID参照結果 → 変更用の掲載履歴行（orig＝変更前の値を保持）
export const toPostRows = (posts) => posts.map((p) => ({ ...structuredClone(p), orig: structuredClone(p) }))

export const createPageChangeInitial = (recordNo = '') => ({
  recordNo,
  companyName: '',
  productName: '',
  changeType: '',
  pageRows: [{ target: '', content: '' }],
  specId: '',          // 期間設定・公開/非公開で使用
  posts: [],           // 商品規格IDに紐づく掲載履歴（変更後の値＋orig）
  stockRows: [{ fromId: '', toId: '', qty: '' }],
  memo: '',
})

// ------------------------------------------------------------
// 一覧（検索画面）
// ------------------------------------------------------------
export const PAGE_CHANGE_LIST_COLS = [
  { key: 'recordNo', label: 'レコード番号' },
  { key: 'companyName', label: '企業名' },
  { key: 'productName', label: '商品名' },
  { key: 'changeType', label: '変更種別' },
  { key: 'specId', label: '商品規格ID' },
  { key: 'summary', label: '変更内容（概要）' },
  { key: 'memo', label: 'メモ' },
]

// 一覧に表示する変更内容の概要
export const summarize = (r) => {
  const T = PAGE_CHANGE_TYPE
  if (r.changeType === T.PAGE) {
    const ts = r.pageRows.filter((x) => x.target).map((x) => TARGET_LABEL[x.target] || x.target)
    return ts.length ? ts.join('、') : ''
  }
  if (r.changeType === T.PERIOD) {
    const n = r.posts.filter((p) => PERIOD_KEYS.some(({ key }) => p[key] !== p.orig[key])).length
    return r.posts.length ? `掲載履歴 ${n}/${r.posts.length}件 変更` : ''
  }
  if (r.changeType === T.PUBLISH) {
    const n = r.posts.reduce((a, p) => a + PUBLISH_CHANNELS.filter((c) => p.publish[c] !== p.orig.publish[c]).length, 0)
    return r.posts.length ? `公開設定 ${n}箇所 変更` : ''
  }
  if (r.changeType === T.STOCK) {
    return r.stockRows.filter((x) => x.fromId || x.toId).map((x) => `${x.fromId}→${x.toId}×${x.qty}`).join('、')
  }
  return ''
}

// 一覧の初期データ（ダミー）
const mk = (no, over) => ({ ...createPageChangeInitial(no), ...over })
const periodSample = () => {
  const posts = toPostRows(SPEC_POST_MASTER['20000001'].posts)
  posts[1].postEnd = '2026-11-15'
  return posts
}
const publishSample = () => {
  const posts = toPostRows(SPEC_POST_MASTER['20000002'].posts)
  posts[0].publish = { ...posts[0].publish, 'Yahoo店': '非公開' }
  return posts
}
export const PAGE_CHANGE_INIT = [
  mk('4', { companyName: '△△食品', productName: '国産ちりめんじゃこ 50g', changeType: PAGE_CHANGE_TYPE.STOCK,
    stockRows: [{ fromId: '1001', toId: '1003', qty: '1' }], memo: '在庫を新規格へ移動' }),
  mk('3', { companyName: 'よつ葉乳業', productName: 'よつ葉バター 125g', changeType: PAGE_CHANGE_TYPE.PUBLISH,
    specId: '20000002', posts: publishSample(), memo: 'Yahoo店のみ非公開に' }),
  mk('2', { companyName: '花王株式会社', productName: 'ビオレUV アクアリッチ ウォータリーエッセンス', changeType: PAGE_CHANGE_TYPE.PERIOD,
    specId: '20000001', posts: periodSample(), memo: '秋の再販の掲載終了を延長' }),
  mk('1', { companyName: '花王株式会社', productName: 'ビオレUV アクアリッチ ウォータリーエッセンス', changeType: PAGE_CHANGE_TYPE.PAGE,
    pageRows: [{ target: '掲載履歴.postName', content: '「夏の日焼け止めフェア」→「夏のUVケアフェア」' }], memo: '' }),
]
