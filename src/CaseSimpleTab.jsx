import React, { useState } from 'react'
import KGroup from './KGroup.jsx'
import Field from './Field.jsx'
import {
  DEFS, GROUPS, DEF_BY_NAME, CS_LIST_COLS, CS_RECORDS_INIT, OPTION_OVERRIDES, PAIRS, MANUAL_FLAG,
  CATEGORY_MASTER, CHANNELS, CHANNEL_ROW_GROUPS, CHANNEL_SLOTS, MATRIX, fmtVal, recalc, makeEmptyCase,
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
                  const cls = ['money', 'pct', 'num'].includes(c.kind) ? 'cl-num' : c.kind === 'checkbox' ? 'cs-center' : ''
                  return <td key={c.name} className={cls}>{fmtVal(c.kind, r[c.name])}</td>
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
//   並び順の調整は caseSimpleFields.js の「画面レイアウト調整」
// ------------------------------------------------------------
const HEAD_DEFS = DEFS.filter((d) => d.group === '')
const CATEGORY = ['カテゴリーコード', '大カテゴリー', '中カテゴリー', '小カテゴリー']
const INPUT_TYPE = { select: 'select', checkbox: 'checkbox', date: 'date', textarea: 'textarea', money: 'number', pct: 'number', num: 'number' }
const numFmt = (v) => (v === '' || v === null || v === undefined ? '' : Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 }))

// kintone風のセル（ラベル上・入力下）。チャネル別の行・総額／単価・カテゴリーで使用
function Cell({ d, label, vals, change, isAuto, wide, extra }) {
  const v = vals[d.vkey]
  const lab = label ?? d.label
  if (d.kind === 'checkbox') {
    return (
      <div className="cs-cell">
        <div className="cs-clabel">{lab}</div>
        <label className="chk-inline"><input type="checkbox" checked={!!v} onChange={(e) => change(d.vkey, e.target.checked)} />
          <span>{d.boolLabel || d.label}</span></label>
      </div>
    )
  }
  const opts = d.options || OPTION_OVERRIDES[d.name] || []
  const input = d.kind === 'select' && !isAuto
    ? <select className="inp" value={v ?? ''} onChange={(e) => change(d.vkey, e.target.value)}>
        <option value="">-----</option>{opts.map((o) => <option key={o}>{o}</option>)}
      </select>
    : <input className={'inp' + (['money', 'pct', 'num'].includes(d.kind) ? ' cs-num' : '')} readOnly={isAuto}
        type={isAuto ? 'text' : (INPUT_TYPE[d.kind] || 'text')}
        value={isAuto && ['money', 'pct', 'num'].includes(d.kind) ? numFmt(v) : (v ?? '')}
        onChange={(e) => change(d.vkey, e.target.value)} />
  return (
    <div className={'cs-cell' + (wide ? ' wide' : '')}>
      <div className="cs-clabel" title={d.note || ''}>{lab}</div>
      <div className="cs-cbox">
        {d.kind === 'money' && <span className="cs-unit">¥</span>}
        {input}
        {d.kind === 'pct' && <span className="cs-unit">%</span>}
      </div>
      {extra}
    </div>
  )
}

function CaseSimpleDetail({ rec, onBack, onSave }) {
  const [vals, setVals] = useState(rec)
  const [openAll, setOpenAll] = useState({ on: true, n: 0 })   // n を変えて KGroup を開き直す

  const change = (name, v) => setVals((s) => recalc({ ...s, [name]: v }))
  const autoOf = (d) => !!(d.auto || (MANUAL_FLAG[d.name] && !vals[MANUAL_FLAG[d.name]]))

  // ラベル左・入力右の行（既存 Field）
  const renderField = (d) => {
    const isAuto = autoOf(d)
    const v = vals[d.vkey]
    if (d.kind === 'suggest') {            // 名称入力（候補付き）→ コード自動
      const listId = `cs-list-${d.key}`
      return (
        <div className="frow" key={d.key}>
          <div className="flabel">{d.label}</div>
          <div className="fbody">
            <input className="inp" list={listId} value={v ?? ''} onChange={(e) => change(d.vkey, e.target.value)} />
            <datalist id={listId}>{Object.keys(PAIRS[d.name].table).map((o) => <option key={o} value={o} />)}</datalist>
          </div>
        </div>
      )
    }
    let field, value = v
    if (isAuto) {
      field = { key: d.vkey, label: d.label, auto: true, note: d.note }
      value = fmtVal(d.kind, v)
    } else {
      const options = d.options || OPTION_OVERRIDES[d.name] || []
      field = { key: d.vkey, label: d.label, type: INPUT_TYPE[d.kind] || 'text', options, boolLabel: d.boolLabel || d.label, note: d.note }
    }
    const right = !isAuto && d.kind === 'money' ? <span className="cs-unit">円</span>
      : !isAuto && d.kind === 'pct' ? <span className="cs-unit">%</span> : null
    return <Field key={d.key} field={field} value={value} onChange={change} right={right} />
  }

  // カテゴリー：コード入力（取得／クリア）＋大・中・小（自動）
  const renderCategory = () => {
    const code = DEF_BY_NAME['カテゴリーコード']
    const get = () => {
      const m = CATEGORY_MASTER[String(vals['カテゴリーコード'] ?? '').trim()] || ['', '', '']
      setVals((s) => recalc({ ...s, '大カテゴリー': m[0], '中カテゴリー': m[1], '小カテゴリー': m[2] }))
    }
    const clear = () => setVals((s) => recalc({ ...s, 'カテゴリーコード': '', '大カテゴリー': '', '中カテゴリー': '', '小カテゴリー': '' }))
    return (
      <KGroup key="cat" title="カテゴリー" defaultOpen>
        <div className="cs-row">
          <Cell d={code} vals={vals} change={change} isAuto={false}
            extra={<span className="cs-links"><button type="button" onClick={get}>取得</button><button type="button" onClick={clear}>クリア</button></span>} />
        </div>
        <div className="cs-row">
          {CATEGORY.slice(1).map((nm) => <Cell key={nm} d={DEF_BY_NAME[nm]} vals={vals} change={change} isAuto />)}
        </div>
      </KGroup>
    )
  }

  // 費用関連：チャネルごとに横一列（列＝CHANNEL_SLOTS の項目、ない項目は空欄）
  const renderChannelRows = (g, defs) => {
    const fallback = CHANNEL_ROW_GROUPS[g]
    const chOf = (d) => CHANNELS.find((c) => d.name.startsWith(c)) || fallback
    const suffix = (d) => { const ch = chOf(d); return d.label.startsWith(ch) && d.label !== ch ? d.label.slice(ch.length) : d.label }
    const slots = CHANNEL_SLOTS[g] || []
    const rowCell = (d) => (
      <Cell key={d.key} d={{ ...d, boolLabel: d.boolLabel ? d.boolLabel.replace(/^.*を/, '') : '' }}
        label={suffix(d)} vals={vals} change={change} isAuto={autoOf(d)} />
    )
    const rows = [fallback, ...CHANNELS.filter((c) => c !== fallback)]
    return (
      <div className="cs-chtable">
        {rows.map((ch) => {
          const list = defs.filter((d) => chOf(d) === ch)
          if (!list.length) return null
          // 共通行（接頭辞なしの項目が他チャネルと別物の場合）は定義書の順のまま
          const aligned = ch !== '共通'
          const extra = aligned ? list.filter((d) => !slots.includes(suffix(d))) : list
          return (
            <div className="cs-chrow" key={ch}>
              <div className="cs-chname">{ch}</div>
              <div className="cs-row nowrap">
                {aligned && slots.map((sl) => {
                  const d = list.find((x) => suffix(x) === sl)
                  return d ? rowCell(d) : <div key={sl} className="cs-cell" />
                })}
                {extra.map(rowCell)}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // 総額・単価：チャネルを列、指標を行
  const renderMatrix = (g) => {
    const mx = MATRIX[g]
    const cell = (vk, wide) => (DEF_BY_NAME[vk]
      ? <Cell key={vk} d={DEF_BY_NAME[vk]} vals={vals} change={change} isAuto={autoOf(DEF_BY_NAME[vk])} wide={wide} />
      : <div key={vk} className="cs-cell" />)
    return (
      <>
        {mx.top.length > 0 && <div className="cs-row">{mx.top.map((vk) => cell(vk))}</div>}
        <div className="cs-matrix" style={{ gridTemplateColumns: `repeat(${mx.cols.length}, minmax(0, 1fr))` }}>
          {mx.cols.map((ch) => <div key={ch} className="cs-mcell">{cell(g === '単価' ? `${mx.head(ch)}` : mx.head(ch), true)}</div>)}
          {mx.rows.map((r, i) => mx.cols.map((ch) => (
            <div key={`${i}-${ch}`} className={'cs-mcell cs-pair' + (r.indent ? ' indent' : '')}>
              {r.cells(ch).map((vk) => cell(vk))}
            </div>
          )))}
        </div>
      </>
    )
  }

  const renderBody = (g, defs) => {
    if (MATRIX[g]) return renderMatrix(g)
    if (CHANNEL_ROW_GROUPS[g]) return renderChannelRows(g, defs)
    // 掲載チャネル：チェックボックスを1行にまとめる
    if (defs.every((d) => d.kind === 'checkbox' && !d.boolLabel)) {
      return (
        <div className="frow">
          <div className="flabel">{g}</div>
          <div className="fbody chk-grid">
            {defs.map((d) => (
              <label key={d.key} className="chk-inline">
                <input type="checkbox" checked={!!vals[d.vkey]} onChange={(e) => change(d.vkey, e.target.checked)} />
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
    // カテゴリーを含むグループ（商品）：前 → カテゴリー → 後
    const ci = defs.findIndex((d) => d.name === 'カテゴリーコード')
    if (ci >= 0) {
      const rest = defs.filter((d) => !CATEGORY.includes(d.name))
      const before = rest.filter((d) => defs.indexOf(d) < ci)
      const after = rest.filter((d) => defs.indexOf(d) > ci)
      return (
        <>
          <div className="grid2">{before.map(renderField)}</div>
          {renderCategory()}
          <div className="grid2">{after.map(renderField)}</div>
        </>
      )
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
          {renderBody(g, DEFS.filter((d) => d.group === g))}
        </KGroup>
      ))}
    </div>
  )
}
