import React, { useState } from 'react'
import Accordion from './Accordion.jsx'
import {
  makerOptions, medicineTypeOptions, questionnaireOptions, alcoholOptions,
  brandOptions, seriesOptions, genderOptions, productUnitOptions, taxTypeOptions,
  productTempZoneOptions, productTagOptions, allergyMainOptions, allergySubOptions,
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

  const toggleArr = (k, opt, on) => {
    const arr = v[k] || []
    set(k, on ? [...arr, opt] : arr.filter((x) => x !== opt))
  }
  const copyCode = () => { try { navigator.clipboard?.writeText(v.productCode || '') } catch (e) {} }

  // タグ設定（複数）
  const addTag = (t) => { if (t && !(v.tags || []).includes(t)) set('tags', [...(v.tags || []), t]) }
  const delTag = (t) => set('tags', (v.tags || []).filter((x) => x !== t))

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

      <Row label="企業リンク（URL）" help>
        <input className="inp" value={v.companyUrl} onChange={(e) => set('companyUrl', e.target.value)} />
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

      {/* 医薬品：ON + ラジオ（未ONはグレー）＋問診票 */}
      <div className="frow">
        <Label text="医薬品" />
        <div className="fbody">
          <label className="chk-inline"><input type="checkbox" checked={v.medicineOn} onChange={(e) => set('medicineOn', e.target.checked)} /><span>ON</span></label>
          <RadioRow name="medicineType" options={medicineTypeOptions} value={v.medicineType} disabled={!v.medicineOn} onChange={(o) => set('medicineType', o)} />
          <div className="sub-inline">
            <span className="mini-label">問診票</span><Help />
            <select className="inp" disabled={!v.medicineOn} value={v.questionnaire} onChange={(e) => set('questionnaire', e.target.value)}>
              <option value="">選択してください</option>
              {questionnaireOptions.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
      </div>

      <Row label="お酒・ノンアル設定">
        <RadioRow name="alcohol" options={alcoholOptions} value={v.alcohol} onChange={(o) => set('alcohol', o)} />
      </Row>

      <Row label="ブランド">
        <select className="inp" value={v.brand} onChange={(e) => set('brand', e.target.value)}>
          <option value="">ブランドを選択してください</option>
          {brandOptions.map((o) => <option key={o}>{o}</option>)}
        </select>
      </Row>

      <Row label="シリーズ">
        <select className="inp" value={v.series} onChange={(e) => set('series', e.target.value)}>
          <option value="">シリーズを選択してください</option>
          {seriesOptions.map((o) => <option key={o}>{o}</option>)}
        </select>
      </Row>

      <Row label="性別">
        <RadioRow name="gender" options={genderOptions} value={v.gender} onChange={(o) => set('gender', o)} />
      </Row>

      <Row label="JICFS分類コード" help>
        <input className="inp" value={v.jicfsCode} onChange={(e) => set('jicfsCode', e.target.value)} />
      </Row>
      <Row label="JICFS分類名（漢字）">
        <input className="inp" value={v.jicfsKanji} onChange={(e) => set('jicfsKanji', e.target.value)} />
      </Row>
      <Row label="JICFS分類名（カナ）">
        <input className="inp" value={v.jicfsKana} onChange={(e) => set('jicfsKana', e.target.value)} />
      </Row>
      <Row label="JICFS分類名（略称）">
        <input className="inp" value={v.jicfsAbbr} onChange={(e) => set('jicfsAbbr', e.target.value)} />
      </Row>

      <Row label="ITFコード" help>
        <input className="inp" value={v.itfCode} onChange={(e) => set('itfCode', e.target.value)} />
      </Row>

      {/* 最小ロット：ケース入数 / ボウル入数 */}
      <div className="frow">
        <Label text="最小ロット" />
        <div className="fbody">
          <div className="minlot">
            <div className="subrow"><span className="mini-label">ケース入数</span><input className="inp" type="number" value={v.caseQty} onChange={(e) => set('caseQty', e.target.value)} /></div>
            <div className="subrow"><span className="mini-label">ボウル入数</span><input className="inp" type="number" value={v.bowlQty} onChange={(e) => set('bowlQty', e.target.value)} /></div>
          </div>
        </div>
      </div>

      <Row label="内容量（実寸）">
        <input className="inp" value={v.netContent} onChange={(e) => set('netContent', e.target.value)} />
      </Row>

      <Row label="単位">
        <select className="inp" value={v.unit} onChange={(e) => set('unit', e.target.value)}>
          <option value="">選択してください</option>
          {productUnitOptions.map((o) => <option key={o}>{o}</option>)}
        </select>
      </Row>

      {/* タグ設定（複数選択） */}
      <Row label="タグ設定">
        <div className="tagpick">
          <select className="inp" value="" onChange={(e) => { addTag(e.target.value); e.target.value = '' }}>
            <option value="">タグを選択してください</option>
            {productTagOptions.filter((o) => !(v.tags || []).includes(o)).map((o) => <option key={o}>{o}</option>)}
          </select>
          <div className="chips">
            {(v.tags || []).map((t) => (
              <span className="chip" key={t}>{t}<button type="button" onClick={() => delTag(t)}>×</button></span>
            ))}
          </div>
        </div>
      </Row>

      <Row label="キーワード" help>
        <input className="inp" value={v.keyword} onChange={(e) => set('keyword', e.target.value)} />
      </Row>

      <Row label="税率対象">
        <RadioRow name="taxType" options={taxTypeOptions} value={v.taxType} onChange={(o) => set('taxType', o)} />
      </Row>

      <Row label="商品温度帯" help>
        <RadioRow name="tempZone" options={productTempZoneOptions} value={v.tempZone} onChange={(o) => set('tempZone', o)} />
      </Row>

      <Row label="ドライアイス設定" help>
        <label className="chk-inline"><input type="checkbox" checked={v.dryIce} onChange={(e) => set('dryIce', e.target.checked)} /><span>ON</span></label>
      </Row>

      {/* 食物アレルギー(29品目) */}
      <div className="frow">
        <Label text="食物アレルギー(29品目)" />
        <div className="fbody">
          <div className="allergy-label">特定原材料（9品目）：</div>
          <div className="chk-grid cols4">
            {allergyMainOptions.map((o) => (
              <label key={o} className="chk-inline"><input type="checkbox" checked={(v.allergyMain || []).includes(o)} onChange={(e) => toggleArr('allergyMain', o, e.target.checked)} /><span>{o}</span></label>
            ))}
          </div>
          <div className="allergy-label">特定原材料に準ずるもの：</div>
          <div className="chk-grid cols4">
            {allergySubOptions.map((o) => (
              <label key={o} className="chk-inline"><input type="checkbox" checked={(v.allergySub || []).includes(o)} onChange={(e) => toggleArr('allergySub', o, e.target.checked)} /><span>{o}</span></label>
            ))}
          </div>
        </div>
      </div>

      <Row label="メーカー希望小売価格">
        <div className="yen-wrap">
          <span className="yen">¥</span>
          <input className="inp" type="number" value={v.makerPrice} onChange={(e) => set('makerPrice', e.target.value)} />
        </div>
      </Row>

      <div className="subhead">カテゴリ情報</div>
      <div className="grid2">
        <Row label="カテゴリーコード"><input className="inp" value={v.categoryCode} onChange={(e) => set('categoryCode', e.target.value)} placeholder="例：C020401" /></Row>
        <Row label="大カテゴリー"><input className="inp" value={v.categoryL} onChange={(e) => set('categoryL', e.target.value)} /></Row>
        <Row label="中カテゴリー"><input className="inp" value={v.categoryM} onChange={(e) => set('categoryM', e.target.value)} /></Row>
        <Row label="小カテゴリー"><input className="inp" value={v.categoryS} onChange={(e) => set('categoryS', e.target.value)} /></Row>
      </div>

      <Row label="ベストチョイス">
        <label className="chk-inline"><input type="checkbox" checked={v.bestChoice} onChange={(e) => set('bestChoice', e.target.checked)} /><span>対象</span></label>
      </Row>
      <Row label="機能性表示食品">
        <label className="chk-inline"><input type="checkbox" checked={v.functionalFood} onChange={(e) => set('functionalFood', e.target.checked)} /><span>対象</span></label>
      </Row>
      <Row label="特定保健用食品">
        <label className="chk-inline"><input type="checkbox" checked={v.specificHealthFood} onChange={(e) => set('specificHealthFood', e.target.checked)} /><span>対象</span></label>
      </Row>
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
