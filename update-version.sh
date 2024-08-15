#!/bin/bash

# 获取传入的版本更新类型和预发布标识
INCREMENT_TYPE=$1

# 获取当前版本号
CURRENT_VERSION=$(jq -r '.version' package.json)

# 解析版本号的各部分
IFS='-' read -r VERSION PRE_VERSION <<< "$CURRENT_VERSION"
IFS='.' read -r -a VERSION_PARTS <<< "$VERSION"
MAJOR=${VERSION_PARTS[0]}
MINOR=${VERSION_PARTS[1]}
PATCH=${VERSION_PARTS[2]}

# 获取当前时间戳
TIMESTAMP=$(date +"%Y%m%d%H%M%S")

# 根据参数更新版本号
case $INCREMENT_TYPE in
  major)
    MAJOR=$((MAJOR + 1))
    MINOR=0
    PATCH=0
    PRE_VERSION="" # 移除预发布版本标识
    ;;
  minor)
    MINOR=$((MINOR + 1))
    PATCH=0
    PRE_VERSION="" # 移除预发布版本标识
    ;;
  patch)
    PATCH=$((PATCH + 1))
    PRE_VERSION="" # 移除预发布版本标识
    ;;
  beta)
    if [[ "$PRE_VERSION" == "beta"* ]]; then
      # 如果已经是 beta 版本，递增版本序号
      IFS='.' read -r PREFIX VERSION_NUMBER <<< "$PRE_VERSION"
      VERSION_NUMBER=$((VERSION_NUMBER + 1))
      PRE_VERSION="beta.$VERSION_NUMBER"
    else
      # 如果不是 beta 版本，初始化版本序号
      PRE_VERSION="beta.1"
    fi
    ;;
  rc)
    # 使用时间戳生成 rc 版本号
    PRE_VERSION="rc-$TIMESTAMP"
    ;;
  *)
    echo "Invalid increment type. Use 'major', 'minor', 'patch', 'beta', or 'rc'."
    exit 1
    ;;
esac

# 组合新的版本号
if [[ -n "$PRE_VERSION" ]]; then
  NEW_VERSION="$MAJOR.$MINOR.$PATCH-$PRE_VERSION"
else
  NEW_VERSION="$MAJOR.$MINOR.$PATCH"
fi

# 使用 jq 更新 package.json 中的版本号
jq --arg new_version "$NEW_VERSION" '.version = $new_version' package.json > tmp.json && mv tmp.json package.json

echo "Version updated to $NEW_VERSION"

# 提交和推送更改
git add package.json
git commit -m "chore: update version $NEW_VERSION"
git push

echo "Version updated to $NEW_VERSION and changes have been pushed."