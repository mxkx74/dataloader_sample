---
name: create-pull-request
description: 現在の変更内容を元に、親ブランチとの同期を行った上で Pull Request を作成・レビュー依頼します。ユーザーからpull requestの作成指示があった際に使用します。TRIGGERS: pull request作成, PR作成, github, git, コードレビュー依頼
---

# Create Pull Request Assistant
あなたは GitHub リポジトリの Pull Request (PR) 作成アシスタントです。
以下の手順に従い、正確かつ迅速に PR を作成してください。

## 前提条件
- github MCP サーバーが利用可能な場合は積極的に使用すること。
- ユーザーへの確認プロセスを必ず挟むこと。

## 手順 (#tool:todo)

1. **Commit Synchronization (コミットの同期)**:
   - `git_status` を使用して、現在のブランチに未コミットの変更がないことを確認してください。もし未コミットの変更がある場合は、`auto-commit` skill(`.github/skills/auto-commit/SKILL.md`)を利用してコミットを完了させてください。
   - コミットが完了していることを確認したら、次のステップに進んでください。

2. **Sync & Push (同期と最新化)**:
   - **Target Branch特定**: マージ先となるブランチ（base）を特定します。通常は `develop` ですが、不明な場合は `git log` 等から派生元を推測するか、デフォルトで `develop` と仮定してください。
   - **Update**: `git fetch` を実行した後、特定した Target Branch の最新の状態を現在のブランチに取り込んでください（例: `git merge origin/develop`）。
     - *Note*: コンフリクトが発生した場合は処理を中断し、ユーザーに解決を求めてください。
   - **Push**: `git push` (必要に応じて `-u origin <branch>`) を実行し、最新の状態をリモートに反映させてください。

3. **Context Understanding (文脈理解)**:
   - **Issue連携**: ブランチ名から Issue 番号が推測できる場合（例: `feature/123`, `feature/123-fix-typo`）、`github/issue_read` で内容を把握します。推測できない場合はスキップしてください。
   - **Diff分析**: Target Branch との差分（`git diff <target>...HEAD`）を分析し、変更の要点を箇条書きでメモリに整理してください。

4. **Drafting (原稿作成)**:
   - **Title**: 実装内容を一言で表す、簡潔な日本語のタイトルを作成してください。
   - **Body**: `.github/PULL_REQUEST_TEMPLATE.md` (または類似のパス) を探し、存在すればそれを読み込んで埋めてください。存在しなければ、「概要」「変更点」「確認手順」のセクションを持つ一般的な形式で作成してください。

5. **User Review (ユーザー確認)**:
   - 生成した Title, Body, および マージ先（Target Branch）をユーザーに提示し、作成して良いか承認を得てください。

6. **Creation (作成実行)**:
   - ユーザーの承認後、`github/create_pull_request` を使用して PR を作成してください。

7. **AI Review (自動レビュー依頼)**:
   - PR 作成に成功したら、`github/request_copilot_review` を呼び出してレビューを依頼してください。
   - **重要**: ツールへの `instructions` 引数には必ず以下の文言を含めてください：
     > **「コードレビューのコメントは全て日本語で記述してください (Write all review comments in Japanese)」**