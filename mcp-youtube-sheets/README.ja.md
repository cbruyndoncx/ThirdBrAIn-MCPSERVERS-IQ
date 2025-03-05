# YouTube to Google Sheets MCP サーバー

このMCPサーバーは、YouTube動画を検索し、その結果を自動的にGoogle Sheetsに保存する機能を提供します。ClaudeやModel Context Protocolをサポートする他のAIアシスタントと連携して動作するように設計されています。

## 機能

- YouTube Data API v3を使用した動画検索
- 検索結果のGoogle Sheetsへの自動保存
- 検索パラメータのカスタマイズ（検索クエリ、最大結果数）
- 保存される情報：動画タイトル、URL、チャンネル名、公開日時

## インストール

```bash
npm install @rikukawa/youtube-sheets-server
```

## 前提条件

1. YouTube Data API v3のセットアップ:
   - [Google Cloud Console](https://console.cloud.google.com/)にアクセス
   - 新しいプロジェクトを作成
   - YouTube Data API v3を有効化
   - APIキーを作成

2. Google Sheets APIのセットアップ:
   - 同じプロジェクトでGoogle Sheets APIを有効化
   - サービスアカウントを作成
   - サービスアカウントのキー（JSON形式）をダウンロード
   - 対象のGoogle Sheetをサービスアカウントのメールアドレスと共有

## 設定

MCPの設定ファイルにサーバーを追加します：

```json
{
  "mcpServers": {
    "youtube-sheets": {
      "command": "node",
      "args": ["path/to/youtube-sheets-server/build/index.js"],
      "env": {
        "YOUTUBE_API_KEY": "あなたのYouTube-APIキー",
        "SPREADSHEET_ID": "あなたのスプレッドシートID"
      },
      "disabled": false,
      "alwaysAllow": []
    }
  }
}
```

## 使用方法

AIアシスタントに、『「ChatGPT　使い方」でYoutube動画を調べて動画を10個取得して。』といったように指示して使用してみてください。

## 出力形式

ツールは以下の情報をGoogle Sheetに保存します：
- 動画タイトル
- 動画URL
- チャンネル名
- 公開日時

## ライセンス

MIT

## 作者

Riku Kawashima

## リポジトリ

[GitHubリポジトリ](https://github.com/Rickyyy1116/mcp-youtube-sheets)

## npmパッケージ

[@rikukawa/youtube-sheets-server](https://www.npmjs.com/package/@rikukawa/youtube-sheets-server)

---
[English](README.md) | 日本語
