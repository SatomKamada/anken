import React, { useState } from 'react'
import { PAGE_CHANGE_LIST_COLS, summarize } from './pageChangeFields.js'

// 掲載ページ変更：一覧（検索画面）— 発注タブの OrderList と同じ kintone 風
// props: records, onOpen(index), onAdd(), onDuplicate(index), onDelete(index)
const VIEW_OPTIONS = ['（すべて）', '掲載ページ変更', '掲載開始終了日/募集開始終了日設定', '公開/非公開設定', '在庫移動']

const IcoDetail = () => (<svg viewBox="0 0 24 24" width="15" height="15" style={{ verticalAlign: 'middle' }}><rect x="5" y="3" width="14" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" /><line x1="8" y1="8" x2="16" y2="8" stroke="currentColor" strokeWidth="1.4" /><line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="1.4" /><line x1="8" y1="16" x2="13" y2="16" stroke="currentColor" strokeWidth="1.4" /></svg>)

export default function PageChangeList({ records, onOpen, onAdd, onDuplicate, onDelete }) {
  const [sel, setSel] = useState(0)
  const [view, setView] = useState('（すべて）')

  // 一覧の切替（変更種別で絞り込み）
  const visible = records
    .map((r, i) => ({ r, i }))
    .filter(({ r }) => view === '（すべて）' || r.changeType === view)

  const ACTIONS = ['全画面表示', '元に戻す', 'やり直し', '再読み込み', '保存', '検索', 'フィルタ', 'エクスポート']

  return (
    <div className="klist-wrap">
      <div className="kappbar">
        <select className="kview-select" value={view} onChange={(e) => setView(e.target.value)}>
          {VIEW_OPTIONS.map((o) => <option key={o}>{o}</option>)}
        </select>
        <span className="kcount">1 - {visible.length}（{visible.length}件中）</span>
      </div>

      <div className="kactionbar">
        <button type="button" className="kact-btn primary" onClick={() => { onAdd(); setSel(0) }}>＋追加</button>
        <button type="button" className="kact-btn primary" onClick={() => { if (records[sel]) { onDuplicate(sel); setSel(0) } }}>複製</button>
        <button type="button" className="kact-btn danger" onClick={() => { if (records[sel]) { onDelete(sel); setSel(0) } }}>削除</button>
        {ACTIONS.map((a) => <button key={a} type="button" className="kact-btn">{a}</button>)}
      </div>

      <div className="ktable-scroll">
        <table className="ktable">
          <thead>
            <tr>
              <th className="th-ico"></th>
              {PAGE_CHANGE_LIST_COLS.map((c) => (
                <th key={c.key}>{c.key === 'recordNo' && <span className="lock">🔒</span>}{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr><td colSpan={PAGE_CHANGE_LIST_COLS.length + 1} className="locked-cell">該当するレコードがありません</td></tr>
            )}
            {visible.map(({ r, i }) => (
              <tr key={r.recordNo} className={i === sel ? 'row-sel' : ''} onClick={() => setSel(i)} onDoubleClick={() => onOpen(i)}>
                <td className="td-ico">
                  <button type="button" className="detail-ico" title="レコードの詳細を表示する"
                    onClick={(e) => { e.stopPropagation(); onOpen(i) }}><IcoDetail /></button>
                </td>
                {PAGE_CHANGE_LIST_COLS.map((c) => (
                  <td key={c.key} className="locked-cell">
                    {c.key === 'summary' ? summarize(r) : (r[c.key] || '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="fnote" style={{ marginTop: 8 }}>
        ※ 行頭アイコン（またはダブルクリック）で詳細へ。＋追加で新規レコード、複製は選択行を一番上に追加します。
      </div>
    </div>
  )
}
