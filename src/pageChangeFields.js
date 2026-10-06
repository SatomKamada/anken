// ============================================================
// 掲載ページ変更 項目定義
//   orderFields.js と同様に fields.js から分離
// ============================================================
import {
  productAttrFields, salesFormRows, companyNameOptions,
  specTopFields, specGroups, lotteryFields, surveyFields,
} from './fields.js'

export const PAGE_CHANGE_TYPE = {
  PAGE:    '掲載ページ変更',
  PERIOD:  '掲載開始終了日/募集開始終了日設定',
  PUBLISH: '公開/非公開設定',
  STOCK:   '在庫移動',
}

// 共通項目（Field.jsx で描画）※レコード番号はヘッダーバーに表示のみ
//   企業名・商品名はサジェスト入力のため PageChange.jsx 側で描画
export const PAGE_CHANGE_FIELDS = [
  { key: 'changeType',  label: '変更種別', type: 'select', required: true,
    options: Object.values(PAGE_CHANGE_TYPE) },
]
// 管理情報（自動・編集不可）
export const PAGE_CHANGE_AUTO_FIELDS = [
  { key: 'assignee',  label: '担当者',   type: 'text', auto: true },
  { key: 'createdAt', label: '作成日時', type: 'text', auto: true },
  { key: 'updatedAt', label: '変更日時', type: 'text', auto: true },
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
// selected：変更対象の掲載履歴（チェックボックス）。一覧にはチェックした掲載履歴のみ表示
export const toPostRows = (posts) => posts.map((p) => ({ ...structuredClone(p), selected: false, orig: structuredClone(p) }))

// ログインユーザー・現在日時（ダミー）
export const CURRENT_USER = '営業担当A'
export const nowStr = () => {
  const d = new Date(), z = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())} ${z(d.getHours())}:${z(d.getMinutes())}`
}
// 編集時に変更日時を更新
export const touch = (r) => ({ ...r, updatedAt: nowStr() })

export const createPageChangeInitial = (recordNo = '', assignee = CURRENT_USER, at = nowStr()) => ({
  recordNo,
  assignee,
  createdAt: at,
  updatedAt: at,
  companyName: '',
  productName: '',
  changeType: '',
  pageRows: [{ target: '', content: '' }],
  specId: '',          // 掲載ページ変更・期間設定・公開/非公開で使用
  posts: [],           // 商品規格IDに紐づく掲載履歴（変更後の値＋orig）
  stockRows: [{ fromId: '', toId: '', qty: '' }],
  memo: '',
})

// ------------------------------------------------------------
// サジェスト候補（ダミー）：企業名・商品名
// ------------------------------------------------------------
export const PRODUCT_MASTER = [
  ...Object.values(SPEC_POST_MASTER).map((m) => ({ productName: m.productName, companyName: m.companyName })),
  { productName: 'ビオレ ザ ハンド 泡ハンドソープ', companyName: '花王株式会社' },
  { productName: 'アタック ZERO 詰替 810g', companyName: '花王株式会社' },
  { productName: 'よつ葉 北海道十勝 牛乳 1000ml', companyName: 'よつ葉乳業' },
  { productName: 'よつ葉 ヨーグルト プレーン 400g', companyName: 'よつ葉乳業' },
  { productName: '国産しらす干し 80g', companyName: '△△食品' },
  { productName: 'ユースキンA 120g', companyName: 'ユースキン製薬株式会社' },
  { productName: 'ミンティア ワイルド＆クール', companyName: 'アサヒグループ食品株式会社' },
]
export const COMPANY_SUGGEST = [...new Set([...companyNameOptions, ...PRODUCT_MASTER.map((p) => p.companyName)])]
// 企業名が候補に一致すればその企業の商品のみ、それ以外は全商品
export const productSuggestFor = (companyName) => {
  const hit = PRODUCT_MASTER.filter((p) => p.companyName === companyName)
  return (hit.length ? hit : PRODUCT_MASTER).map((p) => p.productName)
}
export const companyOfProduct = (productName) => PRODUCT_MASTER.find((p) => p.productName === productName)?.companyName

// 商品名を選択したら、企業名が空欄の場合のみ企業名を補完
export const setProductName = (r, productName) => ({
  ...r, productName, companyName: r.companyName || companyOfProduct(productName) || '',
})

// 商品規格ID → 掲載履歴の呼び出し（詳細・一覧の Enter で共通利用）
export const lookupSpecPosts = (r) => {
  const id = (r.specId || '').trim()
  if (!id) return { ok: false, msg: '商品規格IDを入力してください' }
  const m = SPEC_POST_MASTER[id]
  if (!m) return { ok: false, msg: `商品規格IDに該当なし（${id}）。ダミー：${SPEC_ID_SAMPLES.join(' / ')}` }
  return {
    ok: true,
    msg: `商品規格ID ${id} に紐づく掲載履歴を ${m.posts.length}件 呼び出しました`,
    record: { ...r, posts: toPostRows(m.posts), companyName: r.companyName || m.companyName, productName: r.productName || m.productName },
  }
}

// 商品規格ID → 企業名・商品名のみ補完（掲載ページ変更で使用。掲載履歴は呼び出さない）
export const lookupSpecInfo = (r) => {
  const id = (r.specId || '').trim()
  if (!id) return { ok: false, msg: '商品規格IDを入力してください' }
  const m = SPEC_POST_MASTER[id]
  if (!m) return { ok: false, msg: `商品規格IDに該当なし（${id}）。ダミー：${SPEC_ID_SAMPLES.join(' / ')}` }
  return {
    ok: true,
    msg: `商品規格ID ${id}（${m.companyName} / ${m.productName}）`,
    record: { ...r, companyName: r.companyName || m.companyName, productName: r.productName || m.productName },
  }
}

// ------------------------------------------------------------
// 一覧（検索画面）
// ------------------------------------------------------------
// scope: rec=レコード単位（行結合） / page=掲載ページ変更の行 / post・period・pub=変更対象にチェックした掲載履歴の行 / stock=在庫移動の行
// locked: 編集不可（レコード番号・担当者・作成日時・変更日時）
// types : 対象の変更種別（それ以外の行はグレー表示・入力不可）
const _T = PAGE_CHANGE_TYPE
export const PAGE_CHANGE_LIST_COLS = [
  { key: 'recordNo',    label: 'レコード番号', group: '共通', scope: 'rec', locked: true },
  { key: 'companyName', label: '企業名',       group: '共通', scope: 'rec', type: 'company' },
  { key: 'productName', label: '商品名',       group: '共通', scope: 'rec', type: 'product' },
  { key: 'changeType',  label: '変更種別',     group: '共通', scope: 'rec', type: 'select', options: Object.values(_T), req: true },
  { key: 'specId',      label: '商品規格ID',   group: '共通', scope: 'rec', type: 'specId', types: [_T.PAGE, _T.PERIOD, _T.PUBLISH] },

  { key: 'target',  label: '変更対象の項目', group: '掲載ページ変更', scope: 'page', type: 'target', types: [_T.PAGE] },
  { key: 'content', label: '変更内容',       group: '掲載ページ変更', scope: 'page', types: [_T.PAGE] },

  { key: 'postCode', label: '掲載履歴コード', group: '掲載履歴', scope: 'post', types: [_T.PERIOD, _T.PUBLISH] },
  { key: 'postName', label: '掲載名',         group: '掲載履歴', scope: 'post', types: [_T.PERIOD, _T.PUBLISH] },

  ...PERIOD_KEYS.map((k) => ({ ...k, group: '掲載開始終了日/募集開始終了日', scope: 'period', type: 'date', types: [_T.PERIOD] })),

  ...PUBLISH_CHANNELS.map((ch) => ({ key: ch, label: ch, group: '公開/非公開設定', scope: 'pub', type: 'select', options: PUBLISH_STATUS_OPTIONS, types: [_T.PUBLISH] })),

  { key: 'fromId', label: 'はがす対象の商品規格ID',   group: '在庫移動', scope: 'stock', types: [_T.STOCK] },
  { key: 'toId',   label: '移動する対象の商品規格ID', group: '在庫移動', scope: 'stock', types: [_T.STOCK] },
  { key: 'qty',    label: '販売数',                   group: '在庫移動', scope: 'stock', type: 'number', types: [_T.STOCK] },

  { key: 'memo',      label: 'メモ',     group: 'その他',   scope: 'rec' },
  { key: 'assignee',  label: '担当者',   group: '管理情報', scope: 'rec', locked: true },
  { key: 'createdAt', label: '作成日時', group: '管理情報', scope: 'rec', locked: true },
  { key: 'updatedAt', label: '変更日時', group: '管理情報', scope: 'rec', locked: true },
]

// 一覧の初期データ（ダミー）
const mk = (no, assignee, at, over) => ({ ...createPageChangeInitial(no, assignee, at), ...over })
const periodSample = () => {
  const posts = toPostRows(SPEC_POST_MASTER['20000001'].posts)
  posts[1].postEnd = '2026-11-15'
  posts[1].selected = true
  return posts
}
const publishSample = () => {
  const posts = toPostRows(SPEC_POST_MASTER['20000002'].posts)
  posts[0].publish = { ...posts[0].publish, 'Yahoo店': '非公開' }
  posts[0].selected = true
  return posts
}
export const PAGE_CHANGE_INIT = [
  mk('4', '伊波 篤', '2026-10-06 09:12', { companyName: '△△食品', productName: '国産ちりめんじゃこ 50g', changeType: PAGE_CHANGE_TYPE.STOCK,
    stockRows: [{ fromId: '1001', toId: '1003', qty: '1' }], memo: '在庫を新規格へ移動' }),
  mk('3', '小宮 佳介', '2026-10-05 16:40', { companyName: 'よつ葉乳業', productName: 'よつ葉バター 125g', changeType: PAGE_CHANGE_TYPE.PUBLISH,
    specId: '20000002', posts: publishSample(), memo: 'Yahoo店のみ非公開に' }),
  mk('2', '伊波 篤', '2026-10-05 11:05', { companyName: '花王株式会社', productName: 'ビオレUV アクアリッチ ウォータリーエッセンス', changeType: PAGE_CHANGE_TYPE.PERIOD,
    specId: '20000001', posts: periodSample(), memo: '秋の再販の掲載終了を延長' }),
  mk('1', '営業担当A', '2026-10-02 14:30', { companyName: '花王株式会社', productName: 'ビオレUV アクアリッチ ウォータリーエッセンス', changeType: PAGE_CHANGE_TYPE.PAGE, specId: '20000001',
    pageRows: [{ target: '掲載履歴.postName', content: '「夏の日焼け止めフェア」→「夏のUVケアフェア」' }], memo: '' }),
]
