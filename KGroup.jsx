import React, { useState } from 'react'

// kintoneのグループUI（▽＋グループ名の枠・折りたたみ）
// props: title, defaultOpen, right(ヘッダ右の操作), children
export default function KGroup({ title, defaultOpen = true, right, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={'kgroup' + (open ? ' open' : '')}>
      <div className="kgroup-head">
        <button type="button" className="kgroup-toggle" onClick={() => setOpen((o) => !o)}>
          <span className="kgroup-caret">{open ? '▽' : '▷'}</span>
          <span className="kgroup-title">{title}</span>
        </button>
        {right && <div className="kgroup-right" onClick={(e) => e.stopPropagation()}>{right}</div>}
      </div>
      {open && <div className="kgroup-body">{children}</div>}
    </div>
  )
}
