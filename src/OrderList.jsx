import React, { useState } from 'react'
import { makeEmptyOrderDetail } from './orderFields.js'
import { lookupCaseProduct, caseMaster } from './dummyData.js'

// 発注管理：一覧（検索結果の表）— kintone風。
// props: onOpen(record) … record は { ...header, items:[明細...] }

const VIEW_OPTIONS = ['請求書消込', '営業', 'オペ', 'ロジ', '発注情報出力', '入荷実績', '営業アシスタント', '開発確認用', '仕入実績管理用', '販売目標出力', 'JICFS作業用', '仕入型発注情報抽出用', '（すべて）']
const OUTPUT_OPTIONS = ['出力する書類', '発注書（通常）']

const COMPANY_BY_NAME = {
  '花王株式会社': '001', 'よつ葉乳業': '002', '△△食品': '003',
  '路興商事株式会社': '6281', 'コンフェックス株式会社': '2576', '株式会社八天堂': '6318',
  'DKSHジャパン株式会社': '4749', '小林製薬株式会社': '34', 'ラブリー・ペット商会': '3726', '株式会社ライフブリッジ': '5833',
  '株式会社クレイツ': '5679', '株式会社ミライスビー': '5583', 'サンコー株式会社': '5380', '株式会社QUADS': '4892',
}
const COMPANY_NAMES = Object.keys(COMPANY_BY_NAME)

const COLS = [
  { key: 'recordNo', label: 'レコード番号', locked: true },
  { key: 'orderNo', label: '発注ヘッダー番号', locked: true },
  { key: 'status', label: '発注ステータス', req: true, type: 'select', options: ['入力中', '登録済', '申請中', '承認済', '発注済', '一部入荷', '全部入荷', '差戻', 'NG'] },
  { key: 'caseTypeL', label: '案件種別（大）', type: 'select', options: ['在庫', '受発注', '通常', 'その他'] },
  { key: 'caseTypeM', label: '案件種別（中）', type: 'select', options: ['試算あり', '試算なし', '倉庫間移動', 'その他'] },
  { key: 'caseTypeS', label: '案件種別（小）', type: 'select', options: ['メーカー滞留品', 'NBプロパー', 'TC', 'AAS', 'キャンペーン・抽選', '代品・過受注', '代品'] },
  { key: 'companyId', label: '企業コード', locked: true, req: true },
  { key: 'client', label: '企業名', type: 'companyName', req: true },
  { key: 'orderCat', label: '受発注発注区分', type: 'select', options: ['-', '個別発注', '一斉発注'] },
  { key: 'stockLinkFlag', label: '在庫自動紐づけフラグ', type: 'select', options: ['ON', 'OFF'] },
  { key: 'prodType', label: '商品種別', type: 'select', options: ['その他', '食品', '日用品', '医薬品'] },
  { key: 'promo', label: 'プロモーションコード' },
  { key: 'payTerms', label: '支払条件', type: 'select', options: ['末締め翌月末払い', '15日締め払い', '末締め翌月15日払い', '日付指定'] },
  { key: 'payDue', label: '支払期日', type: 'date' },
  { key: 'totalCase', label: 'ケース数合計', locked: true },
  { key: 'totalPiece', label: 'ピース数合計', locked: true },
  { key: 'amountIn', label: '発注金額合計（税込み）', locked: true },
  { key: 'tax8', label: '消費税（8%）' },
  { key: 'tax10', label: '消費税（10%）' },
  { key: 'amountEx', label: '発注金額合計（税抜）', locked: true },
  { key: 'assignee', label: '担当者', locked: true },
  { key: 'createdAt', label: '作成日時', locked: true },
]

// 発注商品テーブル（表示列・キーは orderFields の明細に一致）
const ITEM_COLS = [
  { key: 'branchNo', label: '発注明細番号（枝番）' },
  { key: 'caseNo', label: '案件番号', caseRef: true },
  { key: 'janCode', label: 'JANコード' },
  { key: 'productId', label: '商品ID' },
  { key: 'productName', label: '商品名' },
  { key: 'categoryL', label: '商品カテゴリー（大）' },
  { key: 'categoryM', label: '商品カテゴリー（中）' },
  { key: 'categoryS', label: '商品カテゴリー（小）' },
  { key: 'makerId', label: 'メーカーID' },
  { key: 'makerName', label: 'メーカー名' },
  { key: 'attrCode', label: '商品属性情報コード', req: true },
  { key: 'warehouse', label: '倉庫', type: 'select', options: ['佐川（花見川）', '日通倉庫', '自社倉庫'] },
  { key: 'bestBeforeDate', label: '消費/賞味/使用期限', type: 'date' },
  { key: 'deliveryDate', label: '納品日', type: 'date' },
  { key: 'salesTarget', label: '販売目標' },
  { key: 'itfCode', label: 'ITFコード' },
  { key: 'orderCaseCount', label: '発注ケース入数', type: 'number' },
  { key: 'orderBallCount', label: '発注ボール入数', type: 'number' },
  { key: 'orderCaseQty', label: '発注ケース数', type: 'number' },
  { key: 'totalPieceQty', label: '発注総ピース数', type: 'number' },
  { key: 'refPriceEx', label: '参考価格（税抜）', type: 'number' },
  { key: 'unitPriceEx', label: '単価（税抜）', type: 'number' },
  { key: 'taxRate', label: '税率', type: 'select', options: ['8%', '10%'] },
  { key: 'amountEx', label: '発注金額（税抜）', type: 'number' },
]

const mkItem = (branchNo, over = {}) => ({ ...makeEmptyOrderDetail(), branchNo, ...over })
const H = (recordNo, orderNo, promo, status, assignee, createdAt, companyId, client, caseL, caseM, caseS, cat, items) =>
  ({ recordNo, orderNo, promo, status, assignee, createdAt, companyId, client, caseTypeL: caseL, caseTypeM: caseM, caseTypeS: caseS, orderCat: cat, stockLinkFlag: '', prodType: 'その他', payTerms: '末締め翌月末払い', payDue: '2026-11-30', totalCase: '0', totalPiece: '0', amountIn: '¥0', tax8: '¥0', tax10: '¥0', amountEx: '¥0', items })

// 案件番号から明細を生成（ダミー充実用）
const itemFromCase = (branchNo, caseNo, extra = {}) => {
  const c = caseMaster[caseNo] || {}
  return mkItem(branchNo, {
    caseNo, janCode: c.janCode || '', productId: c.productId || '', productName: c.productName || '', makerId: c.makerId || '', makerName: c.makerName || '',
    categoryL: c.categoryL || '', categoryM: c.categoryM || '', categoryS: c.categoryS || '',
    medicineType: c.medicineType || '', alcoholType: c.alcoholType || '',
    orderCaseCount: c.orderCaseCount || '', orderBallCount: c.orderBallCount || '', refPriceEx: c.refPriceEx || '',
    warehouse: '佐川（花見川）', bestBeforeDate: '2027-05-08', deliveryDate: '2026-10-08', salesTarget: '2027-01-06',
    taxRate: '8%', ...extra,
  })
}

const INIT = [
  H('48930', '00048930', 'PR-2605-01', '入力中', '伊波 篤', '2026-10-05 12:45', '6281', '路興商事株式会社', '在庫', '試算あり', 'メーカー滞留品', '個別発注', [
    itemFromCase('1', '000048', { orderCaseQty: '2', totalPieceQty: '40', unitPriceEx: '700', amountEx: '28000' }),
    itemFromCase('2', '000049', { orderCaseQty: '3', totalPieceQty: '72', unitPriceEx: '230', amountEx: '16560' }),
  ]),
  H('48929', '00048929', '', '入力中', '伊波 篤', '2026-10-05 12:38', '2576', 'コンフェックス株式会社', '在庫', '試算あり', 'メーカー滞留品', '個別発注', [itemFromCase('1', '000045', { orderCaseQty: '1', totalPieceQty: '24', unitPriceEx: '150', amountEx: '3600' })]),
  H('48928', '00048928', '', '発注済', '伊波 篤', '2026-10-05 12:32', '6318', '株式会社八天堂', '受発注', '試算あり', 'TC', '一斉発注', [itemFromCase('1', '000047', { orderCaseQty: '5', totalPieceQty: '100', unitPriceEx: '450', amountEx: '45000' })]),
  H('48927', '00048927', 'Y501', '入力中', '小宮 佳介', '2026-10-05 11:36', '4749', 'DKSHジャパン株式会社', '在庫', '試算あり', 'メーカー滞留品', '一斉発注', [
    itemFromCase('1', '000045', { orderCaseQty: '50', totalPieceQty: '600', unitPriceEx: '600', amountEx: '360000' }),
    itemFromCase('2', '000046', { orderCaseQty: '10', totalPieceQty: '120', unitPriceEx: '1100', amountEx: '132000' }),
    itemFromCase('3', '000047', { orderCaseQty: '8', totalPieceQty: '160', unitPriceEx: '450', amountEx: '72000' }),
  ]),
  H('48926', '00048926', 'Y393', '入力中', '石津 衛一', '2026-10-05 10:57', '34', '小林製薬株式会社', '通常', '試算あり', 'メーカー滞留品', '個別発注', [itemFromCase('1', '000046', { orderCaseQty: '7', totalPieceQty: '84', unitPriceEx: '1100', amountEx: '92400' })]),
  H('48925', '00048925', 'Y393', '発注済', '石津 衛一', '2026-10-05 10:55', '34', '小林製薬株式会社', '通常', '試算あり', 'メーカー滞留品', '一斉発注', [itemFromCase('1', '000046', { orderCaseQty: '13', totalPieceQty: '156', unitPriceEx: '1100', amountEx: '171600' })]),
  H('48924', '00048924', '', '発注済', '谷口 祐磨', '2026-10-05 9:26', '3726', 'ラブリー・ペット商会', '受発注', '試算あり', 'TC', '一斉発注', [itemFromCase('1', '000048', { orderCaseQty: '2', totalPieceQty: '40', unitPriceEx: '800', amountEx: '32000' })]),
  H('48923', '00048923', '', '発注済', '藤原 功旨', '2026-10-05 9:25', '5833', '株式会社ライフブリッジ', '受発注', '試算あり', 'TC', '一斉発注', [itemFromCase('1', '000049', { orderCaseQty: '1', totalPieceQty: '24', unitPriceEx: '230', amountEx: '5520' })]),
  H('48922', '00048922', '', '発注済', '藤原 功旨', '2026-10-05 9:25', '5679', '株式会社クレイツ', '受発注', '試算あり', 'TC', '一斉発注', [itemFromCase('1', '000045', { orderCaseQty: '1', totalPieceQty: '24', unitPriceEx: '150', amountEx: '3600' })]),
  H('48921', '00048921', '', '発注済', '藤原 功旨', '2026-10-05 9:25', '5583', '株式会社ミライスビー', '受発注', '試算あり', 'TC', '一斉発注', [itemFromCase('1', '000047', { orderCaseQty: '25', totalPieceQty: '500', unitPriceEx: '450', amountEx: '225000' })]),
  H('48920', '00048920', '', '発注済', '藤原 功旨', '2026-10-05 9:25', '5380', 'サンコー株式会社', '受発注', '試算あり', 'TC', '一斉発注', [itemFromCase('1', '000048', { orderCaseQty: '22', totalPieceQty: '440', unitPriceEx: '800', amountEx: '352000' })]),
  H('48919', '00048919', '', '発注済', '藤原 功旨', '2026-10-05 9:25', '4892', '株式会社QUADS', '受発注', '試算あり', 'TC', '一斉発注', [itemFromCase('1', '000049', { orderCaseQty: '62', totalPieceQty: '1488', unitPriceEx: '230', amountEx: '342240' })]),
  H('48918', '00048918', '', '発注済', '藤原 功旨', '2026-10-05 9:25', '4455', '株式会社エスエスケイ', '受発注', '試算あり', 'TC', '一斉発注', [itemFromCase('1', '000045', { orderCaseQty: '55', totalPieceQty: '1320', unitPriceEx: '150', amountEx: '198000' })]),
  H('48917', '00048917', '', '発注済', '藤原 功旨', '2026-10-05 9:25', '4368', '株式会社ツカモトコーポ', '受発注', '試算あり', 'TC', '一斉発注', [itemFromCase('1', '000046', { orderCaseQty: '3', totalPieceQty: '36', unitPriceEx: '1100', amountEx: '39600' })]),
]

const RELATED = ['発注商品テーブル', '案件テーブル', '販売目標変更履歴テーブル']

const IcoChart = () => (<svg viewBox="0 0 24 24" width="16" height="16"><polyline points="3,16 9,10 13,14 21,6" fill="none" stroke="currentColor" strokeWidth="2" /></svg>)
const IcoFilter = () => (<svg viewBox="0 0 24 24" width="16" height="16"><polygon points="3,5 21,5 14,13 14,19 10,21 10,13" fill="none" stroke="currentColor" strokeWidth="2" /></svg>)
const IcoBars = () => (<svg viewBox="0 0 24 24" width="16" height="16"><rect x="4" y="11" width="4" height="9" fill="currentColor" /><rect x="10" y="6" width="4" height="14" fill="currentColor" /><rect x="16" y="14" width="4" height="6" fill="currentColor" /></svg>)
const IcoDetail = () => (<svg viewBox="0 0 24 24" width="15" height="15" style={{ verticalAlign: 'middle' }}><rect x="5" y="3" width="14" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" /><line x1="8" y1="8" x2="16" y2="8" stroke="currentColor" strokeWidth="1.4" /><line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="1.4" /><line x1="8" y1="16" x2="13" y2="16" stroke="currentColor" strokeWidth="1.4" /></svg>)

export default function OrderList({ onOpen }) {
  const [rows, setRows] = useState(INIT)
  const [sel, setSel] = useState(0)                 // 選択中のヘッダー行
  const [viewSel, setViewSel] = useState('入荷実績')
  const [outputSel, setOutputSel] = useState('発注書（通常）')
  const [rel, setRel] = useState(0)

  const setCell = (ri, key, val) => setRows(rows.map((r, i) => (i === ri ? { ...r, [key]: val } : r)))
  const nextRecord = () => String(Math.max(0, ...rows.map((r) => Number(r.recordNo) || 0)) + 1)

  // 追加：空レコード／複製：選択行を複製して一番上／削除：選択行
  const addHeader = () => { const n = nextRecord(); setRows([H(n, String(n).padStart(8, '0'), '', '入力中', '', '', '', '', '', '', '', '', [mkItem('1')]), ...rows]); setSel(0) }
  const dupHeader = () => { const src = rows[sel]; if (!src) return; const n = nextRecord(); setRows([{ ...structuredClone(src), recordNo: n, orderNo: String(n).padStart(8, '0') }, ...rows]); setSel(0) }
  const delHeader = () => { if (rows.length === 0) return; const next = rows.filter((_, i) => i !== sel); setRows(next); setSel(Math.max(0, Math.min(sel, next.length - 1))) }

  // 発注商品テーブル（選択レコードの明細）編集
  const items = rows[sel]?.items || []
  const setItem = (updater) => setRows(rows.map((r, i) => (i === sel ? { ...r, items: updater(r.items) } : r)))
  const setItemCell = (ii, key, val) => setItem((list) => list.map((r, i) => (i === ii ? { ...r, [key]: val } : r)))
  const confirmCaseNo = (ii) => setItem((list) => list.map((r, i) => {
    if (i !== ii) return r
    const res = lookupCaseProduct(r.caseNo)
    return res.found ? { ...r, ...res.values } : r
  }))

  const ACTIONS = ['全画面表示', '元に戻す', 'やり直し', '再読み込み', '保存', '検索', 'フィルタ', 'エクスポート']

  return (
    <div className="klist-wrap">
      <div className="kappbar">
        <select className="kview-select" value={viewSel} onChange={(e) => setViewSel(e.target.value)}>{VIEW_OPTIONS.map((o) => <option key={o}>{o}</option>)}</select>
        <button type="button" className="kicon-btn chart" title="グラフ"><IcoChart /><span className="kcaret">▾</span></button>
        <button type="button" className="kicon-btn" title="絞り込み"><IcoFilter /></button>
        <button type="button" className="kicon-btn" title="分析"><IcoBars /></button>
        <select className="koutput-select" value={outputSel} onChange={(e) => setOutputSel(e.target.value)}>{OUTPUT_OPTIONS.map((o) => <option key={o}>{o}</option>)}</select>
        <button type="button" className="kbtn-out">出力</button>
        <span className="kcount">1 - {rows.length}（{rows.length}件中）</span>
      </div>

      {/* 共通アクションバー（ヘッダー行・発注商品行の双方で使用） */}
      <div className="kactionbar">
        <button type="button" className="kact-btn primary" onClick={addHeader}>＋追加</button>
        <button type="button" className="kact-btn primary" onClick={dupHeader}>複製</button>
        <button type="button" className="kact-btn danger" onClick={delHeader}>削除</button>
        {ACTIONS.map((a) => <button key={a} type="button" className="kact-btn">{a}</button>)}
      </div>

      {/* ヘッダー一覧（行クリックで選択→下の発注商品テーブルが切替） */}
      <div className="ktable-scroll">
        <table className="ktable">
          <thead><tr><th className="th-ico"></th>{COLS.map((c) => <th key={c.key}>{c.locked && <span className="lock">🔒</span>}{c.label}{c.req && <span className="req-star">＊</span>}</th>)}</tr></thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className={ri === sel ? 'row-sel' : ''} onClick={() => setSel(ri)}>
                <td className="td-ico"><button type="button" className="detail-ico" title="レコードの詳細を表示する" onClick={(e) => { e.stopPropagation(); onOpen({ ...row }) }}><IcoDetail /></button></td>
                {COLS.map((c) => (
                  <td key={c.key} className={c.locked ? 'locked-cell' : 'edit-cell'}>
                    {c.locked ? <span>{row[c.key]}</span>
                      : c.type === 'companyName'
                        ? <input className="cell-inp" list="companyNameList" value={row[c.key] || ''} onChange={(e) => setRows(rows.map((r, i) => i === ri ? { ...r, client: e.target.value, companyId: COMPANY_BY_NAME[e.target.value] || r.companyId } : r))} />
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
          {RELATED.map((t, i) => <button key={t} type="button" className={'krel-tab' + (rel === i ? ' active' : '')} onClick={() => setRel(i)}>{t}</button>)}
          {rel === 0 && <span className="krel-note">（選択中：レコード {rows[sel]?.recordNo}）</span>}
        </div>
        {rel === 0 && (
          <div className="ktable-scroll">
            <table className="ktable">
              <thead><tr>{ITEM_COLS.map((c) => <th key={c.key}>{c.label}{c.req && <span className="req-star">＊</span>}</th>)}</tr></thead>
              <tbody>
                {items.map((row, ii) => (
                  <tr key={ii}>
                    {ITEM_COLS.map((c) => (
                      <td key={c.key} className="edit-cell">
                        {c.caseRef
                          ? <input className="cell-inp" value={row.caseNo || ''} placeholder="コード入力→Enter" onChange={(e) => setItemCell(ii, 'caseNo', e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); confirmCaseNo(ii) } }} />
                          : c.type === 'select'
                            ? <select className="cell-inp" value={row[c.key] || ''} onChange={(e) => setItemCell(ii, c.key, e.target.value)}><option value=""></option>{c.options.map((o) => <option key={o}>{o}</option>)}</select>
                            : <input className="cell-inp" type={c.type === 'date' ? 'date' : c.type === 'number' ? 'number' : 'text'} value={row[c.key] || ''} onChange={(e) => setItemCell(ii, c.key, e.target.value)} />}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {rel === 1 && <div className="empty small">案件テーブル（サンプル省略）</div>}
        {rel === 2 && <div className="empty small">販売目標変更履歴テーブル（サンプル省略）</div>}
      </div>

      <datalist id="companyNameList">{COMPANY_NAMES.map((o) => <option key={o} value={o} />)}</datalist>

      <div className="fnote" style={{ marginTop: 8 }}>※ 行をクリックすると選択され、下の発注商品テーブルが切り替わります。行頭アイコンで詳細へ（詳細の明細＝このレコードの発注商品テーブル）。案件番号はコードを入力しEnterで確定・自動入力。＋追加/複製/削除は上部ボタンを使用（複製は一番上に追加）。</div>
    </div>
  )
}
