import React from 'react'
import Accordion from './Accordion.jsx'
import { financeGroups, unitMatrixChannels, unitMatrixRows } from './caseFinanceFields.js'

// 財務系分類（掲載履歴の下）
// props: finance(object: {group:{label:val}}), onChange(nextFinance)
export default function FinanceSection({ finance, onChange }) {
  const get = (grp, label) => (finance[grp] && finance[grp][label]) || ''
  const set = (grp, label, val) => {
    onChange({ ...finance, [grp]: { ...(finance[grp] || {}), [label]: val } })
  }

  return (
    <>
      {financeGroups.map((g) => (
        <Accordion key={g.title} level="sub" defaultOpen={false} title={g.title}>
          {g.matrix
            ? <UnitMatrix get={get} set={set} grp={g.title} />
            : (
              <div className="grid2">
                {g.fields.map((f) => (
                  <FinField key={f.label} f={f} val={get(g.title, f.label)} onChange={(v) => set(g.title, f.label, v)} />
                ))}
              </div>
            )}
        </Accordion>
      ))}
    </>
  )
}

// 新収益構造_単価：チャネル列 × 指標行のマトリクス（添付画像準拠）
function UnitMatrix({ get, set, grp }) {
  return (
    <div className="umatrix">
      {unitMatrixChannels.map((ch) => (
        <div className="ucol" key={ch}>
          <div className="ucol-head">{ch}</div>
          {unitMatrixRows.map((row) => {
            const amtLabel = ch + row.metric
            const rateLabel = ch + (row.rateLabel || (row.metric + '率'))
            return (
              <div className="urow" key={row.metric}>
                <div className="ucell">
                  <div className="ucell-label">{amtLabel}</div>
                  <div className="yen-wrap"><span className="yen">¥</span>
                    <input className="inp" type="number" value={get(grp, amtLabel)} onChange={(e) => set(grp, amtLabel, e.target.value)} />
                  </div>
                </div>
                {row.rate && (
                  <div className="ucell">
                    <div className="ucell-label">{rateLabel}</div>
                    <div className="pct-wrap">
                      <input className="inp" type="number" value={get(grp, rateLabel)} onChange={(e) => set(grp, rateLabel, e.target.value)} />
                      <span className="pct">%</span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

function FinField({ f, val, onChange }) {
  let input
  if (f.kind === 'text') {
    input = <input className="inp" value={val} onChange={(e) => onChange(e.target.value)} />
  } else if (f.kind === 'percent') {
    input = <div className="pct-wrap"><input className="inp" type="number" value={val} onChange={(e) => onChange(e.target.value)} /><span className="pct">%</span></div>
  } else if (f.kind === 'money') {
    input = <div className="yen-wrap"><span className="yen">¥</span><input className="inp" type="number" value={val} onChange={(e) => onChange(e.target.value)} /></div>
  } else {
    input = <input className="inp" type="number" value={val} onChange={(e) => onChange(e.target.value)} />
  }
  return (
    <div className="frow">
      <div className="flabel">{f.label}</div>
      <div className="fbody">{input}</div>
    </div>
  )
}
