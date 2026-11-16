#!/bin/sh
# Verifies the built container serves the SPA and the expected headers.
set -e

BASE="http://localhost:${1:-8090}"
CONTAINER="${2:-burger-test}"

echo "=== health check ==="
curl -fsS -o /dev/null -w "GET /healthz -> HTTP %{http_code}\n" "${BASE}/healthz"

echo "=== application shell ==="
curl -fsS -o /tmp/verify-index.html -w "GET / -> HTTP %{http_code}\n" "${BASE}/"
grep -o "<title>[^<]*</title>" /tmp/verify-index.html || true

echo "=== hashed static asset ==="
ASSET=$(docker exec "${CONTAINER}" ls /usr/share/nginx/html/static/js | grep '^main.*\.js$' | head -1)
curl -fsS -o /dev/null -w "GET /static/js/${ASSET} -> HTTP %{http_code}\n" "${BASE}/static/js/${ASSET}"

echo "=== security headers ==="
curl -sSI "${BASE}/" | grep -iE "content-security-policy|x-frame-options|x-content-type-options|referrer-policy|permissions-policy" | cut -c1-100

echo "=== SPA fallback on a deep route ==="
curl -fsS -o /dev/null -w "GET /orders -> HTTP %{http_code}\n" "${BASE}/orders"

echo "=== dotfile protection ==="
curl -s -o /dev/null -w "GET /.env -> HTTP %{http_code}\n" "${BASE}/.env"
