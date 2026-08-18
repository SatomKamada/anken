import { useState } from 'react'
import {
  productInfoFields,
  specFields,
  makeEmptySpec,
  makeEmptyProductInfo,
} from './fields.js'

// ---- 汎用フィールド描画 ------------------------------------------
function Field({ def, value, onChange }) {
  const { label, type, options, required, readOnly, note } = def

  let control
  switch (type) {
    case 'checkbox':
      control = (
        <label className="kt-checkbox">
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span>あり</span>
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
        <select
          className="kt-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">選択してください</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )
      break

    case 'number':
      control = (
        <input
          className="kt-input"
          type="number"
          value={value}
          readOnly={readOnly}
          onChange={(e) => onChange(e.target.value)}
        />
      )
      break

    case 'datetime':
      control = (
        <input
          className="kt-input"
          type="datetime-local"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )
      break

    default: // text
      control = (
        <input
          className="kt-input"
          type="text"
          value={value}
          readOnly={readOnly}
          onChange={(e) => onChange(e.target.value)}
        />
      )
  }

  return (
    <div className="kt-field">
      <div className="kt-label">
        {label}
        {required && <span className="kt-required">*</span>}
      </div>
      {control}
      {note && <div className="kt-note">{note}</div>}
    </div>
  )
}

// ---- アプリ本体 --------------------------------------------------
export default function App() {
  const [ankenNo] = useState('000000000153971')
  const [productInfo, setProductInfo] = useState(makeEmptyProductInfo())
  const [specs, setSpecs] = useState([makeEmptySpec()]) // 明細（1:多）

  const updateProductInfo = (key, val) =>
    setProductInfo((p) => ({ ...p, [key]: val }))

  const updateSpec = (index, key, val) =>
    setSpecs((rows) => rows.map((r, i) => (i === index ? { ...r, [key]: val } : r)))

  const addSpec = () => setSpecs((rows) => [...rows, makeEmptySpec()])
  const removeSpec = (index) =>
    setSpecs((rows) => (rows.length === 1 ? rows : rows.filter((_, i) => i !== index)))

  return (
    <div className="kt-app">
      {/* ===== kintone 風ヘッダー ===== */}
      <header className="kt-topbar">
        <div className="kt-logo">📄 案件管理アプリ（モック）</div>
        <div className="kt-user">システム開発部 ▾</div>
      </header>
      <div className="kt-breadcrumb">
        アプリ: 案件管理アプリ &nbsp;›&nbsp; 一覧: 個人試算表 &nbsp;›&nbsp; レコード: {ankenNo}
      </div>

      <main className="kt-main">
        <div className="kt-record-head">
          <div className="kt-field">
            <div className="kt-label">案件No</div>
            <input className="kt-input" value={ankenNo} readOnly />
          </div>
        </div>

        {/* ===== 共通エリア：商品情報 ===== */}
        <section className="kt-group">
          <h2 className="kt-group-title">▾ 商品情報（共通）</h2>
          <div className="kt-grid">
            {productInfoFields.map((def) => (
              <Field
                key={def.key}
                def={def}
                value={productInfo[def.key]}
                onChange={(v) => updateProductInfo(def.key, v)}
              />
            ))}
          </div>
        </section>

        {/* ===== 明細：商品規格情報（1:多） ===== */}
        <section className="kt-group">
          <div className="kt-group-header">
            <h2 className="kt-group-title">▾ 商品規格情報（明細）</h2>
            <span className="kt-count">{specs.length} 件</span>
          </div>

          {specs.map((row, i) => (
            <div className="kt-detail-row" key={i}>
              <div className="kt-detail-row-head">
                <span className="kt-detail-index">規格 #{i + 1}</span>
                <div className="kt-row-actions">
                  <button
                    className="kt-icon-btn kt-add"
                    title="行を追加"
                    onClick={addSpec}
                  >＋</button>
                  <button
                    className="kt-icon-btn kt-remove"
                    title="行を削除"
                    onClick={() => removeSpec(i)}
                    disabled={specs.length === 1}
                  >－</button>
                </div>
              </div>
              <div className="kt-grid">
                {specFields.map((def) => (
                  <Field
                    key={def.key}
                    def={def}
                    value={row[def.key]}
                    onChange={(v) => updateSpec(i, def.key, v)}
                  />
                ))}
              </div>
            </div>
          ))}

          <button className="kt-add-row-btn" onClick={addSpec}>
            ＋ 商品規格を追加
          </button>
        </section>

        {/* ===== 確認用：現在の入力値 (JSON) ===== */}
        <details className="kt-debug">
          <summary>入力値プレビュー（開発確認用）</summary>
          <pre>{JSON.stringify({ ankenNo, productInfo, specs }, null, 2)}</pre>
        </details>
      </main>
    </div>
  )
}
