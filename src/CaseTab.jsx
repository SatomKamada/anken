import React, { useState } from 'react'
import Accordion from './Accordion.jsx'
import ProductInfo from './ProductInfo.jsx'
import SpecCommon from './SpecCommon.jsx'
import SpecList from './SpecList.jsx'
import { RecordHeader } from './RecordHeader.jsx'
import {
  makeEmptyProductInfo, makeEmptyProductAttr, productAttrFields,
  makeEmptySalesForm, salesFormRows, makeEmptySpecCommon, makeEmptySpec,
} from './fields.js'

// 案件ヘッダー番号（自動採番のダミー・連番のみ）
const CASE_NO = '000045'

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
      return rows.map((r, idx) => (idx === 0 ? { ...r, ...seed } : r))
    })
  }

  const setAttrField = (k, val) => setAttr({ ...attr, [k]: val })
  const setSF = (key, patch) => setSalesForm({ ...salesForm, [key]: { ...salesForm[key], ...patch } })

  return (
    <div className="tab-panel">
      {/* 最上部：基本情報番号（1件・自動採番） */}
      <RecordHeader badge="基本情報" label="案件ヘッダー番号" no={CASE_NO} />

      {/* ① 基本情報（商品情報＋商品属性情報＋商品規格設定＋商品規格情報（共通）を統合） */}
      <Accordion title="基本情報" defaultOpen={false}>
        {/* 商品情報 */}
        <ProductInfo value={product} onChange={setProduct} bare />

        {/* 商品属性情報 */}
        <div className="subhead lead">商品属性情報</div>
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

        {/* 商品規格設定 */}
        <div className="subhead lead">商品規格設定</div>
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

        {/* 商品規格情報（共通） */}
        <SpecCommon value={specCommon} onChange={setSpecCommon} onSeedSpec={seedSpec} bare />
      </Accordion>

      {/* ② 明細（商品規格・掲載履歴＝明細、枝番を自動採番） */}
      <SpecList rows={specRows} setRows={setSpecRows} headerNo={CASE_NO} />
    </div>
  )
}
