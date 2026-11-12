// ============================================================
// 案件管理（現行踏襲・シンプル版）一覧列・ダミーデータ・計算
//   項目そのもの（名前・グループ・型）は caseSimpleDefs.js（定義書から自動生成）
//   レコードは「論理名 → 値」のオブジェクトで持つ
// ============================================================
import { CASE_DEFS } from './caseSimpleDefs.js'
import { alcoholOptions, deliveryMethodOptions, approvalFlowOptions, deliveryExcludeOptions } from './fields.js'
import { COMPANY_BY_NAME, CURRENT_USER } from './caseListFields.js'

// ---- 定義書に選択肢がない項目の選択肢
export const OPTION_OVERRIDES = {
  '制作ステータス': ['制作済', '画像UP待', '営業確認待', 'PV済', 'PV不要', '転記済', 'NG'],
  '販売形態': ['ケース売り', 'ピース売り', 'ボール売り'],
  'ショッピング広告掲載': ['掲載可', '掲載不可', '掲載済'],
  '掲載変更ステータス': ['メルマガチェック済', '元ID非表示済', '画像UP待', '営業確認待', '掲載チェック待', '対応済', '転記済', 'NG'],
  '掲載時間': Array.from({ length: 24 }, (_, h) => `${h}:00`),
  '申込可能個数': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
  '酒類': alcoholOptions,                 // 以下は既存 fields.js を流用
  '配送方法名称': deliveryMethodOptions,
  '承認フロー': approvalFlowOptions,
}

// ---- 名称とコードのセット：名称を入力するとコードが自動で入る
const WAREHOUSE_ID = { '柏倉庫': 'W01', '厚木倉庫': 'W02', '大阪倉庫': 'W03' }
const EXCLUDE_ID = Object.fromEntries(deliveryExcludeOptions.map((o, i) => [o, `X${String(i + 1).padStart(2, '0')}`]))
export const PAIRS = {
  '企業名': { code: '企業コード', table: COMPANY_BY_NAME },
  '倉庫': { code: '倉庫ID', table: WAREHOUSE_ID },
  '配送除外地域': { code: '配送除外地域ID', table: EXCLUDE_ID },
  '配送料種別': { code: '配送料種別ID', table: { '佐川10kg未満': 'F01', '佐川10kg以上': 'F02' } },
}

// ---- カテゴリーマスタ（カテゴリーコード → 大・中・小）
export const CATEGORY_MASTER = {
  C061005: ['キッチン・日用品', '生活雑貨', '防災グッズ'],
  C010101: ['食品・調味料', '乳製品', 'バター'],
  C010203: ['食品・調味料', '加工食品', '佃煮・ふりかけ'],
  C040101: ['日用品', '洗剤', '衣料用洗剤'],
  C030201: ['ビューティー', 'スキンケア', '日焼け止め'],
  C030105: ['ビューティー', 'スキンケア', 'ハンドクリーム'],
}

// ============================================================
// 画面レイアウト調整（定義書の順序・グループに対する画面上の並べ替え）
// ============================================================
const EXCLUDE = new Set([                                                     // 画面に出さない
  '非会員申込可否', '種別',
  'お試し費用（税込）＋5%を手入力する[お試し費用（税込）＋5%を手入力する]',
])
const RENAME = { '掲載ID': '商品規格ID', '掲載変更種別': '種別' }               // 画面上の名称
const MOVE_BEFORE = { '掲載確定日': '掲載時間' }                                  // 同じグループ内で前へ
const MOVE_TO_GROUP_TOP = { '掲載変更ステータス': '確定情報（オペ・営業企画入力）' } // 別グループの先頭へ
const AFTER_CATEGORY = ['酒類', '医薬', '過去実績/類似商品実績']                  // カテゴリーの下へ
const GROUP_FIRST = ['商品', '商品規格', '掲載履歴']                             // 最上部の次に並べる

function arrange(defs) {
  let list = defs.filter((d) => !EXCLUDE.has(d.name)).map((d) => (RENAME[d.name] ? { ...d, label: RENAME[d.name] } : d))
  for (const [name, before] of Object.entries(MOVE_BEFORE)) {
    const d = list.find((x) => x.name === name)
    list = list.filter((x) => x !== d)
    list.splice(list.findIndex((x) => x.name === before), 0, d)
  }
  for (const [name, g] of Object.entries(MOVE_TO_GROUP_TOP)) {
    const d = list.find((x) => x.name === name)
    list = list.filter((x) => x !== d)
    list.splice(list.findIndex((x) => x.group === g), 0, { ...d, group: g })
  }
  const moving = AFTER_CATEGORY.map((nm) => list.find((x) => x.name === nm)).filter(Boolean)
  list = list.filter((x) => !moving.includes(x))
  list.splice(list.findIndex((x) => x.name === '小カテゴリー') + 1, 0, ...moving)
  // 「単価」グループは「総額」と同名の項目があるため値のキーを分ける
  const totalNames = new Set(list.filter((d) => d.group === '総額').map((d) => d.name))
  return list.map((d) => ({ ...d, vkey: d.group === '単価' && totalNames.has(d.name) ? `${d.name}（単価）` : d.name }))
}
export const DEFS = arrange(CASE_DEFS)
const groupsInOrder = [...new Set(DEFS.map((d) => d.group))].filter((g) => g !== '')
export const GROUPS = [...GROUP_FIRST.filter((g) => groupsInOrder.includes(g)),
  ...groupsInOrder.filter((g) => !GROUP_FIRST.includes(g))]
export const DEF_BY_NAME = Object.fromEntries(DEFS.map((d) => [d.vkey, d]))

// ---- チャネル別に横一列で並べるグループ（行ラベル → 項目名の接頭辞）
export const CHANNELS = ['本店', 'dサンプル', 'd払い', '社販コム', '会員コム', 'Y店']
export const CHANNEL_ROW_GROUPS = { 'お試し費用': '共通', '粗利': '本店' }   // 値＝接頭辞なし項目の行
// チャネル行の列の並び（チャネル名を除いた項目名）。列をそろえ、ない項目は空欄
export const CHANNEL_SLOTS = {
  'お試し費用': ['お試し費用（税込）', 'お試し費用（税抜）', 'お試し費用（変更フラグ）', '加算料率マスタ', '加算料率',
    '加算料率（%）', 'クーポン値引額（税込）', 'クーポン値引額（税抜）', '当月出荷見込み数'],
  '粗利': ['セット粗利', '粗利合計', '粗利率'],
}

// ---- 総額・単価：チャネルを列、指標を行にした並べ方（現行画面どおり）
const METRICS = [
  ['原価', false], ['仕入原価', true], ['物流費', true], ['決済手数料', true], ['販売手数料', true],
  ['粗利（クーポン控除後）', false],
]
const rateName = (ch, m) => (m === '粗利（クーポン控除後）' ? `${ch}粗利率（クーポン控除後）` : `${ch}${m}率`)
export const MATRIX = {
  '総額': {
    top: ['本店売上比率'],
    cols: ['総', '本店', 'dサンプル', 'd払い'],
    head: (ch) => (ch === '総' ? '総売上' : `${ch}売上`),
    rows: METRICS.map(([m, indent]) => ({ indent, cells: (ch) => [`${ch}${m}`, rateName(ch, m)] })),
  },
  '単価': {
    top: [],
    cols: ['本店', 'dサンプル', 'd払い'],
    head: (ch) => `${ch}単価売上`,
    rows: METRICS.map(([m]) => ({ indent: false, cells: (ch) => [`${ch}${m}（単価）`, `${rateName(ch, m)}（単価）`] })),
  },
}

// ---- 「〇〇を手入力する」チェックで入力可になる項目 → フラグ項目名
export const MANUAL_FLAG = {
  'dサンプルお試し費用（税込）': 'dサンプルお試し費用（変更フラグ）[dサンプルお試し費用を手入力する]',
  'd払いお試し費用（税込）': 'd払いお試し費用（変更フラグ）[d払いお試し費用を手入力する]',
  '社販コムお試し費用（税込）': '社販コムお試し費用（変更フラグ）[社販コムお試し費用を手入力する]',
  '会員コムお試し費用（税込）': '会員コムお試し費用（変更フラグ）[会員コムお試し費用を手入力する]',
  'Y店お試し費用（税込）': 'Y店お試し費用（変更フラグ）[Y店お試し費用を手入力する]',
}

// ---- 一覧の列：詳細と同じ名称で、指定グループの項目＋個別項目（倉庫）を並べる
//   ''＝最上部（グループ外）の項目
const LIST_GROUPS = ['', '商品', 'お試し費用', '粗利', '掲載チャネル']
const LIST_EXTRA = ['倉庫']
export const CS_LIST_COLS = [
  ...LIST_GROUPS.flatMap((g) => DEFS.filter((d) => d.group === g)),
  ...LIST_EXTRA.map((nm) => DEFS.find((d) => d.name === nm)).filter(Boolean),
].map((d) => ({ name: d.vkey, label: d.label, kind: d.kind }))

export const fmtVal = (kind, v) => {
  if (kind === 'checkbox') return v ? '✓' : ''
  if (v === '' || v === null || v === undefined) return ''
  if (kind === 'money') return '¥' + Number(v).toLocaleString()
  if (kind === 'pct') return Number(v).toLocaleString(undefined, { maximumFractionDigits: 1 }) + '%'
  if (kind === 'num') return Number(v).toLocaleString()
  return String(v)
}

// ============================================================
// 計算（売価ロジック・上代・仕入れ）
//   粗利・総額・単価・変動は試算表のロジック未反映（表示枠のみ）
// ============================================================
const ADD_RATE = { dサンプル: 8, d払い: 8, Y店: 10 }   // 加算料率マスタ（%）
const PRICE_TYPES = ['在庫型（常温）', '在庫型（冷凍・冷蔵）', '受発注型（常温）', '受発注型（冷凍・冷蔵）']
const n = (x) => (x === '' || x === null || x === undefined || isNaN(Number(x)) ? null : Number(x))

export function recalc(src) {
  const v = { ...src }
  for (const [name, p] of Object.entries(PAIRS)) v[p.code] = p.table[String(v[name] ?? '').trim()] ?? ''
  const tax = v['軽減税率フラグ'] ? 1.08 : 1.10
  const refEx = n(v['参考価格（税抜）']), pieces = n(v['販売ピース数']) ?? 1
  const t = n(v['お試し費用（税込）'])

  v['参考価格（税込）'] = refEx === null ? '' : Math.round(refEx * tax)
  v['上代合計（税抜）'] = refEx === null ? '' : refEx * pieces
  v['上代合計（税込）'] = refEx === null ? '' : Math.round(refEx * pieces * tax)

  v['dサンプル加算料率マスタ'] = 'dサンプル用'; v['d払い加算料率マスタ'] = 'd払い用'; v['Y店加算料率マスタ'] = 'Yahoo!用'
  for (const ch of ['dサンプル', 'd払い', 'Y店']) {
    v[`${ch}加算料率`] = ADD_RATE[ch] / 100
    v[`${ch}加算料率（%）`] = ADD_RATE[ch]
  }

  const manual = (name) => !!v[MANUAL_FLAG[name]]
  const set = (name, val) => { if (!manual(name)) v[name] = val }
  if (t === null) {
    ['dサンプル', 'd払い', '社販コム', '会員コム', 'Y店'].forEach((ch) => set(`${ch}お試し費用（税込）`, ''))
  } else if (PRICE_TYPES.includes(v['案件タイプ'])) {
    set('dサンプルお試し費用（税込）', t + Math.round(t * ADD_RATE.dサンプル / 100))
    set('d払いお試し費用（税込）', t + Math.round(t * ADD_RATE.d払い / 100))
    set('社販コムお試し費用（税込）', t - 1)
    set('会員コムお試し費用（税込）', t - 1)
    const upper = n(v['上代合計（税込）'])
    set('Y店お試し費用（税込）', upper === null || upper <= t
      ? t + Math.round(t * ADD_RATE.Y店 / 100)
      : upper - (n(v['Y店クーポン値引額（税込）']) ?? 0))
  } else {
    ['dサンプル', 'd払い', '社販コム', '会員コム', 'Y店'].forEach((ch) => set(`${ch}お試し費用（税込）`, t))
  }

  const tEx = t === null ? null : Math.floor(t / tax)
  v['お試し費用（税抜）'] = tEx ?? ''
  const y = n(v['Y店お試し費用（税込）'])
  v['Y店お試し費用（税抜）'] = y === null ? '' : Math.floor(y / tax)
  v['お試し費用単価（税込）'] = t === null ? '' : Math.round(t / (pieces || 1))
  set('お試し費用（税抜）+5%', tEx === null ? '' : Math.round(tEx * 1.05))
  v['総売上（税込）'] = t === null ? '' :
    t * (n(v['本店当月出荷見込み数']) ?? 0)
    + (n(v['dサンプルお試し費用（税込）']) ?? 0) * (n(v['dサンプル当月出荷見込み数']) ?? 0)
    + (n(v['d払いお試し費用（税込）']) ?? 0) * (n(v['d払い当月出荷見込み数']) ?? 0)

  const sets = n(v['セット数']), cost = n(v['仕入単価（税抜）'])
  v['セット原価'] = cost ?? ''
  v['仕入合計'] = sets !== null && cost !== null ? sets * cost : ''
  const upEx = n(v['上代合計（税抜）'])
  v['掛け率'] = cost !== null && upEx ? Math.round(cost / upEx * 1000) / 10 : ''
  return v
}

// ============================================================
// ダミーデータ（案件No・企業名・掲載名は既存の案件一覧ダミーと揃える）
// ============================================================
const base = [
  ['1058', '000049', '試算中', '新規', '在庫型（常温）', '花王株式会社', 'アタックZERO 初試しキャンペーン', '2026-11-01', '2026-10-20', 1200, 1, 500, 380, 650, '営業担当A', '4901301421868', 'C040101'],
  ['1057', '000048', '承認待', '商品規格追加', '受発注型（冷凍・冷蔵）', 'よつ葉乳業', 'よつ葉バター 2個セット追加', '2026-11-15', '2026-11-01', 540, 2, 300, 420, 590, '伊波 篤', '4908013230864', 'C010101'],
  ['1056', '000047', '承認済', '新規', '在庫型（冷凍・冷蔵）', 'よつ葉乳業', '北海道フェア よつ葉バター', '2026-10-01', '2026-10-01', 540, 1, 1000, 210, 300, '伊波 篤', '4908013230864', 'C010101'],
  ['1055', '000046', '差戻し', '掲載履歴追', '直送型', '花王株式会社', 'ビオレUV 秋の再販 掲載期間修正', '2026-09-15', '2026-09-15', 960, 1, 400, 300, 480, '小宮 佳介', '4901301390546', 'C030201'],
  ['1054', '000045', '確定済', '新規', '在庫型（常温）', '花王株式会社', 'ビオレUV 夏の日焼け止めフェア', '2026-07-01', '2026-07-01', 960, 1, 800, 300, 420, '小宮 佳介', '4901301390546', 'C030201'],
  ['1053', '000044', '再申請', '掲載履歴追', '受発注型（常温）', '△△食品', '和の食卓特集 ちりめんじゃこ', '2026-11-01', '2026-11-01', 550, 1, 200, 180, 300, '営業担当A', '4987241100118', 'C010203'],
  ['1052', '000043', 'NG', '商品規格追加', '在庫型（常温）', 'ユースキン製薬株式会社', 'ユースキンA 冬の乾燥対策', '2026-12-01', '2026-11-20', 1650, 1, 600, 520, 660, '伊波 篤', '4987234010127', 'C030105'],
]

const addDays = (d, k) => { const x = new Date(d); x.setDate(x.getDate() + k); return x.toISOString().slice(0, 10) }

export const makeEmptyCase = (recordNo = '', user = CURRENT_USER) => recalc({
  'レコード番号': recordNo, '案件No': '', '案件ステータス': '試算中', '作成者ID': user, '更新者ID': user,
  '軽減税率フラグ': true, '販売ピース数': 1, '単位': 'なし', '通常/プロパー': '通常', '申込可能個数': '5',
  '事前アンケート': '無', '事後アンケート': '無', '本店': true, 'ショッピング広告掲載': '掲載可',
  '販売形態': 'ピース売り', '本店売上比率': 55,
})

export const CS_RECORDS_INIT = base.map(([no, caseNo, st, chg, type, comp, name, post, recruit, ref, pieces, sets, cost, trial, user, jan, cat], i) => recalc({
  ...makeEmptyCase(no, user),
  '案件No': caseNo, '案件ステータス': st, '掲載変更種別': chg, '案件タイプ': type, '承認フロー': '通常',
  '企業名': comp, '掲載名': name, '制作ステータス': ['営業確認待', '画像UP待', '制作済', 'PV済'][i % 4],
  'JAN': jan, 'カテゴリーコード': cat, '大カテゴリー': CATEGORY_MASTER[cat][0],
  '中カテゴリー': CATEGORY_MASTER[cat][1], '小カテゴリー': CATEGORY_MASTER[cat][2],
  '掲載時間': '10:00', '配送料種別': '佐川10kg未満',
  '仕入れタイプ': i % 2 ? '仕入れ' : '通常', '倉庫': ['柏倉庫', '厚木倉庫', '大阪倉庫'][i % 3],
  '配送方法名称': type.includes('冷') ? 'クール便' : '通常', '配送形態': '佐川10kg未満',
  '掲載予定日': post, '掲載終了日': addDays(post, 14), '募集予定日': recruit, '募集終了日': addDays(recruit, 7),
  '掲載ID': ['確定済', '承認済'].includes(st) ? `P${caseNo}` : '', '前回ID': '0',
  '掲載確定日': ['確定済', '承認済'].includes(st) ? addDays(post, -10) : '',
  '納品日': addDays(post, -14), '賞味期限': addDays(post, 365),
  '参考価格（税抜）': ref, '販売ピース数': pieces, '販売ピース総数': pieces * sets,
  'セット数': sets, '仕入単価（税抜）': cost, 'お試し費用（税込）': trial,
  '本店当月出荷見込み数': Math.round(sets * 0.6), 'dサンプル当月出荷見込み数': Math.round(sets * 0.3),
  'd払い当月出荷見込み数': sets - Math.round(sets * 0.6) - Math.round(sets * 0.3),
  'd店': true, 'd払い店': i % 2 === 0,
  '作成日時': `2026-10-0${(i % 9) + 1} 10:00`, '更新日時': `2026-10-0${(i % 9) + 1} 15:30`,
}))

