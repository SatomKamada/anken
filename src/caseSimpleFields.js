// ============================================================
// 案件管理（現行踏襲・シンプル版）一覧列・ダミーデータ・計算
//   項目そのもの（名前・グループ・型）は caseSimpleDefs.js（定義書から自動生成）
//   レコードは「論理名 → 値」のオブジェクトで持つ
// ============================================================
import { CASE_DEFS } from './caseSimpleDefs.js'
import { alcoholOptions, deliveryMethodOptions, approvalFlowOptions } from './fields.js'
import { COMPANY_BY_NAME, CURRENT_USER } from './caseListFields.js'

// ---- 定義書に選択肢がない項目の選択肢（既存の fields.js を流用）
export const OPTION_OVERRIDES = {
  '酒類': alcoholOptions,
  '配送方法名称': deliveryMethodOptions,
  '承認フロー': approvalFlowOptions,
  '申込可能個数': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
}

// ---- ルックアップ（取得ボタン）：コード → 同じグループ内のコピー先項目
const COMPANY_BY_CODE = Object.fromEntries(Object.entries(COMPANY_BY_NAME).map(([n, c]) => [c, n]))
const WAREHOUSE_BY_ID = { W01: '柏倉庫', W02: '厚木倉庫', W03: '大阪倉庫' }
export const LOOKUPS = {
  '企業コード': { target: '企業名', table: COMPANY_BY_CODE },
  '倉庫ID': { target: '倉庫', table: WAREHOUSE_BY_ID },
}

// ---- 「〇〇を手入力する」チェックで入力可になる項目 → フラグ項目名
export const MANUAL_FLAG = {
  'dサンプルお試し費用（税込）': 'dサンプルお試し費用（変更フラグ）[dサンプルお試し費用を手入力する]',
  'd払いお試し費用（税込）': 'd払いお試し費用（変更フラグ）[d払いお試し費用を手入力する]',
  '社販コムお試し費用（税込）': '社販コムお試し費用（変更フラグ）[社販コムお試し費用を手入力する]',
  '会員コムお試し費用（税込）': '会員コムお試し費用（変更フラグ）[会員コムお試し費用を手入力する]',
  'Y店お試し費用（税込）': 'Y店お試し費用（変更フラグ）[Y店お試し費用を手入力する]',
  'お試し費用（税抜）+5%': 'お試し費用（税込）＋5%を手入力する[お試し費用（税込）＋5%を手入力する]',
}

// ---- 一覧の列（現行 kintone の一覧に合わせる）
export const CS_LIST_COLS = [
  { name: 'レコード番号' }, { name: '案件No' }, { name: '案件ステータス' }, { name: '掲載ID' },
  { name: '前回ID' }, { name: '掲載確定日' }, { name: '掲載予定日' }, { name: '納品日' },
  { name: '作成者ID', label: '作成者' }, { name: '掲載変更種別', label: '種別' },
  { name: '仕入れタイプ' }, { name: '企業名', label: 'クライアント名' }, { name: '掲載名' },
  { name: '賞味期限' }, { name: '上代合計（税込）', type: 'money' }, { name: 'お試し費用（税込）', type: 'money' },
]

export const fmtVal = (kind, v) => {
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
  ['1058', '000049', '試算中', '新規', '在庫型（常温）', '花王株式会社', 'アタックZERO 初試しキャンペーン', '2026-11-01', '2026-10-20', 1200, 1, 500, 380, 650, '営業担当A'],
  ['1057', '000048', '承認待', '商品規格追加', '受発注型（冷凍・冷蔵）', 'よつ葉乳業', 'よつ葉バター 2個セット追加', '2026-11-15', '2026-11-01', 540, 2, 300, 420, 590, '伊波 篤'],
  ['1056', '000047', '承認済', '新規', '在庫型（冷凍・冷蔵）', 'よつ葉乳業', '北海道フェア よつ葉バター', '2026-10-01', '2026-10-01', 540, 1, 1000, 210, 300, '伊波 篤'],
  ['1055', '000046', '差戻し', '掲載履歴追', '直送型', '花王株式会社', 'ビオレUV 秋の再販 掲載期間修正', '2026-09-15', '2026-09-15', 960, 1, 400, 300, 480, '小宮 佳介'],
  ['1054', '000045', '確定済', '新規', '在庫型（常温）', '花王株式会社', 'ビオレUV 夏の日焼け止めフェア', '2026-07-01', '2026-07-01', 960, 1, 800, 300, 420, '小宮 佳介'],
  ['1053', '000044', '再申請', '掲載履歴追', '受発注型（常温）', '△△食品', '和の食卓特集 ちりめんじゃこ', '2026-11-01', '2026-11-01', 550, 1, 200, 180, 300, '営業担当A'],
  ['1052', '000043', 'NG', '商品規格追加', '在庫型（常温）', 'ユースキン製薬株式会社', 'ユースキンA 冬の乾燥対策', '2026-12-01', '2026-11-20', 1650, 1, 600, 520, 660, '伊波 篤'],
]

const addDays = (d, k) => { const x = new Date(d); x.setDate(x.getDate() + k); return x.toISOString().slice(0, 10) }

export const makeEmptyCase = (recordNo = '', user = CURRENT_USER) => recalc({
  'レコード番号': recordNo, '案件No': '', '案件ステータス': '試算中', '作成者ID': user, '更新者ID': user,
  '軽減税率フラグ': true, '販売ピース数': 1, '単位': 'なし', '通常/プロパー': '通常', '申込可能個数': '5',
  '事前アンケート': '無', '事後アンケート': '無', '本店': true,
})

export const CS_RECORDS_INIT = base.map(([no, caseNo, st, chg, type, comp, name, post, recruit, ref, pieces, sets, cost, trial, user], i) => recalc({
  ...makeEmptyCase(no, user),
  '案件No': caseNo, '案件ステータス': st, '掲載変更種別': chg, '案件タイプ': type, '承認フロー': '通常',
  '企業コード': COMPANY_BY_NAME[comp] || '', '企業名': comp, '掲載名': name,
  '仕入れタイプ': i % 2 ? '仕入れ' : '通常', '倉庫ID': ['W01', 'W02', 'W03'][i % 3], '倉庫': ['柏倉庫', '厚木倉庫', '大阪倉庫'][i % 3],
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

export { CASE_DEFS }
