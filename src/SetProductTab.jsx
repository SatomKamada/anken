import React, { useState } from 'react'
import Accordion from './Accordion.jsx'
import SpecCommon from './SpecCommon.jsx'
import SpecList from './SpecList.jsx'
import { RecordHeader } from './RecordHeader.jsx'
import { makeEmptySpecCommon, makeEmptySpec } from './fields.js'

const SET_NO = '000101'

export default function SetProductTab() {
  const [specCommon, setSpecCommon] = useState(makeEmptySpecCommon)
  const [specRows, setSpecRows] = useState(() => [makeEmptySpec()])
  const [members, setMembers] = useState([{ specId: '' }]) // セットにする商品規格ID（複数）

  const setMember = (i, val) => setMembers(members.map((m, idx) => (idx === i ? { specId: val } : m)))
  const addMember = () => setMembers([...members, { specId: '' }])
  const delMember = (i) => setMembers(members.filter((_, idx) => idx !== i))

  return (
    <div className="tab-panel">
      <RecordHeader badge="セット商品" label="セット商品番号" no={SET_NO} />

      {/* 注意書き（わかりやすく） */}
      <div className="callout warn">
        <span className="callout-icon">⚠</span>
        <div>
          <b>ちょっプル種別・温度帯・ドライアイスフラグが同一の商品規格同士のみ</b>を、セット商品として扱えます。
          <div className="callout-sub">異なる条件の商品規格は同一セットに登録できません。</div>
        </div>
      </div>

      {/* セット構成（商品規格ID・複数選択／プラスで増やす） */}
      <Accordion title="セット構成（商品規格ID）" defaultOpen={true}
        right={<button type="button" className="btn-plus" onClick={addMember}>＋ 商品規格IDを追加</button>}>
        <div className="fnote" style={{ marginBottom: 8 }}>セットにする商品規格IDを選択してください（複数可）。</div>
        {members.map((m, i) => (
          <div className="caselink" key={i} style={{ gridTemplateColumns: '1fr auto' }}>
            <input className="inp" list="specIdList" value={m.specId} placeholder="例：20000001"
              onChange={(e) => setMember(i, e.target.value)} />
            <button type="button" className="btn-del" onClick={() => delMember(i)} disabled={members.length <= 1}>削除</button>
          </div>
        ))}
        <datalist id="specIdList">
          {['20000001', '20000002', '20000003', '20000004'].map((o) => <option key={o} value={o} />)}
        </datalist>
      </Accordion>

      {/* 商品規格情報（共通）：案件タブと同様。ただし一部項目は非活性 */}
      <SpecCommon value={specCommon} onChange={setSpecCommon} defaultOpen={false} setMode />

      {/* 明細：案件タブと同様 */}
      <SpecList rows={specRows} setRows={setSpecRows} headerNo={SET_NO} />
    </div>
  )
}
