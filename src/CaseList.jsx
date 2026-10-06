import React, { useState } from 'react'
import { CASE_LIST_COLS, CASE_LIST_VIEWS, fmtCell } from './caseListFields.js'

// 案件：一覧（検索画面）— 発注タブの OrderList と同じ kintone 風。表示のみ（編集不可）
// props: records, onOpen(i), onAdd(), onDuplicate(i), onDelete(i)
const IcoDetail = () => (<svg viewBox="0 0 24 24" width="15" height="15" style={{ verticalAlign: 'middle' }}><rect x="5" y="3" width="14" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" /><line x1="8" y1="8" x2="16" y2="8" stroke="currentColor" strokeWidth="1.4" /><line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="1.4" /><line x1="8" y1="16" x2="13" y2="16" stroke="currentColor" strokeWidth="1.4" /></svg>)

const ACTIONS = ['全画面表示', '再読み込み', '検索', 'フィルタ', 'エクスポート']

export default function CaseList({ records, onOpen, onAdd, onDuplicate, onDelete }) {
  const [sel, setSel] = useState(0)
  const [view, setView] = useState('（すべて）')

  const visible = records
    .map((r, i) => ({ r, i }))
    .filter(({ r }) => view === '（すべて）' || r.caseStatus === view)

  return (
    <div className="klist-wrap">
      <div className="kappbar">
        <select className="kview-select" value={view} onChange={(e) => setView(e.target.value)}>
          {CASE_LIST_VIEWS.map((o) => <option key={o}>{o}</option>)}
        </select>
        <span className="kcount">1 - {visible.length}（{visible.length}件中）</span>
      </div>

      <div className="kactionbar">
        <button type="button" className="kact-btn primary" onClick={onAdd}>＋追加</button>
        <button type="button" className="kact-btn primary" onClick={() => { if (records[sel]) { onDuplicate(sel); setSel(0) } }}>複製</button>
        <button type="button" className="kact-btn danger" onClick={() => { if (records[sel]) { onDelete(sel); setSel(0) } }}>削除</button>
        {ACTIONS.map((a) => <button key={a} type="button" className="kact-btn">{a}</button>)}
      </div>

      <div className="ktable-scroll">
        <table className="ktable cl-list">
          <thead>
            <tr>
              <th className="th-ico"></th>
              {CASE_LIST_COLS.map((c) => <th key={c.key}>{c.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr><td colSpan={CASE_LIST_COLS.length + 1}>該当するレコードがありません</td></tr>
            )}
            {visible.map(({ r, i }) => (
              <tr key={r.recordNo} className={i === sel ? 'row-sel' : ''} onClick={() => setSel(i)} onDoubleClick={() => onOpen(i)}>
                <td className="td-ico">
                  <button type="button" className="detail-ico" title="レコードの詳細を表示する"
                    onClick={(e) => { e.stopPropagation(); onOpen(i) }}><IcoDetail /></button>
                </td>
                {CASE_LIST_COLS.map((c) => (
                  <td key={c.key} className={c.type === 'money' || c.type === 'number' ? 'cl-num' : ''}>
                    {fmtCell(c, r[c.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}
