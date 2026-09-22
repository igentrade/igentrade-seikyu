# 見積書・請求書メーカー（iGenTrade）

日本の中小企業向けに、**見積書・請求書**をブラウザだけで作成できる無料ツールです。  
印刷ダイアログから **PDF 保存**もできます。

提供: **iGenTrade**（無料・商用利用可）

## できること

- 見積書 / 請求書の切り替え
- 明細行の追加・削除
- 消費税 10% / 軽減税率 8% / 0%
- 適格請求書発行事業者登録番号の記載
- 振込先・備考欄
- 下書きをブラウザ内に保存（外部送信なし）

## 使い方

1. このリポジトリを開く（GitHub Pages を有効にしている場合はその URL）
2. 左のフォームに自社・取引先・明細を入力
3. 「印刷 / PDF」→ プリンタで「PDFに保存」

ローカルでも使えます:

```bash
# どれでも可。例:
python3 -m http.server 8080
# ブラウザで http://localhost:8080
```

または `index.html` を直接開いても動作します。

## デモ（GitHub Pages）

リポジトリの Settings → Pages で `main` / `/ (root)` を公開すると、次の URL で使えます:

`https://<your-username>.github.io/igentrade-seikyu/`

## プライバシー

計算と下書き保存はすべてブラウザ内で完結します。入力内容をサーバへ送信しません。

## ライセンス

MIT License — 改変・再配布・商用利用OK。  
クレジットに iGenTrade を残していただけると嬉しいです。

---

Made free for Japanese SMEs by **iGenTrade**.
