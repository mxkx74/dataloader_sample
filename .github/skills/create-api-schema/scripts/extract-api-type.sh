#!/usr/bin/env bash
# OpenAPI型定義から構造情報を抽出し、API Schemaの雛形（src/models/resources/{resource}/schema.ts）を生成するスクリプト
#
# Usage:
#   .github/skills/create-api-schema/scripts/extract-api-type.sh /rezept/benefit-amounts/summary
#   .github/skills/create-api-schema/scripts/extract-api-type.sh /rezept/benefit-amounts/summary get

set -euo pipefail

# 型定義ファイルのパス
API_TYPES_PATH="node_modules/@litalico-engineering/thaleia-core-api-types/dist/index.d.ts"

# ヘルプメッセージ
show_help() {
  echo ""
  echo "📖 使用方法:"
  echo "   .github/skills/create-api-schema/scripts/extract-api-type.sh <endpoint> [method]"
  echo ""
  echo "例:"
  echo "   .github/skills/create-api-schema/scripts/extract-api-type.sh /rezept/benefit-amounts/summary"
  echo "   .github/skills/create-api-schema/scripts/extract-api-type.sh /rezept/total-amounts get"
  echo ""
  exit 0
}

# 引数チェック
if [ $# -eq 0 ] || [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
  show_help
fi

ENDPOINT="$1"
METHOD="${2:-get}"

# ファイル存在チェック
if [ ! -f "$API_TYPES_PATH" ]; then
  echo "❌ OpenAPI型定義ファイルが見つかりません"
  echo "   パス: $API_TYPES_PATH"
  exit 1
fi

# エンドポイント定義を検索
if ! grep -q "\"$ENDPOINT\":" "$API_TYPES_PATH"; then
  echo "❌ エンドポイント \"$ENDPOINT\" が見つかりません"
  exit 1
fi

# Operation名を抽出
OPERATION_NAME=$(grep -A 15 "\"$ENDPOINT\":" "$API_TYPES_PATH" | \
  grep "$METHOD: operations" | \
  sed -E 's/.*operations\["([^"]+)"\].*/\1/' || echo "")

if [ -z "$OPERATION_NAME" ]; then
  METHOD_UPPER=$(echo "$METHOD" | tr '[:lower:]' '[:upper:]')
  echo "❌ ${METHOD_UPPER} メソッドの定義が見つかりません"
  exit 1
fi

# Response型のパスを構築
RESPONSE_PATH="paths['$ENDPOINT']['$METHOD']['responses']['200']['content']['application/json']"

# 機能名を生成（例: /rezept/benefit-amounts/summary → BenefitAmounts）
generate_feature_name() {
  local endpoint="$1"
  # /rezept/ を除去
  local path="${endpoint#/rezept/}"
  # リソース単位のパスセグメントを取得（例: benefit-amounts/summary → benefit-amounts）
  local resource="${path%%/*}"
  # ハイフン区切りを単語として扱い、各単語の先頭を大文字化
  echo "$resource" | awk -F'-' '{
    result = ""
    for(i=1; i<=NF; i++) {
      result = result toupper(substr($i,1,1)) substr($i,2)
    }
    print result
  }'
}

FEATURE_NAME=$(generate_feature_name "$ENDPOINT")
SCHEMA_NAME="$(echo "${FEATURE_NAME:0:1}" | tr '[:upper:]' '[:lower:]')${FEATURE_NAME:1}"

# コード雛形を生成
generate_sample_code() {
  cat <<EOF
import type { paths } from '@litalico-engineering/thaleia-core-api-types';

import { z } from 'zod';

type ${FEATURE_NAME}Response =
  ${RESPONSE_PATH};

// TODO: ネストしたオブジェクトや配列の型を確認し、適切にスキーマを定義してください
export const ${SCHEMA_NAME}Schema = z.object({
  // TODO: フィールドを実装
}) satisfies z.ZodType<${FEATURE_NAME}Response>;

export type ${FEATURE_NAME} = z.infer<typeof ${SCHEMA_NAME}Schema>;
EOF
}

# 結果を表示
METHOD_UPPER=$(echo "$METHOD" | tr '[:lower:]' '[:upper:]')

echo ""
echo "✅ 型情報を抽出しました"
echo ""
echo "📍 エンドポイント: $ENDPOINT"
echo "🔧 HTTPメソッド: ${METHOD_UPPER}"
echo "📦 Operation名: $OPERATION_NAME"
echo ""
echo "📄 型定義パス:"
echo "   $RESPONSE_PATH"
echo ""
echo "💡 生成されたコード雛形:"
echo ""
echo "────────────────────────────────────────────────────────────────────────────────"
generate_sample_code
echo "────────────────────────────────────────────────────────────────────────────────"
echo ""
echo "📝 次のステップ:"
echo "   1. 上記コードを src/models/resources/{resource}/schema.ts に保存（{resource} は対象リソース名に置き換え）"
echo "   2. OpenAPI定義を確認して、フィールドの詳細を実装"
echo "   3. 適切なバリデーション（.min(), .nullable() 等）を追加"
echo "   4. MSW Mockを作成"
echo ""
