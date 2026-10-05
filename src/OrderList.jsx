import React, { useState } from 'react'

// 発注管理：一覧（検索結果の表）— kintone風。行頭アイコンで詳細へ。
// props: onOpen(record)

const VIEW_OPTIONS = [
  '請求書消込', '営業', 'オペ', 'ロジ', '発注情報出力', '入荷実績',
  '営業アシスタント', '開発確認用', '仕入実績管理用', '販売目標出力',
  'JICFS作業用', '仕入型発注情報抽出用', '（すべて）',
]
const OUTPUT_OPTIONS = ['出力する書類', '発注書（通常）']

// 列定義（locked=鍵／req=必須／type=編集UI）
const COLS = [
  { key: 'recordNo', label: 'レコード番号', locked: true },
  { key: 'orderNo', label: '発注番号', locked: true },
  { key: 'promo', label: 'プロモーションコード' },
  { key: 'status', label: '発注ステータス', req: true, type: 'select', options: ['入力中', '登録済', '申請中', '承認済', '発注済', '一部入荷', '全部入荷', '差戻', 'NG'] },
  { key: 'assignee', label: '担当者', locked: true },
  { key: 'createdAt', label: '作成日時', locked: true },
  { key: 'companyId', label: 'Company ID', locked: true, req: true },
  { key: 'client', label: 'クライアント名', locked: true, req: true },
  { key: 'caseTypeL', label: '案件種別（大）', type: 'select', options: ['在庫', '受発注', '通常', 'その他'] },
  { key: 'caseTypeM', label: '案件種別（中）', type: 'select', options: ['試算あり', '試算なし', '倉庫間移動', 'その他'] },
  { key: 'caseTypeS', label: '案件種別（小）', type: 'select', options: ['メーカー滞留品', 'NBプロパー', 'TC', 'AAS', 'キャンペーン・抽選', '代品・過受注', '代品'] },
  { key: 'orderCat', label: '受発注発注区分', type: 'select', options: ['-', '個別発注', '一斉発注'] },
  { key: 'prodType', label: '商品種別', type: 'select', options: ['その他', '食品', '日用品', '医薬品'] },
  { key: 'payTerms', label: '支払条件', type: 'select', options: ['末締め翌月末払い', '15日締め払い', '末締め翌月15日払い', '日付指定'] },
  { key: 'payDue', label: '支払期日', type: 'date' },
  { key: 'totalCase', label: 'ケース数合計', locked: true },
  { key: 'totalPiece', label: 'ピース数合計', locked: true },
  { key: 'amountIn', label: '発注金額合計（税込）', locked: true },
  { key: 'tax8', label: '消費税（8%）', locked: true },
  { key: 'tax10', label: '消費税（10%）', locked: true },
  { key: 'amountEx', label: '発注金額合計（税抜）', locked: true },
]

const R = (recordNo, orderNo, promo, status, assignee, createdAt, companyId, client, caseL, caseM, caseS, cat, payDue, totalCase, totalPiece, amountIn, tax8, tax10, amountEx) =>
  ({ recordNo, orderNo, promo, status, assignee, createdAt, companyId, client, caseTypeL: caseL, caseTypeM: caseM, caseTypeS: caseS, orderCat: cat, prodType: 'その他', payTerms: '末締め翌月末払い', payDue, totalCase, totalPiece, amountIn, tax8, tax10, amountEx })

const SAMPLE = [
  R('48930', '00048930', '', '入力中', '伊波 篤', '2026-10-05 12:45', '6281', '路興商事株式会社', '在庫', '試算あり', 'メーカー滞留品', '', '2026-11-30', '0', '12', '¥12,000', '¥0', '¥0', '¥12,000'),
  R('48929', '00048929', '', '入力中', '伊波 篤', '2026-10-05 12:38', '2576', 'コンフェックス株式会社', '在庫', '試算あり', 'メーカー滞留品', '', '2026-11-30', '0', '6', '¥6,000', '¥0', '¥0', '¥6,000'),
  R('48928', '00048928', '', '発注済', '伊波 篤', '2026-10-05 12:32', '6318', '株式会社八天堂', '受発注', '試算あり', 'TC', '一斉発注', '2026-11-30', '0', '3', '¥9,800', '¥0', '¥0', '¥9,000'),
  R('48927', '00048927', '', '入力中', '小宮 佳介', '2026-10-05 11:36', '4749', 'DKSHジャパン株式会社', '在庫', '試算あり', 'メーカー滞留品', '', '2026-11-30', '50', '600', '¥388,800', '¥28,800', '¥0', '¥360,000'),
  R('48926', '00048926', 'Y393', '入力中', '石津 衛一', '2026-10-05 10:57', '34', '小林製薬株式会社', '通常', '', 'メーカー滞留品', '', '', '100', '7,000', '¥0', '¥0', '¥0', '¥0'),
  R('48925', '00048925', 'Y393', '発注済', '石津 衛一', '2026-10-05 10:55', '34', '小林製薬株式会社', '通常', '', 'メーカー滞留品', '', '2026-11-30', '158', '8,310', '¥0', '¥0', '¥0', '¥0'),
  R('48924', '00048924', '', '発注済', '谷口 祐磨', '2026-10-05 9:26', '3726', 'ラブリー・ペット商会', '受発注', '試算あり', 'TC', '一斉発注', '2026-11-30', '0', '4', '¥3,549', '¥0', '¥322', '¥3,227'),
  R('48923', '00048923', '', '発注済', '藤原 功旨', '2026-10-05 9:25', '5833', '株式会社ライフブリッジ', '受発注', '試算あり', 'TC', '一斉発注', '2026-11-30', '0', '4', '¥3,036', '¥0', '¥276', '¥2,760'),
]

const ITEM_COLS = ['発注番号（枝番）', 'メーカー名', '商品名', '温度帯', '分類', '倉庫', '配送区分', '賞味期限', '納品日', '販売目標', 'JANコード', 'ケース入数', 'ボール入数', 'ケース数', 'ピース数', '参考価格（税抜）', '単価（税抜）', '税率', '発注金額（税抜）', '商品ID', '商品カテゴリー（大）', '商品カテゴリー（中）', '商品カテゴリー（小）']
const ITEM_SAMPLE = [['1', 'DKSHジャパ…', 'フェル…', '常温', '', '佐川（花見川）', '通常', '2026-11-13', '2026-10-09', '2026-10-14', '', '12', '0', '50', '600', '¥0.00', '¥600.00', '8', '¥360,000.00', '', '', '', '']]
const RELATED = ['発注商品テーブル', '案件テーブル', '販売目標変更履歴テーブル']

const IcoChart = () => (<svg viewBox="0 0 24 24" width="16" height="16"><polyline points="3,16 9,10 13,14 21,6" fill="none" stroke="currentColor" strokeWidth="2" /></svg>)
const IcoFilter = () => (<svg viewBox="0 0 24 24" width="16" height="16"><polygon points="3,5 21,5 14,13 14,19 10,21 10,13" fill="none" stroke="currentColor" strokeWidth="2" /></svg>)
const IcoBars = () => (<svg viewBox="0 0 24 24" width="16" height="16"><rect x="4" y="11" width="4" height="9" fill="currentColor" /><rect x="10" y="6" width="4" height="14" fill="currentColor" /><rect x="16" y="14" width="4" height="6" fill="currentColor" /></svg>)
const IcoDetail = () => (<svg viewBox="0 0 24 24" width="15" height="15" style={{ verticalAlign: 'middle' }}><rect x="5" y="3" width="14" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" /><line x1="8" y1="8" x2="16" y2="8" stroke="currentColor" strokeWidth="1.4" /><line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="1.4" /><line x1="8" y1="16" x2="13" y2="16" stroke="currentColor" strokeWidth="1.4" /></svg>)

export default function OrderList({ onOpen }) {
  const [rows, setRows] = useState(SAMPLE)
  const [viewSel, setViewSel] = useState('入荷実績')
  const [outputSel, setOutputSel] = useState('発注書（通常）')
  const [rel, setRel] = useState(0)

  const setCell = (ri, key, val) => setRows(rows.map((r, i) => (i === ri ? { ...r, [key]: val } : r)))
  const ACTIONS = ['全画面表示', '元に戻す', 'やり直し', '再読み込み', '保存', '＋追加', '複製', '削除', '検索', 'フィルタ', 'エクスポート']

  return (
    <div className="klist-wrap">
      {/* 上部アプリバー */}
      <div className="kappbar">
        <select className="kview-select" value={viewSel} onChange={(e) => setViewSel(e.target.value)}>
          {VIEW_OPTIONS.map((o) => <option key={o}>{o}</option>)}
        </select>
        <button type="button" className="kicon-btn chart" title="グラフ"><IcoChart /><span className="kcaret">▾</span></button>
        <button type="button" className="kicon-btn" title="絞り込み"><IcoFilter /></button>
        <button type="button" className="kicon-btn" title="分析"><IcoBars /></button>
        <select className="koutput-select" value={outputSel} onChange={(e) => setOutputSel(e.target.value)}>
          {OUTPUT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
        </select>
        <button type="button" className="kbtn-out">出力</button>
        <span className="kcount">1 - {rows.length}（{rows.length}件中）</span>
      </div>

      {/* アクションバー（ダミー） */}
      <div className="kactionbar">
        {ACTIONS.map((a) => <button key={a} type="button" className="kact-btn">{a}</button>)}
      </div>

      {/* 一覧（鍵以外は編集可） */}
      <div className="ktable-scroll">
        <table className="ktable">
          <thead>
            <tr>
              <th className="th-ico"></th>
              {COLS.map((c) => (
                <th key={c.key}>
                  {c.locked && <span className="lock">🔒</span>}
                  {c.label}
                  {c.req && <span className="req-star">＊</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={row.recordNo}>
                <td className="td-ico">
                  <button type="button" className="detail-ico" title="レコードの詳細を表示する"
                    onClick={() => onOpen({ recordNo: row.recordNo, orderNo: row.orderNo, client: row.client })}>
                    <IcoDetail />
                  </button>
                </td>
                {COLS.map((c) => (
                  <td key={c.key} className={c.locked ? 'locked-cell' : 'edit-cell'}>
                    {c.locked
                      ? <span>{row[c.key]}</span>
                      : c.type === 'select'
                        ? (
                          <select className="cell-inp" value={row[c.key] || ''} onChange={(e) => setCell(ri, c.key, e.target.value)}>
                            <option value=""></option>
                            {c.options.map((o) => <option key={o}>{o}</option>)}
                          </select>
                        )
                        : <input className="cell-inp" type={c.type === 'date' ? 'date' : 'text'} value={row[c.key] || ''} onChange={(e) => setCell(ri, c.key, e.target.value)} />}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 関連シート */}
      <div className="krelated">
        <div className="krel-tabs">
          <span className="krel-label">関連シート</span>
          {RELATED.map((t, i) => (
            <button key={t} type="button" className={'krel-tab' + (rel === i ? ' active' : '')} onClick={() => setRel(i)}>{t}</button>
          ))}
        </div>
        {rel === 0 && (
          <div className="ktable-scroll">
            <table className="ktable">
              <thead><tr>{ITEM_COLS.map((c) => <th key={c}>{c}</th>)}</tr></thead>
              <tbody>{ITEM_SAMPLE.map((row, ri) => <tr key={ri}>{row.map((v, ci) => <td key={ci}>{v}</td>)}</tr>)}</tbody>
            </table>
          </div>
        )}
        {rel === 1 && <div className="empty small">案件テーブル（サンプル省略）</div>}
        {rel === 2 && <div className="empty small">販売目標変更履歴テーブル（サンプル省略）</div>}
      </div>

      <div className="fnote" style={{ marginTop: 8 }}>※ 行頭のアイコンを押すと詳細画面に遷移します。鍵（🔒）以外のセルは編集できます。</div>
    </div>
  )
}
