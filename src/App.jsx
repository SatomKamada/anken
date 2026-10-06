import React, { useState } from 'react'
import CaseTab from './CaseTab.jsx'
import SetProductTab from './SetProductTab.jsx'
import OrderTab from './OrderTab.jsx'
import PageChange from './PageChange.jsx'

const TABS = [
  { key: 'case',  label: '案件' },
  { key: 'set',   label: '案件（セット商品）' },
  { key: 'order', label: '発注' },
  { key: 'pageChange', label: '掲載ページ変更' },
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
        {tab === 'case' ? <CaseTab />
          : tab === 'set' ? <SetProductTab />
          : tab === 'order' ? <OrderTab />
          : <PageChange />}
      </main>
    </div>
  )
}
