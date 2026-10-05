import React, { useState, useEffect } from 'react'
import Accordion from './Accordion.jsx'
import KGroup from './KGroup.jsx'
import OrderList from './OrderList.jsx'
import Field from './Field.jsx'
import { branchCode } from './RecordHeader.jsx'
import {
  orderHeaderGroups, makeEmptyOrderHeader,
  orderDetailGroups, makeEmptyOrderDetail,
} from './orderFields.js'
import { lookupOrderDetailByProduct, lookupCaseProduct, lookupCompany } from './dummyData.js'

const COMPANY_BY_NAME = {
  '花王株式会社': '001', 'よつ葉乳業': '002', '△△食品': '003',
  '路興商事株式会社': '6281', 'コンフェックス株式会社': '2576', '株式会社八天堂': '6318',
  'DKSHジャパン株式会社': '4749', '小林製薬株式会社': '34', 'ラブリー・ペット商会': '3726', '株式会社ライフブリッジ': '5833',
  '株式会社クレイツ': '5679', '株式会社ミライスビー': '5583', 'サンコー株式会社': '5380', '株式会社QUADS': '4892',
}
const COMPANY_NAMES = Object.keys(COMPANY_BY_NAME)

// 明細の全項目（表の列）。発注番号（枝番）Max No は枝番で表現するため除外。
const RAW_DETAIL_COLS = orderDetailGroups.flatMap((g) => g.fields).filter((f) => !['branchMaxNo', 'saleType', 'stockLinkFlag', 'bestBeforeType'].includes(f.key))
const DETAIL_COLS = []
for (const f of RAW_DETAIL_COLS) {
  if (f.key === 'attrCode') {
    DETAIL_COLS.push({ key: 'saleType', label: '規格区分', type: 'select', options: ['通常','わけあり（B品）','わけあり（期限）','抽選・発送あり','抽選・発送なし','先着・発送あり','先着・発送なし','イベント・発送あり','イベント・発送なし','代品','初試し','企画1','企画2','企画3'] })
    DETAIL_COLS.push({ key: 'stockLinkFlag', label: '在庫自動紐づけフラグ', type: 'select', options: ['ON', 'OFF'] })
    DETAIL_COLS.push({ ...f, required: true })
  } else if (f.key === 'bestBeforeDate') {
    DETAIL_COLS.push({ key: 'bestBeforeType', label: '期限種別', type: 'select', options: ['賞味期限', '消費期限', '製造日', 'なし'] })
    DETAIL_COLS.push(f)
  } else {
    DETAIL_COLS.push(f)
  }
}

const IS_NEW_ITEM = (k) => ['caseNo', 'saleType', 'stockLinkFlag', 'attrCode', 'bestBeforeType'].includes(k);

export default function OrderTab() {
  const [view, setView] = useState('list')   // list（検索一覧）/ detail（詳細入力）
  const [selected, setSelected] = useState(null)
  const [header, setHeader] = useState(makeEmptyOrderHeader)
  const [rows, setRows] = useState(() => [{ ...makeEmptyOrderDetail(), branchNo: '001' }])

  // 選択レコードが切り替わった時にヘッダー情報を同期
  useEffect(() => {
    if (selected) {
      setHeader((prev) => ({ ...prev, ...selected }))
    }
  }, [selected])

  const setHeaderField = (k, val) => setHeader({ ...header, [k]: val })

  const updateRow = (i, next) => setRows(rows.map((r, idx) => (idx === i ? next : r)))
  const setRowField = (i, key, val) => updateRow(i, { ...rows[i], [key]: val })

  const nextBranch = () => String(rows.length + 1).padStart(3, '0')
  // 追加：空行を追加
  const addEmpty = () => setRows([...rows, { ...makeEmptyOrderDetail(), branchNo: nextBranch() }])
  // 複製：一番上の行を複製し、一番上に追加
  const duplicateTop = () => {
    const src = rows[0]
    const clone = src ? structuredClone(src) : makeEmptyOrderDetail()
    clone.branchNo = nextBranch()
    setRows([clone, ...rows])
  }

  // 明細の参照ボタン（JAN→商品マスタ / 案件番号→案件に紐づく商品情報）
  const refDetail = (i, mode) => {
    const r = rows[i]
    if (mode === 'case') {
      const res = lookupCaseProduct(r.caseNo)
      if (!res.found) { alert(`案件番号に該当なし（${r.caseNo || '未入力'}）。ダミー：000045 / 000046 / 000047`); return }
      updateRow(i, { ...r, ...res.values })
      return
    }
    const res = lookupOrderDetailByProduct({ productCode: mode === 'product' ? r.productCode : '', janCode: mode === 'jan' ? r.janCode : '' })
    if (!res.found) { alert('JANコードに該当なし。手動入力してください。'); return }
    updateRow(i, { ...r, ...res.values })
  }

  // 明細セル描画（鍵以外は編集可・参照ボタン付き）
  const cell = (f, row, i) => {
    if (f.auto) return <input className="cell-inp ro" readOnly value={row[f.key] ?? ''} title="自動" />
    if (f.type === 'checkbox') return <input type="checkbox" checked={!!row[f.key]} onChange={(e) => setRowField(i, f.key, e.target.checked)} />
    // 案件番号：コード入力→Enterで確定・自動入力（参照ボタン不要）
    if (f.key === 'caseNo') {
      return (
        <input className="cell-inp" value={row.caseNo ?? ''} placeholder="コード入力→Enter"
          onChange={(e) => setRowField(i, 'caseNo', e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); const res = lookupCaseProduct(rows[i].caseNo); if (res.found) updateRow(i, { ...rows[i], ...res.values }) } }} />
      )
    }
    let inp
    if (f.type === 'select') {
      inp = (
        <select className="cell-inp" value={row[f.key] || ''} onChange={(e) => setRowField(i, f.key, e.target.value)}>
          <option value=""></option>
          {f.options.map((o) => <option key={o}>{o}</option>)}
        </select>
      )
    } else {
      inp = <input className="cell-inp" type={f.type === 'date' ? 'date' : f.type === 'number' ? 'number' : 'text'} value={row[f.key] ?? ''} onChange={(e) => setRowField(i, f.key, e.target.value)} />
    }
    if (f.reflink) {
      if (f.reflink === 'jan' || f.key === 'janCode') return inp;
      return <div className="cell-ref">{inp}<button type="button" className="btn-ref sm" onClick={() => refDetail(i, f.reflink)}>参照</button></div>
    }
    return inp
  }

  // 発注タブを開くと最初は一覧（検索結果の表）を表示
  const openDetail = (rec) => {
    setSelected(rec)
    const items = (rec.items && rec.items.length) ? rec.items.map((x) => structuredClone(x)) : [{ ...makeEmptyOrderDetail(), branchNo: '001' }]
    setRows(items)
    setView('detail')
  }
  if (view === 'list') {
    return (
      <div className="tab-panel">
        <OrderList onOpen={openDetail} />
      </div>
    )
  }

  return (
    <div className="tab-panel">
      <div className="detail-back">
        <button type="button" className="btn-mini" onClick={() => setView('list')}>← 一覧に戻る</button>
        {selected && <span className="detail-rec">発注ヘッダー番号 {selected.orderNo || selected.recordNo} ／ {selected.client}</span>}
      </div>

      {/* ① 基本情報（分類はサブ見出しで統合／最上位分類はラベル非表示） */}
      <Accordion title="発注ヘッダー情報" defaultOpen={false}>
        {orderHeaderGroups.map((g, gi) => (
          <KGroup key={g.title || `g${gi}`} title={g.title || '基本情報'} defaultOpen={true}>
            <div className="grid2">
              {g.fields.map((f) => {
                if (f.key === 'orderNo') return null; // ヘッダー番号は不要
                
                if (f.key === 'companyId') {
                  const modF = { ...f, auto: true }; // 企業コードは手動入力不可
                  return <Field key={f.key} field={modF} value={header[f.key]} onChange={setHeaderField} />
                }
                if (f.key === 'client' || f.key === 'companyName') {
                  // 企業名サジェストと連動
                  return (
                    <div className="frow" key={f.key}>
                      <div className="flabel">{f.label}{f.required && <span className="req">必須</span>}</div>
                      <div className="fbody">
                        <input className="inp" list="orderTabCompanyList" value={header[f.key] || ''} 
                          onChange={(e) => {
                            const val = e.target.value;
                            setHeader({ ...header, [f.key]: val, companyId: COMPANY_BY_NAME[val] || header.companyId });
                          }} 
                        />
                      </div>
                    </div>
                  )
                }

                return (
                  <Field key={f.key} field={f} value={header[f.key]} onChange={setHeaderField} />
                )
              })}
            </div>
          </KGroup>
        ))}
        <datalist id="orderTabCompanyList">{COMPANY_NAMES.map(o => <option key={o} value={o} />)}</datalist>
      </Accordion>

      {/* ② 明細（表形式・1:多／枝番を自動採番） */}
      <Accordion
        title="発注明細"
        defaultOpen={true}
        right={
          <>
            <button type="button" className="btn-plus" title="空行を追加" onClick={addEmpty}>＋ 追加</button>
            <button type="button" className="btn-mini" title="一番上の行を複製して追加" onClick={duplicateTop}>複製</button>
          </>
        }
      >
        {rows.length === 0 && <div className="empty">明細がありません。</div>}
        {rows.length > 0 && (
          <div className="ktable-scroll">
            <table className="ktable meisai">
              <thead>
                <tr>
                  <th className="th-ico"></th>
                  <th>発注明細番号（枝番）</th>
                  {DETAIL_COLS.map((f) => (
                    <th key={f.key} style={IS_NEW_ITEM(f.key) ? { backgroundColor: '#fff4e5' } : {}}>{f.auto && <span className="lock">🔒</span>}{f.label}{(f.required || f.key === 'attrCode') && <span className="req-star">＊</span>}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>
                    <td className="td-ico">#{i + 1}</td>
                    <td className="edit-cell tc"><input className="cell-inp" style={{ minWidth: 70 }} value={row.branchNo ?? ''} onChange={(e) => setRowField(i, 'branchNo', e.target.value)} /></td>
                    {DETAIL_COLS.map((f) => (
                      <td key={f.key} className={f.auto ? 'locked-cell' : 'edit-cell'} style={IS_NEW_ITEM(f.key) ? { backgroundColor: '#fff4e5' } : {}}>{cell(f, row, i)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="fnote" style={{ marginTop: 6 }}>※「＋追加」で空行、「複製」で一番上の行を複製して追加します。案件番号を入力すると、商品名・メーカー名・医薬品・アルコール区分・発注ケース/ボール入数・商品カテゴリが自動入力されます（参照ボタンでも可）。</div>
      </Accordion>
    </div>
  )
}
