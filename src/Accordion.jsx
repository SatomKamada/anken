import React, { useState } from 'react'

// 開閉できるセクション
// props: title, defaultOpen, right(ヘッダ右側の操作), level('section'|'sub'), children
export default function Accordion({ title, defaultOpen = true, right, level = 'section', children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={'acc acc-' + level + (open ? ' open' : '')}>
      <div className="acc-head">
        <button type="button" className="acc-toggle" onClick={() => setOpen((o) => !o)}>
          <span className="acc-caret">{open ? '▼' : '▶'}</span>
          <span className="acc-title">{title}</span>
        </button>
        {right && <div className="acc-right" onClick={(e) => e.stopPropagation()}>{right}</div>}
      </div>
      {open && <div className="acc-body">{children}</div>}
    </div>
  )
}
