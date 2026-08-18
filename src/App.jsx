import { useState } from 'react'
import Field from './Field.jsx'
import PostHistory from './PostHistory.jsx'
import {
  productInfoFields,
  salesFormRows,
  specGroups,
  makeEmptySpec,
  makeEmptyProductInfo,
  makeEmptySalesForm,
  makeEmptyPostHistory,
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

// ---- アプリ本体 --------------------------------------------------
export default function App() {
  const [ankenNo] = useState('000000000153971')
  const [productInfo, setProductInfo] = useState(makeEmptyProductInfo())
  const [salesForm, setSalesForm] = useState(makeEmptySalesForm())
  const [specs, setSpecs] = useState([makeEmptySpec()])
  const [postHistory, setPostHistory] = useState(makeEmptyPostHistory())

  const updateProductInfo = (key, val) => setProductInfo((p) => ({ ...p, [key]: val }))
  const updateSalesForm = (key, patch) => setSalesForm((s) => ({ ...s, [key]: { ...s[key], ...patch } }))
  const updateSpec = (index, key, val) =>
    setSpecs((rows) => rows.map((r, i) => (i === index ? { ...r, [key]: val } : r)))
  const addSpec = () => setSpecs((rows) => [...rows, makeEmptySpec()])
  const removeSpec = (index) =>
    setSpecs((rows) => (rows.length === 1 ? rows : rows.filter((_, i) => i !== index)))
  const updatePostHistory = (key, val) => setPostHistory((p) => ({ ...p, [key]: val }))

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

        {/* ===== 商品情報（共通） ===== */}
        <Accordion title="商品情報（共通）">
          <div className="kt-grid">
            {productInfoFields.map((def) => (
              <Field key={def.key} def={def} value={productInfo[def.key]}
                onChange={(v) => updateProductInfo(def.key, v)} />
            ))}
          </div>
        </Accordion>

        {/* ===== 商品規格設定 ===== */}
        <Accordion title="商品規格設定">
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
                        <input type="checkbox" checked={cur.enabled}
                          onChange={(e) => updateSalesForm(sf.key, { enabled: e.target.checked })} />
                        <span className={cur.enabled ? 'kt-toggle-on' : 'kt-toggle-off'}>
                          {cur.enabled ? 'ON' : 'OFF'}
                        </span>
                      </label>
                    </td>
                    <td>
                      <input className="kt-input kt-limit" type="number" placeholder="－"
                        value={cur.limit} disabled={!cur.enabled}
                        onChange={(e) => updateSalesForm(sf.key, { limit: e.target.value })} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Accordion>

        {/* ===== 商品規格情報（1:多） ===== */}
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

        {/* ===== 掲載履歴情報（一番下） ===== */}
        <Accordion title="掲載履歴情報">
          <PostHistory data={postHistory} onChange={updatePostHistory} />
        </Accordion>

        {/* ===== 確認用：現在の入力値 (JSON) ===== */}
        <details className="kt-debug">
          <summary>入力値プレビュー（開発確認用）</summary>
          <pre>{JSON.stringify({ ankenNo, productInfo, salesForm, specs, postHistory }, null, 2)}</pre>
        </details>
      </main>
    </div>
  )
}
