# 案件管理アプリ 画面モック（kintone風）

React + Vite で作成した、kintone「案件管理アプリ」の入力画面モックです。
- **商品情報**：画面上部の共通エリア（1件）
- **商品規格情報**：＋ボタンで増やせる明細（商品情報と 1:多）

項目は `データ連携（ECC,LMS,KIN).xlsx` の `kintone_案件管理` シートから抽出しています。

## 使い方（GitHub Codespaces / ローカル共通）

```bash
npm install
npm run dev
```

Codespaces では `npm run dev` 実行後、下部の「ポート」タブに出る 5173 番を開くとプレビューできます。

## 項目の追加・変更

`src/fields.js` の 2 つの配列を編集するだけで項目を増減できます。
- `productInfoFields` … 上部の共通エリア（分類「商品情報」）
- `specFields`       … 明細（分類「商品規格情報」）

`type` に指定できる値：`text` / `number` / `checkbox` / `select` / `datetime` / `checkboxGroup`

## ファイル構成

```
kintone-anken-mock/
├─ package.json
├─ vite.config.js
├─ index.html
└─ src/
   ├─ main.jsx      … エントリ
   ├─ App.jsx       … 画面本体（共通エリア＋明細＋±ボタン）
   ├─ fields.js     … 項目定義（Excelから抽出）★ここを編集
   └─ styles.css    … kintone風スタイル
```
