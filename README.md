# 使い方

1. vscode の拡張機能追加部分を開く
2. 右上の...から「VSIX からのインストール」をクリック
3. ./diff-patcher-1.0.0.vsix を選択
4. 再起動するとサイドバーに![alt text](media/diff-patcher-icon.svg)のマークがお出るのでクリック
5. 適当なファイルを開いて diff 形式の文字列を入力し、Apply Patch をクリック
6. diff が適用される

# コード->VSIX

```
npm run compile
npx vsce package
```

# prompt

```
- コードを出力する際はdiff形式でそれぞれのファイル名.diffで出力し、patchコマンドでマージできるようにしてください。
- コードはclaudeのArtifactsでファイルごとに出力してください。
```
