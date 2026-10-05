import React, { useState } from 'react'

// 発注管理：一覧（検索結果の表）— kintone風。レコード番号クリックで詳細へ。
// props: onOpen(record)

// 一覧（発注ヘッダー）サンプル
const HEADER_COLS = [
  'レコード番号', '発注番号', 'プロモーションコード', '発注ステータス', '担当者', '作成日時',
  'Company ID', 'クライアント名', '案件種別（大）', '案件種別（中）', '案件種別（小）', '受発注発注区分',
  '商品種別', '支払条件', '支払期日', 'ケース数合計', 'ピース数合計', '発注金額合計（税込）',
  '消費税（8%）', '消費税（10%）', '発注金額合計（税抜）',
]
const SAMPLE = [
  ['48927', '00048927', '', '入力中', '小宮 佳介', '2026-10-05 11:36', '4749', 'DKSHジャパン株式会社', '在庫', '試算あり', 'メーカー滞留品', '', 'その他', '末締め翌月末払い', '2026-11-30', '50', '600', '¥388,800', '¥28,800', '¥0', '¥360,000'],
  ['48926', '00048926', 'Y393', '入力中', '石津 衛一', '2026-10-05 10:57', '34', '小林製薬株式会社', '通常', '', 'メーカー滞留品', '', 'その他', '末締め翌月末払い', '', '100', '7,000', '¥0', '¥0', '¥0', '¥0'],
  ['48925', '00048925', 'Y393', '発注済', '石津 衛一', '2026-10-05 10:55', '34', '小林製薬株式会社', '通常', '', 'メーカー滞留品', '', 'その他', '末締め翌月末払い', '2026-11-30', '158', '8,310', '¥0', '¥0', '¥0', '¥0'],
  ['48924', '00048924', '', '発注済', '谷口 祐揮', '2026-10-05 9:26', '3726', 'ラブリー・ペット商…', '受発注', '試算あり', 'TC', '', 'その他', '末締め翌月末払い', '2026-11-30', '0', '4', '¥3,549', '¥0', '¥322', '¥3,227'],
  ['48923', '00048923', '', '発注済', '藤原 功翁', '2026-10-05 9:25', '5833', '株式会社ライフブリッジ', '受発注', '試算あり', 'TC', '一斉発注', '', '末締め翌月末払い', '2026-11-30', '0', '4', '¥3,036', '¥0', '¥276', '¥2,760'],
  ['48922', '00048922', '', '発注済', '藤原 功翁', '2026-10-05 9:25', '5679', '株式会社クレイツ', '受発注', '試算あり', 'TC', '一斉発注', '', '末締め翌月末払い', '2026-11-30', '0', '1', '¥5,830', '¥0', '¥530', '¥5,300'],
]

// 関連：発注商品テーブル（サンプル1行）
const ITEM_COLS = ['発注番号（枝番）', 'メーカー名', '商品名', '温度帯', '分類', '倉庫', '配送区分', '賞味期限', '納品日', '販売目標', 'JANコード', 'ケース入数', 'ボール入数', 'ケース数', 'ピース数', '参考価格（税抜）', '単価（税抜）', '税率', '発注金額（税抜）', '商品ID', '商品カテゴリー（大）', '商品カテゴリー（中）', '商品カテゴリー（小）']
const ITEM_SAMPLE = [
  ['1', 'DKSHジャパ…', 'フェル…', '常温', '', '佐川（花見川）', '通常', '2026-11-13', '2026-10-09', '2026-10-14', '', '12', '0', '50', '600', '¥0.00', '¥600.00', '8', '¥360,000.00', '', '', '', ''],
]

const RELATED = ['発注商品テーブル', '案件テーブル', '販売目標変更履歴テーブル']

export default function OrderList({ onOpen }) {
  const [rel, setRel] = useState(0)

  return (
    <div className="klist-wrap">
      {/* ツールバー（kintone風・簡易） */}
      <div className="ktoolbar">
        <span className="kview">営業</span>
        <span className="kview-sel">発注書（通常）</span>
        <button type="button" className="kbtn-out">出力</button>
        <span className="kcount">1 - {SAMPLE.length}（{SAMPLE.length}件中）</span>
      </div>

      {/* 一覧（発注ヘッダー） */}
      <div className="ktable-scroll">
        <table className="ktable">
          <thead>
            <tr>{HEADER_COLS.map((c) => <th key={c}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {SAMPLE.map((row) => (
              <tr key={row[0]}>
                {row.map((v, ci) => (
                  <td key={ci} className={ci === 0 ? 'rec' : ''}>
                    {ci === 0
                      ? <button type="button" className="rec-link" onClick={() => onOpen({ recordNo: row[0], orderNo: row[1], client: row[7] })}>{v}</button>
                      : v}
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
              <tbody>
                {ITEM_SAMPLE.map((row, ri) => (
                  <tr key={ri}>{row.map((v, ci) => <td key={ci}>{v}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {rel === 1 && <div className="empty small">案件テーブル（サンプル省略）</div>}
        {rel === 2 && <div className="empty small">販売目標変更履歴テーブル（サンプル省略）</div>}
      </div>

      <div className="fnote" style={{ marginTop: 8 }}>※ レコード番号（左端のリンク）を押すと詳細入力画面に遷移します。</div>
    </div>
  )
}
