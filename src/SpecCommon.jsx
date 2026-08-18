import { Row } from './Field.jsx'
import {
  salesRepOptions,
  companyCodeOptions,
  tempZoneOptions,
  noticeInfoOptions,
  deliveryMethodOptions,
  deliveryExcludeOptions,
  shippingLeadOptions,
  cautionPresetOptions,
} from './fields.js'

// セレクト（プレースホルダ付き）
function Select({ value, options, placeholder = '選択してください', disabled, onChange }) {
  return (
    <select className="kt-input" value={value} disabled={disabled}
      onChange={(e) => onChange(e.target.value)}>
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

// ON チェックボックス
function OnCheck({ checked, onChange }) {
  return (
    <label className="kt-checkbox">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>ON</span>
    </label>
  )
}

export default function SpecCommon({ data, onChange }) {
  const set = (key, val) => onChange(key, val)

  return (
    <div className="kt-ph">
      <Row label="営業担当">
        <Select value={data.salesRep} options={salesRepOptions} onChange={(v) => set('salesRep', v)} />
      </Row>

      <Row label="企業コード" help="企業マスタの企業コードから選択します">
        <Select value={data.companyCode} options={companyCodeOptions} onChange={(v) => set('companyCode', v)} />
      </Row>

      <Row label="自社品番">
        <input className="kt-input" value={data.ownItemNo} onChange={(e) => set('ownItemNo', e.target.value)} />
      </Row>

      <Row label="商品温度帯">
        <div className="kt-radio-group">
          {tempZoneOptions.map((o) => (
            <label key={o} className="kt-radio">
              <input type="radio" name="tempZone" value={o}
                checked={data.tempZone === o} onChange={(e) => set('tempZone', e.target.value)} />
              <span>{o}</span>
            </label>
          ))}
        </div>
      </Row>

      <Row label="ドライアイス設定">
        <OnCheck checked={data.dryIce} onChange={(v) => set('dryIce', v)} />
      </Row>

      <Row label="商品告知情報の紐づけ">
        <Select value={data.noticeInfo} options={noticeInfoOptions}
          placeholder="商品告知情報を選択してください" onChange={(v) => set('noticeInfo', v)} />
      </Row>

      <Row label="配送方法">
        <Select value={data.deliveryMethod} options={deliveryMethodOptions} onChange={(v) => set('deliveryMethod', v)} />
      </Row>

      <Row label="配送除外地域">
        <Select value={data.deliveryExcludeArea} options={deliveryExcludeOptions} onChange={(v) => set('deliveryExcludeArea', v)} />
      </Row>

      <Row label="初回出荷予定日">
        <input className="kt-input kt-date" type="date" value={data.firstShipDate}
          onChange={(e) => set('firstShipDate', e.target.value)} />
      </Row>

      <Row label="発送日目安">
        <Select value={data.shippingLead} options={shippingLeadOptions} onChange={(v) => set('shippingLead', v)} />
      </Row>

      <Row label="注意事項">
        <div className="kt-caution">
          <Select value={data.cautionPreset} options={cautionPresetOptions} onChange={(v) => set('cautionPreset', v)} />
          <textarea className="kt-input kt-textarea" rows={3} value={data.cautionText}
            onChange={(e) => set('cautionText', e.target.value)} />
        </div>
      </Row>

      <Row label="会員限定フラグ"><OnCheck checked={data.memberOnlyFlag} onChange={(v) => set('memberOnlyFlag', v)} /></Row>
      <Row label="先行チケット利用フラグ"><OnCheck checked={data.advTicketFlag} onChange={(v) => set('advTicketFlag', v)} /></Row>
      <Row label="検索対象外フラグ"><OnCheck checked={data.noSearchFlag} onChange={(v) => set('noSearchFlag', v)} /></Row>
      <Row label="自動抽選フラグ"><OnCheck checked={data.autoLotteryFlag} onChange={(v) => set('autoLotteryFlag', v)} /></Row>
      <Row label="通知フラグ"><OnCheck checked={data.notifyFlag} onChange={(v) => set('notifyFlag', v)} /></Row>
    </div>
  )
}
