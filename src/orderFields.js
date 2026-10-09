// ============================================================
// 発注管理 項目定義
//   データ連携Excel「kintone_発注管理」シートを基に作成
//   auto:true … 自動付与/自動入力/算出（読み取り専用・グレー表示）
//   type: text | number | select | checkbox | date | datetime | textarea
// ============================================================

import { choppleTypeOptions } from './fields.js'

// ---- ヘッダー（発注書単位・共通）----------------------------
export const orderHeaderGroups = [
  {
    // 最上位分類（ラベル非表示）：ヘッダー番号＋プロモ＋発注情報＋システム情報
    title: null,
    fields: [
      { key: 'orderNo',       label: 'ヘッダー番号',       type: 'text', auto: true },
      { key: 'promotionCode', label: 'プロモーションコード', type: 'text', note: '例：25年5月提案6月納品' },
      { key: 'orderFrom',     label: '発注元', type: 'text', note: '例：ちょっプル、オールアバウトストア' },
      {
        key: 'orderStatus', label: '発注ステータス', type: 'select',
        options: ['入力中','登録済','申請中','承認済','発注済','一部入荷','全部入荷','差戻','NG'],
        note: '登録済の段階で倉庫に連携',
      },
      { key: 'orderCategory', label: '受発注発注区分', type: 'select', options: ['個別発注','一斉発注'] },
      { key: 'ecLinkFlag',    label: 'EC基盤自動連携フラグ', type: 'select', options: ['未済','済'], note: '現行：Spica登録状況' },
    ],
  },
  {
    title: '企業情報',
    fields: [
      { key: 'companyId',   label: '企業コード', type: 'text', reflink: 'company', ref: '企業マスタ.id' },
      { key: 'companyName', label: '企業名',     type: 'text', auto: true, ref: '企業マスタ.企業名' },
      { key: 'shopName',    label: '屋号',       type: 'text' },
    ],
  },
  {
    title: '発注情報', // 旧：商品情報（集計）
    fields: [
      { key: 'totalCase',  label: 'ケース数合計', type: 'number', auto: true, note: '明細の合計' },
      { key: 'totalPiece', label: 'ピース数合計', type: 'number', auto: true, note: 'ピース合計' },
    ],
  },
  {
    title: '支払い情報',
    fields: [
      { key: 'amountExTotal', label: '発注金額合計（税抜）', type: 'number', auto: true, note: '各明細のSUM' },
      { key: 'tax8',          label: '消費税（8%）',        type: 'number', auto: true },
      { key: 'tax10',         label: '消費税（10%）',       type: 'number', auto: true },
      { key: 'amountInTotal', label: '発注金額合計（税込み）', type: 'number', auto: true, note: '税抜＋消費税' },
      {
        key: 'paymentTerms', label: '支払条件', type: 'select',
        options: ['末締め翌月末払い','15日締め払い','末締め翌月15日払い','日付指定'],
      },
      { key: 'paymentDue',    label: '支払期日',            type: 'date' },
    ],
  },
  {
    title: '担当者情報',
    fields: [
      { key: 'assignee',  label: '担当者',   type: 'text',     auto: true },
      { key: 'createdAt', label: '作成日時', type: 'datetime', auto: true },
    ],
  },
  {
    title: '備考',
    fields: [
      { key: 'note', label: '備考', type: 'textarea' },
    ],
  },
]

export const orderHeaderFields = orderHeaderGroups.flatMap((g) => g.fields)

export function makeEmptyOrderHeader() {
  const o = {}
  for (const f of orderHeaderFields) {
    o[f.key] = f.type === 'checkbox' ? false : ''
  }
  // 自動付与のダミー値
  o.orderNo = '000123'          // ヘッダー番号
  o.assignee = '営業担当A'
  o.createdAt = '2026-08-31T10:00'
  o.orderStatus = '入力中'
  o.orderCategory = ''
  o.ecLinkFlag = '未済'
  return o
}

// ---- ヘッダー選択肢（発注タブの詳細・一覧で共通利用）------------
// 案件種別（大）＝ちょっプル種別
export const caseTypeLOptions = choppleTypeOptions
export const caseTypeMOptions = ['ちょっプル','抽選サンプル','イベント','プロモーション','スグーマ','ドルチェ']
export const caseTypeSOptions = ['メーカー滞留品','NBプロパー','TC','AAS','キャンペーン・抽選','代品・過受注','代品']
export const orderCategoryOptions = ['個別発注','一斉発注']          // 1:個別発注, 2:一斉発注
export const productTypeOptions  = ['医薬','薬類','その他']          // 1:医薬, 2:薬類, 3:その他
// 明細：在庫紐づけ
export const stockLinkOptions = ['紐づけあり','紐づけなし']

// ---- 商品属性情報コード：JANに紐づく選択肢（ダミー）---------------
//   表示は「商品属性コード：備考」、値は商品属性コード
const ATTR_BY_JAN = {
  '4908013230864': [{ code: '10001234001', note: '通常品' }, { code: '10001234002', note: 'わけあり（期限）' }, { code: '10001234003', note: '初試し用' }],
  '4901301390546': [{ code: '10004567001', note: '通常品' }, { code: '10004567002', note: '2個セット' }],
}
export function attrOptionsForJan(jan) {
  const j = (jan || '').trim()
  if (!j) return []
  if (ATTR_BY_JAN[j]) return ATTR_BY_JAN[j]
  // 未登録のJANはダミーの選択肢を生成
  const base = '1' + j.slice(-7) + '0'
  return [{ code: base + '01', note: '通常品' }, { code: base + '02', note: 'わけあり（期限）' }]
}

// ---- 明細（1:多）--------------------------------------------
// 並び順・項目名・選択肢はテーブル定義書（発注明細）に合わせる
export const saleTypeOptions = ['通常','わけあり（B品）','わけあり（期限）','抽選・発送あり','抽選・発送なし','先着・発送あり','先着・発送なし','イベント・発送あり','イベント・発送なし']
export const bestBeforeTypeOptions = ['なし','賞味期限','消費期限','製造日']

export const orderDetailGroups = [
  {
    title: '商品情報',
    fields: [
      { key: 'branchMaxNo',  label: '発注番号（枝番）Max No', type: 'text', auto: true },
      { key: 'caseNo',       label: '案件番号',         type: 'text', reflink: 'case', ref: '案件管理.id' },
      { key: 'janCode',      label: 'JANコード',       type: 'text', reflink: 'jan', ref: 'JAN基本情報.JAN / 商品マスタ.JAN' },
      { key: 'caseJanCode',  label: 'ケースJANコード',  type: 'text' },
      { key: 'productId',    label: '商品ID',           type: 'text', ref: '商品マスタ.id' },
      { key: 'productName',  label: '商品名',           type: 'text' },
      { key: 'categoryL',    label: '商品カテゴリー（大）', type: 'text', ref: 'カテゴリマスタ' },
      { key: 'categoryM',    label: '商品カテゴリー（中）', type: 'text', ref: 'カテゴリマスタ' },
      { key: 'categoryS',    label: '商品カテゴリー（小）', type: 'text', ref: 'カテゴリマスタ' },
      { key: 'makerId',      label: 'メーカーコード',       type: 'text', ref: 'メーカーマスタ' },
      { key: 'makerName',    label: 'メーカー名',           type: 'text', auto: true, ref: '商品マスタ→メーカーマスタ.メーカー名' },
      { key: 'attrCode',     label: '商品属性情報コード', type: 'text', required: true, ref: '商品属性情報マスタ' },
      { key: 'saleType',     label: '規格区分',         type: 'select', options: saleTypeOptions },
      { key: 'stockLinkFlag', label: '在庫自動紐づけ',  type: 'select', options: stockLinkOptions },
      { key: 'itfCode',      label: 'ITFコード',        type: 'text' },
    ],
  },
  {
    title: '規格・期限',
    fields: [
      { key: 'bestBeforeType', label: '期限種別',   type: 'select', options: bestBeforeTypeOptions },
      { key: 'bestBeforeDate', label: '消費/賞味/使用期限', type: 'date' },
      { key: 'bestBeforeDateActual', label: '消費/賞味/使用期限（実績）', type: 'date', auto: true },
      { key: 'bestBeforeDiffFlag', label: '賞味期限差異フラグ', type: 'checkbox' },
    ],
  },
  {
    title: '発注情報',
    fields: [
      { key: 'orderCaseCount', label: '発注ケース入数', type: 'number' },
      { key: 'orderBallCount', label: '発注ボール入数', type: 'number' },
      { key: 'orderCaseQty',   label: '発注ケース数',   type: 'number' },
      { key: 'totalPieceQty',  label: '発注ピース数',   type: 'number', auto: true, note: '発注ケース入数×発注ケース数' },
    ],
  },
  {
    title: '倉庫・配送情報',
    fields: [
      { key: 'warehouse',      label: '倉庫',             type: 'select', options: ['佐川倉庫','日通倉庫','自社倉庫'], ref: '倉庫マスタ.倉庫業者名' },
      { key: 'sagawaType',     label: '佐川入荷区分',     type: 'text', note: '倉庫に連携' },
      { key: 'sagawaTypeCode', label: '佐川入荷区分コード', type: 'text', note: '倉庫に連携' },
      { key: 'deliveryDate',   label: '納品日',           type: 'date' },
      { key: 'deliveryDateActual', label: '納品日（実績）', type: 'date', auto: true, ref: 'WMS.納品日' },
      { key: 'arrivalStatus',  label: '入荷ステータス',   type: 'text', auto: true, ref: 'WMS' },
      { key: 'earlyArrivalFlag', label: '予定日前入荷フラグ', type: 'checkbox' },
      { key: 'wmsDeleteFlag',  label: 'WMSデータ削除フラグ', type: 'checkbox' },
    ],
  },
  {
    title: '価格情報',
    fields: [
      { key: 'refPriceEx',     label: '参考価格（税抜）',   type: 'number', ref: '案件管理.参考価格（税抜）' },
      { key: 'unitPriceEx',    label: '単価（税抜）',       type: 'number' },
      { key: 'taxRate',        label: '税率',               type: 'select', options: ['8%','10%'] },
      { key: 'amountEx',       label: '発注金額（税抜）',   type: 'number', auto: true, note: '単価×発注ピース数' },
      { key: 'amountExActual', label: '発注金額（実績）（税抜）', type: 'number', auto: true },
      { key: 'amountInActual', label: '発注金額（実績）（税込）', type: 'number', auto: true },
      { key: 'rebateUnitEx',   label: 'リベート単価（税抜）', type: 'number' },
      { key: 'adjustAmount',   label: '調整金額',           type: 'number' },
      { key: 'promoUnitEx',    label: 'プロモーション単価（税抜）', type: 'number' },
      { key: 'finalUnitEx',    label: '決着単価（税抜）',   type: 'number', auto: true, note: '単価-リベート-調整+プロモ' },
      { key: 'finalTotalEx',   label: '決着合計金額（税抜）', type: 'number', auto: true, note: '決着単価×ピース数' },
      { key: 'paymentDate',    label: '支払日',             type: 'date' },
    ],
  },
]

export const orderDetailFields = orderDetailGroups.flatMap((g) => g.fields)

export function makeEmptyOrderDetail() {
  const o = {}
  for (const f of orderDetailFields) {
    o[f.key] = f.type === 'checkbox' ? false : ''
  }
  o.branchMaxNo = '1'
  o.branchNo = ''            // 発注明細番号（枝番）：入力可・追加/複製で自動採番
  return o
}

// ---- 案件番号リンク（明細内・複数可）------------------------
export function makeEmptyCaseLink() {
  return { caseNo: '', caseTypeL: '', caseTypeM: '', caseTypeS: '', refPriceEx: '' }
}
