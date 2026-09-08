import React, { useState } from 'react'
import Accordion from './Accordion.jsx'
import { RecordHeader } from './RecordHeader.jsx'

const GROUP_NO = '000301'

export default function GroupTab() {
  const [groupName, setGroupName] = useState('')
  const [members, setMembers] = useState([{ specId: '' }])

  const setMember = (i, val) => setMembers(members.map((m, idx) => (idx === i ? { specId: val } : m)))
  const addMember = () => setMembers([...members, { specId: '' }])
  const delMember = (i) => setMembers(members.filter((_, idx) => idx !== i))

  return (
    <div className="tab-panel">
      <RecordHeader badge="グループ" label="グループ番号" no={GROUP_NO} />

      <Accordion title="グループ基本情報" defaultOpen={true}>
        <div className="frow">
          <div className="flabel">グループ名</div>
          <div className="fbody"><input className="inp" value={groupName} onChange={(e) => setGroupName(e.target.value)} /></div>
        </div>
      </Accordion>

      <Accordion title="グループ構成（商品規格ID）" defaultOpen={true}
        right={<button type="button" className="btn-plus" onClick={addMember}>＋ 商品規格IDを追加</button>}>
        <div className="fnote" style={{ marginBottom: 8 }}>グループに含める商品規格IDを選択してください（複数可）。</div>
        {members.map((m, i) => (
          <div className="caselink" key={i} style={{ gridTemplateColumns: '1fr auto' }}>
            <input className="inp" list="groupSpecIdList" value={m.specId} placeholder="例：20000001"
              onChange={(e) => setMember(i, e.target.value)} />
            <button type="button" className="btn-del" onClick={() => delMember(i)} disabled={members.length <= 1}>削除</button>
          </div>
        ))}
        <datalist id="groupSpecIdList">
          {['20000001', '20000002', '20000003', '20000004'].map((o) => <option key={o} value={o} />)}
        </datalist>
      </Accordion>

      <div className="fnote">※ グループタブの詳細項目は今後定義予定です。</div>
    </div>
  )
}
