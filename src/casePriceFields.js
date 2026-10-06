// ============================================================
// 案件：価格情報（1つの表）項目定義
//   kintone項目一覧から価格に関する項目を抽出し、チャネル別に整理
//   列：チャネル（本店・dサンプル・d払い・社販コム・会員コム・Y店）＋合計
//   names：各セルに対応する現行kintoneの項目名（セルにカーソルを当てると表示）
//          定義のないセルは「—」（グレー）
//   kind：money=¥ / pct=% / num=数値 / check=チェック / text=文字
//   calc：計算項目（表示のみ）。モックのため計算式は未実装（ダミー値を表示）
//   common：全チャネル共通の項目（1セルで表示）
// ============================================================

export const PRICE_CHANNELS = ['本店', 'dサンプル', 'd払い', '社販コム', '会員コム', 'Y店']

// 接頭辞付きの項目名を各チャネルへ展開（本店は接頭辞なし or「本店」）
const per = (base, chs, honten = `本店${base}`) =>
  Object.fromEntries(chs.map((c) => [c, c === '本店' ? honten : `${c}${base}`]))
const C3 = ['本店', 'dサンプル', 'd払い']
const ALL = PRICE_CHANNELS

export const PRICE_SECTIONS = [
  // ---------------- チャネル別（損益の流れ：販売価格 → 売上 → 変動費 → 利益）
  {
    title: '販売価格', open: true,
    rows: [
      { key: 'trialIn', label: 'お試し費用（税込）', kind: 'money', strong: true,
        names: { ...per('お試し費用（税込）', ALL), 本店: 'お試し費用（税込）' } },
      { key: 'trialEx', label: 'お試し費用（税抜）', kind: 'money', calc: true,
        names: { ...per('お試し費用（税抜）', ALL), 本店: 'お試し費用（税抜）' } },
      { key: 'trialManual', label: 'お試し費用を手入力', kind: 'check',
        names: Object.fromEntries(['dサンプル', 'd払い', '社販コム', '会員コム', 'Y店'].map((c) => [c, `${c}お試し費用（変更フラグ）[${c}お試し費用を手入力する]`])) },
      { key: 'addRateMaster', label: '加算料率マスタ', kind: 'text', names: per('加算料率マスタ', ['dサンプル', 'd払い', 'Y店']) },
      { key: 'addRate',       label: '加算料率',       kind: 'num',  names: per('加算料率', ['dサンプル', 'd払い', 'Y店']) },
      { key: 'addRatePct',    label: '加算料率（%）',  kind: 'pct',  names: per('加算料率（%）', ['dサンプル', 'd払い', 'Y店']) },
      { key: 'couponIn', label: 'クーポン値引額（税込）', kind: 'money', names: per('クーポン値引額（税込）', ALL) },
      { key: 'couponEx', label: 'クーポン値引額（税抜）', kind: 'money', calc: true, names: per('クーポン値引額（税抜）', ALL) },
    ],
  },
  {
    title: '販売数・売上', open: true,
    rows: [
      { key: 'forecast',   label: '当月出荷見込み数', kind: 'num', names: per('当月出荷見込み数', C3) },
      { key: 'unitSales',  label: '単価売上', kind: 'money', calc: true, names: per('単価売上', C3) },
      { key: 'sales',      label: '売上', kind: 'money', calc: true, strong: true, names: { ...per('売上', C3), total: '総売上' } },
      { key: 'salesIn',    label: '売上（税込）', kind: 'money', calc: true, names: { total: '総売上（税込）' } },
      { key: 'salesRatio', label: '売上比率', kind: 'pct', calc: true, names: { 本店: '本店売上比率' } },
    ],
  },
  {
    title: '変動費', open: true,
    rows: [
      { key: 'buyCost',      label: '仕入原価',     kind: 'money', calc: true, names: { ...per('仕入原価', C3), total: '総仕入原価' } },
      { key: 'buyCostRate',  label: '仕入原価率',   kind: 'pct',   calc: true, sub: true, names: { ...per('仕入原価率', C3), total: '総仕入原価率' } },
      { key: 'logi',         label: '物流費',       kind: 'money', calc: true, names: { ...per('物流費', C3), total: '総物流費' } },
      { key: 'logiRate',     label: '物流費率',     kind: 'pct',   calc: true, sub: true, names: { ...per('物流費率', C3), total: '総物流費率' } },
      { key: 'settle',       label: '決済手数料',   kind: 'money', calc: true, names: { ...per('決済手数料', C3), total: '総決済手数料' } },
      { key: 'settleRate',   label: '決済手数料率', kind: 'pct',   calc: true, sub: true, names: { ...per('決済手数料率', C3), total: '総決済手数料率' } },
      { key: 'fee',          label: '販売手数料',   kind: 'money', calc: true, names: { ...per('販売手数料', C3), total: '総販売手数料' } },
      { key: 'feeRate',      label: '販売手数料率', kind: 'pct',   calc: true, sub: true, names: { ...per('販売手数料率', C3), total: '総販売手数料率' } },
      { key: 'cost',         label: '原価（変動費計）', kind: 'money', calc: true, strong: true, names: { ...per('原価', C3), total: '総原価' } },
      { key: 'costRate',     label: '原価率',       kind: 'pct',   calc: true, sub: true, names: { ...per('原価率', C3), total: '総原価率' } },
    ],
  },
  {
    title: '利益', open: true, profit: true,
    rows: [
      { key: 'setProfit',  label: 'セット粗利', kind: 'money', calc: true, names: { ...per('セット粗利', ALL), 本店: 'セット粗利' } },
      { key: 'profitRate', label: '粗利率',     kind: 'pct',   calc: true, sub: true, names: { ...per('粗利率', ALL), 本店: '粗利率' } },
      { key: 'profitSum',  label: '粗利合計',   kind: 'money', calc: true, names: { ...per('粗利合計', ALL), 本店: '粗利合計' } },
      { key: 'profitAfter',     label: '粗利（クーポン控除後）',   kind: 'money', calc: true, strong: true,
        names: { ...per('粗利（クーポン控除後）', C3), total: '総粗利（クーポン控除後）' } },
      { key: 'profitAfterRate', label: '粗利率（クーポン控除後）', kind: 'pct', calc: true, strong: true,
        names: { ...per('粗利率（クーポン控除後）', C3), total: '総粗利率（クーポン控除後）' } },
    ],
  },

  // ---------------- 全チャネル共通（参照用・初期は折りたたみ）
  {
    title: '基準価格・仕入（全チャネル共通）', common: true,
    rows: [
      { key: 'joudaiIn',    label: '上代合計（税込）', kind: 'money' },
      { key: 'joudaiEx',    label: '上代合計（税抜）', kind: 'money' },
      { key: 'refEx',       label: '参考価格（税抜）', kind: 'money' },
      { key: 'refIn',       label: '参考価格（税込）', kind: 'money' },
      { key: 'openPrice',   label: 'オープン価格', kind: 'check', name: 'オープン価格[オープン価格]' },
      { key: 'refJoudaiEx', label: '参考上代（税抜）', kind: 'money' },
      { key: 'mktSale',     label: '市場売価（税抜）（一般特売）', kind: 'money' },
      { key: 'mktMin',      label: '市場売価（税抜）（最安）', kind: 'money' },
      { key: 'rate',        label: '掛け率', kind: 'pct' },
      { key: 'discount',    label: '割引率', kind: 'pct' },
      { key: 'reducedTax',  label: '軽減税率フラグ', kind: 'check' },
      { key: 'setCount',    label: 'セット数', kind: 'num' },
      { key: 'itemCount',   label: '商品個数', kind: 'num' },
      { key: 'buyUnit',     label: '仕入単価（税抜）', kind: 'money' },
      { key: 'buyTotal',    label: '仕入合計', kind: 'money', calc: true },
      { key: 'setCost',     label: 'セット原価', kind: 'money', calc: true },
      { key: 'lotteryUnit', label: '抽選セット単価', kind: 'money' },
      { key: 'trial5In',     label: 'お試し費用（税込）+5%', kind: 'money', calc: true },
      { key: 'trial5Ex',     label: 'お試し費用（税抜）+5%', kind: 'money', calc: true },
      { key: 'trial5Manual', label: 'お試し費用（税込）＋5%を手入力', kind: 'check', name: 'お試し費用（税込）＋5%を手入力する[お試し費用（税込）＋5%を手入力する]' },
      { key: 'trialUnitIn',  label: 'お試し費用単価（税込）', kind: 'money', calc: true },
    ],
  },
  {
    title: '物流費・手数料の内訳（1セットあたり・全チャネル共通）', common: true,
    rows: [
      { key: 'lgIn',        label: '入荷作業費', kind: 'money' },
      { key: 'lgOut',       label: '出荷作業費', kind: 'money' },
      { key: 'lgSlip',      label: '伝票発行料', kind: 'money' },
      { key: 'lgShip',      label: '送料', kind: 'money' },
      { key: 'lgShipManual',label: '送料を手入力', kind: 'check', name: '送料を手入力する[送料を手入力する]' },
      { key: 'lgShipPack',  label: '送料梱包料（単価税抜）', kind: 'money' },
      { key: 'lgFloor',     label: '床代（180円）', kind: 'money' },
      { key: 'lgMng',       label: '管理費', kind: 'money' },
      { key: 'lgWh',        label: '倉庫費', kind: 'money' },
      { key: 'lgAsmWork',   label: 'アッセンブリ作業費', kind: 'money' },
      { key: 'lgAsmPack',   label: 'アッセンブリ梱包費', kind: 'money' },
      { key: 'lgMat',       label: '資材費', kind: 'money' },
      { key: 'lgMatManual', label: '資材費を手入力', kind: 'check', name: '資材費を手入力する[資材費を手入力する]' },
      { key: 'lgBand',      label: 'バンド結束費', kind: 'money' },
      { key: 'lgAir',       label: 'エアキャップ費用', kind: 'money' },
      { key: 'lgIce',       label: 'ドライアイス費用', kind: 'money' },
      { key: 'lgOpp',       label: 'OPP同梱費（40円）', kind: 'money' },
      { key: 'lgPrint',     label: '封入物印刷料（枚数入力）', kind: 'num' },
      { key: 'lgGmo',       label: 'GMO手数料', kind: 'money' },
      { key: 'lgCredit',    label: 'クレジット決済手数料（3.8%）', kind: 'money' },
      { key: 'lgAdj',       label: '調整費', kind: 'money' },
    ],
  },
]

// セルの現行項目名（なければ未定義＝「—」）
export const cellName = (sec, row, col) => {
  if (sec.common) return col === 'common' ? (row.name || row.label) : undefined
  return row.names?.[col]
}

export const fmtPrice = (kind, v) => {
  if (v === '' || v === null || v === undefined) return ''
  if (kind === 'money') return (v < 0 ? '-¥' : '¥') + Math.abs(Number(v)).toLocaleString()
  if (kind === 'pct') return `${Number(v).toFixed(1)}%`
  if (kind === 'num') return Number(v).toLocaleString()
  return String(v)
}

// ダミー値（計算項目も含め整合する値をあらかじめ設定）
export const makePriceInit = () => structuredClone(PRICE_INIT)
const PRICE_INIT = {
 "joudaiIn": {
  "common": 3240
 },
 "joudaiEx": {
  "common": 3000
 },
 "refEx": {
  "common": 500
 },
 "refIn": {
  "common": 540
 },
 "openPrice": {
  "common": false
 },
 "refJoudaiEx": {
  "common": 3000
 },
 "mktSale": {
  "common": 2400
 },
 "mktMin": {
  "common": 2180
 },
 "rate": {
  "common": 33.3
 },
 "discount": {
  "common": 38.9
 },
 "reducedTax": {
  "common": true
 },
 "setCount": {
  "common": 1
 },
 "itemCount": {
  "common": 6
 },
 "buyUnit": {
  "common": 1000
 },
 "buyTotal": {
  "common": 1000
 },
 "setCost": {
  "common": 1000
 },
 "lotteryUnit": {
  "common": ""
 },
 "trial5In": {
  "common": 2079
 },
 "trial5Ex": {
  "common": 1925
 },
 "trial5Manual": {
  "common": false
 },
 "trialUnitIn": {
  "common": 330
 },
 "lgIn": {
  "common": 15
 },
 "lgOut": {
  "common": 120
 },
 "lgSlip": {
  "common": 20
 },
 "lgShip": {
  "common": 300
 },
 "lgShipManual": {
  "common": false
 },
 "lgShipPack": {
  "common": 0
 },
 "lgFloor": {
  "common": 0
 },
 "lgMng": {
  "common": 10
 },
 "lgWh": {
  "common": 0
 },
 "lgAsmWork": {
  "common": 0
 },
 "lgAsmPack": {
  "common": 0
 },
 "lgMat": {
  "common": 35
 },
 "lgMatManual": {
  "common": false
 },
 "lgBand": {
  "common": 0
 },
 "lgAir": {
  "common": 0
 },
 "lgIce": {
  "common": 0
 },
 "lgOpp": {
  "common": 0
 },
 "lgPrint": {
  "common": 0
 },
 "lgGmo": {
  "common": 0
 },
 "lgCredit": {
  "common": ""
 },
 "lgAdj": {
  "common": 0
 },
 "trialIn": {
  "本店": 1980,
  "dサンプル": 2080,
  "d払い": 2080,
  "社販コム": 1880,
  "会員コム": 1880,
  "Y店": 2180
 },
 "trialEx": {
  "本店": 1833,
  "dサンプル": 1926,
  "d払い": 1926,
  "社販コム": 1741,
  "会員コム": 1741,
  "Y店": 2019
 },
 "couponIn": {
  "本店": 198,
  "dサンプル": 108,
  "d払い": 0,
  "社販コム": 0,
  "会員コム": 0,
  "Y店": 0
 },
 "couponEx": {
  "本店": 183,
  "dサンプル": 100,
  "d払い": 0,
  "社販コム": 0,
  "会員コム": 0,
  "Y店": 0
 },
 "setProfit": {
  "本店": 263,
  "dサンプル": 160,
  "d払い": 199,
  "社販コム": 175,
  "会員コム": 175,
  "Y店": 442
 },
 "profitRate": {
  "本店": 14.3,
  "dサンプル": 8.3,
  "d払い": 10.3,
  "社販コム": 10.1,
  "会員コム": 10.1,
  "Y店": 21.9
 },
 "forecast": {
  "本店": 300,
  "dサンプル": 200,
  "d払い": 150
 },
 "unitSales": {
  "本店": 1833,
  "dサンプル": 1926,
  "d払い": 1926
 },
 "sales": {
  "本店": 549900,
  "dサンプル": 385200,
  "d払い": 288900,
  "total": 1224000
 },
 "buyCost": {
  "本店": 300000,
  "dサンプル": 200000,
  "d払い": 150000,
  "total": 650000
 },
 "buyCostRate": {
  "本店": 54.6,
  "dサンプル": 51.9,
  "d払い": 51.9,
  "total": 53.1
 },
 "logi": {
  "本店": 150000,
  "dサンプル": 100000,
  "d払い": 75000,
  "total": 325000
 },
 "logiRate": {
  "本店": 27.3,
  "dサンプル": 26.0,
  "d払い": 26.0,
  "total": 26.6
 },
 "settle": {
  "本店": 20896,
  "dサンプル": 14638,
  "d払い": 10978,
  "total": 46512
 },
 "settleRate": {
  "本店": 3.8,
  "dサンプル": 3.8,
  "d払い": 3.8,
  "total": 3.8
 },
 "fee": {
  "本店": 0,
  "dサンプル": 38520,
  "d払い": 23112,
  "total": 61632
 },
 "feeRate": {
  "本店": 0.0,
  "dサンプル": 10.0,
  "d払い": 8.0,
  "total": 5.0
 },
 "cost": {
  "本店": 470896,
  "dサンプル": 353158,
  "d払い": 259090,
  "total": 1083144
 },
 "costRate": {
  "本店": 85.6,
  "dサンプル": 91.7,
  "d払い": 89.7,
  "total": 88.5
 },
 "profitSum": {
  "本店": 78900,
  "dサンプル": 32000,
  "d払い": 29850
 },
 "profitAfter": {
  "本店": 24104,
  "dサンプル": 12042,
  "d払い": 29810,
  "total": 65956
 },
 "profitAfterRate": {
  "本店": 4.4,
  "dサンプル": 3.1,
  "d払い": 10.3,
  "total": 5.4
 },
 "trialManual": {
  "dサンプル": false,
  "d払い": false,
  "社販コム": false,
  "会員コム": false,
  "Y店": false
 },
 "addRateMaster": {
  "dサンプル": "標準A",
  "d払い": "標準B",
  "Y店": "標準C"
 },
 "addRate": {
  "dサンプル": 0.05,
  "d払い": 0.05,
  "Y店": 0.1
 },
 "addRatePct": {
  "dサンプル": 5,
  "d払い": 5,
  "Y店": 10
 },
 "salesIn": {
  "total": 1322000
 },
 "salesRatio": {
  "本店": 44.9
 }
}
