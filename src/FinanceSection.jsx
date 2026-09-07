import React from 'react'
import Accordion from './Accordion.jsx'
import { financeGroups } from './caseFinanceFields.js'

// 財務系分類（掲載履歴の下）
// props: finance(object: {group:{label:val}}), onChange(nextFinance)
export default function FinanceSection({ finance, onChange }) {
  const get = (grp, label) => (finance[grp] && finance[grp][label]) || ''
  const set = (grp, label, val) => onChange({ ...finance, [grp]: { ...(finance[grp] || {}), [label]: val } })

  return (
    <>
      {financeGroups.map((g) => (
        <Accordion key={g.title} level="sub" defaultOpen={false} title={g.title}>
          {g.sections.map((sec, si) => (
            <div className="fgroup" key={si}>
              {sec.title && <div className="subhead">{sec.title}</div>}
              {sec.type === 'matrix'
                ? <ChannelMatrix sec={sec} get={(l) => get(g.title, l)} set={(l, v) => set(g.title, l, v)} />
                : (
                  <div className="grid2">
                    {sec.fields.map((f) => (
                      <FinField key={f.label} f={f} val={get(g.title, f.label)} onChange={(v) => set(g.title, f.label, v)} />
                    ))}
                  </div>
                )}
            </div>
          ))}
        </Accordion>
      ))}
    </>
  )
}

// チャネル列 × 指標行の汎用マトリクス
function ChannelMatrix({ sec, get, set }) {
  const suffix = sec.suffix || ''
  return (
    <div className="umatrix" style={{ gridTemplateColumns: `repeat(${sec.columns.length}, minmax(0,1fr))` }}>
      {sec.columns.map((col) => (
        <div className="ucol" key={col.head}>
          <div className="ucol-head">{col.head}</div>
          {sec.rows.map((cells, ri) => (
            <div className="urow" key={ri}>
              {cells.map((cell) => {
                const label = col.prefix + cell.metric + suffix
                return (
                  <div className="ucell" key={cell.metric}>
                    <div className="ucell-label">{cell.metric}</div>
                    <Adorned kind={cell.kind} val={get(label)} onChange={(v) => set(label, v)} />
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function Adorned({ kind, val, onChange }) {
  if (kind === 'percent') {
    return <div className="pct-wrap"><input className="inp" type="number" value={val} onChange={(e) => onChange(e.target.value)} /><span className="pct">%</span></div>
  }
  if (kind === 'money') {
    return <div className="yen-wrap"><span className="yen">¥</span><input className="inp" type="number" value={val} onChange={(e) => onChange(e.target.value)} /></div>
  }
  if (kind === 'text') {
    return <input className="inp" value={val} onChange={(e) => onChange(e.target.value)} />
  }
  return <input className="inp" type="number" value={val} onChange={(e) => onChange(e.target.value)} />
}

function FinField({ f, val, onChange }) {
  return (
    <div className="frow">
      <div className="flabel">{f.label}</div>
      <div className="fbody"><Adorned kind={f.kind} val={val} onChange={onChange} /></div>
    </div>
  )
}
