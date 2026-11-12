"""テーブル定義書（案件管理シート）→ src/caseSimpleDefs.js を生成する。

使い方（anken-main 直下で実行）:
    python tools/gen_case_defs.py "【kintone】サンプル百貨店_テーブル定義書_LMS.xlsx"

  B列 論理名 → 項目名（「名前[文言]」はチェックボックス）
  G列 備考   → グループ（空欄＝最上部の基本項目、[…]＝オプション設定の小見出し、
               ACEテーブル上には不要…＝直前の項目と同じグループ、※次期新規追加＝新規マーク、
               ※現行：…＝注記）
  H列        → ドロップダウンの選択肢（1:有,2:無／…を参照（a,b,c）／a、b、c）
"""
import json
import re
import sys
from pathlib import Path

from openpyxl import load_workbook

SHEET = "案件管理"
HEAD = ""                 # 備考が空欄 → 詳細最上部（グループの外）
OPTION = "オプション設定"

LOOKUP = {"カテゴリーコード"}                       # コード入力＋取得／クリア
CODE_AUTO = {"企業コード", "倉庫ID", "配送除外地域ID", "配送料種別ID"}   # 名称を入れるとコードが自動
SUGGEST = {"企業名", "倉庫", "配送除外地域"}            # 名称入力（候補リスト付き）
LOOKUP_COPY = {"大カテゴリー", "中カテゴリー", "小カテゴリー",
               "dサンプル加算料率", "d払い加算料率", "Y店加算料率",
               "dサンプル加算料率（%）", "d払い加算料率（%）", "Y店加算料率（%）",
               "dサンプル加算料率マスタ", "d払い加算料率マスタ", "Y店加算料率マスタ"}
CHECKS = {"会員限定", "非会員申込可否", "抽選可否", "軽減税率フラグ", "通知フラグ"}
SELECTS = {"種別", "酒類", "ドライアイス", "制作ステータス", "ショッピング広告掲載", "申込可能個数",
           "販売形態", "掲載変更ステータス", "配送方法名称", "承認フロー", "掲載時間"}
EDITABLE = {"本店売上比率"}                          # 計算グループ内でも入力可
TEXTAREA = {"備考(営業部内宛)", "備考(オペ宛)", "メモ", "過去実績/類似商品実績"}
CALC_GROUPS = {"粗利", "総額", "単価", "システム項目"}
CALC_NAMES = {"レコード番号", "案件No", "上代合計（税込）", "上代合計（税抜）", "参考価格（税込）",
              "セット原価", "仕入合計", "掛け率", "お試し費用（税抜）", "Y店お試し費用（税抜）",
              "お試し費用単価（税込）", "総売上（税込）", "お試し費用（税抜）+5%", "お試し費用（税込）+5%",
              "dサンプルお試し費用（税抜）", "d払いお試し費用（税抜）", "社販コムお試し費用（税抜）",
              "会員コムお試し費用（税抜）"}
MONEY = ("費用", "価格", "合計", "額", "原価", "売上", "粗利", "手数料", "料", "単価", "費", "送料", "代")


def parse_options(h):
    if not h:
        return None
    h = str(h)
    if "参照" in h and "（" not in h:
        return None
    body = h[h.index("参照（") + 3:h.rindex("）")] if "参照（" in h else h
    if "マスタ" in body or "参照" in body:
        return None
    opts = []
    for p in re.split(r"[,、／]", body):
        p = re.sub(r"^\s*(常温|冷凍・冷蔵)：", "", p.strip())
        p = re.sub(r"^\d+:", "", p).strip()
        if p and p not in opts:
            opts.append(p)
    return opts if len(opts) >= 2 else None


def kind_of(name, group, has_bool, options):
    if has_bool or group == "掲載チャネル" or name in CHECKS:
        return "checkbox"
    if name in LOOKUP:
        return "lookup"
    if name in SUGGEST:
        return "suggest"
    if name in CODE_AUTO or name in LOOKUP_COPY:
        return "text"
    if options or name in SELECTS:
        return "select"
    if name in TEXTAREA:
        return "textarea"
    if name.endswith("日時"):
        return "text"
    if name.endswith("日") or name == "賞味期限":
        return "date"
    if "枚数" in name:
        return "num"
    if "率" in name and "マスタ" not in name:
        return "pct"
    if group == "変動" or (any(w in name for w in MONEY) and not name.endswith("数")):
        return "money"
    if name.endswith("数"):
        return "num"
    return "text"


def main(xlsx, out):
    ws = load_workbook(xlsx, data_only=True)[SHEET]
    head = next(r for r in range(1, 40) if ws.cell(r, 2).value == "論理名")
    defs, prev = [], HEAD
    for r in range(head + 1, ws.max_row + 1):
        name = ws.cell(r, 2).value
        if not name:
            continue
        name = str(name).strip()
        memo = str(ws.cell(r, 7).value or "").replace("\u3000", " ").strip()
        sub, note, new = "", "", False
        if not memo:
            group = HEAD
        elif memo.startswith("ACEテーブル"):
            group = prev
        elif memo.startswith("["):
            group, sub = OPTION, memo.strip("[]")
        else:
            base, _, rest = memo.partition("※")
            group = base.strip()
            new = "次期新規" in rest
            if rest and not new:
                note = "※" + rest.strip()
        prev = group
        label, bool_label = name, ""
        m = re.match(r"(.+?)\[(.+)\]$", name)
        if m:
            label, bool_label = m.group(1), m.group(2)
        options = parse_options(ws.cell(r, 8).value)
        kind = kind_of(name, group, bool(bool_label), options)
        auto = (kind != "checkbox" and name not in EDITABLE and (
                name in LOOKUP_COPY or name in CODE_AUTO or group in CALC_GROUPS
                or name in CALC_NAMES or (group == "変動" and name != "調整費")))
        d = {"key": f"r{r}", "name": name, "label": label, "group": group, "kind": kind}
        if sub: d["sub"] = sub
        if bool_label: d["boolLabel"] = bool_label
        if options: d["options"] = options
        if auto: d["auto"] = True
        if new: d["isNew"] = True
        if note: d["note"] = note
        defs.append(d)
    body = ",\n".join("  " + json.dumps(d, ensure_ascii=False) for d in defs)
    Path(out).write_text(
        "// ============================================================\n"
        "// 案件管理（現行踏襲）項目定義 ※自動生成ファイル。直接編集しない\n"
        f"//   生成元: {Path(xlsx).name}「{SHEET}」シート\n"
        "//   再生成: python tools/gen_case_defs.py <定義書.xlsx>\n"
        "//   kind: text/textarea/select/checkbox/date/money/pct/num/lookup/suggest\n"
        "//   group: 空文字＝詳細最上部（グループ外） / auto: 計算・ルックアップ項目（入力不可）\n"
        "// ============================================================\n"
        f"export const CASE_DEFS = [\n{body},\n]\n", encoding="utf-8")
    print(f"{len(defs)} 項目 → {out}")


if __name__ == "__main__":
    xlsx = sys.argv[1] if len(sys.argv) > 1 else next(Path(".").glob("*テーブル定義書_LMS*.xlsx"))
    main(xlsx, Path(__file__).resolve().parent.parent / "src" / "caseSimpleDefs.js")
