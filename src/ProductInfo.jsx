import React, { useState } from 'react'
import Accordion from './Accordion.jsx'
import {
  makerOptions, medicineTypeOptions, questionnaireOptions, alcoholOptions,
  brandOptions, seriesOptions, genderOptions, productUnitOptions, taxTypeOptions,
  productTempZoneOptions, allergyMainOptions, allergySubOptions,
} from './fields.js'
import { productMaster, productMasterByJan, jicfsMaster } from './dummyData.js'

// 商品情報（共通）+ 商品コード/JANコード 参照ボタン
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

  const toggleArr = (k, opt, on) => {
    const arr = v[k] || []
    set(k, on ? [...arr, opt] : arr.filter((x) => x !== opt))
  }

  const body = (
    <>
      {msg && <div className={'notice ' + msg.t}>{msg.m}</div>}

      {/* コード + 参照ボタン */}
      <div className="frow">
        <div className="flabel">商品コード</div>
        <div className="fbody has-right">
          <input className="inp" value={v.productCode} onChange={(e) => set('productCode', e.target.value)} placeholder="例：P0001" />
          <button type="button" className="btn-ref" onClick={refByProductCode}>参照</button>
          <div className="fnote">商品マスタから連携（P0001〜P0003）</div>
        </div>
      </div>
      <div className="frow">
        <div className="flabel">JANコード</div>
        <div className="fbody has-right">
          <input className="inp" value={v.janCode} onChange={(e) => set('janCode', e.target.value)} placeholder="例：4901234567894" />
          <button type="button" className="btn-ref" onClick={refByJan}>参照</button>
          <div className="fnote">商品マスタ→無ければJICFS（4909999999990 等）</div>
        </div>
      </div>

      <div className="grid2">
        <Sel label="メーカー" val={v.maker} opts={makerOptions} onChange={(x) => set('maker', x)} />
        <Txt label="企業URL" val={v.companyUrl} onChange={(x) => set('companyUrl', x)} />
        <Txt label="商品名" val={v.productName} onChange={(x) => set('productName', x)} />
        <Txt label="サブタイトル" val={v.subtitle} onChange={(x) => set('subtitle', x)} />
        <Txt label="キャッチコピー" val={v.catchCopy} onChange={(x) => set('catchCopy', x)} />
      </div>

      <div className="frow">
        <div className="flabel">医薬品</div>
        <div className="fbody">
          <label className="chk-inline"><input type="checkbox" checked={v.medicineOn} onChange={(e) => set('medicineOn', e.target.checked)} /><span>該当</span></label>
          {v.medicineOn && (
            <span className="inline-extra">
              <select className="inp" value={v.medicineType} onChange={(e) => set('medicineType', e.target.value)}>
                {medicineTypeOptions.map((o) => <option key={o}>{o}</option>)}
              </select>
              <select className="inp" value={v.questionnaire} onChange={(e) => set('questionnaire', e.target.value)}>
                <option value="">問診票なし</option>
                {questionnaireOptions.map((o) => <option key={o}>{o}</option>)}
              </select>
            </span>
          )}
        </div>
      </div>

      <div className="grid2">
        <Sel label="アルコール区分" val={v.alcohol} opts={alcoholOptions} onChange={(x) => set('alcohol', x)} />
        <Sel label="ブランド" val={v.brand} opts={brandOptions} onChange={(x) => set('brand', x)} />
        <Sel label="シリーズ" val={v.series} opts={seriesOptions} onChange={(x) => set('series', x)} />
        <Sel label="性別" val={v.gender} opts={genderOptions} onChange={(x) => set('gender', x)} />
      </div>

      <div className="subhead">JICFS / ITF</div>
      <div className="grid2">
        <Txt label="JICFS分類コード" val={v.jicfsCode} onChange={(x) => set('jicfsCode', x)} />
        <Txt label="JICFS分類名（漢字）" val={v.jicfsKanji} onChange={(x) => set('jicfsKanji', x)} />
        <Txt label="JICFS分類名（カナ）" val={v.jicfsKana} onChange={(x) => set('jicfsKana', x)} />
        <Txt label="JICFS分類名（略称）" val={v.jicfsAbbr} onChange={(x) => set('jicfsAbbr', x)} />
        <Txt label="ITFコード" val={v.itfCode} onChange={(x) => set('itfCode', x)} />
      </div>

      <div className="grid2">
        <Txt label="ケース入数" val={v.caseQty} onChange={(x) => set('caseQty', x)} type="number" />
        <Txt label="ボール入数" val={v.bowlQty} onChange={(x) => set('bowlQty', x)} type="number" />
        <Txt label="内容量" val={v.netContent} onChange={(x) => set('netContent', x)} />
        <Sel label="単位" val={v.unit} opts={productUnitOptions} onChange={(x) => set('unit', x)} />
        <Txt label="キーワード" val={v.keyword} onChange={(x) => set('keyword', x)} />
        <Sel label="税区分" val={v.taxType} opts={taxTypeOptions} onChange={(x) => set('taxType', x)} />
        <Sel label="温度帯" val={v.tempZone} opts={productTempZoneOptions} onChange={(x) => set('tempZone', x)} />
        <Txt label="メーカー希望価格" val={v.makerPrice} onChange={(x) => set('makerPrice', x)} type="number" />
      </div>
      <label className="chk-inline"><input type="checkbox" checked={v.dryIce} onChange={(e) => set('dryIce', e.target.checked)} /><span>ドライアイス</span></label>

      <div className="subhead">アレルギー（特定原材料等）</div>
      <div className="chk-grid">
        {allergyMainOptions.map((o) => (
          <label key={o} className="chk-inline"><input type="checkbox" checked={(v.allergyMain || []).includes(o)} onChange={(e) => toggleArr('allergyMain', o, e.target.checked)} /><span>{o}</span></label>
        ))}
      </div>
      <div className="subhead sub2">準ずるもの</div>
      <div className="chk-grid">
        {allergySubOptions.map((o) => (
          <label key={o} className="chk-inline"><input type="checkbox" checked={(v.allergySub || []).includes(o)} onChange={(e) => toggleArr('allergySub', o, e.target.checked)} /><span>{o}</span></label>
        ))}
      </div>

      <div className="chk-grid" style={{ marginTop: 10 }}>
        <label className="chk-inline"><input type="checkbox" checked={v.bestChoice} onChange={(e) => set('bestChoice', e.target.checked)} /><span>ベストチョイス</span></label>
        <label className="chk-inline"><input type="checkbox" checked={v.functionalFood} onChange={(e) => set('functionalFood', e.target.checked)} /><span>機能性表示食品</span></label>
        <label className="chk-inline"><input type="checkbox" checked={v.specificHealthFood} onChange={(e) => set('specificHealthFood', e.target.checked)} /><span>特定保健用食品</span></label>
      </div>
    </>
  )

  if (bare) return (<><div className="subhead lead">商品情報</div>{body}</>)
  return <Accordion title="商品情報（ヘッダー）" defaultOpen={defaultOpen}>{body}</Accordion>
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
