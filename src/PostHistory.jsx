import React from 'react'
import Accordion from './Accordion.jsx'
import {
  postAttrOptions, bestBeforeTypeOptions, tagOptions, priceChannels,
} from './fields.js'

// 掲載履歴（各規格に内包）
// props: value(postHistory object), onChange(nextObject)
export default function PostHistory({ value, onChange }) {
  const v = value
  const set = (patch) => onChange({ ...v, ...patch })

  const toggleAttr = (opt, on) => {
    const arr = v.postAttr || []
    set({ postAttr: on ? [...arr, opt] : arr.filter((x) => x !== opt) })
  }

  const setPrice = (ch, patch) => {
    set({ prices: { ...v.prices, [ch]: { ...v.prices[ch], ...patch } } })
  }

  const setTag = (i, patch) => {
    const tags = v.tags.map((t, idx) => (idx === i ? { ...t, ...patch } : t))
    set({ tags })
  }
  const addTag = () => set({ tags: [...v.tags, { tag: '', from: '', to: '' }] })
  const delTag = (i) => set({ tags: v.tags.filter((_, idx) => idx !== i) })

  return (
    <Accordion title="掲載履歴" level="sub" defaultOpen={false}>
      <div className="grid2">
        <L label="掲載期間（開始）"><input className="inp" type="date" value={v.postPeriodFrom} onChange={(e) => set({ postPeriodFrom: e.target.value })} /></L>
        <L label="掲載期間（終了）"><input className="inp" type="date" value={v.postPeriodTo} onChange={(e) => set({ postPeriodTo: e.target.value })} /></L>
        <L label="販売期間（開始）"><input className="inp" type="date" value={v.salePeriodFrom} onChange={(e) => set({ salePeriodFrom: e.target.value })} /></L>
        <L label="販売期間（終了）"><input className="inp" type="date" value={v.salePeriodTo} onChange={(e) => set({ salePeriodTo: e.target.value })} /></L>
      </div>

      <L label="各種フラグ">
        <div className="chk-grid">
          <Chk label="プレミアム" on={v.premiumFlag} onChange={(c) => set({ premiumFlag: c })} />
          <Chk label="先着限定" on={v.firstLimitFlag} onChange={(c) => set({ firstLimitFlag: c })} />
          <Chk label="タイムセール" on={v.timeSaleFlag} onChange={(c) => set({ timeSaleFlag: c })} />
          <Chk label="予約" on={v.reserveFlag} onChange={(c) => set({ reserveFlag: c })} />
          <Chk label="告知制限" on={v.noticeLimitFlag} onChange={(c) => set({ noticeLimitFlag: c })} />
        </div>
      </L>

      <L label="掲載属性">
        <div className="chk-grid">
          {postAttrOptions.map((o) => (
            <Chk key={o} label={o} on={(v.postAttr || []).includes(o)} onChange={(c) => toggleAttr(o, c)} />
          ))}
        </div>
      </L>

      <div className="grid2">
        <L label="掲載名"><input className="inp" value={v.postName} onChange={(e) => set({ postName: e.target.value })} /></L>
        <L label="キャッチコピー"><input className="inp" value={v.catchCopy} onChange={(e) => set({ catchCopy: e.target.value })} /></L>
        <L label="サブタイトル1"><input className="inp" value={v.subtitle1} onChange={(e) => set({ subtitle1: e.target.value })} /></L>
        <L label="サブタイトル2"><input className="inp" value={v.subtitle2} onChange={(e) => set({ subtitle2: e.target.value })} /></L>
      </div>

      <div className="grid2">
        <L label="期限種別">
          <select className="inp" value={v.bestBeforeType} onChange={(e) => set({ bestBeforeType: e.target.value })}>
            {bestBeforeTypeOptions.map((o) => <option key={o}>{o}</option>)}
          </select>
        </L>
        <L label="期限日"><input className="inp" type="date" value={v.bestBeforeDate} onChange={(e) => set({ bestBeforeDate: e.target.value })} /></L>
        <L label="表示提供数"><input className="inp" type="number" value={v.displayProvideCount} onChange={(e) => set({ displayProvideCount: e.target.value })} /></L>
        <L label="EC在庫"><input className="inp" type="number" value={v.ecStock} onChange={(e) => set({ ecStock: e.target.value })} /></L>
      </div>

      {/* チャネル別価格 */}
      <div className="subhead">チャネル別価格</div>
      <table className="ptable">
        <thead>
          <tr><th>チャネル</th><th>販売価格</th><th>OFF</th><th>基準粗利</th></tr>
        </thead>
        <tbody>
          {priceChannels.map((ch) => (
            <tr key={ch}>
              <td className="pch">{ch}</td>
              <td><input className="inp" type="number" value={v.prices[ch].salePrice} onChange={(e) => setPrice(ch, { salePrice: e.target.value })} /></td>
              <td className="tc"><input type="checkbox" checked={v.prices[ch].offFlag} onChange={(e) => setPrice(ch, { offFlag: e.target.checked })} /></td>
              <td><input className="inp" type="number" value={v.prices[ch].baseProfit} onChange={(e) => setPrice(ch, { baseProfit: e.target.value })} /></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* タグ */}
      <div className="subhead">
        タグ
        <button type="button" className="btn-mini" onClick={addTag}>＋ 追加</button>
      </div>
      {v.tags.map((t, i) => (
        <div className="tagrow" key={i}>
          <select className="inp" value={t.tag} onChange={(e) => setTag(i, { tag: e.target.value })}>
            <option value=""></option>
            {tagOptions.map((o) => <option key={o}>{o}</option>)}
          </select>
          <input className="inp" type="date" value={t.from} onChange={(e) => setTag(i, { from: e.target.value })} />
          <input className="inp" type="date" value={t.to} onChange={(e) => setTag(i, { to: e.target.value })} />
          <button type="button" className="btn-del" onClick={() => delTag(i)} disabled={v.tags.length <= 1}>削除</button>
        </div>
      ))}

      <div className="grid2">
        <L label="重み1"><input className="inp" type="number" value={v.weight1} onChange={(e) => set({ weight1: e.target.value })} /></L>
        <L label="重み2"><input className="inp" type="number" value={v.weight2} onChange={(e) => set({ weight2: e.target.value })} /></L>
      </div>
      <L label="メモ"><textarea className="inp" rows={2} value={v.memo} onChange={(e) => set({ memo: e.target.value })} /></L>
    </Accordion>
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
function Chk({ label, on, onChange }) {
  return (
    <label className="chk-inline">
      <input type="checkbox" checked={!!on} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  )
}
