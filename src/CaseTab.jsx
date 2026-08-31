import React, { useState } from 'react'
import Accordion from './Accordion.jsx'
import ProductInfo from './ProductInfo.jsx'
import SpecCommon from './SpecCommon.jsx'
import SpecList from './SpecList.jsx'
import {
  makeEmptyProductInfo, makeEmptyProductAttr, productAttrFields,
  makeEmptySalesForm, salesFormRows, makeEmptySpecCommon, makeEmptySpec,
} from './fields.js'

export default function CaseTab() {
  const [product, setProduct] = useState(makeEmptyProductInfo)
  const [attr, setAttr] = useState(makeEmptyProductAttr)
  const [salesForm, setSalesForm] = useState(makeEmptySalesForm)
  const [specCommon, setSpecCommon] = useState(makeEmptySpecCommon)
  const [specRows, setSpecRows] = useState(() => [makeEmptySpec()])

  // 共通の参照ボタン押下 → 個別明細（基本）へ仮入力
  const seedSpec = (seed) => {
    setSpecRows((rows) => {
      if (rows.length === 0) {
        const r = makeEmptySpec()
        return [{ ...r, ...seed }]
      }
      // 先頭行へ仮入力（掲載履歴は保持）
      return rows.map((r, idx) => (idx === 0 ? { ...r, ...seed } : r))
    })
  }

  const setAttrField = (k, val) => setAttr({ ...attr, [k]: val })
  const setSF = (key, patch) => setSalesForm({ ...salesForm, [key]: { ...salesForm[key], ...patch } })

  return (
    <div className="tab-panel">
      <ProductInfo value={product} onChange={setProduct} />

      <Accordion title="商品属性情報" defaultOpen={true}>
        <div className="grid2">
          {productAttrFields.map((f) => (
            <div className="frow" key={f.key}>
              <div className="flabel">{f.label}</div>
              <div className="fbody">
                {f.type === 'checkbox' ? (
                  <label className="chk-inline"><input type="checkbox" checked={!!attr[f.key]} onChange={(e) => setAttrField(f.key, e.target.checked)} /><span>{f.boolLabel || 'ON'}</span></label>
                ) : (
                  <input className="inp" value={attr[f.key] ?? ''} onChange={(e) => setAttrField(f.key, e.target.value)} />
                )}
              </div>
            </div>
          ))}
        </div>
      </Accordion>

      <Accordion title="商品規格設定" defaultOpen={true}>
        <table className="ptable">
          <thead><tr><th>販売形態</th><th>利用</th><th>上限数</th></tr></thead>
          <tbody>
            {salesFormRows.map((sf) => (
              <tr key={sf.key}>
                <td className="pch">{sf.label}</td>
                <td className="tc"><input type="checkbox" checked={salesForm[sf.key].enabled} onChange={(e) => setSF(sf.key, { enabled: e.target.checked })} /></td>
                <td><input className="inp" type="number" value={salesForm[sf.key].limit} disabled={!salesForm[sf.key].enabled} onChange={(e) => setSF(sf.key, { limit: e.target.value })} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Accordion>

      <SpecCommon value={specCommon} onChange={setSpecCommon} onSeedSpec={seedSpec} />

      <SpecList rows={specRows} setRows={setSpecRows} />
    </div>
  )
}
