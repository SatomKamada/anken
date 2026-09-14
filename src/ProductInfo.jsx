import React, { useState } from 'react'
import Accordion from './Accordion.jsx'
import {
  makerOptions, medicineTypeOptions, productTempZoneOptions,
} from './fields.js'
import { productMaster, productMasterByJan, jicfsMaster } from './dummyData.js'

// 商品情報（共通）… 添付画像レイアウト準拠 + 商品コード/JAN 参照ボタン
export default function ProductInfo({ value, onChange, defaultOpen = false, bare = false }) {
  const v = value
  const [msg, setMsg] = useState(null)
  const set = (k, val) => onChange({ ...v, [k]: val })

  // 商品コード参照 → 商品マスタ
  const refByProductCode = () => {
    const code = (v.productCode || '').trim()
    if (!code) { setMsg({ t: 'warn', m: '商品コードを入力してください' }); return }
    const p = productMaster[code]
    if (!p) { setMsg({ t: 'warn', m: `商品マスタに該当なし（${code}）。手動入力してください。` }); return }
    onChange({ ...v, ...p })
    setMsg({ t: 'ok', m: `商品マスタから連携しました（${code} / ${p.productName}）` })
  }

  // JAN参照 → 商品マスタ or JICFS
  const refByJan = () => {
    const jan = (v.janCode || '').trim()
    if (!jan) { setMsg({ t: 'warn', m: 'JANコードを入力してください' }); return }
    if (productMasterByJan[jan]) {
      const p = productMaster[productMasterByJan[jan]]
      onChange({ ...v, ...p })
      setMsg({ t: 'ok', m: `商品マスタから連携しました（JAN:${jan} / ${p.productName}）` })
      return
    }
    if (jicfsMaster[jan]) {
      const j = jicfsMaster[jan]
      onChange({
        ...v, janCode: jan,
        jicfsCode: j.jicfsCode, jicfsKanji: j.jicfsKanji, jicfsKana: j.jicfsKana, jicfsAbbr: j.jicfsAbbr,
        itfCode: j.itfCode,
        productName: v.productName || j.productName,
      })
      setMsg({ t: 'info', m: `商品マスタに無いため JICFS から分類情報のみ連携しました（JAN:${jan}）` })
      return
    }
    setMsg({ t: 'warn', m: `商品マスタ・JICFSに該当なし（JAN:${jan}）。手動入力してください。` })
  }

  const copyCode = () => { try { navigator.clipboard?.writeText(v.productCode || '') } catch (e) {} }

  const body = (
    <>
      {msg && <div className={'notice ' + msg.t}>{msg.m}</div>}

      {/* 商品コード（参照ボタンの仕組みは維持）＋ ID */}
      <div className="frow">
        <Label text="商品コード" />
        <div className="fbody has-right">
          <input className="inp inp-code" value={v.productCode} onChange={(e) => set('productCode', e.target.value)} placeholder="例：10000001" />
          <button type="button" className="btn-icon" title="コピー" onClick={copyCode}>⧉</button>
          <button type="button" className="btn-ref" onClick={refByProductCode}>参照</button>
          <div className="fnote">商品マスタから連携</div>
        </div>
      </div>

      {/* JANコード（参照ボタンの仕組みは維持） */}
      <div className="frow">
        <Label text="JANコード" help />
        <div className="fbody has-right">
          <input className="inp" value={v.janCode} onChange={(e) => set('janCode', e.target.value)} placeholder="例：4908013230864" />
          <button type="button" className="btn-ref" onClick={refByJan}>参照</button>
          <div className="fnote">商品マスタ→無ければJICFSから連携</div>
        </div>
      </div>

      <Row label="メーカー">
        <select className="inp" value={v.maker} onChange={(e) => set('maker', e.target.value)}>
          <option value="">メーカーを選択してください</option>
          {makerOptions.map((o) => <option key={o}>{o}</option>)}
        </select>
      </Row>

      <Row label="商品名" required help>
        <input className="inp" value={v.productName} onChange={(e) => set('productName', e.target.value)} />
      </Row>

      <Row label="サブタイトル">
        <input className="inp" value={v.subtitle} onChange={(e) => set('subtitle', e.target.value)} />
      </Row>

      <Row label="キャッチコピー">
        <textarea className="inp" rows={3} value={v.catchCopy} onChange={(e) => set('catchCopy', e.target.value)} />
      </Row>

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

      <div className="subhead">カテゴリ情報</div>
      <div className="grid2">
        <Row label="カテゴリーコード"><input className="inp" value={v.categoryCode} onChange={(e) => set('categoryCode', e.target.value)} placeholder="例：C020401" /></Row>
        <Row label="大カテゴリー"><input className="inp" value={v.categoryL} onChange={(e) => set('categoryL', e.target.value)} /></Row>
        <Row label="中カテゴリー"><input className="inp" value={v.categoryM} onChange={(e) => set('categoryM', e.target.value)} /></Row>
        <Row label="小カテゴリー"><input className="inp" value={v.categoryS} onChange={(e) => set('categoryS', e.target.value)} /></Row>
      </div>
    </>
  )

  if (bare) return (<><div className="subhead lead">商品情報</div>{body}</>)
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
