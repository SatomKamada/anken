import React, { useState } from 'react'
import Accordion from './Accordion.jsx'
import {
  medicineTypeOptions, productTempZoneOptions,
} from './fields.js'

// 商品情報（共通）… 添付画像レイアウト準拠（商品コード・サブタイトル・キャッチコピーは削除）
export default function ProductInfo({ value, onChange, defaultOpen = false, bare = false }) {
  const v = value
  const [msg, setMsg] = useState(null)
  const set = (k, val) => onChange({ ...v, [k]: val })

  const body = (
    <>
      {msg && <div className={'notice ' + msg.t}>{msg.m}</div>}

      {/* JANコード（入力のみ） */}
      <div className="frow">
        <Label text="JANコード" />
        <div className="fbody has-right">
          <input className="inp inp-code" value={v.janCode} onChange={(e) => set('janCode', e.target.value)} placeholder="例：4908013230864" />
        </div>
      </div>

      {/* カテゴリ（大・中・小／参照で自動・表示のみ） */}
      <div className="grid2">
        <Row label="大カテゴリー"><input className="inp" value={v.categoryL} readOnly /></Row>
        <Row label="中カテゴリー"><input className="inp" value={v.categoryM} readOnly /></Row>
        <Row label="小カテゴリー"><input className="inp" value={v.categoryS} readOnly /></Row>
      </div>

      <Row label="メーカー">
        <input className="inp" value={v.maker} readOnly />
      </Row>

      <Row label="商品名">
        <input className="inp" value={v.productName} readOnly />
      </Row>
      <div className="fnote">
        ※ カテゴリ（大・中・小）・メーカー・商品名はkintone上の項目です。AMPに連携する際、新規商品の場合は自動作成し、商品マスタに既にある商品は商品マスタから取得します。
      </div>

      {/* 医薬品：ON + 区分ラジオ（未ONはグレー） */}
      <div className="frow">
        <Label text="医薬品" />
        <div className="fbody">
          <label className="chk-inline"><input type="checkbox" checked={v.medicineOn} onChange={(e) => set('medicineOn', e.target.checked)} /><span>ON</span></label>
          <RadioRow name="medicineType" options={medicineTypeOptions} value={v.medicineType} disabled={!v.medicineOn} onChange={(o) => set('medicineType', o)} />
        </div>
      </div>

      <Row label="商品温度帯" help>
        <RadioRow name="tempZone" options={productTempZoneOptions} value={v.tempZone} onChange={(o) => set('tempZone', o)} />
      </Row>

      <Row label="ドライアイス設定" help>
        <label className="chk-inline"><input type="checkbox" checked={v.dryIce} onChange={(e) => set('dryIce', e.target.checked)} /><span>ON</span></label>
      </Row>
    </>
  )

  if (bare) return (<><div className="subhead">商品情報</div>{body}</>)
  return <Accordion title="商品情報（ヘッダー）" defaultOpen={defaultOpen}>{body}</Accordion>
}

// --- 小物 -----------------------------------------------------
function Help() { return <span className="help" title="ヘルプ">?</span> }
function Label({ text, required, help }) {
  return (
    <div className="flabel">
      {text}
      {required && <span className="req">必須</span>}
      {help && <Help />}
    </div>
  )
}
function Row({ label, required, help, children }) {
  return (
    <div className="frow">
      <Label text={label} required={required} help={help} />
      <div className="fbody">{children}</div>
    </div>
  )
}
function RadioRow({ name, options, value, onChange, disabled }) {
  return (
    <div className="radio-row">
      {options.map((o) => (
        <label key={o} className={'radio-inline' + (disabled ? ' dis' : '')}>
          <input type="radio" name={name} disabled={disabled} checked={value === o} onChange={() => onChange(o)} />
          <span>{o}</span>
        </label>
      ))}
    </div>
  )
}
