# 案例 A：基隆車站歷史觀光小工具

這個案例是一個可直接部署到 GitHub Pages 的歷史地圖小工具。使用者可以在基隆車站周邊放置或拖曳圖釘，地圖會即時列出圖釘 100 公尺內的歷史景點，並可切換中研院百年歷史地圖圖層。

## Demo 內容

- 現代底圖：Leaflet + OpenStreetMap
- 歷史底圖：中央研究院臺灣百年歷史地圖官方圖磚服務（本案例使用 RESTful tile URL）
- 本地資料：`data/processed/keelung_history_sites.geojson`
- 互動方式：
  - 點地圖或拖曳圖釘更新查詢位置
  - 即時重算 100 公尺內的歷史景點
  - 點列表同步開啟地圖 popup
  - 可開關歷史圖層並調整透明度

## 專案結構

```text
案例A_百年歷史地圖導覽/
├─ index.html
├─ styles.css
├─ app.js
├─ SKILL.md
├─ README.md
├─ SPEC.md
├─ AGENTS.md
├─ data/
│  ├─ raw/
│  │  ├─ README.md
│  │  └─ historic_wmts.txt
│  ├─ processed/
│  │  └─ keelung_history_sites.geojson
│  └─ notes/
│     └─ data_prep_notes.md
├─ outputs/
└─ scripts/
```

## 在 Codex App 使用 Skill

這個案例附了一份 `SKILL.md`，適合在 Codex App 開工前先讀。

建議順序：

1. 先讀 `SKILL.md`
2. 再讀 `README.md`、`SPEC.md`
3. 若要讓 Codex 直接協作，再讀 `AGENTS.md`

建議起手提示：

```text
請依照這個案例的 SKILL.md 協助我，先理解 README.md、SPEC.md、AGENTS.md，再幫我處理基隆歷史導覽案例。
```

## 使用資料

- `data/raw/historic_wmts.txt`
  - 中研院 tileserver 服務說明與本案例使用的圖層模板
- `data/processed/keelung_history_sites.geojson`
  - 預先整理好的基隆車站周邊歷史景點點位
- `data/notes/data_prep_notes.md`
  - 點位整理原則、欄位契約、來源清單與座標備註

## 本地預覽

在這個資料夾內執行：

```bash
python3 -m http.server 8000
```

瀏覽器打開：

- `http://127.0.0.1:8000/`

## GitHub Pages 部署

1. 建立一個新的 GitHub repo
2. 將本資料夾內容放到 repo root
3. 在 repo 的 GitHub Pages 設定中選擇從 root 發佈
4. 確認 `index.html`、`app.js`、`styles.css` 與 `data/processed/keelung_history_sites.geojson` 都在同一個相對路徑層級

## 互動驗收

- 拖曳圖釘時，側欄清單會立即更新
- 100 公尺查詢圈會跟著移動
- 歷史圖層失敗時，工具仍保留現代底圖與點位查詢
- 每個景點卡片都保留來源連結，適合課堂上說明資料來源

## 已知限制

- 歷史圖層來自外部 tileserver，若外部圖磚服務暫時失效，頁面會退回現代底圖
- 景點摘要為預先整理版，暫時不做即時抓站與即時生成
- 100 公尺查詢以地圖距離計算，不包含坡度或步行可達性
