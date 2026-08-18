import { useState } from 'react'
import {
  productInfoFields,
  salesFormRows,
  specGroups,
  makeEmptySpec,
  makeEmptyProductInfo,
  makeEmptySalesForm,
} from './fields.js'

// ---- 開閉できるセクション（アコーディオン）------------------------
function Accordion({ title, extra, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section className="kt-group">
      <div className="kt-accordion-header" onClick={() => setOpen((o) => !o)}>
        <h2 className="kt-group-title">
          <span className="kt-caret">{open ? '▾' : '▸'}</span> {title}
        </h2>
        {extra && <div onClick={(e) => e.stopPropagation()}>{extra}</div>}
      </div>
      {open && <div className="kt-group-body">{children}</div>}
    </section>
  )
}

// ---- 明細内のサブ分類（軽量アコーディオン）------------------------
function SubAccordion({ title, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="kt-subgroup">
      <div className="kt-subgroup-header" onClick={() => setOpen((o) => !o)}>
        <span className="kt-caret">{open ? '▾' : '▸'}</span> {title}
      </div>
      {open && <div className="kt-subgroup-body">{children}</div>}
    </div>
  )
}

// ---- 汎用フィールド描画 ------------------------------------------
function Field({ def, value, onChange }) {
  const { label, type, options, required, readOnly, note } = def

  let control
  switch (type) {
    case 'checkbox':
      control = (
        <label className="kt-checkbox">
          <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
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
        <select className="kt-input" value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">選択してください</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )
      break

    case 'number':
      control = (
        <input className="kt-input" type="number" value={value} readOnly={readOnly}
          onChange={(e) => onChange(e.target.value)} />
      )
      break

    case 'datetime':
      control = (
        <input className="kt-input" type="datetime-local" value={value}
          onChange={(e) => onChange(e.target.value)} />
      )
      break

    default: // text
      control = (
        <input className="kt-input" type="text" value={value} readOnly={readOnly}
          onChange={(e) => onChange(e.target.value)} />
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
  const [salesForm, setSalesForm] = useState(makeEmptySalesForm()) // 商品規格設定
  const [specs, setSpecs] = useState([makeEmptySpec()])            // 商品規格情報（1:多）

  const updateProductInfo = (key, val) => setProductInfo((p) => ({ ...p, [key]: val }))

  const updateSalesForm = (key, patch) =>
    setSalesForm((s) => ({ ...s, [key]: { ...s[key], ...patch } }))

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
        <Accordion title="商品情報（共通）">
          <div className="kt-grid">
            {productInfoFields.map((def) => (
              <Field key={def.key} def={def} value={productInfo[def.key]}
                onChange={(v) => updateProductInfo(def.key, v)} />
            ))}
          </div>
        </Accordion>

        {/* ===== 商品規格設定：販売形態 ON/OFF ＋上限数 ===== */}
        <Accordion title="商品規格設定">
          <p className="kt-desc">
            販売形態ごとに起票せず、1つの商品発注を起点に販売したい商品規格をON/OFFしてECへ発信します。
            販売したい販売形態のみONにし、必要なものだけ上限数を指定します。
          </p>
          <table className="kt-form-table">
            <thead>
              <tr>
                <th style={{ width: '40%' }}>販売形態</th>
                <th style={{ width: '30%' }}>ON/OFF</th>
                <th style={{ width: '30%' }}>上限数</th>
              </tr>
            </thead>
            <tbody>
              {salesFormRows.map((sf) => {
                const cur = salesForm[sf.key]
                return (
                  <tr key={sf.key}>
                    <td className="kt-form-name">{sf.label}</td>
                    <td>
                      <label className="kt-toggle">
                        <input
                          type="checkbox"
                          checked={cur.enabled}
                          onChange={(e) => updateSalesForm(sf.key, { enabled: e.target.checked })}
                        />
                        <span className={cur.enabled ? 'kt-toggle-on' : 'kt-toggle-off'}>
                          {cur.enabled ? 'ON' : 'OFF'}
                        </span>
                      </label>
                    </td>
                    <td>
                      <input
                        className="kt-input kt-limit"
                        type="number"
                        placeholder="－"
                        value={cur.limit}
                        disabled={!cur.enabled}
                        onChange={(e) => updateSalesForm(sf.key, { limit: e.target.value })}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Accordion>

        {/* ===== 明細：商品規格情報（1:多） ===== */}
        <Accordion title="商品規格情報" extra={<span className="kt-count">{specs.length} 件</span>}>
          {specs.map((row, i) => (
            <div className="kt-detail-row" key={i}>
              <div className="kt-detail-row-head">
                <span className="kt-detail-index">規格 #{i + 1}</span>
                <div className="kt-row-actions">
                  <button className="kt-icon-btn kt-add" title="行を追加" onClick={addSpec}>＋</button>
                  <button className="kt-icon-btn kt-remove" title="行を削除"
                    onClick={() => removeSpec(i)} disabled={specs.length === 1}>－</button>
                </div>
              </div>

              {specGroups.map((group) => (
                <SubAccordion key={group.title} title={group.title}>
                  <div className="kt-grid">
                    {group.fields.map((def) => (
                      <Field key={def.key} def={def} value={row[def.key]}
                        onChange={(v) => updateSpec(i, def.key, v)} />
                    ))}
                  </div>
                </SubAccordion>
              ))}
            </div>
          ))}

          <button className="kt-add-row-btn" onClick={addSpec}>＋ 商品規格を追加</button>
        </Accordion>

        {/* ===== 確認用：現在の入力値 (JSON) ===== */}
        <details className="kt-debug">
          <summary>入力値プレビュー（開発確認用）</summary>
          <pre>{JSON.stringify({ ankenNo, productInfo, salesForm, specs }, null, 2)}</pre>
        </details>
      </main>
    </div>
  )
}
