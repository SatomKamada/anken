import React from 'react'
import Accordion from './Accordion.jsx'
import Field from './Field.jsx'
import PostHistory from './PostHistory.jsx'
import { BranchBar, branchCode } from './RecordHeader.jsx'
import { specGroups, specTopFields, makeEmptySpec } from './fields.js'

const baseGroup    = specGroups.find((g) => g.title === '基本')
const lotteryGroup = specGroups.find((g) => g.title === '抽選')
const surveyGroup  = specGroups.find((g) => g.title === 'アンケート')

// 商品規格・掲載履歴（個別）明細（1:多）
// props: rows, setRows, headerNo（ヘッダー番号：枝番採番用）
export default function SpecList({ rows, setRows, headerNo }) {
  const updateRow = (i, next) => setRows(rows.map((r, idx) => (idx === i ? next : r)))
  const setField = (i, key, val) => updateRow(i, { ...rows[i], [key]: val })
  const setPostHistory = (i, ph) => updateRow(i, { ...rows[i], postHistory: ph })

  const duplicateLast = () => {
    const src = rows[rows.length - 1]
    const clone = src ? structuredClone(src) : makeEmptySpec()
    setRows([...rows, clone])
  }
  const addEmpty = () => setRows([...rows, makeEmptySpec()])
  const dupRow = (i) => {
    const clone = structuredClone(rows[i])
    setRows([...rows.slice(0, i + 1), clone, ...rows.slice(i + 1)])
  }
  const delRow = (i) => setRows(rows.filter((_, idx) => idx !== i))

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
        // 抽選・アンケート（掲載履歴のチャネル別価格の下に差し込む）
        const afterPrices = (
          <>
            <div className="fgroup">
              <div className="subhead">抽選</div>
              <div className="grid2">
                {lotteryGroup.fields.map((f) => (
                  <Field key={f.key} field={f} value={row[f.key]} onChange={(k, val) => setField(i, k, val)} />
                ))}
              </div>
            </div>
            <div className="fgroup">
              <div className="subhead">アンケート</div>
              <div className="grid2">
                {surveyGroup.fields.map((f) => (
                  <Field key={f.key} field={f} value={row[f.key]} onChange={(k, val) => setField(i, k, val)} />
                ))}
              </div>
            </div>
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
            {/* 枝番（自動採番） */}
            <BranchBar no={i + 1} code={code} numberLabel="案件明細番号" codeLabel="案件番号" />

            <div className="fgroup">
              {/* 商品規格コード（先頭） */}
              <div className="frow">
                <div className="flabel">商品規格コード</div>
                <div className="fbody">
                  <input className="inp" value={row.specCode} onChange={(e) => setField(i, 'specCode', e.target.value)} placeholder="共通の参照で仮入力されます" />
                </div>
              </div>

              {/* 規格区分・販売形態・販売数（縦並び） */}
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

            {/* 掲載履歴（内部に抽選・アンケートをチャネル別価格の下で表示） */}
            <PostHistory value={row.postHistory} onChange={(ph) => setPostHistory(i, ph)} afterPrices={afterPrices} />
          </Accordion>
        )
      })}
    </Accordion>
  )
}
