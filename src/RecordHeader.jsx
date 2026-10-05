import React from 'react'

// 最上部のレコードヘッダー（自動採番されたヘッダー番号を表示）
export function RecordHeader({ badge, label, no }) {
  return (
    <div className="record-bar">
      <span className="rec-badge">{badge}</span>
      <span className="rec-label">{label}</span>
      <span className="rec-no">{no}</span>
      <span className="rec-auto">（自動採番）</span>
    </div>
  )
}

// 明細行の先頭に表示する枝番バー（自動採番）
export function BranchBar({ no, code, numberLabel = '明細番号（枝番）', codeLabel = '明細キー' }) {
  const noPadded = String(no).padStart(3, '0')
  return (
    <div className="branch-bar">
      <span className="bb-label">{numberLabel}</span>
      <span className="bb-no">{noPadded}</span>
      {code && <span className="bb-label">/ {codeLabel}</span>}
      {code && <span className="bb-no">{code}</span>}
      <span className="bb-auto">（自動採番）</span>
    </div>
  )
}

// 枝番コード生成: ヘッダー番号 + 3桁連番（ハイフンなし）
export function branchCode(headerNo, index) {
  const n = String(index + 1).padStart(3, '0')
  return headerNo ? `${headerNo}${n}` : n
}
