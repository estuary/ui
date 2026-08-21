#!/usr/bin/env bash
#
# demo-tunnel.sh — expose the local Estuary dashboard for internal UI review.
#
# Builds the currently checked-out UI, serves it plus the local flow stack's
# APIs from one origin (scripts/demo-tunnel/proxy.cjs), and puts that origin
# behind a Cloudflare quick tunnel. A second quick tunnel exposes Mailpit so
# reviewers can read their one-time login codes. No accounts required.
#
# Usage (via npm):
#   npm run demo            # build + serve + tunnel
#   npm run demo:stop       # stop proxy + tunnels
#   npm run demo:status     # show state + current URLs
#   npm run demo:restart    # stop then start
#
# To demo a specific branch: git checkout <branch>, then `npm run demo` (or demo:restart).
#
# Requirements: node, npm, cloudflared, and a running local flow stack
# (mise run local:stack). The quick-tunnel URLs change on every start, so the
# UI is rebuilt each time to bake in the new origin.
#
# Overridable via environment:
#   UI_DIR (default: repo root inferred from this script)
#   PROXY_PORT (9999), KONG_PORT (10010), AGENT_PORT (10020),
#   ENC_PORT (10021), MAILPIT_PORT (10013)
# Find your stack's ports with: mise run local:stack-info
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
UI_DIR="${UI_DIR:-$(cd "$SCRIPT_DIR/../.." && pwd)}"
PROXY_JS="$SCRIPT_DIR/proxy.cjs"

PROXY_PORT="${PROXY_PORT:-9999}"
KONG_PORT="${KONG_PORT:-10010}"
AGENT_PORT="${AGENT_PORT:-10020}"
ENC_PORT="${ENC_PORT:-10021}"
MAILPIT_PORT="${MAILPIT_PORT:-10013}"

RUN_DIR="${RUN_DIR:-$HOME/.flow-demo-tunnel}"
mkdir -p "$RUN_DIR"

log() { printf '\033[1;36m==>\033[0m %s\n' "$*"; }
err() { printf '\033[1;31mERROR:\033[0m %s\n' "$*" >&2; }

pidfile() { echo "$RUN_DIR/$1.pid"; }
logfile() { echo "$RUN_DIR/$1.log"; }

is_running() {
  local pf; pf="$(pidfile "$1")"
  [ -f "$pf" ] && kill -0 "$(cat "$pf")" 2>/dev/null
}

kill_one() {
  local name="$1" pf; pf="$(pidfile "$name")"
  if [ -f "$pf" ]; then
    kill "$(cat "$pf")" 2>/dev/null || true
    rm -f "$pf"
  fi
}

# Print the first trycloudflare URL to appear in a log, waiting up to ~40s.
wait_for_url() {
  local log="$1" url="" i=0
  while [ "$i" -lt 40 ]; do
    url="$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$log" 2>/dev/null | head -1 || true)"
    if [ -n "$url" ]; then echo "$url"; return 0; fi
    sleep 1; i=$((i + 1))
  done
  return 1
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || { err "'$1' not found on PATH."; exit 1; }
}

check_stack() {
  local p
  for p in "$KONG_PORT" "$AGENT_PORT" "$ENC_PORT"; do
    if ! curl -s -o /dev/null -m 3 "http://localhost:$p"; then
      err "No local stack service on port $p. Start it with 'mise run local:stack' in your flow checkout."
      err "If your stack uses different ports, set KONG_PORT/AGENT_PORT/ENC_PORT (see: mise run local:stack-info)."
      exit 1
    fi
  done
}

gen_env() {
  local url="$1"
  local src="$UI_DIR/.env.development.local"
  local dst="$UI_DIR/.env.production.local"
  if [ ! -f "$src" ]; then
    err "$src not found — cannot derive demo env."
    exit 1
  fi
  # Inherit local-stack settings (anon key, feature flags, etc.) and override
  # only the three endpoint URLs to the single tunnel origin.
  sed -E \
    -e "s#^VITE_SUPABASE_URL=.*#VITE_SUPABASE_URL=$url#" \
    -e "s#^VITE_ESTUARY_API_URL=.*#VITE_ESTUARY_API_URL=$url#" \
    -e "s#^VITE_ENCRYPTION_URL=.*#VITE_ENCRYPTION_URL=$url/v1/encrypt-config#" \
    "$src" > "$dst"
}

start() {
  require_cmd node
  require_cmd npm
  require_cmd cloudflared
  require_cmd curl

  if is_running proxy || is_running app-tunnel || is_running mail-tunnel; then
    err "Already running. Use 'restart', or 'stop' first."
    status
    exit 1
  fi

  log "Checking local flow stack (ports $KONG_PORT/$AGENT_PORT/$ENC_PORT)..."
  check_stack

  log "Starting single-origin proxy on :$PROXY_PORT..."
  BUILD_DIR="$UI_DIR/build" PROXY_PORT="$PROXY_PORT" KONG_PORT="$KONG_PORT" \
    AGENT_PORT="$AGENT_PORT" ENC_PORT="$ENC_PORT" \
    nohup node "$PROXY_JS" > "$(logfile proxy)" 2>&1 &
  echo $! > "$(pidfile proxy)"

  log "Opening app tunnel..."
  nohup cloudflared tunnel --url "http://localhost:$PROXY_PORT" > "$(logfile app-tunnel)" 2>&1 &
  echo $! > "$(pidfile app-tunnel)"

  log "Opening Mailpit tunnel..."
  nohup cloudflared tunnel --url "http://localhost:$MAILPIT_PORT" > "$(logfile mail-tunnel)" 2>&1 &
  echo $! > "$(pidfile mail-tunnel)"

  local app_url mail_url
  app_url="$(wait_for_url "$(logfile app-tunnel)")" || { err "App tunnel URL not found; see $(logfile app-tunnel)"; stop; exit 1; }
  mail_url="$(wait_for_url "$(logfile mail-tunnel)")" || { err "Mail tunnel URL not found; see $(logfile mail-tunnel)"; stop; exit 1; }
  echo "$app_url" > "$RUN_DIR/app.url"
  echo "$mail_url" > "$RUN_DIR/mail.url"

  log "Building UI for origin $app_url (this takes ~30-60s)..."
  gen_env "$app_url"
  ( cd "$UI_DIR" && npm run build >"$(logfile build)" 2>&1 ) || { err "Build failed; see $(logfile build)"; stop; exit 1; }

  print_urls
}

print_urls() {
  local app_url mail_url
  app_url="$(cat "$RUN_DIR/app.url" 2>/dev/null || echo '?')"
  mail_url="$(cat "$RUN_DIR/mail.url" 2>/dev/null || echo '?')"
  echo
  log "Demo is live:"
  echo "    App:     $app_url"
  echo "    Mailpit: $mail_url (use OTP)"
  echo
  echo "  Reviewer login: open the App URL, enter any email, click 'Already have an"
  echo "  OTP code?', then read the 6-digit code from the Mailpit URL and enter it."
  echo
  echo "  Keep this machine awake and online. Stop with: npm run demo:stop"
}

stop() {
  log "Stopping..."
  kill_one mail-tunnel
  kill_one app-tunnel
  kill_one proxy
  rm -f "$RUN_DIR/app.url" "$RUN_DIR/mail.url"
  log "Stopped."
}

# Quiet stop for internal use (no logging).
stop_quiet() { kill_one mail-tunnel; kill_one app-tunnel; kill_one proxy; }

status() {
  local s
  for s in proxy app-tunnel mail-tunnel; do
    if is_running "$s"; then
      printf '  %-12s running (pid %s)\n' "$s" "$(cat "$(pidfile "$s")")"
    else
      printf '  %-12s stopped\n' "$s"
    fi
  done
  if is_running app-tunnel && [ -f "$RUN_DIR/app.url" ]; then
    print_urls
  fi
}

case "${1:-}" in
  start) start ;;
  stop) stop ;;
  restart) stop; start ;;
  status) status ;;
  *)
    echo "Usage: $0 {start|stop|status|restart}" >&2
    exit 2
    ;;
esac
