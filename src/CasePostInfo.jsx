import React from 'react'
import Field from './Field.jsx'
import { surveyFields } from './fields.js'

// 案件：掲載履歴（価格以外）
//   PostHistory.jsx（案件（セット商品）タブで使用）から価格関連を除いたもの
//   追加：募集期間（開始・終了）、提供数
//   削除：掲載履歴コード、販売期間、各種フラグ、掲載属性、掲載名・キャッチコピー・サブタイトル、
//         期限種別・期限日・表示提供数、抽選（抽選人数・抽選合計・当選確定日時・抽選対象範囲区分）
// props: value(postHistory object), onChange(nextObject)
export default function CasePostInfo({ value, onChange }) {
  const v = value
  const set = (patch) => onChange({ ...v, ...patch })

  const setF = (k, val) => set({ [k]: val })

  return (
    <div className="ph-body">
      <div className="grid2">
        <L label="掲載期間（開始）"><input className="inp" type="date" value={v.postPeriodFrom} onChange={(e) => set({ postPeriodFrom: e.target.value })} /></L>
        <L label="掲載期間（終了）"><input className="inp" type="date" value={v.postPeriodTo} onChange={(e) => set({ postPeriodTo: e.target.value })} /></L>
        <L label="募集期間（開始）"><input className="inp" type="date" value={v.recruitPeriodFrom ?? ''} onChange={(e) => set({ recruitPeriodFrom: e.target.value })} /></L>
        <L label="募集期間（終了）"><input className="inp" type="date" value={v.recruitPeriodTo ?? ''} onChange={(e) => set({ recruitPeriodTo: e.target.value })} /></L>
      </div>

      <div className="grid2">
        <L label="提供数"><input className="inp" type="number" value={v.provideCount ?? ''} onChange={(e) => set({ provideCount: e.target.value })} /></L>
        <L label="完売想定日"><input className="inp" type="date" value={v.sellOutDate} onChange={(e) => set({ sellOutDate: e.target.value })} /></L>
      </div>

      {/* 当月出荷見込み数 */}
      <div className="grid2">
        <L label="本店当月出荷見込み数"><input className="inp" type="number" value={v.shipForecastHonten} onChange={(e) => set({ shipForecastHonten: e.target.value })} /></L>
        <L label="dサンプル当月出荷見込み数"><input className="inp" type="number" value={v.shipForecastDsample} onChange={(e) => set({ shipForecastDsample: e.target.value })} /></L>
        <L label="d払い当月出荷見込み数"><input className="inp" type="number" value={v.shipForecastDpay} onChange={(e) => set({ shipForecastDpay: e.target.value })} /></L>
      </div>

      {/* アンケート */}
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
