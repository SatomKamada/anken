import { useState } from 'react'
import Field from './Field.jsx'
import ProductInfo from './ProductInfo.jsx'
import SpecCommon from './SpecCommon.jsx'
import PostHistory from './PostHistory.jsx'
import {
  salesFormRows,
  specGroups,
  productAttrFields,
  makeEmptySpec,
  makeEmptyProductInfo,
  makeEmptyProductAttr,
  makeEmptySalesForm,
  makeEmptySpecCommon,
} from './fields.js'

const basicGroup   = specGroups.find((g) => g.title === '基本')
const lotteryGroup = specGroups.find((g) => g.title === '抽選')
const surveyGroup  = specGroups.find((g) => g.title === 'アンケート')

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

// 掲載履歴内の項目群（Row形式）
function FieldRows({ fields, row, onChange }) {
  return (
    <div className="kt-ph">
      {fields.map((def) => (
        <Field key={def.key} def={def} layout="row" value={row[def.key]}
          onChange={(v) => onChange(def.key, v)} />
      ))}
    </div>
  )
}

// ---- アプリ本体 --------------------------------------------------
export default function App() {
  const [ankenNo] = useState('000000000153971')
  const [productInfo, setProductInfo] = useState(makeEmptyProductInfo())
  const [productAttr, setProductAttr] = useState(makeEmptyProductAttr())
  const [salesForm, setSalesForm] = useState(makeEmptySalesForm())
  const [specCommon, setSpecCommon] = useState(makeEmptySpecCommon())
  const [specs, setSpecs] = useState([makeEmptySpec()])

  const updateProductInfo = (key, val) => setProductInfo((p) => ({ ...p, [key]: val }))
  const updateProductAttr = (key, val) => setProductAttr((p) => ({ ...p, [key]: val }))
  const updateSalesForm = (key, patch) => setSalesForm((s) => ({ ...s, [key]: { ...s[key], ...patch } }))
  const updateSpecCommon = (key, val) => setSpecCommon((p) => ({ ...p, [key]: val }))
  const updateSpec = (index, key, val) =>
    setSpecs((rows) => rows.map((r, i) => (i === index ? { ...r, [key]: val } : r)))
  const updateSpecPostHistory = (index, key, val) =>
    setSpecs((rows) => rows.map((r, i) => (i === index ? { ...r, postHistory: { ...r.postHistory, [key]: val } } : r)))
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

        {/* ===== 商品情報 ===== */}
        <Accordion title="商品情報">
          <ProductInfo data={productInfo} onChange={updateProductInfo} />
        </Accordion>

        {/* ===== 商品属性情報 ===== */}
        <Accordion title="商品属性情報">
          <FieldRows fields={productAttrFields} row={productAttr} onChange={updateProductAttr} />
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

        {/* ===== 商品規格情報（共通） ===== */}
        <Accordion title="商品規格情報（共通）">
          <SpecCommon data={specCommon} onChange={updateSpecCommon} />
        </Accordion>

        {/* ===== 商品規格・掲載履歴（個別）※1:多 ===== */}
        <Accordion title="商品規格・掲載履歴（個別）" extra={<span className="kt-count">{specs.length} 件</span>}>
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

              {/* 先頭：商品規格コード */}
              <div className="kt-ph">
                <Field def={{ label: '商品規格コード', type: 'text' }} layout="row"
                  value={row.specCode} onChange={(v) => updateSpec(i, 'specCode', v)} />
              </div>

              {/* 基本 */}
              <SubAccordion title="基本">
                <FieldRows fields={basicGroup.fields} row={row}
                  onChange={(key, val) => updateSpec(i, key, val)} />
              </SubAccordion>

              {/* 掲載履歴（抽選・アンケートを内包） */}
              <SubAccordion title="掲載履歴">
                <PostHistory data={row.postHistory}
                  onChange={(key, val) => updateSpecPostHistory(i, key, val)} />

                <div className="kt-ph-subheading">抽選</div>
                <FieldRows fields={lotteryGroup.fields} row={row}
                  onChange={(key, val) => updateSpec(i, key, val)} />

                <div className="kt-ph-subheading">アンケート</div>
                <FieldRows fields={surveyGroup.fields} row={row}
                  onChange={(key, val) => updateSpec(i, key, val)} />
              </SubAccordion>
            </div>
          ))}

          <button className="kt-add-row-btn" onClick={addSpec}>＋ 商品規格を追加</button>
        </Accordion>

        {/* ===== 確認用：現在の入力値 (JSON) ===== */}
        <details className="kt-debug">
          <summary>入力値プレビュー（開発確認用）</summary>
          <pre>{JSON.stringify({ ankenNo, productInfo, productAttr, salesForm, specCommon, specs }, null, 2)}</pre>
        </details>
      </main>
    </div>
  )
}
