import React, { useState } from 'react'
import Accordion from './Accordion.jsx'
import KGroup from './KGroup.jsx'
import Field from './Field.jsx'
import ProductInfo from './ProductInfo.jsx'
import CaseSpecInfo from './CaseSpecInfo.jsx'
import CasePostInfo from './CasePostInfo.jsx'
import CasePriceMatrix from './CasePriceMatrix.jsx'
import { makePriceInit } from './casePriceFields.js'
import CaseList from './CaseList.jsx'
import {
  makeEmptyProductInfo, makeEmptyProductAttr, productAttrFields,
  makeEmptySpecCommon, makeEmptySpec, makeEmptyPostHistory,
  makeEmptyCaseHead, caseTypeOptions, approvalFlowOptions, caseStatusOptions,
} from './fields.js'
import {
  CASE_LIST_INIT, makeEmptyCaseListRow, CURRENT_USER, COMPANY_BY_NAME, COMPANY_NAMES,
} from './caseListFields.js'
import { lookupCompanySpec } from './dummyData.js'
import './caseList.css'

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
    setRecords([{ ...records[i], recordNo: nextNo(), caseNo: '', createdAt: at, updatedAt: at, createdBy: CURRENT_USER }, ...records])
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
  // key でレコードごとに詳細の入力状態をリセット
  return <CaseDetail key={cur?.recordNo} rec={cur} onBack={() => setView('list')} />
}

// ------------------------------------------------------------
// 詳細：発注タブと同じ構成
//   ← 一覧に戻る ＋ 案件ヘッダー番号 ／ 企業名
//   ① 商品・商品規格情報（案件種別〜営業担当 → 基本情報 → 商品規格情報）
//   ② 掲載履歴（価格以外）
//   ③ 価格情報（チャネル別の1つの表）
//   ※表示時はすべて閉じた状態
//   ※必須・自動ラベルは一旦非表示（caseList.css の .case-detail で制御）
// ------------------------------------------------------------
const HEAD_FIELDS = [
  { key: 'caseType',     label: '案件種別',       type: 'select', options: caseTypeOptions },
  { key: 'approvalFlow', label: '承認フロー',     type: 'select', options: approvalFlowOptions },
  { key: 'caseStatus',   label: '案件ステータス', type: 'select', options: caseStatusOptions },
]

// 商品規格情報（案件に1つ）の初期値：旧共通 ＋ 旧明細の規格項目
const makeCaseSpec = (specCode = '') => {
  const { priceInfos, ...spec } = makeEmptySpec()
  return { ...makeEmptySpecCommon(), ...spec, specCode }
}

function CaseDetail({ rec, onBack }) {
  const headerNo = rec?.caseNo ? rec.caseNo.slice(0, 6) : ''

  const [caseHead, setCaseHead] = useState(() => ({
    ...makeEmptyCaseHead(),
    caseType: rec?.caseType || '',
    caseStatus: rec?.caseStatus || '',
    companyName: rec?.companyName || '',
    companyCode: COMPANY_BY_NAME[rec?.companyName] || '',
    salesRep: rec?.createdBy || CURRENT_USER, // 営業担当＝ログインユーザー（作成者）
  }))
  const [product, setProduct] = useState(() => ({ ...makeEmptyProductInfo(), janCode: rec?.janCode || '' }))
  const [attr, setAttr] = useState(makeEmptyProductAttr)
  const [spec, setSpec] = useState(() => {
    const s = makeCaseSpec(rec?.specId || '')
    const res = lookupCompanySpec(COMPANY_BY_NAME[rec?.companyName] || '')
    return res?.found ? { ...s, businessType: res.values.businessType, choppleType: res.values.choppleType } : s
  })
  // 掲載履歴（一覧の掲載開始日・募集開始日・提供数を初期表示）
  const [post, setPost] = useState(() => ({
    ...makeEmptyPostHistory(),
    postPeriodFrom: rec?.postStart || '',
    recruitPeriodFrom: rec?.recruitStart || '', recruitPeriodTo: '',
    provideCount: rec?.provideCount ?? '',
  }))
  const [price, setPrice] = useState(makePriceInit)

  const setHead = (k, val) => setCaseHead({ ...caseHead, [k]: val })
  const setAttrField = (k, val) => setAttr({ ...attr, [k]: val })

  // 企業名サジェスト → 企業コード自動。企業マスタにあれば業態区分・ちょっプル種別も自動
  const setCompanyName = (val) => {
    const code = COMPANY_BY_NAME[val] || ''
    setCaseHead({ ...caseHead, companyName: val, companyCode: code })
    const res = code ? lookupCompanySpec(code) : null
    setSpec((s) => ({
      ...s,
      businessType: res?.found ? res.values.businessType : '',
      choppleType: res?.found ? res.values.choppleType : '',
    }))
  }

  return (
    <div className="tab-panel case-detail">
      <div className="detail-back">
        <button type="button" className="btn-mini" onClick={onBack}>← 一覧に戻る</button>
        <span className="detail-rec">
          案件ヘッダー番号 {headerNo || '（新規・自動採番）'}{caseHead.companyName ? ` ／ ${caseHead.companyName}` : ''}
        </span>
      </div>

      {/* ① 商品・商品規格情報 */}
      <Accordion title="商品・商品規格情報" defaultOpen={false}>
        {/* 基本情報の上：案件種別・承認フロー・案件ステータス・企業コード・企業名・営業担当 */}
        <div className="grid2">
          {HEAD_FIELDS.map((f) => (
            <Field key={f.key} field={f} value={caseHead[f.key]} onChange={setHead} />
          ))}
          <Field field={{ key: 'companyCode', label: '企業コード', auto: true }} value={caseHead.companyCode} onChange={() => {}} />
          <div className="frow">
            <div className="flabel">企業名<span className="req">必須</span></div>
            <div className="fbody">
              <input className="inp" list="caseTabCompanyList" value={caseHead.companyName} placeholder="入力すると候補が表示されます"
                onChange={(e) => setCompanyName(e.target.value)} />
              <datalist id="caseTabCompanyList">{COMPANY_NAMES.map((o) => <option key={o} value={o} />)}</datalist>
            </div>
          </div>
          <Field field={{ key: 'salesRep', label: '営業担当', auto: true }} value={caseHead.salesRep} onChange={() => {}} />
        </div>

        <KGroup title="基本情報" defaultOpen={false}>
          {/* 商品情報 */}
          <ProductInfo value={product} onChange={setProduct} bare />

          {/* 商品属性情報 */}
          <div className="subhead">商品属性情報</div>
          <div className="grid2">
            {productAttrFields.map((f) => (
              <Field key={f.key} field={f} value={attr[f.key]} onChange={setAttrField} />
            ))}
          </div>
        </KGroup>

        <KGroup title="商品規格情報" defaultOpen={false}>
          <CaseSpecInfo value={spec} onChange={setSpec} />
        </KGroup>
      </Accordion>

      {/* ② 掲載履歴（価格以外） */}
      <Accordion title="掲載履歴" defaultOpen={false}>
        <CasePostInfo value={post} onChange={setPost} />
      </Accordion>

      {/* ③ 価格情報：チャネル別の1つの表 */}
      <Accordion title="価格情報" defaultOpen={false}>
        <CasePriceMatrix value={price} onChange={setPrice} />
      </Accordion>
    </div>
  )
}
