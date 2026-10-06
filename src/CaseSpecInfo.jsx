import React, { useState } from 'react'
import Field from './Field.jsx'
import {
  specTopFields, specGroups,
  deliveryMethodOptions, deliveryExcludeOptions, deliveryFeeTypeOptions,
} from './fields.js'
import { specMaster } from './dummyData.js'

// 商品規格情報（案件に1つ）
//   旧「商品規格情報（共通）」＋旧明細の規格項目（規格区分・販売形態・販売数・基本）を統合
//   温度帯・ドライアイスは不要のため非表示（案件（セット商品）タブの SpecCommon は従来どおり）
// props: value, onChange
const baseFields = specGroups.find((g) => g.title === '基本').fields

export default function CaseSpecInfo({ value, onChange }) {
  const v = value
  const [msg, setMsg] = useState(null)
  const set = (k, val) => onChange({ ...v, [k]: val })

  // 商品規格コード参照 → 商品規格マスタから入力
  const refBySpecCode = () => {
    const code = (v.specCode || '').trim()
    if (!code) { setMsg({ t: 'warn', m: '商品規格コードを入力してください' }); return }
    const m = specMaster[code]
    if (!m) { setMsg({ t: 'warn', m: `商品規格マスタに該当なし（${code}）` }); return }
    onChange({ ...v, ...m.common, ...m.seedSpec, specCode: code })
    setMsg({ t: 'ok', m: `商品規格マスタから連携しました（${code}）` })
  }

  return (
    <>
      {msg && <div className={'notice ' + msg.t}>{msg.m}</div>}

      <div className="frow">
        <div className="flabel">商品規格コード</div>
        <div className="fbody has-right">
          <input className="inp inp-code" value={v.specCode} onChange={(e) => set('specCode', e.target.value)} placeholder="例：20000001" />
          <button type="button" className="btn-ref" onClick={refBySpecCode}>参照</button>
        </div>
      </div>

      {/* 規格区分・販売形態・販売数 */}
      <div className="vstack">
        {specTopFields.map((f) => (
          <Field key={f.key} field={f} value={v[f.key]} onChange={set} />
        ))}
      </div>

      <div className="grid2">
        <Disp label="業態区分" val={v.businessType} />
        <Disp label="ちょっプル種別" val={v.choppleType} />
        <Sel label="配送方法" val={v.deliveryMethod} opts={deliveryMethodOptions} onChange={(x) => set('deliveryMethod', x)} />
        <Sel label="配送除外エリア" val={v.deliveryExcludeArea} opts={deliveryExcludeOptions} onChange={(x) => set('deliveryExcludeArea', x)} />
        <Sel label="配送料種別" val={v.deliveryFeeType} opts={deliveryFeeTypeOptions} onChange={(x) => set('deliveryFeeType', x)} />
      </div>

      {/* 旧明細「基本」 */}
      <div className="grid2">
        {baseFields.map((f) => (
          <Field key={f.key} field={f} value={v[f.key]} onChange={set} />
        ))}
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
}

function Disp({ label, val }) {
  return (
    <div className="frow"><div className="flabel">{label}<span className="autotag">自動</span></div>
      <div className="fbody"><input className="inp" value={val ?? ''} readOnly placeholder="企業名の選択で自動" title="表示のみ（入力不要）" /></div>
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
