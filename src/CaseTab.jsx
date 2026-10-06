import React, { useState } from 'react'
import Accordion from './Accordion.jsx'
import ProductInfo from './ProductInfo.jsx'
import SpecCommon from './SpecCommon.jsx'
import SpecList from './SpecList.jsx'
import { RecordHeader } from './RecordHeader.jsx'
import CaseList from './CaseList.jsx'
import { CASE_LIST_INIT, makeEmptyCaseListRow } from './caseListFields.js'
import './caseList.css'
import {
  makeEmptyProductInfo, makeEmptyProductAttr, productAttrFields,
  makeEmptySalesForm, salesFormRows, makeEmptySpecCommon, makeEmptySpec,
  makeEmptyCaseHead, caseTypeOptions, approvalFlowOptions, caseStatusOptions,
} from './fields.js'

// 案件ヘッダー番号（自動採番のダミー・連番のみ）
const CASE_NO = '000045'

const nowStr = () => {
  const d = new Date(), z = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())} ${z(d.getHours())}:${z(d.getMinutes())}`
}

// 案件タブ：最初は一覧（検索画面）→ 行頭アイコンで詳細
export default function CaseTab() {
  const [view, setView] = useState('list')
  const [records, setRecords] = useState(CASE_LIST_INIT)
  const [cur, setCur] = useState(null)

  const nextNo = () => String(Math.max(0, ...records.map((r) => Number(r.recordNo) || 0)) + 1)
  const add = () => {
    const r = makeEmptyCaseListRow(nextNo(), nowStr())
    setRecords([r, ...records]); setCur(r); setView('detail')
  }
  const duplicate = (i) => {
    const at = nowStr()
    setRecords([{ ...records[i], recordNo: nextNo(), caseNo: '', createdAt: at, updatedAt: at, createdBy: '営業担当A' }, ...records])
  }
  const remove = (i) => setRecords(records.filter((_, idx) => idx !== i))

  if (view === 'list') {
    return (
      <div className="tab-panel">
        <CaseList records={records} onOpen={(i) => { setCur(records[i]); setView('detail') }}
          onAdd={add} onDuplicate={duplicate} onDelete={remove} />
      </div>
    )
  }

  return (
    <div className="tab-panel">
      <div className="detail-back">
        <button type="button" className="btn-mini" onClick={() => setView('list')}>← 一覧に戻る</button>
        {cur && <span className="detail-rec">レコード番号 {cur.recordNo}{cur.caseName ? ` ／ ${cur.caseName}` : ''}</span>}
      </div>
      {/* key でレコードごとに詳細の入力状態をリセット */}
      <CaseDetail key={cur?.recordNo} rec={cur} />
    </div>
  )
}

// ------------------------------------------------------------
// 詳細（従来の案件画面）
//   一覧から開いたレコードの 案件ヘッダー番号・案件種別・案件ステータス・JAN を初期表示
// ------------------------------------------------------------
function CaseDetail({ rec }) {
  const headerNo = rec?.caseNo ? rec.caseNo.slice(0, 6) : CASE_NO
  const [caseHead, setCaseHead] = useState(() => ({
    ...makeEmptyCaseHead(), caseType: rec?.caseType || '', caseStatus: rec?.caseStatus || '',
  }))
  const [product, setProduct] = useState(() => ({ ...makeEmptyProductInfo(), janCode: rec?.janCode || '' }))
  const [attr, setAttr] = useState(makeEmptyProductAttr)
  const [salesForm, setSalesForm] = useState(makeEmptySalesForm)
  const [specCommon, setSpecCommon] = useState(makeEmptySpecCommon)
  const [specRows, setSpecRows] = useState(() => [makeEmptySpec()])

  // 共通の参照ボタン押下 → 個別明細（基本）へ仮入力
  const seedSpec = (seed) => {
    setSpecRows((rows) => {
      if (rows.length === 0) {
        const r = makeEmptySpec()
        return [{ ...r, ...seed }]
      }
      return rows.map((r, idx) => (idx === 0 ? { ...r, ...seed } : r))
    })
  }

  const setAttrField = (k, val) => setAttr({ ...attr, [k]: val })
  const setSF = (key, patch) => setSalesForm({ ...salesForm, [key]: { ...salesForm[key], ...patch } })

  return (
    <div className="tab-panel">
      {/* 最上部：基本情報番号（1件・自動採番） */}
      <RecordHeader badge="基本情報" label="案件ヘッダー番号" no={headerNo} />

      {/* 基本情報の上（アコーディオンなし）：案件種別・各種フラグ */}
      <div className="fgroup casehead">
        <div className="frow">
          <div className="flabel">案件種別</div>
          <div className="fbody">
            <select className="inp" value={caseHead.caseType} onChange={(e) => setCaseHead({ ...caseHead, caseType: e.target.value })}>
              <option value="">選択してください</option>
              {caseTypeOptions.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <div className="frow">
          <div className="flabel">承認フロー</div>
          <div className="fbody">
            <select className="inp" value={caseHead.approvalFlow} onChange={(e) => setCaseHead({ ...caseHead, approvalFlow: e.target.value })}>
              <option value="">選択してください</option>
              {approvalFlowOptions.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <div className="frow">
          <div className="flabel">案件ステータス</div>
          <div className="fbody">
            <select className="inp" value={caseHead.caseStatus} onChange={(e) => setCaseHead({ ...caseHead, caseStatus: e.target.value })}>
              <option value="">選択してください</option>
              {caseStatusOptions.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ① 基本情報（商品情報＋商品属性情報＋商品規格設定＋商品規格情報（共通）を統合） */}
      <Accordion title="基本情報" defaultOpen={false}>
        {/* 商品情報 */}
        <ProductInfo value={product} onChange={setProduct} bare />

        {/* 商品属性情報 */}
        <div className="subhead lead">商品属性情報</div>
        <div className="grid2">
          {productAttrFields.map((f) => (
            <div className="frow" key={f.key}>
              <div className="flabel">{f.label}</div>
              <div className="fbody">
                {f.type === 'checkbox' ? (
                  <label className="chk-inline"><input type="checkbox" checked={!!attr[f.key]} onChange={(e) => setAttrField(f.key, e.target.checked)} /><span>{f.boolLabel || 'ON'}</span></label>
                ) : (
                  <input className="inp" value={attr[f.key] ?? ''} onChange={(e) => setAttrField(f.key, e.target.value)} />
                )}
              </div>
            </div>
          ))}
        </div>
        {/* プロモーション説明（新規作成フラグON時のみ活性・100字程度） */}
        <div className="frow">
          <div className="flabel">プロモーション説明</div>
          <div className="fbody">
            <textarea className="inp" rows={3} maxLength={120} disabled={!attr.newFlag}
              placeholder={attr.newFlag ? '100字程度で入力' : '新規作成フラグをONにすると入力できます'}
              value={attr.promoDesc || ''} onChange={(e) => setAttrField('promoDesc', e.target.value)} />
            {attr.newFlag && <div className="fnote">{(attr.promoDesc || '').length} / 120</div>}
          </div>
        </div>

        {/* 商品規格設定 */}
        <div className="subhead lead">商品規格設定</div>
        <table className="ptable">
          <thead><tr><th>販売形態</th><th>利用</th><th>上限数</th></tr></thead>
          <tbody>
            {salesFormRows.map((sf) => (
              <tr key={sf.key}>
                <td className="pch">{sf.label}</td>
                <td className="tc"><input type="checkbox" checked={salesForm[sf.key].enabled} onChange={(e) => setSF(sf.key, { enabled: e.target.checked })} /></td>
                <td><input className="inp" type="number" value={salesForm[sf.key].limit} disabled={!salesForm[sf.key].enabled} onChange={(e) => setSF(sf.key, { limit: e.target.value })} /></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 商品規格情報（共通） */}
        <SpecCommon value={specCommon} onChange={setSpecCommon} onSeedSpec={seedSpec} bare />
      </Accordion>

      {/* ② 明細（商品規格・掲載履歴＝明細、枝番を自動採番） */}
      <SpecList rows={specRows} setRows={setSpecRows} headerNo={headerNo} />
    </div>
  )
}
