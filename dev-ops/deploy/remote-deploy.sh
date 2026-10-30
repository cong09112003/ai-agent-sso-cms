#!/usr/bin/env bash
# Runs on the server (piped over SSH by the GitHub Actions workflow).
# Replaces the app container with an already-loaded image, waits for the Docker healthcheck,
# rolls back to the previous image if the new one is not healthy, then removes old images.
#
# Usage: remote-deploy.sh <app-name> <image:tag> <host-port>
set -euo pipefail

APP_NAME="$1"
IMAGE="$2"
HOST_PORT="$3"
CONTAINER_PORT=80
KEEP_IMAGES=3
HEALTH_TIMEOUT_SECONDS=90

run_container() {
    docker run -d \
        --name "$APP_NAME" \
        --restart unless-stopped \
        -p "${HOST_PORT}:${CONTAINER_PORT}" \
        --label "fe-app=${APP_NAME}" \
        --log-opt max-size=10m --log-opt max-file=3 \
        "$1" >/dev/null
}

wait_healthy() {
    local status
    for _ in $(seq 1 "$HEALTH_TIMEOUT_SECONDS"); do
        status=$(docker inspect -f '{{.State.Health.Status}}' "$APP_NAME" 2>/dev/null || echo missing)
        case "$status" in
            healthy) return 0 ;;
            unhealthy | missing) return 1 ;;
        esac
        sleep 1
    done
    return 1
}

PREVIOUS_IMAGE=$(docker inspect -f '{{.Config.Image}}' "$APP_NAME" 2>/dev/null || true)
docker rm -f "$APP_NAME" >/dev/null 2>&1 || true

if run_container "$IMAGE" && wait_healthy; then
    echo "Deployed ${IMAGE} as ${APP_NAME} on port ${HOST_PORT}"
else
    echo "ERROR: ${IMAGE} did not become healthy" >&2
    docker logs --tail 50 "$APP_NAME" >&2 2>&1 || true
    docker rm -f "$APP_NAME" >/dev/null 2>&1 || true
    if [ -n "$PREVIOUS_IMAGE" ] && [ "$PREVIOUS_IMAGE" != "$IMAGE" ]; then
        run_container "$PREVIOUS_IMAGE" && echo "Rolled back to ${PREVIOUS_IMAGE}" >&2
    fi
    exit 1
fi

# Keep only the newest KEEP_IMAGES tags of this app (docker images lists newest first)
docker images "${IMAGE%:*}" --format '{{.Repository}}:{{.Tag}}' \
    | tail -n +"$((KEEP_IMAGES + 1))" \
    | xargs -r docker rmi >/dev/null 2>&1 || true
