import React, { useState } from 'react'
import CaseTab from './CaseTab.jsx'
import OrderTab from './OrderTab.jsx'
import WarehouseTab from './WarehouseTab.jsx'

const TABS = [
  { key: 'case',  label: '案件' },
  { key: 'order', label: '発注' },
  { key: 'move',  label: '倉庫移動' },
]

export default function App() {
  const [tab, setTab] = useState('case')
  return (
    <div className="app">
      <header className="app-head">
        <h1>案件・発注管理アプリ</h1>
        <div className="app-sub">UIモック（kintone想定）</div>
      </header>

      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={'tab' + (tab === t.key ? ' active' : '')}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="content">
        {tab === 'case' ? <CaseTab /> : tab === 'order' ? <OrderTab /> : <WarehouseTab />}
      </main>
    </div>
  )
}
