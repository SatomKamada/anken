import React, { useState } from 'react'
import { lookupCaseProduct } from './dummyData.js'

// 発注管理：一覧（検索結果の表）— kintone風。行頭アイコンで詳細へ。
// props: onOpen(record)

const VIEW_OPTIONS = [
  '請求書消込', '営業', 'オペ', 'ロジ', '発注情報出力', '入荷実績',
  '営業アシスタント', '開発確認用', '仕入実績管理用', '販売目標出力',
  'JICFS作業用', '仕入型発注情報抽出用', '（すべて）',
]
const OUTPUT_OPTIONS = ['出力する書類', '発注書（通常）']

// 企業名→企業コード（クライアント名入力時に企業コード自動）
const COMPANY_BY_NAME = {
  '花王株式会社': '001', 'よつ葉乳業': '002', '△△食品': '003',
  '路興商事株式会社': '6281', 'コンフェックス株式会社': '2576', '株式会社八天堂': '6318',
  'DKSHジャパン株式会社': '4749', '小林製薬株式会社': '34', 'ラブリー・ペット商会': '3726', '株式会社ライフブリッジ': '5833',
  '株式会社クレイツ': '5679', '株式会社ミライスビー': '5583', 'サンコー株式会社': '5380', '株式会社QUADS': '4892',
}
const COMPANY_NAMES = Object.keys(COMPANY_BY_NAME)

// ヘッダー一覧 列定義
const COLS = [
  { key: 'recordNo', label: 'レコード番号', locked: true },
  { key: 'orderNo', label: '発注ヘッダー番号', locked: true },
  { key: 'promo', label: 'プロモーションコード' },
  { key: 'status', label: '発注ステータス', req: true, type: 'select', options: ['入力中', '登録済', '申請中', '承認済', '発注済', '一部入荷', '全部入荷', '差戻', 'NG'] },
  { key: 'assignee', label: '担当者', locked: true },
  { key: 'createdAt', label: '作成日時', locked: true },
  { key: 'client', label: '企業名', type: 'companyName', req: true },
  { key: 'companyId', label: '企業コード', locked: true, req: true },
  { key: 'caseTypeL', label: '案件種別（大）', type: 'select', options: ['在庫', '受発注', '通常', 'その他'] },
  { key: 'caseTypeM', label: '案件種別（中）', type: 'select', options: ['試算あり', '試算なし', '倉庫間移動', 'その他'] },
  { key: 'caseTypeS', label: '案件種別（小）', type: 'select', options: ['メーカー滞留品', 'NBプロパー', 'TC', 'AAS', 'キャンペーン・抽選', '代品・過受注', '代品'] },
  { key: 'orderCat', label: '受発注発注区分', type: 'select', options: ['-', '個別発注', '一斉発注'] },
  { key: 'prodType', label: '商品種別', type: 'select', options: ['その他', '食品', '日用品', '医薬品'] },
  { key: 'payTerms', label: '支払条件', type: 'select', options: ['末締め翌月末払い', '15日締め払い', '末締め翌月15日払い', '日付指定'] },
  { key: 'payDue', label: '支払期日', type: 'date' },
  { key: 'totalCase', label: 'ケース数合計', locked: true },
  { key: 'totalPiece', label: 'ピース数合計', locked: true },
  { key: 'amountIn', label: '発注金額合計（税込み）', locked: true },
  { key: 'tax8', label: '消費税（8%）' },
  { key: 'tax10', label: '消費税（10%）' },
  { key: 'amountEx', label: '発注金額合計（税抜）', locked: true },
]

const H = (recordNo, orderNo, promo, status, assignee, createdAt, companyId, client, caseL, caseM, caseS, cat) =>
  ({ recordNo, orderNo, promo, status, assignee, createdAt, companyId, client, caseTypeL: caseL, caseTypeM: caseM, caseTypeS: caseS, orderCat: cat, prodType: 'その他', payTerms: '末締め翌月末払い', payDue: '2026-11-30', totalCase: '0', totalPiece: '0', amountIn: '¥0', tax8: '¥0', tax10: '¥0', amountEx: '¥0' })

const HEADER_SAMPLE = [
  H('48930', '00048930', '', '入力中', '伊波 篤', '2026-10-05 12:45', '6281', '路興商事株式会社', '在庫', '試算あり', 'メーカー滞留品', ''),
  H('48929', '00048929', '', '入力中', '伊波 篤', '2026-10-05 12:38', '2576', 'コンフェックス株式会社', '在庫', '試算あり', 'メーカー滞留品', ''),
  H('48928', '00048928', '', '発注済', '伊波 篤', '2026-10-05 12:32', '6318', '株式会社八天堂', '受発注', '試算あり', 'TC', '一斉発注'),
  H('48927', '00048927', '', '入力中', '小宮 佳介', '2026-10-05 11:36', '4749', 'DKSHジャパン株式会社', '在庫', '試算あり', 'メーカー滞留品', ''),
  H('48926', '00048926', 'Y393', '入力中', '石津 衛一', '2026-10-05 10:57', '34', '小林製薬株式会社', '通常', '', 'メーカー滞留品', ''),
  H('48925', '00048925', 'Y393', '発注済', '石津 衛一', '2026-10-05 10:55', '34', '小林製薬株式会社', '通常', '', 'メーカー滞留品', ''),
  H('48924', '00048924', '', '発注済', '谷口 祐磨', '2026-10-05 9:26', '3726', 'ラブリー・ペット商会', '受発注', '試算あり', 'TC', '一斉発注'),
  H('48923', '00048923', '', '発注済', '藤原 功旨', '2026-10-05 9:25', '5833', '株式会社ライフブリッジ', '受発注', '試算あり', 'TC', '一斉発注'),
]

// 発注商品テーブル（関連シート）列定義
const ITEM_COLS = [
  { key: 'branchNo', label: '発注明細番号（枝番）' },
  { key: 'attrCode', label: '商品属性情報コード' },
  { key: 'caseNo', label: '案件番号', ref: 'case' },
  { key: 'makerName', label: 'メーカー名' },
  { key: 'productName', label: '商品名' },
  { key: 'warehouse', label: '倉庫', type: 'select', options: ['佐川（花見川）', '日通倉庫', '自社倉庫'] },
  { key: 'bestBefore', label: '消費/賞味/使用期限', type: 'date' },
  { key: 'deliveryDate', label: '納品日', type: 'date' },
  { key: 'salesTarget', label: '販売目標' },
  { key: 'janCode', label: 'JANコード' },
  { key: 'makerId', label: 'メーカーID' },
  { key: 'itfCode', label: 'ITFコード' },
  { key: 'orderCaseCount', label: '発注ケース入数', type: 'number' },
  { key: 'orderBallCount', label: '発注ボール入数', type: 'number' },
  { key: 'orderCaseQty', label: '発注ケース数', type: 'number' },
  { key: 'totalPieceQty', label: '発注総ピース数', type: 'number' },
  { key: 'refPriceEx', label: '参考価格（税抜）', type: 'number' },
  { key: 'unitPriceEx', label: '単価（税抜）', type: 'number' },
  { key: 'taxRate', label: '税率', type: 'select', options: ['8%', '10%'] },
  { key: 'amountEx', label: '発注金額（税抜）', type: 'number' },
  { key: 'productId', label: '商品ID' },
  { key: 'categoryL', label: '商品カテゴリー（大）' },
  { key: 'categoryM', label: '商品カテゴリー（中）' },
  { key: 'categoryS', label: '商品カテゴリー（小）' },
]
const makeItem = (branchNo) => { const o = {}; ITEM_COLS.forEach((c) => (o[c.key] = '')); o.branchNo = branchNo; return o }
const ITEM_SAMPLE = [{ ...makeItem('1'), caseNo: '000045', makerName: 'DKSHジャパン…', productName: 'フェル…', warehouse: '佐川（花見川）', bestBefore: '2026-11-13', deliveryDate: '2026-10-09', salesTarget: '2026-10-14', orderCaseCount: '12', orderBallCount: '0', orderCaseQty: '50', totalPieceQty: '600', unitPriceEx: '600', taxRate: '8%', amountEx: '360000' }]

const RELATED = ['発注商品テーブル', '案件テーブル', '販売目標変更履歴テーブル']

const IcoChart = () => (<svg viewBox="0 0 24 24" width="16" height="16"><polyline points="3,16 9,10 13,14 21,6" fill="none" stroke="currentColor" strokeWidth="2" /></svg>)
const IcoFilter = () => (<svg viewBox="0 0 24 24" width="16" height="16"><polygon points="3,5 21,5 14,13 14,19 10,21 10,13" fill="none" stroke="currentColor" strokeWidth="2" /></svg>)
const IcoBars = () => (<svg viewBox="0 0 24 24" width="16" height="16"><rect x="4" y="11" width="4" height="9" fill="currentColor" /><rect x="10" y="6" width="4" height="14" fill="currentColor" /><rect x="16" y="14" width="4" height="6" fill="currentColor" /></svg>)
const IcoDetail = () => (<svg viewBox="0 0 24 24" width="15" height="15" style={{ verticalAlign: 'middle' }}><rect x="5" y="3" width="14" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" /><line x1="8" y1="8" x2="16" y2="8" stroke="currentColor" strokeWidth="1.4" /><line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="1.4" /><line x1="8" y1="16" x2="13" y2="16" stroke="currentColor" strokeWidth="1.4" /></svg>)

export default function OrderList({ onOpen }) {
  const [rows, setRows] = useState(HEADER_SAMPLE)
  const [items, setItems] = useState(ITEM_SAMPLE)
  const [viewSel, setViewSel] = useState('入荷実績')
  const [outputSel, setOutputSel] = useState('発注書（通常）')
  const [rel, setRel] = useState(0)

  // --- ヘッダー一覧 操作 ---
  const setCell = (ri, key, val) => setRows(rows.map((r, i) => (i === ri ? { ...r, [key]: val } : r)))
  const nextRecord = () => String(Math.max(0, ...rows.map((r) => Number(r.recordNo) || 0)) + 1)
  const addHeader = () => {
    const n = nextRecord()
    setRows([...rows, H(n, String(n).padStart(8, '0'), '', '入力中', '', '', '', '', '', '', '', '')])
  }
  const dupHeaderTop = () => {
    const src = rows[0]
    if (!src) { addHeader(); return }
    const n = nextRecord()
    setRows([...rows, { ...structuredClone(src), recordNo: n, orderNo: String(n).padStart(8, '0') }])
  }

  // --- 発注商品テーブル 操作 ---
  const setItemCell = (ri, key, val) => setItems(items.map((r, i) => (i === ri ? { ...r, [key]: val } : r)))
  const onItemCaseNo = (ri, val) => {
    const res = lookupCaseProduct(val)
    setItems(items.map((r, i) => (i === ri ? { ...r, caseNo: val, ...(res.found ? res.values : {}) } : r)))
  }
  const nextBranch = () => String(items.length + 1)
  const addItem = () => setItems([...items, makeItem(nextBranch())])
  const dupItemTop = () => {
    const src = items[0]
    const clone = src ? structuredClone(src) : makeItem(nextBranch())
    clone.branchNo = nextBranch()
    setItems([...items, clone])
  }
  const delItem = (ri) => setItems(items.filter((_, i) => i !== ri))

  const ACTIONS = ['全画面表示', '元に戻す', 'やり直し', '再読み込み', '保存', '削除', '検索', 'フィルタ', 'エクスポート']

  return (
    <div className="klist-wrap">
      {/* 上部アプリバー */}
      <div className="kappbar">
        <select className="kview-select" value={viewSel} onChange={(e) => setViewSel(e.target.value)}>
          {VIEW_OPTIONS.map((o) => <option key={o}>{o}</option>)}
        </select>
        <button type="button" className="kicon-btn chart" title="グラフ"><IcoChart /><span className="kcaret">▾</span></button>
        <button type="button" className="kicon-btn" title="絞り込み"><IcoFilter /></button>
        <button type="button" className="kicon-btn" title="分析"><IcoBars /></button>
        <select className="koutput-select" value={outputSel} onChange={(e) => setOutputSel(e.target.value)}>
          {OUTPUT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
        </select>
        <button type="button" className="kbtn-out">出力</button>
        <span className="kcount">1 - {rows.length}（{rows.length}件中）</span>
      </div>

      {/* アクションバー：追加＝空行、複製＝一番上の行を複製 */}
      <div className="kactionbar">
        <button type="button" className="kact-btn primary" onClick={addHeader}>＋追加</button>
        <button type="button" className="kact-btn primary" onClick={dupHeaderTop}>複製</button>
        {ACTIONS.map((a) => <button key={a} type="button" className="kact-btn">{a}</button>)}
      </div>

      {/* ヘッダー一覧（鍵以外は編集可） */}
      <div className="ktable-scroll">
        <table className="ktable">
          <thead>
            <tr>
              <th className="th-ico"></th>
              {COLS.map((c) => (
                <th key={c.key}>{c.locked && <span className="lock">🔒</span>}{c.label}{c.req && <span className="req-star">＊</span>}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                <td className="td-ico">
                  <button type="button" className="detail-ico" title="レコードの詳細を表示する"
                    onClick={() => onOpen({ recordNo: row.recordNo, orderNo: row.orderNo, client: row.client })}><IcoDetail /></button>
                </td>
                {COLS.map((c) => (
                  <td key={c.key} className={c.locked ? 'locked-cell' : 'edit-cell'}>
                    {c.locked
                      ? <span>{row[c.key]}</span>
                      : c.type === 'companyName'
                        ? <input className="cell-inp" list="companyNameList" value={row[c.key] || ''}
                            onChange={(e) => setRows(rows.map((r, i) => i === ri ? { ...r, client: e.target.value, companyId: COMPANY_BY_NAME[e.target.value] || r.companyId } : r))} />
                        : c.type === 'select'
                          ? <select className="cell-inp" value={row[c.key] || ''} onChange={(e) => setCell(ri, c.key, e.target.value)}><option value=""></option>{c.options.map((o) => <option key={o}>{o}</option>)}</select>
                          : <input className="cell-inp" type={c.type === 'date' ? 'date' : 'text'} value={row[c.key] || ''} onChange={(e) => setCell(ri, c.key, e.target.value)} />}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 関連シート */}
      <div className="krelated">
        <div className="krel-tabs">
          <span className="krel-label">関連シート</span>
          {RELATED.map((t, i) => (
            <button key={t} type="button" className={'krel-tab' + (rel === i ? ' active' : '')} onClick={() => setRel(i)}>{t}</button>
          ))}
        </div>
        {rel === 0 && (
          <>
            <div className="kactionbar sub">
              <button type="button" className="kact-btn primary" onClick={addItem}>＋追加</button>
              <button type="button" className="kact-btn primary" onClick={dupItemTop}>複製</button>
            </div>
            <div className="ktable-scroll">
              <table className="ktable">
                <thead><tr>{ITEM_COLS.map((c) => <th key={c.key}>{c.label}</th>)}<th>操作</th></tr></thead>
                <tbody>
                  {items.map((row, ri) => (
                    <tr key={ri}>
                      {ITEM_COLS.map((c) => (
                        <td key={c.key} className="edit-cell">
                          {c.ref === 'case'
                            ? <div className="cell-ref">
                                <input className="cell-inp" value={row.caseNo || ''} placeholder="例：000045" onChange={(e) => onItemCaseNo(ri, e.target.value)} />
                                <button type="button" className="btn-ref sm" onClick={() => onItemCaseNo(ri, row.caseNo)}>参照</button>
                              </div>
                            : c.type === 'select'
                              ? <select className="cell-inp" value={row[c.key] || ''} onChange={(e) => setItemCell(ri, c.key, e.target.value)}><option value=""></option>{c.options.map((o) => <option key={o}>{o}</option>)}</select>
                              : <input className="cell-inp" type={c.type === 'date' ? 'date' : c.type === 'number' ? 'number' : 'text'} value={row[c.key] || ''} onChange={(e) => setItemCell(ri, c.key, e.target.value)} />}
                        </td>
                      ))}
                      <td className="tc"><button type="button" className="btn-del" onClick={() => delItem(ri)}>削除</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        {rel === 1 && <div className="empty small">案件テーブル（サンプル省略）</div>}
        {rel === 2 && <div className="empty small">販売目標変更履歴テーブル（サンプル省略）</div>}
      </div>

      <datalist id="companyNameList">{COMPANY_NAMES.map((o) => <option key={o} value={o} />)}</datalist>

      <div className="fnote" style={{ marginTop: 8 }}>※「＋追加」で空行、「複製」で一番上の行を複製します。鍵（🔒）以外は編集可。企業名を入れると企業コードが自動入力。発注商品テーブルは案件番号を入れると商品名・メーカー名・医薬品・アルコール区分・発注ケース/ボール入数・商品カテゴリが自動入力されます。</div>
    </div>
  )
}
