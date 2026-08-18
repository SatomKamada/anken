import Field, { Row } from './Field.jsx'
import {
  postChannelOptions,
  postAttrOptions,
  bestBeforeTypeOptions,
  tagOptions,
  priceChannels,
} from './fields.js'

// 日時レンジ（〜）
function DateRange({ from, to, onFrom, onTo }) {
  return (
    <div className="kt-daterange">
      <input className="kt-input" type="datetime-local" value={from} onChange={(e) => onFrom(e.target.value)} />
      <span className="kt-tilde">〜</span>
      <input className="kt-input" type="datetime-local" value={to} onChange={(e) => onTo(e.target.value)} />
    </div>
  )
}

export default function PostHistory({ data, onChange }) {
  const set = (key, val) => onChange(key, val)

  // 価格テーブル更新
  const setPrice = (ch, patch) =>
    onChange('prices', { ...data.prices, [ch]: { ...data.prices[ch], ...patch } })

  // タグ行更新
  const setTag = (i, patch) =>
    onChange('tags', data.tags.map((t, idx) => (idx === i ? { ...t, ...patch } : t)))
  const addTag = () => onChange('tags', [...data.tags, { tag: '', from: '', to: '' }])
  const removeTag = (i) =>
    onChange('tags', data.tags.length === 1 ? data.tags : data.tags.filter((_, idx) => idx !== i))

  return (
    <div className="kt-ph">
      <Row label="掲載期間" required>
        <DateRange from={data.postPeriodFrom} to={data.postPeriodTo}
          onFrom={(v) => set('postPeriodFrom', v)} onTo={(v) => set('postPeriodTo', v)} />
      </Row>

      <Row label="販売期間" required>
        <DateRange from={data.salePeriodFrom} to={data.salePeriodTo}
          onFrom={(v) => set('salePeriodFrom', v)} onTo={(v) => set('salePeriodTo', v)} />
      </Row>

      <Row label="対象チャネル">
        <div className="kt-checkbox-group kt-vertical">
          {postChannelOptions.map((opt) => (
            <label key={opt} className="kt-checkbox">
              <input type="checkbox" checked={data.targetChannel.includes(opt)}
                onChange={(e) => {
                  const s = new Set(data.targetChannel)
                  e.target.checked ? s.add(opt) : s.delete(opt)
                  set('targetChannel', [...s])
                }} />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      </Row>

      {[
        ['premiumFlag', 'プレミアム会員フラグ'],
        ['firstLimitFlag', '初回限定フラグ'],
        ['timeSaleFlag', 'タイムセールフラグ'],
        ['reserveFlag', '予約フラグ'],
      ].map(([key, label]) => (
        <Row key={key} label={label}>
          <label className="kt-checkbox">
            <input type="checkbox" checked={data[key]} onChange={(e) => set(key, e.target.checked)} />
            <span>ON</span>
          </label>
        </Row>
      ))}

      <Row label="掲載属性情報">
        <div className="kt-checkbox-group kt-vertical">
          {postAttrOptions.map((opt) => (
            <label key={opt} className="kt-checkbox">
              <input type="checkbox" checked={data.postAttr.includes(opt)}
                onChange={(e) => {
                  const s = new Set(data.postAttr)
                  e.target.checked ? s.add(opt) : s.delete(opt)
                  set('postAttr', [...s])
                }} />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      </Row>

      <Row label="告知限定フラグ">
        <label className="kt-checkbox">
          <input type="checkbox" checked={data.noticeLimitFlag}
            onChange={(e) => set('noticeLimitFlag', e.target.checked)} />
          <span>ON</span>
        </label>
      </Row>

      <Row label="申込み回数制限">
        <label className="kt-checkbox">
          <input type="checkbox" checked={data.applyCountLimit}
            onChange={(e) => set('applyCountLimit', e.target.checked)} />
          <span>ON</span>
        </label>
      </Row>

      <Row label="申込み可能個数" help="申込み回数制限がONのとき入力できます">
        <input className="kt-input" type="number" value={data.applyableCount}
          disabled={!data.applyCountLimit}
          onChange={(e) => set('applyableCount', e.target.value)} />
      </Row>

      <Row label="掲載名">
        <input className="kt-input" value={data.postName} onChange={(e) => set('postName', e.target.value)} />
      </Row>
      <Row label="サブタイトル1">
        <input className="kt-input" value={data.subtitle1} onChange={(e) => set('subtitle1', e.target.value)} />
      </Row>
      <Row label="サブタイトル2">
        <input className="kt-input" value={data.subtitle2} onChange={(e) => set('subtitle2', e.target.value)} />
      </Row>
      <Row label="キャッチコピー">
        <input className="kt-input" value={data.catchCopy} onChange={(e) => set('catchCopy', e.target.value)} />
      </Row>

      <Row label="賞味期限" required help="対象外の場合はチェックを入れる">
        <div className="kt-bestbefore">
          <label className="kt-checkbox">
            <input type="checkbox" checked={data.bestBeforeExcluded}
              onChange={(e) => set('bestBeforeExcluded', e.target.checked)} />
            <span>対象外</span>
          </label>
          <div className="kt-bestbefore-inputs">
            <select className="kt-input" value={data.bestBeforeType}
              disabled={data.bestBeforeExcluded}
              onChange={(e) => set('bestBeforeType', e.target.value)}>
              {bestBeforeTypeOptions.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <input className="kt-input" type="date" value={data.bestBeforeDate}
              disabled={data.bestBeforeExcluded}
              onChange={(e) => set('bestBeforeDate', e.target.value)} />
          </div>
        </div>
      </Row>

      <Row label="表示提供数" required>
        <input className="kt-input" type="number" value={data.displayProvideCount}
          onChange={(e) => set('displayProvideCount', e.target.value)} />
      </Row>
      <Row label="EC在庫数" required>
        <input className="kt-input" type="number" value={data.ecStock}
          onChange={(e) => set('ecStock', e.target.value)} />
      </Row>

      {/* 価格テーブル（チャネル×価格項目） */}
      <Row label="価格">
        <div className="kt-price-wrap">
          <table className="kt-price-table">
            <thead>
              <tr>
                <th className="kt-price-rowhead"></th>
                {priceChannels.map((ch) => <th key={ch}>{ch}</th>)}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th className="kt-price-rowhead">販売価格<span className="kt-badge-req">必須</span></th>
                {priceChannels.map((ch) => (
                  <td key={ch}>
                    <span className="kt-yen">¥</span>
                    <input className="kt-input kt-price-input" type="number" value={data.prices[ch].salePrice}
                      onChange={(e) => setPrice(ch, { salePrice: e.target.value })} />
                  </td>
                ))}
              </tr>
              <tr>
                <th className="kt-price-rowhead">単位あたりの価格</th>
                {priceChannels.map((ch) => <td key={ch} className="kt-price-auto">¥0</td>)}
              </tr>
              <tr>
                <th className="kt-price-rowhead">OFF率表示フラグ</th>
                {priceChannels.map((ch) => (
                  <td key={ch}>
                    <label className="kt-checkbox">
                      <input type="checkbox" checked={data.prices[ch].offFlag}
                        onChange={(e) => setPrice(ch, { offFlag: e.target.checked })} />
                      <span>ON</span>
                    </label>
                  </td>
                ))}
              </tr>
              <tr>
                <th className="kt-price-rowhead">OFF率</th>
                {priceChannels.map((ch) => <td key={ch} className="kt-price-auto">0%OFF</td>)}
              </tr>
              <tr>
                <th className="kt-price-rowhead">基準粗利<span className="kt-badge-req">必須</span></th>
                {priceChannels.map((ch) => (
                  <td key={ch}>
                    <span className="kt-yen">¥</span>
                    <input className="kt-input kt-price-input" type="number" value={data.prices[ch].baseProfit}
                      onChange={(e) => setPrice(ch, { baseProfit: e.target.value })} />
                  </td>
                ))}
              </tr>
              <tr>
                <th className="kt-price-rowhead">基準原価</th>
                <td className="kt-price-auto" colSpan={priceChannels.length}>0.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Row>

      {/* タグ（複数行・追加可） */}
      <Row label="タグ">
        <div className="kt-tags">
          {data.tags.map((t, i) => (
            <div className="kt-tag-row" key={i}>
              <select className="kt-input" value={t.tag} onChange={(e) => setTag(i, { tag: e.target.value })}>
                <option value="">タグを選択してください</option>
                {tagOptions.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <input className="kt-input" type="datetime-local" value={t.from} onChange={(e) => setTag(i, { from: e.target.value })} />
              <span className="kt-tilde">〜</span>
              <input className="kt-input" type="datetime-local" value={t.to} onChange={(e) => setTag(i, { to: e.target.value })} />
              <button className="kt-icon-btn kt-remove" onClick={() => removeTag(i)} disabled={data.tags.length === 1}>×</button>
            </div>
          ))}
          <button className="kt-add-row-btn kt-sm" onClick={addTag}>追加</button>
        </div>
      </Row>

      {/* セグメント */}
      <Row label="セグメント" help="ONにするとセグメントを指定できます">
        <div className="kt-segment">
          <div className="kt-segment-head">
            <label className="kt-checkbox">
              <input type="checkbox" checked={data.segmentOn}
                onChange={(e) => set('segmentOn', e.target.checked)} />
              <span>ON</span>
            </label>
            {['セグメント', '会員セグメント'].map((o) => (
              <label key={o} className="kt-radio">
                <input type="radio" name="segmentType" value={o}
                  disabled={!data.segmentOn} checked={data.segmentType === o}
                  onChange={(e) => set('segmentType', e.target.value)} />
                <span>{o}</span>
              </label>
            ))}
          </div>
          <input className="kt-input" value={data.segmentValue} disabled={!data.segmentOn}
            onChange={(e) => set('segmentValue', e.target.value)} />
        </div>
      </Row>

      <Row label="重み付け1">
        <input className="kt-input" value={data.weight1} onChange={(e) => set('weight1', e.target.value)} />
      </Row>
      <Row label="重み付け2">
        <input className="kt-input" value={data.weight2} onChange={(e) => set('weight2', e.target.value)} />
      </Row>
      <Row label="メモ">
        <textarea className="kt-input kt-textarea" rows={4} value={data.memo}
          onChange={(e) => set('memo', e.target.value)} />
      </Row>
    </div>
  )
}
