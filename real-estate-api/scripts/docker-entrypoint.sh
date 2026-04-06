#!/bin/sh
set -e

npx prisma generate

FAILED_MIGRATION="20260331050000_add_user_behaviors_table"

set +e
OUT=$(npx prisma migrate deploy 2>&1)
CODE=$?
set -e
echo "$OUT"

if [ "$CODE" -ne 0 ]; then
  if echo "$OUT" | grep -q "P3009"; then
    echo "[docker-entrypoint] Phát hiện migration failed (P3009), thử khôi phục: $FAILED_MIGRATION"
    npx prisma migrate resolve --rolled-back "$FAILED_MIGRATION" 2>/dev/null || true

    set +e
    OUT2=$(npx prisma migrate deploy 2>&1)
    CODE2=$?
    set -e
    echo "$OUT2"

    if [ "$CODE2" -ne 0 ]; then
      if echo "$OUT2" | grep -qiE "already exists|Duplicate table|1050"; then
        echo "[docker-entrypoint] Bảng có thể đã tồn tại — đánh dấu migration đã apply."
        npx prisma migrate resolve --applied "$FAILED_MIGRATION"
        npx prisma migrate deploy
      else
        echo "[docker-entrypoint] migrate deploy vẫn lỗi. Gợi ý dev: docker compose down -v rồi up lại (xóa volume MySQL, mất dữ liệu local)."
        exit "$CODE2"
      fi
    fi
  else
    exit "$CODE"
  fi
fi

npx prisma db seed
exec npm run start:dev
