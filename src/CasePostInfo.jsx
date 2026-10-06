import React, { useState } from 'react'
import Field from './Field.jsx'
import {
  postAttrOptions, bestBeforeTypeOptions,
  lotteryFields, surveyFields,
} from './fields.js'
import { lookupPostByCode } from './dummyData.js'

// 案件：掲載履歴（価格以外）
//   PostHistory.jsx（案件（セット商品）タブで使用）から価格関連を除いたもの
//   追加：募集期間（開始・終了）、提供数
// props: value(postHistory object), onChange(nextObject)
export default function CasePostInfo({ value, onChange }) {
  const v = value
  const [msg, setMsg] = useState(null)
  const set = (patch) => onChange({ ...v, ...patch })

  // 掲載履歴コード参照 → 掲載履歴マスタから入力
  const refPost = () => {
    const code = (v.postCode || '').trim()
    if (!code) { setMsg({ t: 'warn', m: '掲載履歴コードを入力してください' }); return }
    const res = lookupPostByCode(code)
    if (!res.found) { setMsg({ t: 'warn', m: `掲載履歴マスタに該当なし（${code}）。ダミー：30000001 / 30000002` }); return }
    const val = res.values
    const nextPrices = { ...v.prices }
    if (val.prices) {
      for (const ch of Object.keys(val.prices)) nextPrices[ch] = { ...nextPrices[ch], ...val.prices[ch] }
    }
    onChange({ ...v, ...val, prices: nextPrices })
    setMsg({ t: 'ok', m: `掲載履歴マスタから連携しました（${code} / ${val.postName || ''}）` })
  }

  const toggleAttr = (opt, on) => {
    const arr = v.postAttr || []
    set({ postAttr: on ? [...arr, opt] : arr.filter((x) => x !== opt) })
  }

  const setF = (k, val) => set({ [k]: val })

  return (
    <div className="ph-body">
      {msg && <div className={'notice ' + msg.t}>{msg.m}</div>}
      <div className="frow">
        <div className="flabel">掲載履歴コード</div>
        <div className="fbody has-right">
          <input className="inp" value={v.postCode || ''} onChange={(e) => set({ postCode: e.target.value })} placeholder="例：30000001" />
          <button type="button" className="btn-ref" onClick={refPost}>参照</button>
          <div className="fnote">掲載履歴マスタから情報を呼び出し（30000001 / 30000002）</div>
        </div>
      </div>
      <div className="grid2">
        <L label="掲載期間（開始）"><input className="inp" type="date" value={v.postPeriodFrom} onChange={(e) => set({ postPeriodFrom: e.target.value })} /></L>
        <L label="掲載期間（終了）"><input className="inp" type="date" value={v.postPeriodTo} onChange={(e) => set({ postPeriodTo: e.target.value })} /></L>
        <L label="募集期間（開始）"><input className="inp" type="date" value={v.recruitPeriodFrom ?? ''} onChange={(e) => set({ recruitPeriodFrom: e.target.value })} /></L>
        <L label="募集期間（終了）"><input className="inp" type="date" value={v.recruitPeriodTo ?? ''} onChange={(e) => set({ recruitPeriodTo: e.target.value })} /></L>
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
        <L label="提供数"><input className="inp" type="number" value={v.provideCount ?? ''} onChange={(e) => set({ provideCount: e.target.value })} /></L>
        <L label="表示提供数"><input className="inp" type="number" value={v.displayProvideCount} onChange={(e) => set({ displayProvideCount: e.target.value })} /></L>
        <L label="完売想定日"><input className="inp" type="date" value={v.sellOutDate} onChange={(e) => set({ sellOutDate: e.target.value })} /></L>
      </div>

      {/* 当月出荷見込み数 */}
      <div className="grid2">
        <L label="本店当月出荷見込み数"><input className="inp" type="number" value={v.shipForecastHonten} onChange={(e) => set({ shipForecastHonten: e.target.value })} /></L>
        <L label="dサンプル当月出荷見込み数"><input className="inp" type="number" value={v.shipForecastDsample} onChange={(e) => set({ shipForecastDsample: e.target.value })} /></L>
        <L label="d払い当月出荷見込み数"><input className="inp" type="number" value={v.shipForecastDpay} onChange={(e) => set({ shipForecastDpay: e.target.value })} /></L>
      </div>

      {/* 抽選・アンケート */}
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

      {/* ショッピング広告掲載・PV出し・過去実績 */}
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
