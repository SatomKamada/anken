import React from 'react'
import { attrOptionsForJan } from './orderFields.js'

// 商品属性情報コードのプルダウン（JAN未入力時は選択不可）
export default function AttrSelect({ jan, value, onChange }) {
  const opts = attrOptionsForJan(jan)
  const list = value && !opts.some((o) => o.code === value) ? [{ code: value, note: '（現在の値）' }, ...opts] : opts
  return (
    <select className="cell-inp" value={value || ''} disabled={list.length === 0} onChange={(e) => onChange(e.target.value)}>
      <option value="">{list.length === 0 ? 'JANを入力してください' : ''}</option>
      {list.map((o) => <option key={o.code} value={o.code}>{o.code}：{o.note}</option>)}
    </select>
  )
}
