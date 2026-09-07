import React, { useState } from 'react'
import Accordion from './Accordion.jsx'
import { RecordHeader } from './RecordHeader.jsx'

const MOVE_NO = '000201' // 倉庫移動ヘッダー番号（自動採番ダミー）
const warehouseOptions = ['佐川倉庫', '日通倉庫', '自社倉庫', 'メーカー倉庫']

function makeEmptyMove() {
  return { stockId: '', toWarehouse: '', pieces: '', moveDate: '' }
}

export default function WarehouseTab() {
  const [rows, setRows] = useState(() => [makeEmptyMove()])

  const setField = (i, key, val) => setRows(rows.map((r, idx) => (idx === i ? { ...r, [key]: val } : r)))
  const addRow = () => setRows([...rows, makeEmptyMove()])
  const dupRow = (i) => setRows([...rows.slice(0, i + 1), structuredClone(rows[i]), ...rows.slice(i + 1)])
  const delRow = (i) => setRows(rows.filter((_, idx) => idx !== i))

  return (
    <div className="tab-panel">
      <RecordHeader badge="倉庫移動" label="倉庫移動番号" no={MOVE_NO} />

      <Accordion
        title="倉庫移動明細"
        defaultOpen={true}
        right={<button type="button" className="btn-plus" onClick={addRow}>＋ 行を追加</button>}
      >
        {rows.length === 0 && <div className="empty">行がありません。「＋ 行を追加」で追加してください。</div>}

        <table className="ptable">
          <thead>
            <tr>
              <th style={{ width: '30px' }}>#</th>
              <th>在庫ID</th>
              <th>移動倉庫名</th>
              <th style={{ width: '140px' }}>移動ピース数</th>
              <th style={{ width: '160px' }}>移動日</th>
              <th style={{ width: '110px' }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td className="tc">{i + 1}</td>
                <td><input className="inp" value={r.stockId} placeholder="例：ST-000123" onChange={(e) => setField(i, 'stockId', e.target.value)} /></td>
                <td>
                  <select className="inp" value={r.toWarehouse} onChange={(e) => setField(i, 'toWarehouse', e.target.value)}>
                    <option value="">選択してください</option>
                    {warehouseOptions.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </td>
                <td><input className="inp" type="number" value={r.pieces} onChange={(e) => setField(i, 'pieces', e.target.value)} /></td>
                <td><input className="inp" type="date" value={r.moveDate} onChange={(e) => setField(i, 'moveDate', e.target.value)} /></td>
                <td className="tc">
                  <button type="button" className="btn-mini" onClick={() => dupRow(i)}>複製</button>
                  <button type="button" className="btn-del" onClick={() => delRow(i)}>削除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Accordion>
    </div>
  )
}
