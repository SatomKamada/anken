
// ============================================================
// 掲載ページ変更タブ
// ============================================================

export const PAGE_CHANGE_TYPE = {
  PAGE:    '掲載ページ変更',
  PERIOD:  '掲載開始終了日/募集開始終了日設定',
  PUBLISH: '公開/非公開設定',
  STOCK:   '在庫移動',
}

// 共通項目（Field.jsx で描画）
export const PAGE_CHANGE_FIELDS = [
  { key: 'recordNo',   label: 'レコード番号', type: 'text', auto: true },
  { key: 'changeType', label: '変更種別', type: 'select', required: true,
    options: Object.values(PAGE_CHANGE_TYPE) },
]

// 公開/非公開設定の対象チャネル
// ※テーブル定義書の「○○公開状態」列を仮置き。正式な一覧は要確認
export const PUBLISH_CHANNELS = ['本店', 'Yahoo店', 'd店', 'd払い店', '生活市場', 'うま博', '地域創生']
export const PUBLISH_STATUS_OPTIONS = ['公開', '非公開']

// 変更対象の項目から除外する価格関連項目（ラベルで判定・仮置き）
export const PRICE_FIELD_PATTERN = /価格|売価|原価|単価|金額|送料|手数料|粗利|掛率|税/

// 案件フィールド定義 → 変更対象の項目プルダウン（自動項目・価格関連を除外）
export const getPageChangeTargets = (caseFields = []) =>
  caseFields
    .filter((f) => f.key && f.label && !f.auto && !PRICE_FIELD_PATTERN.test(f.label))
    .map((f) => ({ key: f.key, label: f.label }))

export const createPageChangeInitial = (recordNo = '') => ({
  recordNo,
  changeType: '',
  pageRows: [{ target: '', content: '' }],
  postStart: '', postEnd: '',
  recruitStart: '', recruitEnd: '',
  publish: Object.fromEntries(PUBLISH_CHANNELS.map((c) => [c, ''])),
  stockRows: [{ fromId: '', toId: '', qty: '' }],
})
