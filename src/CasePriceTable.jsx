import React from 'react'
import { priceChannels } from './fields.js'

// 案件：価格情報内のチャネル別価格（掲載履歴から移動）＋ 基準原価・総売上（税込）
// props: value(postHistory object), onChange(nextObject)
export default function CasePriceTable({ value, onChange }) {
  const v = value
  const set = (patch) => onChange({ ...v, ...patch })
  const setPrice = (ch, patch) => set({ prices: { ...v.prices, [ch]: { ...v.prices[ch], ...patch } } })

  return (
    <div className="ph-body">
      {/* チャネル別価格（添付画像準拠：チャネル列 × 指標行） */}
      <table className="ptable umatrix-table">
        <thead>
          <tr>
            <th></th>
            {priceChannels.map((ch) => <th key={ch}>{ch}</th>)}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="pch">販売価格<span className="req">必須</span></td>
            {priceChannels.map((ch) => (
              <td key={ch}><div className="yen-wrap"><span className="yen">¥</span><input className="inp" type="number" value={v.prices[ch].salePrice} onChange={(e) => setPrice(ch, { salePrice: e.target.value })} /></div></td>
            ))}
          </tr>
          <tr>
            <td className="pch">単位あたりの価格</td>
            {priceChannels.map((ch) => (
              <td key={ch}><div className="yen-wrap"><span className="yen">¥</span><input className="inp" type="number" value={v.prices[ch].unitPrice} onChange={(e) => setPrice(ch, { unitPrice: e.target.value })} /></div></td>
            ))}
          </tr>
          <tr>
            <td className="pch">OFF率表示フラグ</td>
            {priceChannels.map((ch) => (
              <td key={ch} className="tc"><label className="chk-inline"><input type="checkbox" checked={v.prices[ch].offFlag} onChange={(e) => setPrice(ch, { offFlag: e.target.checked })} /><span>ON</span></label></td>
            ))}
          </tr>
          <tr>
            <td className="pch">OFF率</td>
            {priceChannels.map((ch) => (
              <td key={ch}><div className="pct-wrap"><input className="inp" type="number" value={v.prices[ch].offRate} onChange={(e) => setPrice(ch, { offRate: e.target.value })} /><span className="pct">%OFF</span></div></td>
            ))}
          </tr>
          <tr>
            <td className="pch">基準粗利<span className="req">必須</span></td>
            {priceChannels.map((ch) => (
              <td key={ch}><div className="yen-wrap"><span className="yen">¥</span><input className="inp" type="number" value={v.prices[ch].baseProfit} onChange={(e) => setPrice(ch, { baseProfit: e.target.value })} /></div></td>
            ))}
          </tr>
        </tbody>
      </table>
      <L label="基準原価"><div className="yen-wrap"><span className="yen">¥</span><input className="inp" type="number" value={v.baseCost} onChange={(e) => set({ baseCost: e.target.value })} /></div></L>

      <L label="総売上（税込）"><div className="yen-wrap"><span className="yen">¥</span><input className="inp" type="number" value={v.totalSalesInTax} onChange={(e) => set({ totalSalesInTax: e.target.value })} /></div></L>
    </div>
  )
}

function L({ label, children }) {
  return (
    <div className="frow">
      <div className="flabel">{label}</div>
      <div className="fbody">{children}</div>
    </div>
  )
}
