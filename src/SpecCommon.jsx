import React, { useState } from 'react'
import Accordion from './Accordion.jsx'
import {
  salesRepOptions, companyCodeOptions, tempZoneOptions, noticeInfoOptions,
  deliveryMethodOptions, deliveryExcludeOptions, shippingLeadOptions, cautionPresetOptions,
} from './fields.js'
import { specMaster } from './dummyData.js'

// 商品規格情報（共通）+ 商品規格コード 参照ボタン
// props: value, onChange(nextObj), onSeedSpec(seedSpecObj)
export default function SpecCommon({ value, onChange, onSeedSpec, defaultOpen = false, bare = false }) {
  const v = value
  const [msg, setMsg] = useState(null)
  const set = (k, val) => onChange({ ...v, [k]: val })

  const refBySpecCode = () => {
    const code = (v.specCode || '').trim()
    if (!code) { setMsg({ t: 'warn', m: '商品規格コードを入力してください' }); return }
    const m = specMaster[code]
    if (!m) { setMsg({ t: 'warn', m: `商品規格マスタに該当なし（${code}）` }); return }
    // 共通へ流し込み
    onChange({ ...v, ...m.common })
    // 個別明細（基本）へ仮入力
    if (onSeedSpec) onSeedSpec(m.seedSpec)
    setMsg({ t: 'ok', m: `商品規格マスタから連携しました（${code}）。個別明細の商品規格欄にも仮入力しました。` })
  }

  const body = (
    <>
      {msg && <div className={'notice ' + msg.t}>{msg.m}</div>}

      <div className="frow">
        <div className="flabel">商品規格コード</div>
        <div className="fbody has-right">
          <input className="inp" value={v.specCode} onChange={(e) => set('specCode', e.target.value)} placeholder="例：20000001" />
          <button type="button" className="btn-ref" onClick={refBySpecCode}>参照</button>
          <div className="fnote">商品規格マスタから連携（20000001 / 20000002）</div>
        </div>
      </div>

      <div className="grid2">
        <Sel label="営業担当" val={v.salesRep} opts={salesRepOptions} onChange={(x) => set('salesRep', x)} />
        <Sel label="企業コード" val={v.companyCode} opts={companyCodeOptions} onChange={(x) => set('companyCode', x)} />
        <Txt label="自社品番" val={v.ownItemNo} onChange={(x) => set('ownItemNo', x)} />
        <Sel label="温度帯" val={v.tempZone} opts={tempZoneOptions} onChange={(x) => set('tempZone', x)} />
        <Sel label="告知情報" val={v.noticeInfo} opts={noticeInfoOptions} onChange={(x) => set('noticeInfo', x)} />
        <Sel label="配送方法" val={v.deliveryMethod} opts={deliveryMethodOptions} onChange={(x) => set('deliveryMethod', x)} />
        <Sel label="配送除外エリア" val={v.deliveryExcludeArea} opts={deliveryExcludeOptions} onChange={(x) => set('deliveryExcludeArea', x)} />
        <Txt label="初回出荷日" val={v.firstShipDate} onChange={(x) => set('firstShipDate', x)} type="date" />
        <Sel label="出荷リードタイム" val={v.shippingLead} opts={shippingLeadOptions} onChange={(x) => set('shippingLead', x)} />
        <Sel label="注意事項プリセット" val={v.cautionPreset} opts={cautionPresetOptions} onChange={(x) => set('cautionPreset', x)} />
      </div>
      <label className="chk-inline"><input type="checkbox" checked={v.dryIce} onChange={(e) => set('dryIce', e.target.checked)} /><span>ドライアイス</span></label>

      <div className="frow"><div className="flabel">注意事項</div>
        <div className="fbody"><textarea className="inp" rows={2} value={v.cautionText} onChange={(e) => set('cautionText', e.target.value)} /></div>
      </div>

      <div className="subhead">各種フラグ</div>
      <div className="chk-grid">
        <Chk label="会員限定" on={v.memberOnlyFlag} onChange={(c) => set('memberOnlyFlag', c)} />
        <Chk label="前売り券" on={v.advTicketFlag} onChange={(c) => set('advTicketFlag', c)} />
        <Chk label="検索非表示" on={v.noSearchFlag} onChange={(c) => set('noSearchFlag', c)} />
        <Chk label="自動抽選" on={v.autoLotteryFlag} onChange={(c) => set('autoLotteryFlag', c)} />
        <Chk label="通知" on={v.notifyFlag} onChange={(c) => set('notifyFlag', c)} />
      </div>
    </>
  )

  if (bare) return (<><div className="subhead lead">商品規格情報（共通）</div>{body}</>)
  return <Accordion title="商品規格情報（共通）" defaultOpen={defaultOpen}>{body}</Accordion>
}

function Txt({ label, val, onChange, type = 'text' }) {
  return (
    <div className="frow"><div className="flabel">{label}</div>
      <div className="fbody"><input className="inp" type={type} value={val ?? ''} onChange={(e) => onChange(e.target.value)} /></div>
    </div>
  )
}
function Sel({ label, val, opts, onChange }) {
  return (
    <div className="frow"><div className="flabel">{label}</div>
      <div className="fbody">
        <select className="inp" value={val ?? ''} onChange={(e) => onChange(e.target.value)}>
          <option value=""></option>
          {opts.map((o) => <option key={o}>{o}</option>)}
        </select>
      </div>
    </div>
  )
}
function Chk({ label, on, onChange }) {
  return (
    <label className="chk-inline"><input type="checkbox" checked={!!on} onChange={(e) => onChange(e.target.checked)} /><span>{label}</span></label>
  )
}
