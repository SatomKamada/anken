import React, { useState } from 'react'
import Accordion from './Accordion.jsx'
import Field from './Field.jsx'
import { RecordHeader, BranchBar, branchCode } from './RecordHeader.jsx'
import {
  orderHeaderGroups, makeEmptyOrderHeader,
  orderDetailGroups, makeEmptyOrderDetail,
  targetHistoryFields, makeEmptyTargetHistory,
} from './orderFields.js'
import { lookupOrderDetailByProduct } from './dummyData.js'

export default function OrderTab() {
  const [header, setHeader] = useState(makeEmptyOrderHeader)
  const [rows, setRows] = useState(() => [makeEmptyOrderDetail()])
  const setHeaderField = (k, val) => setHeader({ ...header, [k]: val })

  const updateRow = (i, next) => setRows(rows.map((r, idx) => (idx === i ? next : r)))
  const setRowField = (i, key, val) => updateRow(i, { ...rows[i], [key]: val })

  const duplicateLast = () => {
    const src = rows[rows.length - 1]
    setRows([...rows, src ? structuredClone(src) : makeEmptyOrderDetail()])
  }
  const addEmpty = () => setRows([...rows, makeEmptyOrderDetail()])
  const dupRow = (i) => {
    const clone = structuredClone(rows[i])
    setRows([...rows.slice(0, i + 1), clone, ...rows.slice(i + 1)])
  }
  const delRow = (i) => setRows(rows.filter((_, idx) => idx !== i))

  // 明細の参照ボタン（商品マスタ / JICFS）
  const refDetail = (i, mode) => {
    const r = rows[i]
    const res = lookupOrderDetailByProduct({
      productCode: mode === 'product' ? r.productCode : '',
      janCode: mode === 'jan' ? r.janCode : '',
    })
    if (!res.found) {
      alert(`${mode === 'product' ? '商品コード' : 'JANコード'}に該当なし。手動入力してください。`)
      return
    }
    updateRow(i, { ...r, ...res.values })
  }

  // 販売目標変更履歴（明細サブテーブル）
  const addHist = (i) => updateRow(i, { ...rows[i], targetHistory: [...(rows[i].targetHistory || []), makeEmptyTargetHistory()] })
  const setHist = (i, hi, key, val) => {
    const th = rows[i].targetHistory.map((h, idx) => (idx === hi ? { ...h, [key]: val } : h))
    updateRow(i, { ...rows[i], targetHistory: th })
  }
  const delHist = (i, hi) => updateRow(i, { ...rows[i], targetHistory: rows[i].targetHistory.filter((_, idx) => idx !== hi) })

  return (
    <div className="tab-panel">
      {/* 最上部：ヘッダー番号（1件・自動採番） */}
      <RecordHeader badge="ヘッダー" label="発注番号" no={header.orderNo || '000123'} />

      {/* ① ヘッダー（旧・分類別アコーディオンをサブ見出しで統合） */}
      <Accordion title="ヘッダー" defaultOpen={false}>
        {orderHeaderGroups.map((g) => (
          <div key={g.title}>
            <div className="subhead">{g.title}</div>
            <div className="grid2">
              {g.fields.map((f) => (
                <Field key={f.key} field={f} value={header[f.key]} onChange={setHeaderField} />
              ))}
            </div>
          </div>
        ))}
      </Accordion>

      {/* ② 明細（1:多・枝番を自動採番） */}
      <Accordion
        title="明細（発注商品）"
        defaultOpen={false}
        right={
          <>
            <button type="button" className="btn-plus" title="直前の行を複製して追加" onClick={duplicateLast}>＋ 複製追加</button>
            <button type="button" className="btn-mini" onClick={addEmpty}>空行追加</button>
          </>
        }
      >
        {rows.length === 0 && <div className="empty">明細がありません。</div>}
        {rows.map((row, i) => {
          const code = branchCode(header.orderNo || '000123', i)
          const title = (
            <>
              <span className="branch-tag">明細 #{i + 1}</span>
              {row.productName || row.janCode || row.productCode || '（未設定）'}
            </>
          )
          return (
            <Accordion
              key={i}
              level="sub"
              defaultOpen={false}
              title={title}
              right={
                <>
                  <button type="button" className="btn-mini" onClick={() => dupRow(i)}>この行を複製</button>
                  <button type="button" className="btn-del" onClick={() => delRow(i)}>削除</button>
                </>
              }
            >
              {/* 枝番（自動採番） */}
              <BranchBar no={i + 1} code={code} />

              {orderDetailGroups.map((g) => (
                <div key={g.title}>
                  <div className="subhead">{g.title}</div>
                  <div className="grid2">
                    {g.fields.filter((f) => f.key !== 'branchMaxNo').map((f) => {
                      const right = f.reflink
                        ? <button type="button" className="btn-ref" onClick={() => refDetail(i, f.reflink)}>参照</button>
                        : null
                      return (
                        <Field key={f.key} field={f} value={row[f.key]} right={right}
                          onChange={(k, val) => setRowField(i, k, val)} />
                      )
                    })}
                  </div>
                </div>
              ))}

              {/* 販売目標変更履歴 */}
              <div className="subhead">
                販売目標変更履歴
                <button type="button" className="btn-mini" onClick={() => addHist(i)}>＋ 追加</button>
              </div>
              {(!row.targetHistory || row.targetHistory.length === 0)
                ? <div className="empty small">履歴なし</div>
                : (
                  <table className="ptable">
                    <thead><tr>{targetHistoryFields.map((f) => <th key={f.key}>{f.label}</th>)}<th></th></tr></thead>
                    <tbody>
                      {row.targetHistory.map((h, hi) => (
                        <tr key={hi}>
                          {targetHistoryFields.map((f) => (
                            <td key={f.key}><input className="inp" value={h[f.key] ?? ''} onChange={(e) => setHist(i, hi, f.key, e.target.value)} /></td>
                          ))}
                          <td className="tc"><button type="button" className="btn-del" onClick={() => delHist(i, hi)}>削除</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
            </Accordion>
          )
        })}
      </Accordion>
    </div>
  )
}
