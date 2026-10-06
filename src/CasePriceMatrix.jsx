import React, { useState } from 'react'
import { PRICE_CHANNELS, PRICE_SECTIONS, cellName, fmtPrice } from './casePriceFields.js'

// 案件：価格情報（1つの表）
//   列＝チャネル＋合計、行＝販売価格 → 売上 → 変動費 → 利益（損益の流れ）
//   どのチャネルでいくら売り、変動費がいくらで、利益がいくらかを1画面で確認
//   全チャネル共通の項目（基準価格・仕入、物流費内訳）は下段（初期は折りたたみ）
// props: value({ [rowKey]: { [channel|'total'|'common']: value } }), onChange(next)
const COLS = [...PRICE_CHANNELS, 'total']

export default function CasePriceMatrix({ value, onChange }) {
  const [open, setOpen] = useState(() => Object.fromEntries(PRICE_SECTIONS.map((s) => [s.title, !!s.open])))
  const get = (k, c) => value[k]?.[c] ?? ''
  const set = (k, c, v) => onChange({ ...value, [k]: { ...(value[k] || {}), [c]: v } })

  const input = (row, col) => {
    const v = get(row.key, col)
    if (row.calc) {
      const neg = typeof v === 'number' && v < 0
      return <span className={'pm-val' + (neg ? ' pm-neg' : '')}>{fmtPrice(row.kind, v)}</span>
    }
    if (row.kind === 'check') {
      return <input type="checkbox" checked={!!v} onChange={(e) => set(row.key, col, e.target.checked)} />
    }
    const isNum = row.kind !== 'text'
    return (
      <div className={'pm-inp-wrap' + (row.kind === 'money' ? ' pm-yen' : row.kind === 'pct' ? ' pm-pct' : '')}>
        <input className="cell-inp pm-inp" type={isNum ? 'number' : 'text'} value={v}
          onChange={(e) => set(row.key, col, isNum && e.target.value !== '' ? Number(e.target.value) : e.target.value)} />
      </div>
    )
  }

  return (
    <div className="ktable-scroll">
      <table className="ktable pm-table">
        <thead>
          <tr>
            <th className="pm-item">項目</th>
            {PRICE_CHANNELS.map((c) => <th key={c}>{c}</th>)}
            <th className="pm-total">合計</th>
          </tr>
        </thead>
        {PRICE_SECTIONS.map((sec) => (
          <tbody key={sec.title}>
            <tr className={'pm-sec' + (sec.common ? ' common' : '') + (sec.profit ? ' profit' : '')}
              onClick={() => setOpen({ ...open, [sec.title]: !open[sec.title] })}>
              <td colSpan={COLS.length + 1}>
                <span className="pm-caret">{open[sec.title] ? '▽' : '▷'}</span>{sec.title}
              </td>
            </tr>
            {open[sec.title] && sec.rows.map((row) => (
              <tr key={row.key} className={(row.strong ? 'pm-strong' : '') + (row.sub ? ' pm-sub' : '') + (sec.profit ? ' pm-profit' : '')}>
                <td className="pm-item">{row.label}</td>
                {sec.common ? (
                  <td colSpan={COLS.length} className={'pm-cell pm-common' + (row.calc ? ' calc' : '')} title={cellName(sec, row, 'common')}>
                    {input(row, 'common')}
                  </td>
                ) : (
                  COLS.map((col) => {
                    const name = cellName(sec, row, col)
                    if (!name) return <td key={col} className={'pm-cell pm-na' + (col === 'total' ? ' pm-total' : '')}>—</td>
                    return (
                      <td key={col} title={name}
                        className={'pm-cell' + (row.calc ? ' calc' : '') + (col === 'total' ? ' pm-total' : '')}>
                        {input(row, col)}
                      </td>
                    )
                  })
                )}
              </tr>
            ))}
          </tbody>
        ))}
      </table>
      <div className="fnote" style={{ marginTop: 6 }}>
        ※ グレーの値は計算項目（表示のみ・モックのためダミー値）。「—」は該当項目なし。セルにカーソルを当てると現行kintoneの項目名を表示します。
      </div>
    </div>
  )
}
