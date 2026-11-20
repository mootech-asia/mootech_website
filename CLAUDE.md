# mootech_website — Claude 協作入口

開工前依序閱讀：

1. [AGENTS.md](AGENTS.md)：本 repo 協作規則。
2. [HANDOFF.md](HANDOFF.md)：用途、現況、分支／發布、驗證及下一步。
3. [README.md](README.md)：執行方式與專案功能。
4. [素材標準](docs/ASSET_STANDARD.md)、[用途清單](docs/ASSETS.md)：涉及素材時必讀。

使用者最新指示優先。先核對實際 Git 狀態，不以舊對話或另一個 repo 的設定猜測本 repo。多人同時作業使用獨立 worktree／分支或串行提交；不得強推或清空他人改動。未經使用者明確要求，不另派 subagent。

每次工作結束更新 HANDOFF.md 的工作紀錄、程式提交、驗證結果、部署狀態、阻塞與下一步。只有文件改動時檢查連結與差異，不跑無關全站測試；不能把素材 CI 通過當成業務或視覺驗收。
