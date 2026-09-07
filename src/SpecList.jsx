import React from 'react'
import Accordion from './Accordion.jsx'
import Field from './Field.jsx'
import PostHistory from './PostHistory.jsx'
import FinanceSection from './FinanceSection.jsx'
import { BranchBar, branchCode } from './RecordHeader.jsx'
import { specGroups, specTopFields, makeEmptySpec, makeEmptyPostHistory } from './fields.js'

const baseGroup = specGroups.find((g) => g.title === '基本')

// 商品規格・掲載履歴（個別）明細（1:多）
// props: rows, setRows, headerNo（ヘッダー番号：枝番採番用）
export default function SpecList({ rows, setRows, headerNo }) {
  const updateRow = (i, next) => setRows(rows.map((r, idx) => (idx === i ? next : r)))
  const setField = (i, key, val) => updateRow(i, { ...rows[i], [key]: val })

  const duplicateLast = () => {
    const src = rows[rows.length - 1]
    setRows([...rows, src ? structuredClone(src) : makeEmptySpec()])
  }
  const addEmpty = () => setRows([...rows, makeEmptySpec()])
  const dupRow = (i) => {
    const clone = structuredClone(rows[i])
    setRows([...rows.slice(0, i + 1), clone, ...rows.slice(i + 1)])
  }
  const delRow = (i) => setRows(rows.filter((_, idx) => idx !== i))

  // 掲載履歴（複製可）
  const setPh = (i, pi, ph) => {
    const list = rows[i].postHistories.map((p, idx) => (idx === pi ? ph : p))
    updateRow(i, { ...rows[i], postHistories: list })
  }
  const dupPh = (i, pi) => {
    const list = rows[i].postHistories
    const clone = structuredClone(list[pi])
    updateRow(i, { ...rows[i], postHistories: [...list.slice(0, pi + 1), clone, ...list.slice(pi + 1)] })
  }
  const addPh = (i) => updateRow(i, { ...rows[i], postHistories: [...rows[i].postHistories, makeEmptyPostHistory()] })
  const delPh = (i, pi) => updateRow(i, { ...rows[i], postHistories: rows[i].postHistories.filter((_, idx) => idx !== pi) })

  const setFinance = (i, fin) => updateRow(i, { ...rows[i], finance: fin })

  return (
    <Accordion
      title="商品規格・掲載履歴（個別）［明細］"
      defaultOpen={false}
      right={
        <>
          <button type="button" className="btn-plus" title="直前の行を複製して追加" onClick={duplicateLast}>＋ 複製追加</button>
          <button type="button" className="btn-mini" onClick={addEmpty}>空行追加</button>
        </>
      }
    >
      {rows.length === 0 && <div className="empty">行がありません。「＋ 複製追加」または「空行追加」で明細を追加してください。</div>}

      {rows.map((row, i) => {
        const code = branchCode(headerNo, i)
        const title = (
          <>
            <span className="branch-tag">明細 #{i + 1}</span>
            {row.specCode || '（規格コード未設定）'}{row.specProductName ? ' / ' + row.specProductName : ''}
          </>
        )
        return (
          <Accordion
            key={i}
            level="sub"
            defaultOpen={false}
            title={title}
            right={
              <>
                <button type="button" className="btn-mini" onClick={() => dupRow(i)}>この行を複製</button>
                <button type="button" className="btn-del" onClick={() => delRow(i)}>削除</button>
              </>
            }
          >
            <BranchBar no={i + 1} code={code} numberLabel="案件明細番号" codeLabel="案件番号" />

            <div className="fgroup">
              <div className="frow">
                <div className="flabel">商品規格コード</div>
                <div className="fbody">
                  <input className="inp" value={row.specCode} onChange={(e) => setField(i, 'specCode', e.target.value)} placeholder="共通の参照で仮入力されます" />
                </div>
              </div>
              <div className="vstack">
                {specTopFields.map((f) => (
                  <Field key={f.key} field={f} value={row[f.key]} onChange={(k, val) => setField(i, k, val)} />
                ))}
              </div>
            </div>

            {/* 基本 */}
            <div className="fgroup">
              <div className="subhead">{baseGroup.title}</div>
              <div className="grid2">
                {baseGroup.fields.map((f) => (
                  <Field key={f.key} field={f} value={row[f.key]} onChange={(k, val) => setField(i, k, val)} />
                ))}
              </div>
            </div>

            {/* 掲載履歴の上：財務系分類（上代・変動費〜試算） */}
            <FinanceSection finance={row.finance} onChange={(fin) => setFinance(i, fin)} />

            {/* 掲載履歴（複製可・抽選/アンケートを内包） */}
            <Accordion
              level="sub"
              defaultOpen={false}
              title={`掲載履歴（${row.postHistories.length}件）`}
              right={<button type="button" className="btn-plus" onClick={() => addPh(i)}>＋ 掲載履歴を追加</button>}
            >
              {row.postHistories.map((ph, pi) => (
                <Accordion
                  key={pi}
                  level="sub"
                  defaultOpen={false}
                  title={`掲載履歴 #${pi + 1}${ph.postName ? ' / ' + ph.postName : ''}`}
                  right={
                    <>
                      <button type="button" className="btn-mini" onClick={() => dupPh(i, pi)}>複製</button>
                      <button type="button" className="btn-del" onClick={() => delPh(i, pi)} disabled={row.postHistories.length <= 1}>削除</button>
                    </>
                  }
                >
                  <PostHistory value={ph} onChange={(next) => setPh(i, pi, next)} />
                </Accordion>
              ))}
            </Accordion>
          </Accordion>
        )
      })}
    </Accordion>
  )
}
