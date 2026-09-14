import React, { useState } from 'react'
import Accordion from './Accordion.jsx'
import {
  tempZoneOptions,
  deliveryMethodOptions, deliveryExcludeOptions, deliveryFeeTypeOptions,

} from './fields.js'
import { specMaster, lookupCompanySpec } from './dummyData.js'

// 商品規格情報（共通）+ 商品規格コード / 企業コード 参照ボタン
// props: value, onChange, onSeedSpec, defaultOpen, bare, setMode(セット商品：一部非活性)
export default function SpecCommon({ value, onChange, onSeedSpec, defaultOpen = false, bare = false, setMode = false }) {
  const v = value
  const [msg, setMsg] = useState(null)
  const set = (k, val) => onChange({ ...v, [k]: val })

  const refBySpecCode = () => {
    const code = (v.specCode || '').trim()
    if (!code) { setMsg({ t: 'warn', m: '商品規格コードを入力してください' }); return }
    const m = specMaster[code]
    if (!m) { setMsg({ t: 'warn', m: `商品規格マスタに該当なし（${code}）` }); return }
    onChange({ ...v, ...m.common })
    if (onSeedSpec) onSeedSpec(m.seedSpec)
    setMsg({ t: 'ok', m: `商品規格マスタから連携しました（${code}）。個別明細の商品規格欄にも仮入力しました。` })
  }

  // 企業コード参照 → 業態区分・ちょっプル種別・営業担当を自動入力
  const refByCompanyCode = () => {
    const code = (v.companyCode || '').trim()
    if (!code) { setMsg({ t: 'warn', m: '企業コードを入力してください' }); return }
    const res = lookupCompanySpec(code)
    if (!res.found) { setMsg({ t: 'warn', m: `企業マスタに該当なし（${code}）。ダミー：001 / 002 / 003` }); return }
    onChange({ ...v, businessType: res.values.businessType, choppleType: res.values.choppleType, salesRep: res.values.salesRep })
    setMsg({ t: 'ok', m: `企業マスタから連携しました（${code} / ${res.values.companyName}）。業態区分・ちょっプル種別・営業担当を自動入力しました。` })
  }

  const body = (
    <>
      {msg && <div className={'notice ' + msg.t}>{msg.m}</div>}

      <div className="frow">
        <div className="flabel">商品規格コード</div>
        <div className="fbody has-right">
          <input className="inp inp-code" value={v.specCode} onChange={(e) => set('specCode', e.target.value)} placeholder="例：20000001" />
          <button type="button" className="btn-ref" onClick={refBySpecCode}>参照</button>
        </div>
      </div>

      <div className="frow">
        <div className="flabel">企業コード</div>
        <div className="fbody has-right">
          <input className="inp inp-code" value={v.companyCode} onChange={(e) => set('companyCode', e.target.value)} placeholder="例：001" />
          <button type="button" className="btn-ref" onClick={refByCompanyCode}>参照</button>
          <div className="fnote">参照で 業態区分・ちょっプル種別・営業担当 を自動入力（001 / 002 / 003）</div>
        </div>
      </div>

      <div className="grid2">
        <Disp label="業態区分" val={v.businessType} />
        <Disp label="ちょっプル種別" val={v.choppleType} />
        <Disp label="営業担当" val={v.salesRep} />
        <Sel label="温度帯" val={v.tempZone} opts={tempZoneOptions} onChange={(x) => set('tempZone', x)}
          disabled={setMode} note={setMode ? 'セット商品の場合は入力不要' : undefined} />
        <Sel label="配送方法" val={v.deliveryMethod} opts={deliveryMethodOptions} onChange={(x) => set('deliveryMethod', x)} />
        <Sel label="配送除外エリア" val={v.deliveryExcludeArea} opts={deliveryExcludeOptions} onChange={(x) => set('deliveryExcludeArea', x)} />
        <Sel label="配送料種別" val={v.deliveryFeeType} opts={deliveryFeeTypeOptions} onChange={(x) => set('deliveryFeeType', x)} />
      </div>

      <div className="subhead">各種フラグ</div>
      <div className="chk-grid">
        <Chk label="ドライアイス" on={v.dryIce} onChange={(c) => set('dryIce', c)} disabled={setMode} />
        <Chk label="会員限定" on={v.memberOnlyFlag} onChange={(c) => set('memberOnlyFlag', c)} />
        <Chk label="前売り券" on={v.advTicketFlag} onChange={(c) => set('advTicketFlag', c)} />
        <Chk label="検索非表示" on={v.noSearchFlag} onChange={(c) => set('noSearchFlag', c)} />
        <Chk label="自動抽選" on={v.autoLotteryFlag} onChange={(c) => set('autoLotteryFlag', c)} />
        <Chk label="通知" on={v.notifyFlag} onChange={(c) => set('notifyFlag', c)} />
      </div>
      {setMode && <div className="fnote">※ ドライアイスフラグはセット商品の場合は入力不要です</div>}
    </>
  )

  if (bare) return (<><div className="subhead lead">商品規格情報（共通）</div>{body}</>)
  return <Accordion title="商品規格情報（共通）" defaultOpen={defaultOpen}>{body}</Accordion>
}

function Disp({ label, val }) {
  return (
    <div className="frow"><div className="flabel">{label}</div>
      <div className="fbody"><input className="inp" value={val ?? ''} readOnly placeholder="表示のみ・入力不要（企業コード参照で自動）" title="表示のみ（入力不要）" /></div>
    </div>
  )
}
function Txt({ label, val, onChange, type = 'text' }) {
  return (
    <div className="frow"><div className="flabel">{label}</div>
      <div className="fbody"><input className="inp" type={type} value={val ?? ''} onChange={(e) => onChange(e.target.value)} /></div>
    </div>
  )
}
function Sel({ label, val, opts, onChange, disabled, note }) {
  return (
    <div className="frow"><div className="flabel">{label}</div>
      <div className="fbody">
        <select className="inp" value={val ?? ''} disabled={disabled} onChange={(e) => onChange(e.target.value)}>
          <option value=""></option>
          {opts.map((o) => <option key={o}>{o}</option>)}
        </select>
        {note && <div className="fnote">{note}</div>}
      </div>
    </div>
  )
}
function Chk({ label, on, onChange, disabled }) {
  return (
    <label className={'chk-inline' + (disabled ? ' dis' : '')}><input type="checkbox" disabled={disabled} checked={!!on} onChange={(e) => onChange(e.target.checked)} /><span>{label}</span></label>
  )
}
