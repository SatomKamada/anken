import React, { useState } from 'react'
import KGroup from './KGroup.jsx'
import Field from './Field.jsx'
import {
  CASE_DEFS, CS_LIST_COLS, CS_RECORDS_INIT, OPTION_OVERRIDES, LOOKUPS, MANUAL_FLAG,
  fmtVal, recalc, makeEmptyCase,
} from './caseSimpleFields.js'
import { caseStatusOptions } from './fields.js'
import './caseList.css'
import './caseSimple.css'

// ============================================================
// 案件タブ（現行踏襲・シンプル版）
//   一覧（表示のみ）→ 行頭アイコン／ダブルクリックで詳細
//   詳細：テーブル定義書「案件管理」の項目を、備考欄のグループごとに表示
// ============================================================
const nowStr = () => {
  const d = new Date(), z = (x) => String(x).padStart(2, '0')
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())} ${z(d.getHours())}:${z(d.getMinutes())}`
}
const KIND_OF = Object.fromEntries(CASE_DEFS.map((d) => [d.name, d.kind]))

export default function CaseSimpleTab() {
  const [view, setView] = useState('list')
  const [records, setRecords] = useState(CS_RECORDS_INIT)
  const [cur, setCur] = useState(null)

  const nextNo = () => String(Math.max(0, ...records.map((r) => Number(r['レコード番号']) || 0)) + 1)
  const open = (r) => { setCur(r); setView('detail') }
  const add = () => open(makeEmptyCase(nextNo()))
  const save = (rec) => {
    const r = { ...rec, '更新日時': nowStr(), '作成日時': rec['作成日時'] || nowStr() }
    setRecords((rs) => rs.some((x) => x['レコード番号'] === r['レコード番号'])
      ? rs.map((x) => (x['レコード番号'] === r['レコード番号'] ? r : x))
      : [r, ...rs])
    setView('list')
  }

  if (view === 'list') {
    return <div className="tab-panel"><CaseSimpleList records={records} onOpen={open} onAdd={add} /></div>
  }
  return <CaseSimpleDetail key={cur['レコード番号']} rec={cur} onBack={() => setView('list')} onSave={save} />
}

// ------------------------------------------------------------
// 一覧：表示のみ
// ------------------------------------------------------------
const IcoDetail = () => (<svg viewBox="0 0 24 24" width="15" height="15" style={{ verticalAlign: 'middle' }}><rect x="5" y="3" width="14" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" /><line x1="8" y1="8" x2="16" y2="8" stroke="currentColor" strokeWidth="1.4" /><line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="1.4" /><line x1="8" y1="16" x2="13" y2="16" stroke="currentColor" strokeWidth="1.4" /></svg>)
const VIEWS = ['（すべて）', ...caseStatusOptions]

function CaseSimpleList({ records, onOpen, onAdd }) {
  const [filter, setFilter] = useState('（すべて）')
  const visible = records.filter((r) => filter === '（すべて）' || r['案件ステータス'] === filter)
  return (
    <div className="klist-wrap">
      <div className="kappbar">
        <select className="kview-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
          {VIEWS.map((o) => <option key={o}>{o}</option>)}
        </select>
        <button type="button" className="kact-btn primary" onClick={onAdd}>＋追加</button>
        <span className="kcount">1 - {visible.length}（{visible.length}件中）</span>
      </div>
      <div className="ktable-scroll">
        <table className="ktable cl-list">
          <thead>
            <tr>
              <th className="th-ico"></th>
              {CS_LIST_COLS.map((c) => <th key={c.name}>{c.label || c.name}</th>)}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && <tr><td colSpan={CS_LIST_COLS.length + 1}>該当するレコードがありません</td></tr>}
            {visible.map((r) => (
              <tr key={r['レコード番号']} onDoubleClick={() => onOpen(r)}>
                <td className="td-ico">
                  <button type="button" className="detail-ico" title="レコードの詳細を表示する" onClick={() => onOpen(r)}><IcoDetail /></button>
                </td>
                {CS_LIST_COLS.map((c) => {
                  const kind = c.type || KIND_OF[c.name]
                  return <td key={c.name} className={kind === 'money' ? 'cl-num' : ''}>{fmtVal(kind, r[c.name])}</td>
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ------------------------------------------------------------
// 詳細：備考欄のグループごとに表示（グループ外＝最上部）
// ------------------------------------------------------------
const GROUPS = [...new Set(CASE_DEFS.map((d) => d.group))].filter((g) => g !== '')
const HEAD_DEFS = CASE_DEFS.filter((d) => d.group === '')

function CaseSimpleDetail({ rec, onBack, onSave }) {
  const [vals, setVals] = useState(rec)
  const [openAll, setOpenAll] = useState({ on: true, n: 0 })   // n を変えて KGroup を開き直す

  const change = (name, v) => setVals((s) => recalc({ ...s, [name]: v }))
  const doLookup = (d) => {
    const lk = LOOKUPS[d.name]
    if (!lk) return
    change(lk.target, lk.table[String(vals[d.name] ?? '').trim()] ?? '')
  }

  const renderField = (d) => {
    const isAuto = d.auto || (MANUAL_FLAG[d.name] && !vals[MANUAL_FLAG[d.name]])
    const label = d.isNew ? <>{d.label}<span className="cs-new">次期新規</span></> : d.label
    const options = d.options || OPTION_OVERRIDES[d.name] || []
    const v = vals[d.name]
    let field, value = v
    if (isAuto) {
      field = { key: d.name, label, auto: true, note: d.note }
      value = fmtVal(d.kind, v)
    } else {
      const type = { select: 'select', checkbox: 'checkbox', date: 'date', textarea: 'textarea',
        money: 'number', pct: 'number', num: 'number' }[d.kind] || 'text'
      field = { key: d.name, label, type, options, boolLabel: d.boolLabel || d.label, note: d.note }
    }
    const right = d.kind === 'lookup'
      ? <button type="button" className="btn-ref" onClick={() => doLookup(d)}>取得</button>
      : !isAuto && d.kind === 'money' ? <span className="cs-unit">円</span>
      : !isAuto && d.kind === 'pct' ? <span className="cs-unit">%</span> : null
    return <Field key={d.key} field={field} value={value} onChange={change} right={right} />
  }

  const renderBody = (g, defs) => {
    // 掲載チャネル：チェックボックスを1行にまとめる
    if (defs.every((d) => d.kind === 'checkbox' && !d.boolLabel)) {
      return (
        <div className="frow">
          <div className="flabel">{g}</div>
          <div className="fbody chk-grid">
            {defs.map((d) => (
              <label key={d.key} className="chk-inline">
                <input type="checkbox" checked={!!vals[d.name]} onChange={(e) => change(d.name, e.target.checked)} />
                <span>{d.label}</span>
              </label>
            ))}
          </div>
        </div>
      )
    }
    // オプション設定：小見出しごと
    if (defs.some((d) => d.sub)) {
      const subs = [...new Set(defs.map((d) => d.sub))]
      return subs.map((s) => (
        <React.Fragment key={s}>
          <div className="subhead">{s}</div>
          <div className="grid2">{defs.filter((d) => d.sub === s).map(renderField)}</div>
        </React.Fragment>
      ))
    }
    return <div className="grid2">{defs.map(renderField)}</div>
  }

  return (
    <div className="tab-panel case-detail cs-detail">
      <div className="detail-back">
        <button type="button" className="btn-mini" onClick={onBack}>← 一覧に戻る</button>
        <span className="detail-rec">レコード番号 {vals['レコード番号']}　案件No {vals['案件No'] || '（新規）'}</span>
        <span className="cs-spacer" />
        <button type="button" className="btn-mini" onClick={() => setOpenAll((o) => ({ on: true, n: o.n + 1 }))}>すべて開く</button>
        <button type="button" className="btn-mini" onClick={() => setOpenAll((o) => ({ on: false, n: o.n + 1 }))}>すべて閉じる</button>
        <button type="button" className="btn-ref" onClick={() => onSave(vals)}>保存</button>
      </div>

      {/* グループ外の項目（備考が空欄）：最上部 */}
      <div className="fgroup casehead grid2">{HEAD_DEFS.map(renderField)}</div>

      {GROUPS.map((g) => (
        <KGroup key={`${g}-${openAll.n}`} title={g} defaultOpen={openAll.on}>
          {renderBody(g, CASE_DEFS.filter((d) => d.group === g))}
        </KGroup>
      ))}
    </div>
  )
}
