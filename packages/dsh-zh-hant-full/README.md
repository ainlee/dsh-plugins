# dsh-zh-hant-full

在「設定 → 一般 → 語言」選「繁體中文」即會把 DSH 介面切換為台灣用語的繁體中文（語系代碼 `zh-Hant`；依 DSH 語言服務設計，頁面語系 `document.lang` 應同步為 `zh-Hant`，實際切換行為待 GUI 目視確認，見〈已知限制〉）。
本包本版（`v1.0.1`）收錄 74 個命名空間、4,326 個字串，取代 `dsh-zh-hant@0.1.1`；安裝後沿用既有的 `locale.preference: zh-Hant`，不需立即重選（重開後是否保存待 GUI 驗證）。相容性基準為 DSH `0.2.2-rc.5`；`package.json` 描述所稱的「以上」指以此版為基準，日後新版請用下述升級流程重新抽取與驗證字典。
停用後介面依 `zh`（內建中文）→ `en`（English）回落；未收錄的字串也循同一順序顯示，補錄前可能仍是簡體中文，不會變成空白。

## 資料來源 → 規則 → 產生器 → 檢查

語言包由本機靜態資料與產生器組成；字典視為產生檔、不手寫維護，每次由產生器重算，方便跟上 DSH 新版介面。

| 檔案 | 用途 |
| --- | --- |
| `build/installed-zh.json` | 經 `npm run refresh` 正規化的現行版本簡體字典，作為「鍵與佔位符」的唯一權威來源。 |
| `build/refresh-report.json` | 每次 refresh 的掃描、巢狀還原、漂移與基準保留報告。 |
| `data/pack-base.json` | 舊包 `dsh-zh-hant@0.1.1` 的字典，只補現行版本已不存在的鍵。 |
| `data/char-map.json` | 以 .NET `StrConv` 建立的逐字簡→繁對照表，共 310 項。 |
| `data/phrase-rules.json` | 台灣用語的詞組／樣式規則（例如「軟體」「檔案」「程式碼」「透過」）。 |
| `build/base-traditional.json` | 轉繁結果的基準黃金樣本，供檢查程式比對回歸。 |
| `dictionaries.json` | 產生檔，供本工作樹的 `check` 獨立讀回；不是套件載入或 `package.json` 的匯出項目。 |
| `lib/client.js` | 真正交付給 DSH Client 載入的產生檔，內含 `DICTIONARIES` 與註冊邏輯。 |

> `plugin_manager install_bundle` 從本機目錄建立的是 `link:` 依賴，直接指向整個原始碼工作樹；`package.json` 的 `files` 只影響打包發佈，不會過濾 `link:` 內容，因此 `scripts/`、`tests/`、`data/`、`build/`、`src/` 在連結位置也都看得到。`package.json` 的 `exports`、bundle patch 與 icon 指定的是 `lib/client.js`、`cordis.patch.yml`、`locale/*.json`、`icon.svg` 等入口；字典與註冊合約是否正確，則由 `tests/check-language-pack.mjs` 獨立讀回驗證。本套件為 `private: true`，僅供本機 `link:` 安裝，不發佈到 registry。

處理順序：以 `build/installed-zh.json` 的鍵為骨架 → 用 `data/char-map.json` 逐字轉繁 → 套用 `data/phrase-rules.json` 的詞組規則改成台灣用語 → 與 `build/base-traditional.json` 比對 → 由 `scripts/build-dictionaries.mjs` 讀取 `src/client.js` 模板，把 `/*__DICTIONARIES__*/` 標記替換為 `var DICTIONARIES = {...};` 後輸出 `lib/client.js`。`tests/check-language-pack.mjs` 負責檢查命名空間數、鍵數、佔位符一致性與轉繁結果是否偏離黃金樣本。

> `src/client.js` 是唯一需要人工維護的 Client 端模板；`lib/client.js` 是產生器輸出，請勿直接編輯。

## 可重跑驗證

目前工作樹已重跑過下面三道指令，且皆為離線、可重跑證據：

```powershell
npm run refresh   # 檢查現行安裝版本的字典來源
npm run verify    # 補缺 + 重建 + 獨立檢查
npm run verify    # 再跑一次，產生檔位元組不變
```

- `npm run refresh` 呼叫 `scripts/refresh-source.cjs`：以 `ELECTRON_RUN_AS_NODE` 讀取 `app.asar`，在系統暫存目錄複製抽取器並隔離 `HOME` / `USERPROFILE`，避免把本專案已產生的 `lib/client.js` 誤當成 bundle 掃進去。`build/refresh-report.json` 記錄結果：88 bundles、56 個 `register()`、56 個命名空間；原生抽取為 56 / 3,596，還原 `permission.access` 的 17 鍵與 `schedule.manager` 的 215 鍵後為 56 / 3,828。基準與合併皆為 56 / 3,828，`lostKeys`、`changedValues`、`warnings` 全部為空。首次 refresh 曾把 `build/installed-zh.json` 正規化為固定排版而改變檔案雜湊；報告證實字典內容零差異，第二次 refresh 已達位元組穩定。
- `npm run verify` 等於先 `build` 再 `check`（`node scripts/build-dictionaries.mjs && node tests/check-language-pack.mjs`）。本次輸出為 `74 namespaces / 4326 strings`、`installed 56/3829, pack-only 497, overlap 2214`，並通過 `check: OK`。`tests/check-language-pack.mjs` 不重建任何檔案，而是直接讀回產生檔 `dictionaries.json` 與交付檔 `lib/client.js`，檢查精確鍵集合、4,326 個字串、佔位符、黃金轉繁樣本、零寬字元、保護標記滲漏、Client 註冊資料與 `exports.inject = ['locale']`。
- 連續兩次 `verify` 後，`dictionaries.json` 與 `lib/client.js` 的 SHA-256 完全相同（分別為 `BCBF11BC32CF2C0238629D93CA1630FD7C731DFC39F941E478F1613ECAE7008B`、`3B310A2F597EDC41454CF4903DD7119EAC4324FB0B5092AE23951544E5A9DFEB`），確認產生流程具有冪等性。重跑與驗證流程不需 OpenCC、.NET、網路或執行期依賴；`.NET` 僅用於離線建立已固化的 `data/char-map.json`。本包為零 npm 執行期依賴（`dsh.client.inject` 是 DSH 服務注入，不是 npm dependency）。

## 升級流程：檢查 → 補缺 → 重建 → 驗證

DSH 改版後，請回到原始碼工作樹依下列四步更新字典：

```powershell
# 1. 檢查／抽取新版本簡體字典（app.asar 必須透過 Electron 讀）
npm run refresh
# 2. 補缺 + 3. 重建 + 4. 驗證
npm run verify
```

若新版路徑不同，可指定 Electron 執行檔與套件根目錄：

```powershell
npm run refresh -- --exe 'E:\Software\DeepSeek Harness\DeepSeek Harness.exe' `
  --root 'E:\Software\DeepSeek Harness\resources\app.asar\dsh\node_modules\@deepseek-ai'
npm run verify
```

- **檢查**：`refresh-source.cjs` 透過 Electron 讀取新版本，於暫存隔離環境抽出字典；不使用 `--locale zh`（會濾掉空命名空間）也不以 `--strict` 當閘門。巢狀 `accessDictionaries` / `managerDictionaries` 會被還原，任何基準鍵遺失或來源漂移都會拒絕寫入；確認報告後才可用 `--allow-drift` 接受新版差異。
- **補缺**：以新版本字典為準；鍵、佔位符（例如 `{name}`、`{count}`）一律跟新版本，不沿用舊包的寫法。舊包 `data/pack-base.json` 只補「新版本已不存在」的 497 個鍵。本版基準為 74 個命名空間、4,326 個字串；DSH 鍵集變動時這個數字會跟著變，`scripts/build-dictionaries.mjs` 與 `tests/check-language-pack.mjs` 內的計數斷言需同步更新（或改由來源推導），否則 `npm run verify` 會先因斷言不符而失敗。
- **重建**：`scripts/build-dictionaries.mjs` 同時產生供檢查讀回的 `dictionaries.json` 與交付載入的 `lib/client.js`，並在寫入前模擬 Client 註冊流程。
- **驗證**：`tests/check-language-pack.mjs` 只讀回上述產生檔與交付檔，獨立比對黃金樣本、精確鍵集合、佔位符與註冊合約。

`link:` 讓重跑後的新 `lib/client.js` 立刻出現在同一個安裝位置，但它是 JavaScript 模組；DSH 不會自動替換執行中的模組世代。請重新整理既有 GUI（必要時重新啟動 DSH）後再確認新字典生效，不要假設只改檔案就會即時套用。

停用後一律回落 `zh → en`；啟用時 `zh-Hant` 未收錄的鍵也循此順序顯示。

## 安裝與 GUI 驗證狀態

已依使用者授權完成舊包替換，且全程使用 DSH 官方 `plugin_manager`，未手寫 profile 檔（以下為操作當下的回報與觀察紀錄，非唯讀重審可獨立複核的證據）：

- `remove_bundle dsh-zh-hant` 與 `install_bundle F:\DevProjects\dsh-zh-hant-full` 都回報 `application: applied`；兩次操作只有與本包無關、既有的 `orca-agent-hooks` 匯入警告，沒有語言包警告、`pendingBuilds` 或 `nextStep`。
- `desktop` profile 的 `package.json`、`pnpm-lock.yaml`、`node_modules` 只留下 `dsh-zh-hant-full`（`link:F:/DevProjects/dsh-zh-hant-full`）；舊包 `dsh-zh-hant@0.1.1` 的依賴、bundle 列與目錄都已消失。`list_bundles` / `list_plugins` 顯示本包 `enabled: true`、`fiberPhase: active`，且沒有舊的 `include:zh-hant`／`patchId: zh-hant` 提供者。
- `cordis.patch.yml` 的 `locale` 列完整保留 `preference: zh-Hant`；沒有重設或改寫偏好。
- Orca Computer Use 讀到的「外掛 → 已安裝」頁本身呈現繁體中文框架（「安裝、啟用和設定外掛」「已安裝」「搜尋外掛」），並顯示本包標題「繁體中文（台灣）語言包」、完整的台灣用語描述與「啟用」切換；該分頁未截斷，也沒有舊包列。這顯示 Plugin Manager 已讀入本地化的 `meta.title`／`meta.description`，且已安裝清單中只有這一個語言包列；AX 樹無法證明整個 GUI 已切換到新載入的 Client 模組世代。

仍須明確區分的驗證限制：

- 目前沒有可用的瀏覽器 DOM 控制，Orca 只能讀取桌面視窗的 AX 樹；「設定 → 一般 → 語言」的實際選取值、`document.lang`、停用後 `zh → en` 的即時回落、偏好在重開後的保存，以及外掛詳情頁的 README／圖示像素呈現，尚未直接目視驗證。
- 已安裝清單目前顯示的是安裝時快取的 `zh-Hant` 描述文案。磁碟上的 `locale/zh-hant.json`、`locale/en.json` 已於複審後再修訂（移除未驗證的「立即生效／`document.lang`」斷言，並補上未收錄字串可能顯示簡體），因此清單與詳情頁要等 GUI 重新載入後才會反映最新文案；英文 metadata 的實際呈現也尚未切換語系驗證。
- 現有流程沒有 `pnpm run dev:web` 監看程式；若修改了列表快取以外的 Client／Web artifact，應重新整理既有 `http://127.0.0.1:7021` GUI 後再檢查，不能假設自動 HMR。

交付狀態應解讀為：離線重建、靜態合約、官方安裝回報、單一提供者啟用、偏好檔案延續，以及 Plugin Manager 已安裝清單的本地化呈現，這些項目已有證據；設定頁選取值／`document.lang`／停用回落／重開後偏好保存／詳情頁與圖示的像素層級驗證，仍待具備瀏覽器控制時補做。「偏好檔案延續」指 profile 設定檔中的 `preference: zh-Hant` 未變動，不等於 GUI 重開後一定沿用。

## 同一份語言包裝進全域 CLI 的 web profile

桌面版走的是 `desktop` profile；全域安裝的 `@deepseek-ai/dsh`（本次驗證基準為 0.2.2-rc.5）用 `web` profile，兩者互不相通，需要各自安裝。`web` profile 一樣掛 `@deepseek-ai/dsh-web-app` 與 `@deepseek-ai/dsh-client-locale`，所以 client 半支完全通用：

```powershell
dsh plugin --profile web add F:/DevProjects/dsh-zh-hant-full
```

- `dsh plugin` 與 `plugin_manager` 共用 `@deepseek-ai/dsh-plugin-manager/operations`，在 profile 寫入鎖內執行 pnpm，並在安裝後一併把套件補進 `dsh.profile.bundles`；不需要另外手動 reconcile。
- 語言偏好屬於使用者層覆寫，仍要自己在 `%USERPROFILE%\.dsh\profiles\web\cordis.patch.yml` 補一列（bundle 層預設不指定）：

```yaml
- id: locale
  name: "@deepseek-ai/dsh-client-locale"
  config:
    preference: zh-Hant
```

驗證結果（2026-11-17，可重跑）：

- `dsh --profile web --dump-config` 組態成立（1,337 行），`- id: locale` 只有一列且帶 `preference: zh-Hant`，bundle 層尾端出現 `# == dsh-zh-hant-full`。
- 以 `dsh web --no-open --port 0` 起站後，開機頁的模組清單含 `dsh-zh-hant-full`，`plugins/??dsh-zh-hant-full/client.js` 回 HTTP 200、259,062 bytes，內容含 `zh-Hant`、`addLanguage`、`繁體中文`；只有既有的 `orca-agent-hooks` 匯入警告，沒有語言包相關警告。
- 這只證明模組已送達瀏覽器；畫面是否真的切成繁體仍需開瀏覽器目視。

`dsh-tui` profile 不適用：終端機介面由第三方 `@deepseek-harness-tui/dsh-tui` 提供，自帶一套 i18n（`LANGS = ['zh', 'en']`，`zh` 字典為簡體），不讀 `dsh-client-locale` 的字典，也沒有外掛注入點。`headless` profile 沒有介面。

## 已知限制

- `zh-Hant → zh → en` 的回落鏈是合法設計；未收錄的鍵在補錄前會持續以簡體中文顯示，而非空白。這是取捨，不是錯誤。
- 本包刻意不提供 `meta.detail` 與預覽圖，依 DSH 規範，外掛詳情頁會直接顯示本 README 作為說明；此呈現尚未目視驗證。
- `icon.svg` 為靜態幾何圖示；圖示與實際渲染結果的視覺對比未經瀏覽器驗證，僅確認結構符合規範（透明底、單組本機漸層、無文字與指令碼）。
