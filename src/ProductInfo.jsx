import { Row } from './Field.jsx'
import {
  makerOptions,
  medicineTypeOptions,
  questionnaireOptions,
  alcoholOptions,
  brandOptions,
  seriesOptions,
  genderOptions,
  productUnitOptions,
  productTagOptions,
  taxTypeOptions,
  productTempZoneOptions,
  allergyMainOptions,
  allergySubOptions,
} from './fields.js'

function Select({ value, options, placeholder = '選択してください', disabled, onChange }) {
  return (
    <select className="kt-input" value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}>
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

function RadioGroup({ name, value, options, disabled, onChange }) {
  return (
    <div className="kt-radio-group">
      {options.map((o) => (
        <label key={o} className="kt-radio">
          <input type="radio" name={name} value={o} checked={value === o}
            disabled={disabled} onChange={(e) => onChange(e.target.value)} />
          <span>{o}</span>
        </label>
      ))}
    </div>
  )
}

// チェックボックスのグリッド（複数選択）
function CheckGrid({ options, value, onChange }) {
  const toggle = (opt, checked) => {
    const s = new Set(value)
    checked ? s.add(opt) : s.delete(opt)
    onChange([...s])
  }
  return (
    <div className="kt-check-grid">
      {options.map((o) => (
        <label key={o} className="kt-checkbox">
          <input type="checkbox" checked={value.includes(o)} onChange={(e) => toggle(o, e.target.checked)} />
          <span>{o}</span>
        </label>
      ))}
    </div>
  )
}

export default function ProductInfo({ data, onChange }) {
  const set = (key, val) => onChange(key, val)

  // タグ設定（複数）
  const setTag = (i, val) => onChange('tags', data.tags.map((t, idx) => (idx === i ? { tag: val } : t)))
  const addTag = () => onChange('tags', [...data.tags, { tag: '' }])
  const removeTag = (i) => onChange('tags', data.tags.length === 1 ? data.tags : data.tags.filter((_, idx) => idx !== i))

  return (
    <div className="kt-ph">
      {/* 先頭：商品コード */}
      <Row label="商品コード">
        <input className="kt-input" value={data.productCode} onChange={(e) => set('productCode', e.target.value)} />
      </Row>

      <Row label="JANコード" help="JANコードを入力してください">
        <input className="kt-input" value={data.janCode} onChange={(e) => set('janCode', e.target.value)} />
      </Row>
      <Row label="メーカー">
        <Select value={data.maker} options={makerOptions} placeholder="メーカーを選択してください" onChange={(v) => set('maker', v)} />
      </Row>
      <Row label="企業リンク（URL）" help="企業サイトのURL">
        <input className="kt-input" value={data.companyUrl} onChange={(e) => set('companyUrl', e.target.value)} />
      </Row>
      <Row label="商品名" required help="商品名を入力してください">
        <input className="kt-input" value={data.productName} onChange={(e) => set('productName', e.target.value)} />
      </Row>
      <Row label="サブタイトル">
        <input className="kt-input" value={data.subtitle} onChange={(e) => set('subtitle', e.target.value)} />
      </Row>
      <Row label="キャッチコピー">
        <textarea className="kt-input kt-textarea" rows={3} value={data.catchCopy} onChange={(e) => set('catchCopy', e.target.value)} />
      </Row>

      {/* 医薬品：ON＋区分＋問診票 */}
      <Row label="医薬品">
        <div className="kt-stack">
          <label className="kt-checkbox">
            <input type="checkbox" checked={data.medicineOn} onChange={(e) => set('medicineOn', e.target.checked)} />
            <span>ON</span>
          </label>
          <RadioGroup name="medicineType" value={data.medicineType} options={medicineTypeOptions}
            disabled={!data.medicineOn} onChange={(v) => set('medicineType', v)} />
          <div className="kt-inline">
            <span className="kt-inline-label">問診票</span>
            <Select value={data.questionnaire} options={questionnaireOptions}
              disabled={!data.medicineOn} onChange={(v) => set('questionnaire', v)} />
          </div>
        </div>
      </Row>

      <Row label="お酒・ノンアル設定">
        <RadioGroup name="alcohol" value={data.alcohol} options={alcoholOptions} onChange={(v) => set('alcohol', v)} />
      </Row>
      <Row label="ブランド">
        <Select value={data.brand} options={brandOptions} placeholder="ブランドを選択してください" onChange={(v) => set('brand', v)} />
      </Row>
      <Row label="シリーズ">
        <Select value={data.series} options={seriesOptions} placeholder="シリーズを選択してください" onChange={(v) => set('series', v)} />
      </Row>
      <Row label="性別">
        <RadioGroup name="gender" value={data.gender} options={genderOptions} onChange={(v) => set('gender', v)} />
      </Row>

      <Row label="JICFS分類コード" help="JICFS分類コード">
        <input className="kt-input" value={data.jicfsCode} onChange={(e) => set('jicfsCode', e.target.value)} />
      </Row>
      <Row label="JICFS分類名（漢字）">
        <input className="kt-input" value={data.jicfsKanji} onChange={(e) => set('jicfsKanji', e.target.value)} />
      </Row>
      <Row label="JICFS分類名（カナ）">
        <input className="kt-input" value={data.jicfsKana} onChange={(e) => set('jicfsKana', e.target.value)} />
      </Row>
      <Row label="JICFS分類名（略称）">
        <input className="kt-input" value={data.jicfsAbbr} onChange={(e) => set('jicfsAbbr', e.target.value)} />
      </Row>
      <Row label="ITFコード" help="ITFコード">
        <input className="kt-input" value={data.itfCode} onChange={(e) => set('itfCode', e.target.value)} />
      </Row>

      {/* 最小ロット：ケース入数・ボウル入数 */}
      <Row label="最小ロット">
        <div className="kt-stack">
          <div className="kt-inline">
            <span className="kt-inline-label">ケース入数</span>
            <input className="kt-input" type="number" value={data.caseQty} onChange={(e) => set('caseQty', e.target.value)} />
          </div>
          <div className="kt-inline">
            <span className="kt-inline-label">ボウル入数</span>
            <input className="kt-input" type="number" value={data.bowlQty} onChange={(e) => set('bowlQty', e.target.value)} />
          </div>
        </div>
      </Row>

      <Row label="内容量（実寸）">
        <input className="kt-input" value={data.netContent} onChange={(e) => set('netContent', e.target.value)} />
      </Row>
      <Row label="単位">
        <Select value={data.unit} options={productUnitOptions} onChange={(v) => set('unit', v)} />
      </Row>

      {/* タグ設定 */}
      <Row label="タグ設定">
        <div className="kt-tags">
          {data.tags.map((t, i) => (
            <div className="kt-tag-row" key={i}>
              <select className="kt-input" value={t.tag} onChange={(e) => setTag(i, e.target.value)}>
                <option value="">タグを選択してください</option>
                {productTagOptions.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <button className="kt-icon-btn kt-remove" onClick={() => removeTag(i)} disabled={data.tags.length === 1}>×</button>
            </div>
          ))}
          <button className="kt-add-row-btn kt-sm" onClick={addTag}>追加</button>
        </div>
      </Row>

      <Row label="キーワード" help="検索キーワード">
        <input className="kt-input" value={data.keyword} onChange={(e) => set('keyword', e.target.value)} />
      </Row>
      <Row label="税率対象">
        <RadioGroup name="taxType" value={data.taxType} options={taxTypeOptions} onChange={(v) => set('taxType', v)} />
      </Row>
      <Row label="商品温度帯" help="商品の温度帯">
        <RadioGroup name="piTempZone" value={data.tempZone} options={productTempZoneOptions} onChange={(v) => set('tempZone', v)} />
      </Row>
      <Row label="ドライアイス設定" help="ドライアイスの要否">
        <label className="kt-checkbox">
          <input type="checkbox" checked={data.dryIce} onChange={(e) => set('dryIce', e.target.checked)} />
          <span>ON</span>
        </label>
      </Row>

      {/* 食物アレルギー(29品目) */}
      <Row label="食物アレルギー(29品目)">
        <div className="kt-stack">
          <div className="kt-check-grid-label">特定原材料（9品目）：</div>
          <CheckGrid options={allergyMainOptions} value={data.allergyMain} onChange={(v) => set('allergyMain', v)} />
          <div className="kt-check-grid-label">特定原材料に準ずるもの：</div>
          <CheckGrid options={allergySubOptions} value={data.allergySub} onChange={(v) => set('allergySub', v)} />
        </div>
      </Row>

      <Row label="メーカー希望小売価格">
        <div className="kt-inline">
          <span className="kt-yen">¥</span>
          <input className="kt-input" type="number" value={data.makerPrice} onChange={(e) => set('makerPrice', e.target.value)} />
        </div>
      </Row>

      <Row label="ベストチョイス">
        <label className="kt-checkbox">
          <input type="checkbox" checked={data.bestChoice} onChange={(e) => set('bestChoice', e.target.checked)} />
          <span>対象</span>
        </label>
      </Row>
      <Row label="機能性表示食品">
        <label className="kt-checkbox">
          <input type="checkbox" checked={data.functionalFood} onChange={(e) => set('functionalFood', e.target.checked)} />
          <span>対象</span>
        </label>
      </Row>
      <Row label="特定保健用食品">
        <label className="kt-checkbox">
          <input type="checkbox" checked={data.specificHealthFood} onChange={(e) => set('specificHealthFood', e.target.checked)} />
          <span>対象</span>
        </label>
      </Row>
    </div>
  )
}
