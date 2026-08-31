// ============================================================
// 発注管理 項目定義
//   データ連携Excel「kintone_発注管理」シートを基に作成
//   auto:true … 自動付与/自動入力/算出（読み取り専用・グレー表示）
//   type: text | number | select | checkbox | date | datetime | textarea
// ============================================================

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
      { key: 'orderCategory', label: '受発注発注区分', type: 'select', options: ['-','個別発注','一斉発注'] },
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
  o.orderCategory = '-'
  o.ecLinkFlag = '未済'
  return o
}

// ---- 案件種別 選択肢（発注明細の案件リンク）------------------
export const caseTypeLOptions = ['在庫','受発注','通常','その他']
export const caseTypeMOptions = ['試算あり','試算なし','倉庫間移動','その他']
export const caseTypeSOptions = ['メーカー滞留品','NBプロパー','TC','AAS','キャンペーン・抽選','代品・過受注','代品']

// ---- 明細（1:多）--------------------------------------------
export const orderDetailGroups = [
  {
    title: '商品情報',
    fields: [
      { key: 'branchMaxNo',  label: '発注番号（枝番）Max No', type: 'text', auto: true },
      { key: 'janCode',      label: 'JANコード',       type: 'text', reflink: 'jan', ref: 'JAN基本情報.JAN / 商品マスタ.JAN' },
      { key: 'caseJanCode',  label: 'ケースJANコード',  type: 'text' },
      { key: 'jicfsCode',    label: 'JICFS分類コード',  type: 'text' },
      { key: 'jicfsKanji',   label: 'JICFS分類名（漢字）', type: 'text' },
      { key: 'jicfsKana',    label: 'JICFS分類名（カナ）', type: 'text' },
      { key: 'jicfsShort',   label: 'JICFS分類名（略称）', type: 'text' },
      { key: 'itfCode',      label: 'ITFコード',        type: 'text' },
      { key: 'productCode',  label: '商品コード',       type: 'text', reflink: 'product', ref: '商品マスタ.商品コード' },
      { key: 'attrCode',     label: '商品属性情報コード', type: 'text', ref: '商品属性情報マスタ' },
      { key: 'attrChangeFlag', label: '商品属性変更フラグ', type: 'checkbox' },
      { key: 'productName',  label: '商品名',           type: 'text' },
      { key: 'medicineType', label: '医薬区分',         type: 'select', options: ['対象外','要指導医薬品','第1類医薬品','第2類医薬品','第3類医薬品','医薬部外品','医薬品未分類'] },
      { key: 'alcoholType',  label: 'アルコール区分',   type: 'select', options: ['対象外','お酒','ノンアルコール','みりん'] },
      { key: 'categoryL',    label: '商品カテゴリー（大）', type: 'text', ref: 'カテゴリマスタ' },
      { key: 'categoryM',    label: '商品カテゴリー（中）', type: 'text', ref: 'カテゴリマスタ' },
      { key: 'categoryS',    label: '商品カテゴリー（小）', type: 'text', ref: 'カテゴリマスタ' },
      { key: 'autoStockLink', label: '在庫自動紐づけフラグ', type: 'checkbox' },
    ],
  },
  {
    title: '規格・単位',
    fields: [
      {
        key: 'saleType', label: '販売区分', type: 'select',
        options: ['通常','わけあり（B品）','わけあり（期限）','抽選・発送あり','抽選・発送なし','先着・発送あり','先着・発送なし','イベント・発送あり','イベント・発送なし','代品','企画1','企画2','企画3'],
      },
      { key: 'saleUnitType', label: '販売単位区分', type: 'select', options: ['ケース売り','ボウル売り','ピース売り'] },
      { key: 'tempZone',     label: '温度帯',       type: 'select', options: ['常温','冷蔵','冷凍','チルド','超冷凍','その他'] },
      { key: 'dryIce',       label: 'ドライアイス', type: 'checkbox' },
      { key: 'bestBeforeType', label: '期限種別',   type: 'select', options: ['使用期限','賞味期限','消費期限'] },
      { key: 'bestBeforeDate', label: '消費/賞味/使用期限', type: 'date' },
      { key: 'bestBeforeDiffFlag', label: '賞味期限差異フラグ', type: 'checkbox' },
      { key: 'orderCaseCount', label: '発注ケース入数', type: 'number', note: '現行：ケース入数' },
      { key: 'orderBallCount', label: '発注ボール入数', type: 'number', note: '現行：ボール入数' },
      { key: 'orderCaseQty',   label: '発注ケース数',   type: 'number', note: '例：2ケース,5ケース' },
      { key: 'totalPieceQty',  label: '発注総ピース数', type: 'number', auto: true, note: 'ケース入数×ケース数' },
      { key: 'totalPieceActual', label: '発注総ピース数（実績）', type: 'number', auto: true, ref: 'WMS.ピース数' },
      { key: 'netContent',   label: '内容量', type: 'text' },
      { key: 'unit',         label: '単位',   type: 'text' },
    ],
  },
  {
    title: 'メーカー情報',
    fields: [
      { key: 'makerCode',      label: 'メーカーコード',       type: 'text', ref: 'メーカーマスタ.コード' },
      { key: 'makerName',      label: 'メーカー名',           type: 'text', auto: true, ref: 'メーカーマスタ.メーカー名' },
      { key: 'makerAddFlag',   label: 'メーカーマスタ追加フラグ', type: 'checkbox' },
    ],
  },
  {
    title: '倉庫・配送情報',
    fields: [
      { key: 'warehouseCode',  label: '倉庫コード',       type: 'text', ref: '倉庫マスタ.id' },
      { key: 'warehouse',      label: '倉庫',             type: 'text', auto: true, ref: '倉庫マスタ.倉庫業者名' },
      { key: 'sagawaType',     label: '佐川入荷区分',     type: 'text', note: '倉庫に連携' },
      { key: 'sagawaTypeCode', label: '佐川入荷区分コード', type: 'text', note: '倉庫に連携' },
      { key: 'deliveryDate',   label: '納品日',           type: 'date' },
      { key: 'deliveryDateActual', label: '納品日（実績）', type: 'date', auto: true, ref: 'WMS.納品日' },
      { key: 'arrivalStatus',  label: '入荷ステータス',   type: 'text', auto: true, ref: 'WMS' },
      { key: 'earlyArrivalFlag', label: '予定日前入荷フラグ', type: 'checkbox', auto: true, ref: 'WMS' },
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
      { key: 'rebateUnitEx',   label: 'リベート単価（税抜）', type: 'number' },
      { key: 'adjustAmount',   label: '調整金額',           type: 'number' },
      { key: 'promoUnitEx',    label: 'プロモーション単価（税抜）', type: 'number' },
      { key: 'finalUnitEx',    label: '決着単価（税抜）',   type: 'number', auto: true, note: '単価-リベート-調整+プロモ' },
      { key: 'finalTotalEx',   label: '決着合計金額（税抜）', type: 'number', auto: true, note: '決着単価×ピース数' },
      { key: 'paymentDate',    label: '支払日',             type: 'date' },
      { key: 'invoiceCheck',   label: '請求書チェック（営業アシスタント）', type: 'checkbox' },
    ],
  },
  {
    title: '販売目標情報',
    fields: [
      { key: 'salesTarget',        label: '販売目標',           type: 'text', note: '例：2026/4/27' },
      { key: 'salesTargetManual',  label: '販売目標手動設定フラグ', type: 'select', options: ['手動','自動'] },
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
  // 案件番号（複数紐づけ可）
  o.caseLinks = [makeEmptyCaseLink()]
  // 販売目標変更履歴（サブテーブル）
  o.targetHistory = []
  return o
}

// ---- 案件番号リンク（明細内・複数可）------------------------
export function makeEmptyCaseLink() {
  return { caseNo: '', caseTypeL: '', caseTypeM: '', caseTypeS: '', refPriceEx: '' }
}

// ---- 販売目標変更履歴（明細内サブテーブル）------------------
export const targetHistoryFields = [
  { key: 'orderNo',      label: '発注番号',        type: 'text', auto: true },
  { key: 'branchNo',     label: '枝番号',          type: 'text', auto: true },
  { key: 'targetBefore', label: '販売目標（変更前）', type: 'text', auto: true },
  { key: 'changedBy',    label: '変更者',          type: 'text', auto: true },
  { key: 'changedAt',    label: '変更日付',        type: 'text', auto: true },
]

export function makeEmptyTargetHistory() {
  const o = {}
  for (const f of targetHistoryFields) o[f.key] = ''
  return o
}
