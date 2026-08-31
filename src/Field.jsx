import React from 'react'

// 汎用フィールド行（左ラベル + 入力）
// props: field, value, onChange, right(任意=参照ボタン等)
export default function Field({ field, value, onChange, right }) {
  const { key, label, type, options, note, required, auto, boolLabel } = field
  const ro = !!auto

  const handle = (v) => { if (!ro) onChange(key, v) }

  let input
  switch (type) {
    case 'textarea':
      input = (
        <textarea className="inp" rows={2} readOnly={ro} value={value ?? ''}
          onChange={(e) => handle(e.target.value)} />
      )
      break
    case 'checkbox':
      input = (
        <label className="chk-inline">
          <input type="checkbox" disabled={ro} checked={!!value}
            onChange={(e) => handle(e.target.checked)} />
          <span>{boolLabel || 'ON'}</span>
        </label>
      )
      break
    case 'checkboxGroup':
      input = (
        <div className={'chk-grid' + (field.vertical ? ' vcol' : '')}>
          {options.map((opt) => {
            const arr = Array.isArray(value) ? value : []
            const on = arr.includes(opt)
            return (
              <label key={opt} className="chk-inline">
                <input type="checkbox" disabled={ro} checked={on}
                  onChange={(e) => {
                    const next = e.target.checked ? [...arr, opt] : arr.filter((x) => x !== opt)
                    handle(next)
                  }} />
                <span>{opt}</span>
              </label>
            )
          })}
        </div>
      )
      break
    case 'select':
      input = (
        <select className="inp" disabled={ro} value={value ?? ''}
          onChange={(e) => handle(e.target.value)}>
          <option value=""></option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      )
      break
    case 'number':
      input = (
        <input className="inp" type="number" readOnly={ro} value={value ?? ''}
          onChange={(e) => handle(e.target.value)} />
      )
      break
    case 'date':
      input = (
        <input className="inp" type="date" readOnly={ro} value={value ?? ''}
          onChange={(e) => handle(e.target.value)} />
      )
      break
    case 'datetime':
      input = (
        <input className="inp" type="datetime-local" readOnly={ro} value={value ?? ''}
          onChange={(e) => handle(e.target.value)} />
      )
      break
    default:
      input = (
        <input className="inp" type="text" readOnly={ro} value={value ?? ''}
          onChange={(e) => handle(e.target.value)} />
      )
  }

  return (
    <div className="frow">
      <div className="flabel">
        {label}
        {required && <span className="req">必須</span>}
        {auto && <span className="autotag">自動</span>}
      </div>
      <div className={'fbody' + (right ? ' has-right' : '')}>
        {input}
        {right}
        {note && <div className="fnote">{note}</div>}
      </div>
    </div>
  )
}
