import { useState } from 'react';
import {
  PAGE_CHANGE_TYPES,
  PUBLISH_CHANNELS,
  PUBLISH_STATUS_OPTIONS,
  getPageChangeTargets,
  createPageChangeInitial,
} from './fields';

/**
 * 掲載ページ変更タブ
 * props:
 *   caseFields : 案件タブのフィールド定義配列（変更対象の項目プルダウンの元）
 *   recordNo   : 自動採番されたレコード番号
 */
export default function PageChange({ caseFields = [], recordNo }) {
  const [form, setForm] = useState(createPageChangeInitial);
  const targets = getPageChangeTargets(caseFields);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  // 行配列の共通操作
  const updateRow = (key, i, patch) =>
    set({ [key]: form[key].map((r, idx) => (idx === i ? { ...r, ...patch } : r)) });
  const addRow = (key, row) => set({ [key]: [...form[key], row] });
  const removeRow = (key, i) =>
    set({ [key]: form[key].length > 1 ? form[key].filter((_, idx) => idx !== i) : form[key] });

  return (
    <div className="pc-wrap">
      {/* ── 基本 ── */}
      <section className="pc-section">
        <div className="pc-grid2">
          <label className="pc-field">
            <span className="pc-label">レコード番号</span>
            <input className="pc-input pc-readonly" value={recordNo ?? '（自動採番）'} readOnly />
          </label>
          <label className="pc-field">
            <span className="pc-label">変更種別<em className="pc-req">*</em></span>
            <select
              className="pc-input"
              value={form.changeType}
              onChange={(e) => set({ changeType: e.target.value })}
            >
              <option value="">選択してください</option>
              {PAGE_CHANGE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {/* ── 掲載ページ変更 ── */}
      {form.changeType === 'page' && (
        <section className="pc-section">
          <h3 className="pc-title">掲載ページ変更</h3>
          {form.pageRows.map((r, i) => (
            <div className="pc-row" key={i}>
              <label className="pc-field pc-w-target">
                <span className="pc-label">変更対象の項目</span>
                <select
                  className="pc-input"
                  value={r.target}
                  onChange={(e) => updateRow('pageRows', i, { target: e.target.value })}
                >
                  <option value="">選択してください</option>
                  {targets.map((t) => (
                    <option key={t.key} value={t.key}>{t.label}</option>
                  ))}
                </select>
              </label>
              <label className="pc-field pc-grow">
                <span className="pc-label">変更内容</span>
                <textarea
                  className="pc-input pc-textarea"
                  rows={3}
                  value={r.content}
                  onChange={(e) => updateRow('pageRows', i, { content: e.target.value })}
                />
              </label>
              <button type="button" className="pc-del" onClick={() => removeRow('pageRows', i)}>×</button>
            </div>
          ))}
          <button type="button" className="pc-add" onClick={() => addRow('pageRows', { target: '', content: '' })}>
            ＋ 行を追加
          </button>
        </section>
      )}

      {/* ── 掲載開始終了日 / 募集開始終了日 ── */}
      {form.changeType === 'period' && (
        <section className="pc-section">
          <h3 className="pc-title">掲載開始終了日 / 募集開始終了日設定</h3>
          {[
            ['掲載', 'postStart', 'postEnd'],
            ['募集', 'recruitStart', 'recruitEnd'],
          ].map(([name, s, e]) => (
            <div className="pc-row" key={name}>
              <span className="pc-rowhead">{name}期間</span>
              <label className="pc-field">
                <span className="pc-label">{name}開始日</span>
                <input type="date" className="pc-input" value={form[s]} onChange={(ev) => set({ [s]: ev.target.value })} />
              </label>
              <span className="pc-tilde">〜</span>
              <label className="pc-field">
                <span className="pc-label">{name}終了日</span>
                <input type="date" className="pc-input" value={form[e]} onChange={(ev) => set({ [e]: ev.target.value })} />
              </label>
              {form[s] && form[e] && form[s] > form[e] && (
                <span className="pc-err">終了日が開始日より前です</span>
              )}
            </div>
          ))}
        </section>
      )}

      {/* ── 公開/非公開設定 ── */}
      {form.changeType === 'publish' && (
        <section className="pc-section">
          <h3 className="pc-title">公開 / 非公開設定</h3>
          <table className="pc-table">
            <thead>
              <tr>
                <th>チャネル</th>
                {PUBLISH_STATUS_OPTIONS.map((o) => <th key={o.value}>{o.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {PUBLISH_CHANNELS.map((ch) => (
                <tr key={ch.key}>
                  <td>{ch.label}</td>
                  {PUBLISH_STATUS_OPTIONS.map((o) => (
                    <td key={o.value} className="pc-center">
                      <input
                        type="radio"
                        name={`pub-${ch.key}`}
                        checked={form.publish[ch.key] === o.value}
                        onChange={() => set({ publish: { ...form.publish, [ch.key]: o.value } })}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* ── 在庫移動 ── */}
      {form.changeType === 'stock' && (
        <section className="pc-section">
          <h3 className="pc-title">在庫移動</h3>
          <p className="pc-note">販売数は移動前商品規格の販売種別で指定</p>
          <div className="pc-stock-box">
            {form.stockRows.map((r, i) => (
              <div className="pc-row" key={i}>
                <label className="pc-field">
                  <span className="pc-label">はがす対象の商品規格ID</span>
                  <input className="pc-input pc-center" value={r.fromId} onChange={(e) => updateRow('stockRows', i, { fromId: e.target.value })} />
                </label>
                <span className="pc-arrow">→</span>
                <label className="pc-field">
                  <span className="pc-label">移動する対象の商品規格ID</span>
                  <input className="pc-input pc-center pc-accent" value={r.toId} onChange={(e) => updateRow('stockRows', i, { toId: e.target.value })} />
                </label>
                <label className="pc-field pc-w-qty">
                  <span className="pc-label">販売数</span>
                  <input type="number" min="0" className="pc-input pc-center" value={r.qty} onChange={(e) => updateRow('stockRows', i, { qty: e.target.value })} />
                </label>
                <button type="button" className="pc-del" onClick={() => removeRow('stockRows', i)}>×</button>
              </div>
            ))}
          </div>
          <button type="button" className="pc-add" onClick={() => addRow('stockRows', { fromId: '', toId: '', qty: '' })}>
            ＋ 行を追加
          </button>
        </section>
      )}
    </div>
  );
}
