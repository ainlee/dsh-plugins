# dsh-plugins

Ain 的 DeepSeek Harness 插件 monorepo。每個插件放在 `packages/<name>/`，各自是可安裝的 DSH bundle。

## 結構

```text
packages/
  example-hello/        # 最小範例 bundle（可刪除或改名）
```

## 新增插件

1. 複製 `packages/example-hello/` 成新的 package 目錄。
2. 修改 `package.json`（`name`、`version`、`description`、exports）。
3. 修改 `cordis.patch.yml` 的 `id` 與 `name`。
4. 修改 `index.js` 的 `apply()` 實作。
5. 更新 `locale/*.json` 的 `meta.title/description`。
6. 確認 icon 與 `files` 清單完整。

## 發佈到索引

這個 repo 的插件可由獨立的索引 repo（例如 `ainlee/dsh-plugin-index`）透過 `git` source 引用：

```json
{
  "type": "git",
  "url": "https://github.com/ainlee/dsh-plugins",
  "commit": "<40-char-lowercase-hex-commit-sha>",
  "path": "packages/<name>"
}
```

注意：DSH format 1 的 git commit 必須是 **40 位小寫 hex SHA**，不能使用 branch 或 tag。

## 注意事項

- 安裝/啟用插件會影響整個 DSH profile。
- 請勿在 plugin 程式碼中硬編碼憑證或敏感資料。
- 發布前檢查 `engines.dsh`、bundle manifest、locale/icon、授權與說明。
