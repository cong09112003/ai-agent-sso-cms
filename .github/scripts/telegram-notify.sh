#!/usr/bin/env bash
# Sends a pipeline status message to Telegram. Never fails the workflow.
# Usage: telegram-notify.sh <started|success|failure> <title> [details]
# Env: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID (skipped if missing), plus the GITHUB_* defaults.
set -uo pipefail

status="$1"
title="$2"
details="${3:-}"

if [ -z "${TELEGRAM_BOT_TOKEN:-}" ] || [ -z "${TELEGRAM_CHAT_ID:-}" ]; then
    echo "Telegram secrets not set; skipping notification"
    exit 0
fi

case "$status" in
    started) icon="🚀" ;;
    success) icon="✅" ;;
    failure) icon="❌" ;;
    *) icon="ℹ️" ;;
esac

commit_msg=$(git log -1 --pretty=%s 2>/dev/null | head -c 200)

text="${icon} ${title}
Repo: ${GITHUB_REPOSITORY}
Branch: ${GITHUB_REF_NAME}
Commit: ${GITHUB_SHA::7} - ${commit_msg}
By: ${GITHUB_ACTOR}"
if [ -n "$details" ]; then
    text="${text}
${details}"
fi
text="${text}
Run: ${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}"

http_code=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 15 \
    "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
    --data-urlencode "chat_id=${TELEGRAM_CHAT_ID}" \
    --data-urlencode "text=${text}" \
    --data "disable_web_page_preview=true") || true
echo "Telegram response: ${http_code:-none}"
exit 0
