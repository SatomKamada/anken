import React, { useState } from 'react'
import {
  PAGE_CHANGE_LIST_COLS, PAGE_CHANGE_TYPE, PAGE_CHANGE_TARGET_GROUPS,
  COMPANY_SUGGEST, productSuggestFor, setProductName, lookupSpecPosts,
} from './pageChangeFields.js'

// 掲載ページ変更：一覧（検索画面）— 発注タブの OrderList と同じ kintone 風
//   1レコード＝変更明細の行数ぶん表示（掲載ページ変更の行 / 変更対象の掲載履歴 / 在庫移動の行）
//   レコード単位の項目は行結合。レコード番号・担当者・作成日時・変更日時以外は編集可
// props: records, onOpen(i), onAdd(), onDuplicate(i), onDelete(i), onUpdate(i, next)
const VIEW_OPTIONS = ['（すべて）', ...Object.values(PAGE_CHANGE_TYPE)]
const T = PAGE_CHANGE_TYPE

const IcoDetail = () => (<svg viewBox="0 0 24 24" width="15" height="15" style={{ verticalAlign: 'middle' }}><rect x="5" y="3" width="14" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" /><line x1="8" y1="8" x2="16" y2="8" stroke="currentColor" strokeWidth="1.4" /><line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="1.4" /><line x1="8" y1="16" x2="13" y2="16" stroke="currentColor" strokeWidth="1.4" /></svg>)

// 見出し1段目（グループ）の colSpan
const GROUPS = PAGE_CHANGE_LIST_COLS.reduce((acc, c) => {
  const last = acc[acc.length - 1]
  if (last && last.name === c.group) last.span++
  else acc.push({ name: c.group, span: 1 })
  return acc
}, [])

// レコードの変更明細（行）：{ line, idx }（idx は元配列の位置）
//   掲載履歴は「変更対象」にチェックしたもののみ
const linesOf = (r) => {
  const wrap = (arr) => arr.map((line, idx) => ({ line, idx }))
  if (r.changeType === T.PAGE) return wrap(r.pageRows)
  if (r.changeType === T.PERIOD || r.changeType === T.PUBLISH) return wrap(r.posts).filter(({ line }) => line.selected)
  if (r.changeType === T.STOCK) return wrap(r.stockRows)
  return []
}

export default function PageChangeList({ records, onOpen, onAdd, onDuplicate, onDelete, onUpdate }) {
  const [sel, setSel] = useState(0)
  const [view, setView] = useState('（すべて）')
  const [msg, setMsg] = useState(null)

  const visible = records
    .map((r, i) => ({ r, i }))
    .filter(({ r }) => view === '（すべて）' || r.changeType === view)
  const lineCount = visible.reduce((a, { r }) => a + Math.max(1, linesOf(r).length), 0)

  // ---- セル更新 ----
  const setRec = (i, patch) => onUpdate(i, { ...records[i], ...patch })
  const setLine = (i, j, c, val) => {
    const r = records[i]
    if (c.scope === 'page') return setRec(i, { pageRows: r.pageRows.map((x, k) => (k === j ? { ...x, [c.key]: val } : x)) })
    if (c.scope === 'stock') return setRec(i, { stockRows: r.stockRows.map((x, k) => (k === j ? { ...x, [c.key]: val } : x)) })
    if (c.scope === 'pub') return setRec(i, { posts: r.posts.map((x, k) => (k === j ? { ...x, publish: { ...x.publish, [c.key]: val } } : x)) })
    return setRec(i, { posts: r.posts.map((x, k) => (k === j ? { ...x, [c.key]: val } : x)) })
  }
  const enterSpec = (i) => {
    const res = lookupSpecPosts(records[i])
    setMsg({ t: res.ok ? 'ok' : 'warn', m: `レコード ${records[i].recordNo}：${res.msg}` })
    if (res.ok) onUpdate(i, res.record)
  }

  // ---- セル描画 ----
  const recCell = (c, r, i, rowSpan) => {
    const na = c.types && !c.types.includes(r.changeType)
    if (c.locked || na) {
      return <td key={c.key} rowSpan={rowSpan} className={'locked-cell' + (na ? ' pc-na' : '')}>{na ? '' : r[c.key]}</td>
    }
    let inp
    if (c.type === 'company') {
      inp = <input className="cell-inp" list="pcCompanyList" value={r.companyName} placeholder="入力で候補表示"
        onChange={(e) => setRec(i, { companyName: e.target.value })} />
    } else if (c.type === 'product') {
      inp = (
        <>
          <input className="cell-inp pc-wide" list={`pcProd-${r.recordNo}`} value={r.productName} placeholder="入力で候補表示"
            onChange={(e) => onUpdate(i, setProductName(r, e.target.value))} />
          <datalist id={`pcProd-${r.recordNo}`}>{productSuggestFor(r.companyName).map((o) => <option key={o} value={o} />)}</datalist>
        </>
      )
    } else if (c.type === 'select') {
      inp = (
        <select className="cell-inp" value={r[c.key]} onChange={(e) => setRec(i, { [c.key]: e.target.value })}>
          <option value=""></option>
          {c.options.map((o) => <option key={o}>{o}</option>)}
        </select>
      )
    } else if (c.type === 'specId') {
      inp = <input className="cell-inp" value={r.specId} placeholder="入力→Enter"
        onChange={(e) => setRec(i, { specId: e.target.value })}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); enterSpec(i) } }} />
    } else {
      inp = <input className="cell-inp pc-wide" value={r[c.key] ?? ''} onChange={(e) => setRec(i, { [c.key]: e.target.value })} />
    }
    return <td key={c.key} rowSpan={rowSpan} className="edit-cell" onClick={(e) => e.stopPropagation()}>{inp}</td>
  }

  const lineCell = (c, r, i, line, j) => {
    const na = !c.types.includes(r.changeType) || !line
    if (na) return <td key={c.key} className="locked-cell pc-na"></td>

    const val = c.scope === 'pub' ? line.publish[c.key] : line[c.key]
    const set = (v) => setLine(i, j, c, v)

    let inp
    if (c.type === 'target') {
      inp = (
        <select className="cell-inp pc-wide" value={val} onChange={(e) => set(e.target.value)}>
          <option value=""></option>
          {PAGE_CHANGE_TARGET_GROUPS.map((g) => (
            <optgroup key={g.group} label={g.group}>
              {g.items.map((t) => <option key={t.key} value={`${g.group}.${t.key}`}>{t.label}</option>)}
            </optgroup>
          ))}
        </select>
      )
    } else if (c.type === 'select') {
      inp = (
        <select className="cell-inp" value={val} onChange={(e) => set(e.target.value)}>
          {c.options.map((o) => <option key={o}>{o}</option>)}
        </select>
      )
    } else {
      inp = <input className={'cell-inp' + (c.key === 'content' ? ' pc-wide' : '')}
        type={c.type === 'date' ? 'date' : c.type === 'number' ? 'number' : 'text'}
        value={val ?? ''} onChange={(e) => set(e.target.value)} />
    }
    return (
      <td key={c.key} className="edit-cell" onClick={(e) => e.stopPropagation()}>{inp}</td>
    )
  }

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

      {msg && <div className={'notice ' + msg.t}>{msg.m}</div>}

      <div className="ktable-scroll">
        <table className="ktable pc-list">
          <thead>
            <tr>
              <th className="th-ico" rowSpan={2}></th>
              {GROUPS.map((g) => <th key={g.name} colSpan={g.span} className="pc-grp">{g.name}</th>)}
            </tr>
            <tr>
              {PAGE_CHANGE_LIST_COLS.map((c) => (
                <th key={c.key}>{c.locked && <span className="lock">🔒</span>}{c.label}{c.req && <span className="req-star">＊</span>}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr><td colSpan={PAGE_CHANGE_LIST_COLS.length + 1} className="locked-cell">該当するレコードがありません</td></tr>
            )}
            {visible.map(({ r, i }) => {
              const lines = linesOf(r)
              const n = Math.max(1, lines.length)
              return Array.from({ length: n }, (_, j) => (
                <tr key={`${r.recordNo}-${j}`} className={(i === sel ? 'row-sel' : '') + (j === n - 1 ? ' pc-rec-end' : '')} onClick={() => setSel(i)}>
                  {j === 0 && (
                    <td className="td-ico" rowSpan={n}>
                      <button type="button" className="detail-ico" title="レコードの詳細を表示する"
                        onClick={(e) => { e.stopPropagation(); onOpen(i) }}><IcoDetail /></button>
                    </td>
                  )}
                  {PAGE_CHANGE_LIST_COLS.map((c) => (
                    c.scope === 'rec'
                      ? (j === 0 ? recCell(c, r, i, n) : null)
                      : lineCell(c, r, i, lines[j]?.line, lines[j]?.idx)
                  ))}
                </tr>
              ))
            })}
          </tbody>
        </table>
      </div>

      <datalist id="pcCompanyList">{COMPANY_SUGGEST.map((o) => <option key={o} value={o} />)}</datalist>

      <div className="fnote" style={{ marginTop: 8 }}>
        ※ 1レコードに複数の変更明細（掲載ページ変更の行・変更対象の掲載履歴・在庫移動の行）がある場合は明細の行数ぶん表示します。
        掲載履歴は詳細画面で「変更対象」にチェックしたもののみ表示します。
        変更種別に関係しない項目はグレー表示です。商品規格IDは入力してEnterで企業名・商品名・掲載履歴を呼び出し。行頭アイコンで詳細へ。
      </div>
    </div>
  )
}
