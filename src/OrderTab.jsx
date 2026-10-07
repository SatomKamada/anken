import React, { useState, useEffect } from 'react'
import Accordion from './Accordion.jsx'
import KGroup from './KGroup.jsx'
import OrderList from './OrderList.jsx'
import Field from './Field.jsx'
import { branchCode } from './RecordHeader.jsx'
import {
  orderDetailGroups, makeEmptyOrderDetail,
  caseTypeLOptions, caseTypeMOptions, caseTypeSOptions, orderCategoryOptions, productTypeOptions,
  stockLinkOptions,
} from './orderFields.js'
import AttrSelect from './AttrSelect.jsx'
import { lookupOrderDetailByProduct, lookupCaseProduct, lookupCompany } from './dummyData.js'

const COMPANY_BY_NAME = {
  '花王株式会社': '001', 'よつ葉乳業': '002', '△△食品': '003',
  '路興商事株式会社': '6281', 'コンフェックス株式会社': '2576', '株式会社八天堂': '6318',
  'DKSHジャパン株式会社': '4749', '小林製薬株式会社': '34', 'ラブリー・ペット商会': '3726', '株式会社ライフブリッジ': '5833',
  '株式会社クレイツ': '5679', '株式会社ミライスビー': '5583', 'サンコー株式会社': '5380', '株式会社QUADS': '4892',
}
const COMPANY_NAMES = Object.keys(COMPANY_BY_NAME)

// 検索画面で見えている発注ヘッダーレコードの項目を詳細画面にも定義
const HEADER_COLS = [
  { key: 'status', label: '発注ステータス', required: true, type: 'select', options: ['入力中', '登録済', '申請中', '承認済', '発注済', '一部入荷', '全部入荷', '差戻', 'NG'] },
  { key: 'caseTypeL', label: '案件種別（大）', type: 'select', options: caseTypeLOptions },
  { key: 'caseTypeM', label: '案件種別（中）', type: 'select', options: caseTypeMOptions },
  { key: 'caseTypeS', label: '案件種別（小）', type: 'select', options: caseTypeSOptions },
  { key: 'companyId', label: '企業コード', auto: true, required: true },
  { key: 'client', label: '企業名', type: 'companyName', required: true },
  { key: 'orderCat', label: '受発注発注区分', type: 'select', options: orderCategoryOptions },
  { key: 'prodType', label: '商品種別', type: 'select', options: productTypeOptions },
  { key: 'promo', label: 'プロモーションコード' },
  { key: 'payTerms', label: '支払条件', type: 'select', options: ['末締め翌月末払い', '15日締め払い', '末締め翌月15日払い', '日付指定'] },
  { key: 'payDue', label: '支払期日', type: 'date' },
  { key: 'totalCase', label: 'ケース数合計', auto: true },
  { key: 'totalPiece', label: 'ピース数合計', auto: true },
  { key: 'amountIn', label: '発注金額合計（税込み）', auto: true },
  { key: 'tax8', label: '消費税（8%）' },
  { key: 'tax10', label: '消費税（10%）' },
  { key: 'amountEx', label: '発注金額合計（税抜）', auto: true },
  { key: 'assignee', label: '担当者', auto: true },
  { key: 'createdAt', label: '作成日時', auto: true },
]

// 明細の全項目（表の列）。発注番号（枝番）Max No は枝番で表現するため除外。
const RAW_DETAIL_COLS = orderDetailGroups.flatMap((g) => g.fields).filter((f) => !['branchMaxNo', 'saleType', 'stockLinkFlag', 'bestBeforeType'].includes(f.key))
const DETAIL_COLS = []
for (const f of RAW_DETAIL_COLS) {
  if (f.key === 'attrCode') {
    DETAIL_COLS.push({ key: 'saleType', label: '規格区分', type: 'select', options: ['通常','わけあり（B品）','わけあり（期限）','抽選・発送あり','抽選・発送なし','先着・発送あり','先着・発送なし','イベント・発送あり','イベント・発送なし','代品','初試し','企画1','企画2','企画3'] })
    DETAIL_COLS.push({ key: 'stockLinkFlag', label: '在庫紐づけ', type: 'select', options: stockLinkOptions })
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
  const [header, setHeader] = useState({})
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
        <input className="cell-inp" value={row.caseNo ?? ''}
          onChange={(e) => setRowField(i, 'caseNo', e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); const res = lookupCaseProduct(rows[i].caseNo); if (res.found) updateRow(i, { ...rows[i], ...res.values }) } }} />
      )
    }
    // 商品属性情報コード：JANに紐づく「商品属性コード：備考」から選択
    if (f.key === 'attrCode') return <AttrSelect jan={row.janCode} value={row.attrCode} onChange={(v) => setRowField(i, 'attrCode', v)} />
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

      {/* ① 基本情報（検索画面で見えているヘッダー項目を表示） */}
      <Accordion title="発注ヘッダー情報" defaultOpen={false}>
        <KGroup title="基本情報" defaultOpen={true}>
          <div className="grid2">
            {HEADER_COLS.map((f) => {
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
      </Accordion>
    </div>
  )
}

