import React from 'react'
import Accordion from './Accordion.jsx'
import PostHistory from './PostHistory.jsx'
import FinanceSection from './FinanceSection.jsx'
import { BranchBar, branchCode } from './RecordHeader.jsx'
import { makeEmptyPriceInfo } from './fields.js'

// 案件明細（掲載履歴・価格情報）1:多
//   発注明細と同じ操作：「＋追加」で空行、「複製」で一番上の行を複製して一番上に追加
// props: rows, setRows, headerNo
export default function CasePostList({ rows, setRows, headerNo }) {
  const setRow = (i, next) => setRows(rows.map((r, idx) => (idx === i ? next : r)))
  const addEmpty = () => setRows([...rows, makeEmptyPriceInfo()])
  const duplicateTop = () => setRows([rows[0] ? structuredClone(rows[0]) : makeEmptyPriceInfo(), ...rows])
  const delRow = (i) => setRows(rows.filter((_, idx) => idx !== i))

  return (
    <Accordion
      title="案件明細（掲載履歴・価格情報）"
      defaultOpen={true}
      right={
        <>
          <button type="button" className="btn-plus" title="空行を追加" onClick={addEmpty}>＋ 追加</button>
          <button type="button" className="btn-mini" title="一番上の行を複製して追加" onClick={duplicateTop}>複製</button>
        </>
      }
    >
      {rows.length === 0 && <div className="empty">明細がありません。</div>}

      {rows.map((pi, i) => (
        <Accordion
          key={i}
          level="sub"
          defaultOpen={false}
          title={<><span className="branch-tag">明細 #{i + 1}</span>{pi.post.postName || ''}</>}
          right={<button type="button" className="btn-del" onClick={() => delRow(i)} disabled={rows.length <= 1}>削除</button>}
        >
          <BranchBar no={i + 1} code={branchCode(headerNo, i)} numberLabel="案件明細番号" codeLabel="案件番号" />
          {/* 上代〜試算。掲載履歴は「上代」の直下 */}
          <FinanceSection
            finance={pi.finance}
            onChange={(fin) => setRow(i, { ...pi, finance: fin })}
            afterGroups={{
              '上代': (
                <Accordion level="sub" defaultOpen={false} title="掲載履歴">
                  <PostHistory value={pi.post} onChange={(next) => setRow(i, { ...pi, post: next })} />
                </Accordion>
              ),
            }}
          />
        </Accordion>
      ))}
      <div className="fnote" style={{ marginTop: 6 }}>※「＋追加」で空行、「複製」で一番上の行を複製して追加します。</div>
    </Accordion>
  )
}
