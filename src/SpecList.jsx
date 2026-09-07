import React from 'react'
import Accordion from './Accordion.jsx'
import Field from './Field.jsx'
import PostHistory from './PostHistory.jsx'
import FinanceSection from './FinanceSection.jsx'
import { BranchBar, branchCode } from './RecordHeader.jsx'
import { specGroups, specTopFields, makeEmptySpec, makeEmptyPriceInfo } from './fields.js'

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

  // 掲載履歴・価格情報（バンドル：finance ＋ post。丸ごと複製）
  const setPi = (i, pi, next) => {
    const list = rows[i].priceInfos.map((b, idx) => (idx === pi ? next : b))
    updateRow(i, { ...rows[i], priceInfos: list })
  }
  const addPi = (i) => updateRow(i, { ...rows[i], priceInfos: [...rows[i].priceInfos, makeEmptyPriceInfo()] })
  const dupPi = (i, pi) => {
    const list = rows[i].priceInfos
    const clone = structuredClone(list[pi]) // finance＋postを丸ごと複製
    updateRow(i, { ...rows[i], priceInfos: [...list.slice(0, pi + 1), clone, ...list.slice(pi + 1)] })
  }
  const delPi = (i, pi) => updateRow(i, { ...rows[i], priceInfos: rows[i].priceInfos.filter((_, idx) => idx !== pi) })

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

            {/* 掲載履歴・価格情報（複製単位：上代〜試算＋掲載履歴を丸ごと複製） */}
            <div className="subhead">
              掲載履歴・価格情報
              <button type="button" className="btn-plus" onClick={() => addPi(i)}>＋ 掲載履歴・価格情報を追加</button>
            </div>
            {row.priceInfos.map((pi, k) => (
              <Accordion
                key={k}
                level="sub"
                defaultOpen={false}
                title={`掲載履歴・価格情報 #${k + 1}${pi.post.postName ? ' / ' + pi.post.postName : ''}`}
                right={
                  <>
                    <button type="button" className="btn-mini" onClick={() => dupPi(i, k)}>複製</button>
                    <button type="button" className="btn-del" onClick={() => delPi(i, k)} disabled={row.priceInfos.length <= 1}>削除</button>
                  </>
                }
              >
                {/* 上代〜試算。掲載履歴は「上代」の直下に差し込む（単体複製なし） */}
                <FinanceSection
                  finance={pi.finance}
                  onChange={(fin) => setPi(i, k, { ...pi, finance: fin })}
                  afterGroups={{
                    '上代': (
                      <Accordion level="sub" defaultOpen={false} title="掲載履歴 #1">
                        <PostHistory value={pi.post} onChange={(next) => setPi(i, k, { ...pi, post: next })} />
                      </Accordion>
                    ),
                  }}
                />
              </Accordion>
            ))}
          </Accordion>
        )
      })}
    </Accordion>
  )
}
