import React, { useState } from 'react'
import Field from './Field.jsx'
import './pageChange.css'
import {
  PAGE_CHANGE_FIELDS,
  PAGE_CHANGE_TYPE,
  PUBLISH_CHANNELS,
  PUBLISH_STATUS_OPTIONS,
  PAGE_CHANGE_TARGET_GROUPS,
  createPageChangeInitial,
} from './pageChangeFields.js'

let seq = 0
const nextRecordNo = () => String(++seq)

export default function PageChange() {
  const [form, setForm] = useState(() => createPageChangeInitial(nextRecordNo()))

  const onChange = (key, v) => setForm((f) => ({ ...f, [key]: v }))
  const set = (patch) => setForm((f) => ({ ...f, ...patch }))

  const updateRow = (key, i, patch) =>
    set({ [key]: form[key].map((r, idx) => (idx === i ? { ...r, ...patch } : r)) })
  const addRow = (key, row) => set({ [key]: [...form[key], row] })
  const removeRow = (key, i) =>
    form[key].length > 1 && set({ [key]: form[key].filter((_, idx) => idx !== i) })

  const T = PAGE_CHANGE_TYPE
  const period = (s, e) => form[s] && form[e] && form[s] > form[e]

  return (
    <div className="pc-wrap">
      <section className="pc-section">
        {PAGE_CHANGE_FIELDS.map((fd) => (
          <Field key={fd.key} field={fd} value={form[fd.key]} onChange={onChange} />
        ))}
      </section>

      {form.changeType === T.PAGE && (
        <section className="pc-section">
          <h3 className="pc-title">掲載ページ変更</h3>
          {form.pageRows.map((r, i) => (
            <div className="pc-row" key={i}>
              <div className="pc-cell pc-w-target">
                <div className="pc-label">変更対象の項目</div>
                <select className="inp" value={r.target}
                  onChange={(e) => updateRow('pageRows', i, { target: e.target.value })}>
                  <option value=""></option>
                  {PAGE_CHANGE_TARGET_GROUPS.map((g) => (
                    <optgroup key={g.group} label={g.group}>
                      {g.items.map((t) => (
                        <option key={t.key} value={`${g.group}.${t.key}`}>{t.label}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className="pc-cell pc-grow">
                <div className="pc-label">変更内容</div>
                <textarea className="inp" rows={3} value={r.content}
                  onChange={(e) => updateRow('pageRows', i, { content: e.target.value })} />
              </div>
              <button type="button" className="pc-del" onClick={() => removeRow('pageRows', i)}>×</button>
            </div>
          ))}
          <button type="button" className="pc-add"
            onClick={() => addRow('pageRows', { target: '', content: '' })}>＋ 行を追加</button>
        </section>
      )}

      {form.changeType === T.PERIOD && (
        <section className="pc-section">
          <h3 className="pc-title">掲載開始終了日 / 募集開始終了日設定</h3>
          {[['掲載', 'postStart', 'postEnd'], ['募集', 'recruitStart', 'recruitEnd']].map(([name, s, e]) => (
            <div className="pc-row" key={name}>
              <div className="pc-rowhead">{name}期間</div>
              <div className="pc-cell">
                <div className="pc-label">{name}開始日</div>
                <input className="inp" type="date" value={form[s]} onChange={(ev) => set({ [s]: ev.target.value })} />
              </div>
              <span className="pc-sep">〜</span>
              <div className="pc-cell">
                <div className="pc-label">{name}終了日</div>
                <input className="inp" type="date" value={form[e]} onChange={(ev) => set({ [e]: ev.target.value })} />
              </div>
              {period(s, e) && <span className="pc-err">終了日が開始日より前です</span>}
            </div>
          ))}
        </section>
      )}

      {form.changeType === T.PUBLISH && (
        <section className="pc-section">
          <h3 className="pc-title">公開 / 非公開設定</h3>
          <table className="pc-table">
            <thead>
              <tr>
                <th>チャネル</th>
                {PUBLISH_STATUS_OPTIONS.map((o) => <th key={o}>{o}</th>)}
              </tr>
            </thead>
            <tbody>
              {PUBLISH_CHANNELS.map((ch) => (
                <tr key={ch}>
                  <td>{ch}</td>
                  {PUBLISH_STATUS_OPTIONS.map((o) => (
                    <td key={o} className="pc-center">
                      <input type="radio" name={`pub-${ch}`} checked={form.publish[ch] === o}
                        onChange={() => set({ publish: { ...form.publish, [ch]: o } })} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {form.changeType === T.STOCK && (
        <section className="pc-section">
          <h3 className="pc-title">在庫移動</h3>
          <div className="pc-note">販売数は移動前商品規格の販売種別で指定</div>
          <div className="pc-stock-box">
            {form.stockRows.map((r, i) => (
              <div className="pc-row" key={i}>
                <div className="pc-cell">
                  <div className="pc-label">はがす対象の商品規格ID</div>
                  <input className="inp pc-center" value={r.fromId}
                    onChange={(e) => updateRow('stockRows', i, { fromId: e.target.value })} />
                </div>
                <span className="pc-sep">→</span>
                <div className="pc-cell">
                  <div className="pc-label">移動する対象の商品規格ID</div>
                  <input className="inp pc-center pc-accent" value={r.toId}
                    onChange={(e) => updateRow('stockRows', i, { toId: e.target.value })} />
                </div>
                <div className="pc-cell pc-w-qty">
                  <div className="pc-label">販売数</div>
                  <input className="inp pc-center" type="number" min="0" value={r.qty}
                    onChange={(e) => updateRow('stockRows', i, { qty: e.target.value })} />
                </div>
                <button type="button" className="pc-del" onClick={() => removeRow('stockRows', i)}>×</button>
              </div>
            ))}
          </div>
          <button type="button" className="pc-add"
            onClick={() => addRow('stockRows', { fromId: '', toId: '', qty: '' })}>＋ 行を追加</button>
        </section>
      )}
    </div>
  )
}
