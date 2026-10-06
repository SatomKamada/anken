
// ============================================================
// 掲載ページ変更タブ
// ============================================================

// 変更種別
export const PAGE_CHANGE_TYPES = [
  { value: 'page',    label: '掲載ページ変更' },
  { value: 'period',  label: '掲載開始終了日/募集開始終了日設定' },
  { value: 'publish', label: '公開/非公開設定' },
  { value: 'stock',   label: '在庫移動' },
];

// 公開/非公開設定の対象チャネル
// ※テーブル定義書の「○○公開状態」列を仮置き。正式な一覧は要確認
export const PUBLISH_CHANNELS = [
  { key: 'honten',   label: '本店' },
  { key: 'yahoo',    label: 'Yahoo店' },
  { key: 'd',        label: 'd店' },
  { key: 'dbarai',   label: 'd払い店' },
  { key: 'seikatsu', label: '生活市場' },
  { key: 'umahaku',  label: 'うま博' },
  { key: 'chiiki',   label: '地域創生' },
];

// 公開状態（テーブル定義書のコード値に合わせる：1:公開, 0:非公開）
export const PUBLISH_STATUS_OPTIONS = [
  { value: '1', label: '公開' },
  { value: '0', label: '非公開' },
];

// 変更対象の項目から除外する価格関連項目（ラベルで判定・仮置き）
export const PRICE_FIELD_PATTERN = /価格|売価|原価|単価|金額|送料|手数料|粗利|掛率|税/;

// 案件タブのフィールド定義 → 変更対象の項目プルダウン
// ※既存の案件フィールド定義の key/label 名に合わせて調整
export const getPageChangeTargets = (caseFields = []) =>
  caseFields
    .map((f) => ({ key: f.key ?? f.id ?? f.name, label: f.label ?? f.name }))
    .filter((f) => f.key && f.label && !PRICE_FIELD_PATTERN.test(f.label));

// 初期値
export const createPageChangeInitial = () => ({
  changeType: '',
  pageRows: [{ target: '', content: '' }],
  postStart: '', postEnd: '',
  recruitStart: '', recruitEnd: '',
  publish: Object.fromEntries(PUBLISH_CHANNELS.map((c) => [c.key, ''])),
  stockRows: [{ fromId: '', toId: '', qty: '' }],
});
