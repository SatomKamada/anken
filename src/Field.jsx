// ラベル（左）＋コントロール（右）の1行レイアウト。掲載履歴情報・商品規格情報（共通）で共用。
export function Row({ label, required, help, children }) {
  return (
    <div className="kt-ph-row">
      <div className="kt-ph-label">
        {label}
        {required && <span className="kt-badge-req">必須</span>}
        {help && <span className="kt-help" title={help}>?</span>}
      </div>
      <div className="kt-ph-control">{children}</div>
    </div>
  )
}

// 汎用フィールド描画コンポーネント
// type: text | number | checkbox | select | datetime | checkboxGroup | textarea
// layout: 'stack'（ラベル上）| 'row'（ラベル左・掲載履歴と同じUI）
export default function Field({ def, value, onChange, disabled = false, layout = 'stack' }) {
  const { label, type, options, required, readOnly, note, boolLabel = 'あり' } = def

  let control
  switch (type) {
    case 'checkbox':
      control = (
        <label className="kt-checkbox">
          <input type="checkbox" checked={!!value} disabled={disabled}
            onChange={(e) => onChange(e.target.checked)} />
          <span>{boolLabel}</span>
        </label>
      )
      break

    case 'checkboxGroup':
      control = (
        <div className="kt-checkbox-group">
          {options.map((opt) => (
            <label key={opt} className="kt-checkbox">
              <input
                type="checkbox"
                disabled={disabled}
                checked={Array.isArray(value) && value.includes(opt)}
                onChange={(e) => {
                  const set = new Set(Array.isArray(value) ? value : [])
                  e.target.checked ? set.add(opt) : set.delete(opt)
                  onChange([...set])
                }}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      )
      break

    case 'select':
      control = (
        <select className="kt-input" value={value} disabled={disabled}
          onChange={(e) => onChange(e.target.value)}>
          <option value="">選択してください</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )
      break

    case 'number':
      control = (
        <input className="kt-input" type="number" value={value}
          readOnly={readOnly} disabled={disabled}
          onChange={(e) => onChange(e.target.value)} />
      )
      break

    case 'datetime':
      control = (
        <input className="kt-input" type="datetime-local" value={value} disabled={disabled}
          onChange={(e) => onChange(e.target.value)} />
      )
      break

    case 'textarea':
      control = (
        <textarea className="kt-input kt-textarea" rows={4} value={value} disabled={disabled}
          onChange={(e) => onChange(e.target.value)} />
      )
      break

    default: // text
      control = (
        <input className="kt-input" type="text" value={value}
          readOnly={readOnly} disabled={disabled}
          onChange={(e) => onChange(e.target.value)} />
      )
  }

  if (layout === 'row') {
    return (
      <Row label={label} required={required} help={def.help}>
        {control}
        {note && <div className="kt-note">{note}</div>}
      </Row>
    )
  }

  return (
    <div className="kt-field">
      <div className="kt-label">
        {label}
        {required && <span className="kt-badge-req">必須</span>}
      </div>
      {control}
      {note && <div className="kt-note">{note}</div>}
    </div>
  )
}
