#!/bin/bash

# 设置变量
REPO_URL="https://github.com/peng-xiao-shuai/telegram-sdk-docs.git"
BRANCH="gh-pages" # 可以是你想要推送到的任何分支
DOCS_FOLDER="docs"
README_FILE="README.md"
PACKAGES_FOLDER="packages"
CHANGELOG_FILE="CHANGELOG.md"

# 检查 DOCS_FOLDER 文件夹是否存在
if [ ! -d "$DOCS_FOLDER" ]; then
  echo "Docs folder does not exist!"
  exit 1
fi

# 初始化一个新的临时目录
TEMP_DIR=$(mktemp -d)
echo "Using temporary directory $TEMP_DIR"

# 复制docs文件夹内容到临时目录
mkdir -p $TEMP_DIR/$DOCS_FOLDER
cp -r $DOCS_FOLDER/* $TEMP_DIR/$DOCS_FOLDER

# 复制 README.md 到临时目录
cp $README_FILE $TEMP_DIR

# 复制 packages 下的子文件夹中的 CHANGELOG.md 文件到临时目录，同时保留文件结构
for dir in $PACKAGES_FOLDER/*/; do
  if [ -f "$dir$CHANGELOG_FILE" ]; then
    mkdir -p $TEMP_DIR/$dir
    cp "$dir$CHANGELOG_FILE" $TEMP_DIR/$dir
  fi
done

# 进入临时目录并初始化Git仓库
cd $TEMP_DIR
git init
git remote add origin $REPO_URL

# 添加所有文件并提交
git add .
git commit -m "Deploy docs"

# 强制推送到远程仓库
git push --force origin master:$BRANCH

# 清理临时目录
rm -rf $TEMP_DIR

echo "Docs deployed successfully!"