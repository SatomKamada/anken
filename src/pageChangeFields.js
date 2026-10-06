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

export const createPageChangeInitial = (recordNo = '') => ({
  recordNo,
  changeType: '',
  pageRows: [{ target: '', content: '' }],
  postStart: '', postEnd: '',
  recruitStart: '', recruitEnd: '',
  publish: Object.fromEntries(PUBLISH_CHANNELS.map((c) => [c, ''])),
  stockRows: [{ fromId: '', toId: '', qty: '' }],
})
