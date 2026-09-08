import React from 'react'
import Accordion from './Accordion.jsx'
import Field from './Field.jsx'
import {
  postAttrOptions, bestBeforeTypeOptions, priceChannels,
  lotteryFields, surveyFields,
} from './fields.js'

// 掲載履歴（各規格に内包・複製可）
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

  const setF = (k, val) => set({ [k]: val })

  return (
    <div className="ph-body">
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
        <L label="完売想定日"><input className="inp" type="date" value={v.sellOutDate} onChange={(e) => set({ sellOutDate: e.target.value })} /></L>
      </div>

      {/* チャネル別価格（添付画像準拠：チャネル列 × 指標行） */}
      <div className="subhead">価格</div>
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

      {/* チャネル別価格の下：当月出荷見込み数・総売上（税込） */}
      <div className="grid2">
        <L label="本店当月出荷見込み数"><input className="inp" type="number" value={v.shipForecastHonten} onChange={(e) => set({ shipForecastHonten: e.target.value })} /></L>
        <L label="dサンプル当月出荷見込み数"><input className="inp" type="number" value={v.shipForecastDsample} onChange={(e) => set({ shipForecastDsample: e.target.value })} /></L>
        <L label="d払い当月出荷見込み数"><input className="inp" type="number" value={v.shipForecastDpay} onChange={(e) => set({ shipForecastDpay: e.target.value })} /></L>
        <L label="総売上（税込）"><div className="yen-wrap"><span className="yen">¥</span><input className="inp" type="number" value={v.totalSalesInTax} onChange={(e) => set({ totalSalesInTax: e.target.value })} /></div></L>
      </div>

      {/* チャネル別価格の下に抽選・アンケートを配置 */}
      <div className="fgroup">
        <div className="subhead">抽選</div>
        <div className="grid2">
          {lotteryFields.map((f) => (
            <Field key={f.key} field={f} value={v[f.key]} onChange={(k, val) => setF(k, val)} />
          ))}
        </div>
      </div>
      <div className="fgroup">
        <div className="subhead">アンケート</div>
        <div className="grid2">
          {surveyFields.map((f) => (
            <Field key={f.key} field={f} value={v[f.key]} onChange={(k, val) => setF(k, val)} />
          ))}
        </div>
      </div>

      {/* アンケートの下：ショッピング広告掲載・PV出し・過去実績 */}
      <div className="grid2">
        <L label="ショッピング広告掲載">
          <select className="inp" value={v.shoppingAd} onChange={(e) => set({ shoppingAd: e.target.value })}>
            <option value="">選択してください</option>
            {['掲載可','掲載不可','掲載済'].map((o) => <option key={o}>{o}</option>)}
          </select>
        </L>
        <L label="PV出し">
          <select className="inp" value={v.pvNeeded} onChange={(e) => set({ pvNeeded: e.target.value })}>
            <option value="">選択してください</option>
            {['必要','不要'].map((o) => <option key={o}>{o}</option>)}
          </select>
        </L>
        <L label="過去実績/類似商品実績"><input className="inp" value={v.pastResult} onChange={(e) => set({ pastResult: e.target.value })} /></L>
      </div>

      <L label="メモ"><textarea className="inp" rows={2} value={v.memo} onChange={(e) => set({ memo: e.target.value })} /></L>
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
function Chk({ label, on, onChange }) {
  return (
    <label className="chk-inline">
      <input type="checkbox" checked={!!on} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  )
}
