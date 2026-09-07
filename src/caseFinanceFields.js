// ============================================================
// 案件管理シート 財務系分類（掲載履歴の下に表示）
//   各分類を「セクション（grid / matrix）」に分けて見やすく構成。
//   値は row.finance[groupTitle][fullLabel] に保持。
//   grid: fields=[{label,kind}]
//   matrix: columns=[{prefix,head}], rows=[[{metric,kind}...]...], suffix
//     セルの実ラベル = prefix + metric + suffix
//   kind: money(¥) | percent(%) | num | text
// ============================================================

function classify(label) {
  if (/率|割合|掛け率/.test(label)) return 'percent'
  if (/名|施策|ステータス|チャネル|区分|ID/.test(label)) return 'text'
  if (/期限|日時/.test(label)) return 'text'
  if (/入数|セット数|個数|残数|残日数|ヶ月目|それ以降|Total（販売）/.test(label)) return 'num'
  return 'money'
}
const F = (label) => ({ label, kind: classify(label) })
const grid = (title, labels) => ({ type: 'grid', title, fields: labels.map(F) })

// 金額＋率のペア行 / 金額のみ行 / 率のみ行
const pair = (m) => [{ metric: m, kind: 'money' }, { metric: m + '率', kind: 'percent' }]
const money = (m) => [{ metric: m, kind: 'money' }]
const pct = (m) => [{ metric: m, kind: 'percent' }]

// ---- 変動費（グリッド）-------------------------------------
const henpi = grid(null, [
  '伝票発行料','GMO手数料','通常配送料','地域別配送料','床代(180円)','倉庫費','管理費',
  'アッセンブリ梱包費','アッセンブリ作業費','資材費','バンド結束費','エアキャップ費用',
  'ドライアイス費用','OPP同梱費(40円)','調整費','クレジット決済手数料(3.8%)','送料梱包費（単価税抜）',
])

// ---- 仕入れ（グリッド）-------------------------------------
const shiire = {
  type: 'grid', title: null,
  fields: [
    { label: 'ケース入数', kind: 'num' }, { label: 'ボール入数', kind: 'num' },
    { label: '仕入単価（税抜）', kind: 'money' }, { label: 'セット原価', kind: 'money' },
    { label: '仕入れ合計', kind: 'money' }, { label: '掛け率', kind: 'percent' },
  ],
}

// ---- 粗利（チャネル別マトリクス）---------------------------
const arariMatrix = {
  type: 'matrix', title: 'チャネル別 粗利', suffix: '',
  columns: [
    { prefix: '', head: '本店' }, { prefix: 'dサンプル', head: 'dサンプル' }, { prefix: 'd払い', head: 'd払い' },
    { prefix: 'Y店', head: 'Y店' }, { prefix: '社販コム', head: '社販コム' }, { prefix: '会員コム', head: '会員コム' },
  ],
  rows: [ money('セット粗利'), money('粗利合計'), pct('粗利率') ],
}

// ---- 新収益構造_総額（総＋チャネル別マトリクス）------------
const totalMatrix = {
  type: 'matrix', title: '総額・チャネル別', suffix: '',
  columns: [
    { prefix: '総', head: '総額' }, { prefix: '本店', head: '本店' },
    { prefix: 'dサンプル', head: 'dサンプル' }, { prefix: 'd払い', head: 'd払い' },
  ],
  rows: [
    money('売上'), pair('原価'), pair('仕入原価'), pair('物流費'),
    pair('決済手数料'), pair('販売手数料'),
    [{ metric: '粗利（クーポン控除後）', kind: 'money' }, { metric: '粗利率（クーポン控除後）', kind: 'percent' }],
  ],
}

// ---- 新収益構造_単価（添付画像のマトリクス）----------------
const unitMatrix = {
  type: 'matrix', title: 'チャネル別 単価', suffix: '',
  columns: [
    { prefix: '本店', head: '本店' }, { prefix: 'dサンプル', head: 'dサンプル' }, { prefix: 'd払い', head: 'd払い' },
  ],
  rows: [
    money('単価売上'), pair('原価'), pair('仕入原価'), pair('物流費'),
    pair('決済手数料'), pair('販売手数料'),
    [{ metric: '粗利（クーポン控除後）', kind: 'money' }, { metric: '粗利率（クーポン控除後）', kind: 'percent' }],
  ],
}

// ---- 掲載（基本＋チャネル別＋コスト明細）--------------------
const keisai = {
  sections: [
    grid('基本', ['施策（掲載）', '掲載名（掲載）', '倉庫（掲載）', 'ステータス（掲載）']),
    {
      type: 'matrix', title: 'チャネル別 売上・粗利', suffix: '（掲載）',
      columns: [{ prefix: '', head: '本店' }, { prefix: 'dサンプル', head: 'dサンプル' }, { prefix: 'd払い', head: 'd払い' }],
      rows: [ money('売上'), money('粗利額'), pct('粗利率') ],
    },
    grid('コスト明細', [
      '仕入合計（掲載）', '原価率（掲載）', '物流費（掲載）', '物流費率（掲載）',
      '決済手数料（掲載）', '決済手数料率（掲載）', 'その他手数料（掲載）', 'その他手数料率（掲載）',
      'Total Cost（掲載）', 'Cost率（掲載）', '仕入セット単価（掲載）', '入荷作業費（掲載）', '出荷作業費（掲載）',
      '伝票発行料（掲載）', 'GMO手数料（掲載）', '送料（掲載）', '床代（掲載）', '管理費（掲載）',
      'アッセンブリ梱包費（掲載）', 'アッセンブリ作業費（掲載）', '資材費（掲載）', 'バンド結束費（掲載）',
      'エアキャップ費用（掲載）', 'ドライアイス費用（掲載）', '調整費（掲載）', 'クレジットカード決済手数料（掲載）',
      '送料梱包料（単価税抜）',
    ]),
  ],
}

// ---- 販売シミュレーション ----------------------------------
const salesSim = {
  sections: [
    grid('基本', ['施策（販売）', '掲載名（販売）', '掲載チャネル（販売）', '最短賞味期限（販売）']),
    {
      type: 'matrix', title: 'チャネル別 お試し費用', suffix: '（販売）',
      columns: [{ prefix: '', head: '本店' }, { prefix: 'dサンプル', head: 'dサンプル' }, { prefix: 'd払い', head: 'd払い' }],
      rows: [ money('お試し費用（税込）') ],
    },
    grid('数量', ['セット数（販売）', '掲載残日数（販売）']),
    grid('月別販売数', [
      '1ヶ月目（販売）', '2ヶ月目（販売）', '3ヶ月目（販売）', '4ヶ月目（販売）', '5ヶ月目（販売）', '6ヶ月目（販売）',
      'それ以降（販売）', 'Total（販売）', '残数（販売）',
    ]),
  ],
}

// ---- 試算（基本＋チャネル別＋コスト＋メタ）------------------
const shisan = {
  sections: [
    grid('基本', [
      '掲載名（試算）', '上代単価（税抜）（試算）', '上代単価（税込）（試算）', '仕入単価（税抜）（試算）', '掛け率（試算）',
      '商品個数（試算）', '上代合計（税込）（試算）', 'セット数（試算）', '仕入セット単価（試算）',
      '掲載チャネル（試算）', '賞味期限（試算）', '倉庫（試算）',
    ]),
    {
      type: 'matrix', title: 'チャネル別 お試し費用・粗利', suffix: '（試算）',
      columns: [
        { prefix: '', head: '本店' }, { prefix: 'dサンプル', head: 'dサンプル' }, { prefix: 'd払い', head: 'd払い' },
        { prefix: 'yahoo', head: 'yahoo' }, { prefix: '社販コム', head: '社販コム' },
      ],
      rows: [
        money('お試し費用（税抜）'), money('お試し費用（税込）'), money('お試し費用単価（税込）'),
        pct('割引率'), money('セット粗利単価'), pct('粗利率'),
      ],
    },
    grid('コスト', [
      '入荷作業費（試算）', '出荷作業費（試算）', '伝票発行料（試算）', 'GMO手数料（試算）', '送料（試算）',
      '床代（試算）', '管理費（試算）', 'アッセンブリ梱包費（試算）', 'アッセンブリ作業費（試算）', '資材費（試算）',
      'バンド結束費（試算）', 'エアキャップ費用（試算）', 'ドライアイス費用（試算）', 'OPP同梱費（試算）', '調整費（試算）',
      'クレジットカード決済手数料（試算）', '物流費（試算）',
    ]),
    grid('メタ情報', ['作成者ID', '作成日時', '更新者ID', '更新日時']),
  ],
}

// financeGroups：各分類は sections（未指定は単一グリッド or 単一マトリクス）
export const financeGroups = [
  { title: '変動費',           sections: [henpi] },
  { title: '仕入れ',           sections: [shiire] },
  { title: '粗利',             sections: [arariMatrix] },
  { title: '新収益構造_総額',   sections: [totalMatrix, grid('その他', ['本店売上比率'])] },
  { title: '新収益構造_単価',   sections: [unitMatrix] },
  { title: '掲載',             sections: keisai.sections },
  { title: '販売シミュレーション', sections: salesSim.sections },
  { title: '試算',             sections: shisan.sections },
]
