// ============================================================
// 案件 一覧（検索画面）項目定義・ダミーデータ
//   orderFields.js / pageChangeFields.js と同様に fields.js から分離
//   ※一覧は表示のみ（編集は詳細画面で行う）
// ============================================================
import { caseTypeOptions, caseStatusOptions } from './fields.js'

// type: money=¥・3桁区切り・右寄せ / number=右寄せ
export const CASE_LIST_COLS = [
  { key: 'recordNo',      label: 'レコード番号' },
  { key: 'caseNo',        label: '案件No' },
  { key: 'caseStatus',    label: '案件ステータス', type: 'status' },
  { key: 'caseType',      label: '案件種別' },
  { key: 'janCode',       label: 'JAN' },
  { key: 'specId',        label: '商品規格ID' },
  { key: 'companyName',   label: '企業名' },
  { key: 'caseName',      label: '案件名' },
  { key: 'provideCount',  label: '提供数', type: 'number' },
  { key: 'postStart',     label: '掲載開始日' },
  { key: 'recruitStart',  label: '募集開始日' },
  { key: 'joudaiTotalIn', label: '上代合計（税込み）', type: 'money' },
  { key: 'trialCostIn',   label: 'お試し費用（税込み）', type: 'money' },
  { key: 'createdAt',     label: '作成日時' },
  { key: 'updatedAt',     label: '更新日時' },
  { key: 'createdBy',     label: '作成者' },
]

// 一覧の絞り込み（案件ステータス）
export const CASE_LIST_VIEWS = ['（すべて）', ...caseStatusOptions]

export const fmtCell = (c, v) => {
  if (v === '' || v === null || v === undefined) return ''
  if (c.type === 'money') return '¥' + Number(v).toLocaleString()
  if (c.type === 'number') return Number(v).toLocaleString()
  return v
}

// 新規レコード
export const makeEmptyCaseListRow = (recordNo, at, user = '営業担当A') => ({
  recordNo, caseNo: '', caseStatus: '試算中', caseType: '', janCode: '', specId: '',
  companyName: '', caseName: '', provideCount: '', postStart: '', recruitStart: '',
  joudaiTotalIn: '', trialCostIn: '', createdAt: at, updatedAt: at, createdBy: user,
})

// ダミーデータ（案件No＝案件ヘッダー番号＋3桁枝番）
const [T_NEW, T_SPEC, T_POST, T_SPECFIX, T_POSTFIX] = caseTypeOptions
export const CASE_LIST_INIT = [
  { recordNo: '1058', caseNo: '000047001', caseStatus: '試算中', caseType: T_NEW,     janCode: '4901301421868', specId: '20000005', companyName: '花王株式会社',       caseName: 'アタックZERO 初試しキャンペーン',   provideCount: 500,  postStart: '2026-11-01', recruitStart: '2026-10-20', joudaiTotalIn: 297000, trialCostIn: 148500, createdAt: '2026-10-06 10:21', updatedAt: '2026-10-06 10:21', createdBy: '営業担当A' },
  { recordNo: '1057', caseNo: '000046002', caseStatus: '承認待', caseType: T_SPEC,    janCode: '4908013230864', specId: '20000004', companyName: 'よつ葉乳業',         caseName: 'よつ葉バター 2個セット追加',        provideCount: 300,  postStart: '2026-11-15', recruitStart: '2026-11-01', joudaiTotalIn: 237600, trialCostIn: 95040,  createdAt: '2026-10-05 17:02', updatedAt: '2026-10-06 09:48', createdBy: '伊波 篤' },
  { recordNo: '1056', caseNo: '000046001', caseStatus: '承認済', caseType: T_NEW,     janCode: '4908013230864', specId: '20000002', companyName: 'よつ葉乳業',         caseName: '北海道フェア よつ葉バター',         provideCount: 1000, postStart: '2026-10-01', recruitStart: '2026-10-01', joudaiTotalIn: 594000, trialCostIn: 237600, createdAt: '2026-09-18 13:40', updatedAt: '2026-09-25 11:12', createdBy: '伊波 篤' },
  { recordNo: '1055', caseNo: '000045002', caseStatus: '差戻し', caseType: T_POSTFIX, janCode: '4901301390546', specId: '20000001', companyName: '花王株式会社',       caseName: 'ビオレUV 秋の再販 掲載期間修正',   provideCount: 400,  postStart: '2026-09-15', recruitStart: '2026-09-15', joudaiTotalIn: 422400, trialCostIn: 168960, createdAt: '2026-09-10 15:05', updatedAt: '2026-09-12 10:30', createdBy: '小宮 佳介' },
  { recordNo: '1054', caseNo: '000045001', caseStatus: '確定済', caseType: T_NEW,     janCode: '4901301390546', specId: '20000001', companyName: '花王株式会社',       caseName: 'ビオレUV 夏の日焼け止めフェア',     provideCount: 800,  postStart: '2026-07-01', recruitStart: '2026-07-01', joudaiTotalIn: 844800, trialCostIn: 337920, createdAt: '2026-06-02 09:15', updatedAt: '2026-06-20 18:44', createdBy: '小宮 佳介' },
  { recordNo: '1053', caseNo: '000044001', caseStatus: '再申請', caseType: T_POST,    janCode: '4987241100118', specId: '20000003', companyName: '△△食品',           caseName: '和の食卓特集 ちりめんじゃこ',       provideCount: 200,  postStart: '2026-11-01', recruitStart: '2026-11-01', joudaiTotalIn: 118800, trialCostIn: 59400,  createdAt: '2026-05-28 11:30', updatedAt: '2026-10-01 16:05', createdBy: '営業担当A' },
  { recordNo: '1052', caseNo: '000043001', caseStatus: 'NG',     caseType: T_SPECFIX, janCode: '4987234010127', specId: '20000006', companyName: 'ユースキン製薬株式会社', caseName: 'ユースキンA 冬の乾燥対策',        provideCount: 600,  postStart: '2026-12-01', recruitStart: '2026-11-20', joudaiTotalIn: 990000, trialCostIn: 396000, createdAt: '2026-05-20 14:00', updatedAt: '2026-05-27 10:20', createdBy: '伊波 篤' },
]
