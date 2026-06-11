#!/bin/bash
JAVA21_HOME=/Users/admin/Library/Java/JavaVirtualMachines/temurin-21.0.6/Contents/Home
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== Signal Desk 시작 ==="

# .env 로드
if [ -f "$SCRIPT_DIR/backend/.env" ]; then
  export $(grep -v '^#' "$SCRIPT_DIR/backend/.env" | xargs)
else
  echo "[오류] backend/.env 파일이 없습니다. .env.example을 참고해서 만들어주세요."
  exit 1
fi

pkill -f "signal-desk" 2>/dev/null
pkill -f "next-server" 2>/dev/null
pkill -f "next dev" 2>/dev/null
sleep 1

echo "[1/3] 백엔드 빌드 중..."
cd "$SCRIPT_DIR/backend"
JAVA_HOME=$JAVA21_HOME mvn package -DskipTests -q
if [ $? -ne 0 ]; then echo "백엔드 빌드 실패"; exit 1; fi

echo "[2/3] 백엔드 실행 중 (포트 8080)..."
JAVA_HOME=$JAVA21_HOME java -jar target/*.jar > /tmp/signal-desk-backend.log 2>&1 &

echo "   백엔드 준비 대기..."
for i in {1..20}; do
  sleep 2
  if curl -s http://localhost:8080/api/interests > /dev/null 2>&1; then
    echo "   백엔드 준비 완료"; break
  fi
done

echo "[3/3] 프론트엔드 실행 중 (포트 3000)..."
cd "$SCRIPT_DIR/frontend"
npm run dev > /tmp/signal-desk-frontend.log 2>&1 &

sleep 5
echo ""
echo "=== 실행 완료 ==="
echo "  대시보드:   http://localhost:3000/dashboard"
echo "  백엔드 API: http://localhost:8080/api"
