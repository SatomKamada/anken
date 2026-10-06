import React, { useState } from 'react'
import Field from './Field.jsx'
import PageChangeList from './PageChangeList.jsx'
import { RecordHeader } from './RecordHeader.jsx'
import './pageChange.css'
import {
  PAGE_CHANGE_FIELDS,
  PAGE_CHANGE_MEMO_FIELD,
  PAGE_CHANGE_TYPE,
  PUBLISH_CHANNELS,
  PUBLISH_STATUS_OPTIONS,
  PAGE_CHANGE_TARGET_GROUPS,
  SPEC_POST_MASTER,
  SPEC_ID_SAMPLES,
  PERIOD_KEYS,
  PAGE_CHANGE_INIT,
  toPostRows,
  createPageChangeInitial,
} from './pageChangeFields.js'

// 掲載ページ変更タブ：最初は一覧（検索画面）→ 行頭アイコンで詳細
export default function PageChange() {
  const [view, setView] = useState('list')
  const [records, setRecords] = useState(PAGE_CHANGE_INIT)
  const [cur, setCur] = useState(0)

  const nextNo = () => String(Math.max(0, ...records.map((r) => Number(r.recordNo) || 0)) + 1)

  const add = () => { setRecords([createPageChangeInitial(nextNo()), ...records]) }
  const addAndOpen = () => { add(); setCur(0); setView('detail') }
  const duplicate = (i) => setRecords([{ ...structuredClone(records[i]), recordNo: nextNo() }, ...records])
  const remove = (i) => setRecords(records.filter((_, idx) => idx !== i))
  const updateCur = (next) => setRecords(records.map((r, idx) => (idx === cur ? next : r)))

  if (view === 'list') {
    return (
      <div className="tab-panel">
        <PageChangeList
          records={records}
          onOpen={(i) => { setCur(i); setView('detail') }}
          onAdd={addAndOpen}
          onDuplicate={duplicate}
          onDelete={remove}
        />
      </div>
    )
  }

  return (
    <div className="tab-panel">
      <div className="detail-back">
        <button type="button" className="btn-mini" onClick={() => setView('list')}>← 一覧に戻る</button>
      </div>
      <PageChangeDetail form={records[cur]} onChange={updateCur} />
    </div>
  )
}

// ------------------------------------------------------------
// 詳細（1レコード）
// ------------------------------------------------------------
function PageChangeDetail({ form, onChange }) {
  const [msg, setMsg] = useState(null)
  const T = PAGE_CHANGE_TYPE

  const set = (patch) => onChange({ ...form, ...patch })
  const onField = (key, v) => set({ [key]: v })

  const updateRow = (key, i, patch) =>
    set({ [key]: form[key].map((r, idx) => (idx === i ? { ...r, ...patch } : r)) })
  const addRow = (key, row) => set({ [key]: [...form[key], row] })
  const removeRow = (key, i) =>
    form[key].length > 1 && set({ [key]: form[key].filter((_, idx) => idx !== i) })

  // 商品規格ID → 紐づく掲載履歴を呼び出し（Enter）
  const lookupSpec = () => {
    const id = (form.specId || '').trim()
    if (!id) { setMsg({ t: 'warn', m: '商品規格IDを入力してください' }); return }
    const m = SPEC_POST_MASTER[id]
    if (!m) { setMsg({ t: 'warn', m: `商品規格IDに該当なし（${id}）。ダミー：${SPEC_ID_SAMPLES.join(' / ')}` }); return }
    set({
      posts: toPostRows(m.posts),
      companyName: form.companyName || m.companyName,
      productName: form.productName || m.productName,
    })
    setMsg({ t: 'ok', m: `商品規格ID ${id} に紐づく掲載履歴を ${m.posts.length}件 呼び出しました` })
  }
  const setPost = (i, patch) => set({ posts: form.posts.map((p, idx) => (idx === i ? { ...p, ...patch } : p)) })

  // 商品規格ID入力欄（期間設定・公開/非公開で共通）
  const specIdRow = (
    <div className="frow">
      <div className="flabel">商品規格ID<span className="req">必須</span></div>
      <div className="fbody">
        <input className="inp inp-code" value={form.specId} placeholder="商品規格ID入力→Enter"
          onChange={(e) => set({ specId: e.target.value })}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); lookupSpec() } }} />
        <div className="fnote">Enterで紐づく掲載履歴を呼び出し（ダミー：{SPEC_ID_SAMPLES.join(' / ')}）。変更した箇所は色付きで表示されます。</div>
      </div>
    </div>
  )
  const noPosts = form.posts.length === 0 && <div className="empty small">商品規格IDを入力してEnterを押してください。</div>

  return (
    <div className="pc-wrap">
      {/* レコード番号：表示のみ */}
      <RecordHeader badge="掲載ページ変更" label="レコード番号" no={form.recordNo} />

      {msg && <div className={'notice ' + msg.t}>{msg.m}</div>}

      {/* 企業名・商品名・変更種別 */}
      <section className="pc-section">
        {PAGE_CHANGE_FIELDS.map((fd) => (
          <Field key={fd.key} field={fd} value={form[fd.key]} onChange={onField} />
        ))}
      </section>

      {/* ── 掲載ページ変更 ── */}
      {form.changeType === T.PAGE && (
        <section className="pc-section">
          <h3 className="pc-title">掲載ページ変更</h3>
          {form.pageRows.map((r, i) => (
            <div className="pc-row" key={i}>
              <div className="pc-cell pc-w-target">
                <div className="pc-label">変更対象の項目</div>
                <select className="inp" value={r.target}
                  onChange={(e) => updateRow('pageRows', i, { target: e.target.value })}>
                  <option value=""></option>
                  {PAGE_CHANGE_TARGET_GROUPS.map((g) => (
                    <optgroup key={g.group} label={g.group}>
                      {g.items.map((t) => (
                        <option key={t.key} value={`${g.group}.${t.key}`}>{t.label}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className="pc-cell pc-grow">
                <div className="pc-label">変更内容</div>
                <textarea className="inp" rows={3} value={r.content}
                  onChange={(e) => updateRow('pageRows', i, { content: e.target.value })} />
              </div>
              <button type="button" className="pc-del" onClick={() => removeRow('pageRows', i)}>×</button>
            </div>
          ))}
          <button type="button" className="pc-add"
            onClick={() => addRow('pageRows', { target: '', content: '' })}>＋ 行を追加</button>
        </section>
      )}

      {/* ── 掲載開始終了日 / 募集開始終了日設定（掲載履歴単位） ── */}
      {form.changeType === T.PERIOD && (
        <section className="pc-section">
          <h3 className="pc-title">掲載開始終了日 / 募集開始終了日設定</h3>
          {specIdRow}
          {noPosts}
          {form.posts.length > 0 && (
            <div className="ktable-scroll pc-mt">
              <table className="ktable pc-ptable">
                <thead>
                  <tr>
                    <th>掲載履歴コード</th>
                    <th>掲載名</th>
                    {PERIOD_KEYS.map((k) => <th key={k.key}>{k.label}</th>)}
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {form.posts.map((p, i) => {
                    const ng = (p.postStart && p.postEnd && p.postStart > p.postEnd) || (p.recruitStart && p.recruitEnd && p.recruitStart > p.recruitEnd)
                    return (
                      <tr key={p.postCode}>
                        <td className="locked-cell">{p.postCode}</td>
                        <td className="locked-cell">{p.postName}</td>
                        {PERIOD_KEYS.map(({ key }) => {
                          const changed = p[key] !== p.orig[key]
                          return (
                            <td key={key} className={'edit-cell' + (changed ? ' pc-changed' : '')}>
                              <input className="cell-inp" type="date" value={p[key]} onChange={(e) => setPost(i, { [key]: e.target.value })} />
                              {changed && <div className="pc-before">変更前：{p.orig[key] || '（空）'}</div>}
                            </td>
                          )
                        })}
                        <td className="edit-cell">{ng && <span className="pc-err">終了日が開始日より前です</span>}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* ── 公開/非公開設定（掲載履歴単位） ── */}
      {form.changeType === T.PUBLISH && (
        <section className="pc-section">
          <h3 className="pc-title">公開 / 非公開設定</h3>
          {specIdRow}
          {noPosts}
          {form.posts.length > 0 && (
            <div className="ktable-scroll pc-mt">
              <table className="ktable pc-ptable">
                <thead>
                  <tr>
                    <th>掲載履歴コード</th>
                    <th>掲載名</th>
                    {PUBLISH_CHANNELS.map((ch) => <th key={ch}>{ch}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {form.posts.map((p, i) => (
                    <tr key={p.postCode}>
                      <td className="locked-cell">{p.postCode}</td>
                      <td className="locked-cell">{p.postName}</td>
                      {PUBLISH_CHANNELS.map((ch) => {
                        const changed = p.publish[ch] !== p.orig.publish[ch]
                        return (
                          <td key={ch} className={'edit-cell' + (changed ? ' pc-changed' : '')}>
                            <select className="cell-inp" value={p.publish[ch]}
                              onChange={(e) => setPost(i, { publish: { ...p.publish, [ch]: e.target.value } })}>
                              {PUBLISH_STATUS_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                            </select>
                            {changed && <div className="pc-before">変更前：{p.orig.publish[ch]}</div>}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* ── 在庫移動 ── */}
      {form.changeType === T.STOCK && (
        <section className="pc-section">
          <h3 className="pc-title">在庫移動</h3>
          <div className="pc-note">販売数は移動前商品規格の販売種別で指定</div>
          <div className="pc-stock-box">
            {form.stockRows.map((r, i) => (
              <div className="pc-row" key={i}>
                <div className="pc-cell">
                  <div className="pc-label">はがす対象の商品規格ID</div>
                  <input className="inp pc-center" value={r.fromId}
                    onChange={(e) => updateRow('stockRows', i, { fromId: e.target.value })} />
                </div>
                <span className="pc-sep">→</span>
                <div className="pc-cell">
                  <div className="pc-label">移動する対象の商品規格ID</div>
                  <input className="inp pc-center pc-accent" value={r.toId}
                    onChange={(e) => updateRow('stockRows', i, { toId: e.target.value })} />
                </div>
                <div className="pc-cell pc-w-qty">
                  <div className="pc-label">販売数</div>
                  <input className="inp pc-center" type="number" min="0" value={r.qty}
                    onChange={(e) => updateRow('stockRows', i, { qty: e.target.value })} />
                </div>
                <button type="button" className="pc-del" onClick={() => removeRow('stockRows', i)}>×</button>
              </div>
            ))}
          </div>
          <button type="button" className="pc-add"
            onClick={() => addRow('stockRows', { fromId: '', toId: '', qty: '' })}>＋ 行を追加</button>
        </section>
      )}

      {/* メモ（一番下） */}
      <section className="pc-section">
        <Field field={PAGE_CHANGE_MEMO_FIELD} value={form.memo} onChange={onField} />
      </section>
    </div>
  )
}
