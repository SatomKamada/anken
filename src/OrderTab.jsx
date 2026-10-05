import React, { useState } from 'react'
import Accordion from './Accordion.jsx'
import KGroup from './KGroup.jsx'
import OrderList from './OrderList.jsx'
import Field from './Field.jsx'
import { RecordHeader, branchCode } from './RecordHeader.jsx'
import {
  orderHeaderGroups, makeEmptyOrderHeader,
  orderDetailGroups, makeEmptyOrderDetail,
} from './orderFields.js'
import { lookupOrderDetailByProduct, lookupCaseProduct, lookupCompany } from './dummyData.js'

// 明細の全項目（表の列）。発注番号（枝番）Max No は枝番で表現するため除外。
const DETAIL_COLS = orderDetailGroups.flatMap((g) => g.fields).filter((f) => f.key !== 'branchMaxNo')

const HEADER_NO = '000123'

export default function OrderTab() {
  const [view, setView] = useState('list')   // list（検索一覧）/ detail（詳細入力）
  const [selected, setSelected] = useState(null)
  const [header, setHeader] = useState(makeEmptyOrderHeader)
  const [rows, setRows] = useState(() => [{ ...makeEmptyOrderDetail(), branchNo: '001' }])
  const [hmsg, setHmsg] = useState(null)
  const setHeaderField = (k, val) => setHeader({ ...header, [k]: val })

  const updateRow = (i, next) => setRows(rows.map((r, idx) => (idx === i ? next : r)))
  const setRowField = (i, key, val) => updateRow(i, { ...rows[i], [key]: val })

  const nextBranch = () => String(rows.length + 1).padStart(3, '0')
  // 追加：空行を追加
  const addEmpty = () => setRows([...rows, { ...makeEmptyOrderDetail(), branchNo: nextBranch() }])
  // 複製：一番上の行を複製し、一番上に追加
  const duplicateTop = () => {
    const src = rows[0]
    const clone = src ? structuredClone(src) : makeEmptyOrderDetail()
    clone.branchNo = nextBranch()
    setRows([clone, ...rows])
  }
  const dupRow = (i) => {
    const clone = structuredClone(rows[i])
    clone.branchNo = nextBranch()
    setRows([clone, ...rows])
  }
  const delRow = (i) => setRows(rows.filter((_, idx) => idx !== i))

  // 企業コード参照（ヘッダー）
  const refCompany = () => {
    const res = lookupCompany(header.companyId)
    if (!res.found) { setHmsg({ t: 'warn', m: `企業コードに該当なし（${header.companyId || '未入力'}）。ダミー：001 / 002 / 003` }); return }
    setHeader({ ...header, ...res.values })
    setHmsg({ t: 'ok', m: `企業マスタから連携しました（${header.companyId} / ${res.values.companyName}）` })
  }

  // 明細の参照ボタン（JAN→商品マスタ / 案件番号→案件に紐づく商品情報）
  const refDetail = (i, mode) => {
    const r = rows[i]
    if (mode === 'case') {
      const res = lookupCaseProduct(r.caseNo)
      if (!res.found) { alert(`案件番号に該当なし（${r.caseNo || '未入力'}）。ダミー：000045 / 000046 / 000047`); return }
      updateRow(i, { ...r, ...res.values })
      return
    }
    const res = lookupOrderDetailByProduct({ productCode: mode === 'product' ? r.productCode : '', janCode: mode === 'jan' ? r.janCode : '' })
    if (!res.found) { alert('JANコードに該当なし。手動入力してください。'); return }
    updateRow(i, { ...r, ...res.values })
  }

  // 案件番号入力時：紐づく商品情報を自動入力
  const onCaseNoChange = (i, val) => {
    const res = lookupCaseProduct(val)
    updateRow(i, { ...rows[i], caseNo: val, ...(res.found ? res.values : {}) })
  }

  // 明細セル描画（鍵以外は編集可・参照ボタン付き）
  const cell = (f, row, i) => {
    if (f.auto) return <input className="cell-inp ro" readOnly value={row[f.key] ?? ''} title="自動" />
    if (f.type === 'checkbox') return <input type="checkbox" checked={!!row[f.key]} onChange={(e) => setRowField(i, f.key, e.target.checked)} />
    // 案件番号：コード入力→Enterで確定・自動入力（参照ボタン不要）
    if (f.key === 'caseNo') {
      return (
        <input className="cell-inp" value={row.caseNo ?? ''} placeholder="コード入力→Enter"
          onChange={(e) => setRowField(i, 'caseNo', e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); const res = lookupCaseProduct(rows[i].caseNo); if (res.found) updateRow(i, { ...rows[i], ...res.values }) } }} />
      )
    }
    let inp
    if (f.type === 'select') {
      inp = (
        <select className="cell-inp" value={row[f.key] || ''} onChange={(e) => setRowField(i, f.key, e.target.value)}>
          <option value=""></option>
          {f.options.map((o) => <option key={o}>{o}</option>)}
        </select>
      )
    } else {
      inp = <input className="cell-inp" type={f.type === 'date' ? 'date' : f.type === 'number' ? 'number' : 'text'} value={row[f.key] ?? ''} onChange={(e) => setRowField(i, f.key, e.target.value)} />
    }
    if (f.reflink) return <div className="cell-ref">{inp}<button type="button" className="btn-ref sm" onClick={() => refDetail(i, f.reflink)}>参照</button></div>
    return inp
  }

  // 発注タブを開くと最初は一覧（検索結果の表）を表示
  const openDetail = (rec) => {
    setSelected(rec)
    const items = (rec.items && rec.items.length) ? rec.items.map((x) => structuredClone(x)) : [{ ...makeEmptyOrderDetail(), branchNo: '001' }]
    setRows(items)
    setView('detail')
  }
  if (view === 'list') {
    return (
      <div className="tab-panel">
        <OrderList onOpen={openDetail} />
      </div>
    )
  }

  return (
    <div className="tab-panel">
      <div className="detail-back">
        <button type="button" className="btn-mini" onClick={() => setView('list')}>← 一覧に戻る</button>
        {selected && <span className="detail-rec">レコード {selected.recordNo} ／ {selected.client}</span>}
      </div>
      {/* 最上部：ヘッダー番号（1件・自動採番） */}
      <RecordHeader badge="発注ヘッダー情報" label="発注ヘッダー番号" no={selected?.orderNo || header.orderNo || HEADER_NO} />

      {/* ① 基本情報（分類はサブ見出しで統合／最上位分類はラベル非表示） */}
      <Accordion title="発注ヘッダー情報" defaultOpen={false}>
        {hmsg && <div className={'notice ' + hmsg.t}>{hmsg.m}</div>}
        {orderHeaderGroups.map((g, gi) => (
          <KGroup key={g.title || `g${gi}`} title={g.title || '基本情報'} defaultOpen={true}>
            <div className="grid2">
              {g.fields.map((f) => {
                const right = f.reflink === 'company'
                  ? <button type="button" className="btn-ref" onClick={refCompany}>参照</button>
                  : null
                return (
                  <Field key={f.key} field={f} value={header[f.key]} right={right} onChange={setHeaderField} />
                )
              })}
            </div>
          </KGroup>
        ))}
      </Accordion>

      {/* ② 明細（表形式・1:多／枝番を自動採番） */}
      <Accordion
        title="発注明細"
        defaultOpen={true}
        right={
          <>
            <button type="button" className="btn-plus" title="空行を追加" onClick={addEmpty}>＋ 追加</button>
            <button type="button" className="btn-mini" title="一番上の行を複製して追加" onClick={duplicateTop}>複製</button>
          </>
        }
      >
        {rows.length === 0 && <div className="empty">明細がありません。</div>}
        {rows.length > 0 && (
          <div className="ktable-scroll">
            <table className="ktable meisai">
              <thead>
                <tr>
                  <th className="th-ico"></th>
                  <th>発注明細番号（枝番）</th>
                  <th>発注番号</th>
                  {DETAIL_COLS.map((f) => (
                    <th key={f.key}>{f.auto && <span className="lock">🔒</span>}{f.label}{f.required && <span className="req-star">＊</span>}</th>
                  ))}
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>
                    <td className="td-ico">#{i + 1}</td>
                    <td className="edit-cell tc"><input className="cell-inp" style={{ minWidth: 70 }} value={row.branchNo ?? ''} onChange={(e) => setRowField(i, 'branchNo', e.target.value)} /></td>
                    <td className="locked-cell">{(header.orderNo || HEADER_NO)}{row.branchNo || String(i + 1).padStart(3, '0')}</td>
                    {DETAIL_COLS.map((f) => (
                      <td key={f.key} className={f.auto ? 'locked-cell' : 'edit-cell'}>{cell(f, row, i)}</td>
                    ))}
                    <td className="tc">
                      <button type="button" className="btn-mini" onClick={() => dupRow(i)}>複製</button>
                      <button type="button" className="btn-del" onClick={() => delRow(i)}>削除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="fnote" style={{ marginTop: 6 }}>※「＋追加」で空行、「複製」で一番上の行を複製して追加します。案件番号を入力すると、商品名・メーカー名・医薬品・アルコール区分・発注ケース/ボール入数・商品カテゴリが自動入力されます（参照ボタンでも可）。</div>
      </Accordion>
    </div>
  )
}


