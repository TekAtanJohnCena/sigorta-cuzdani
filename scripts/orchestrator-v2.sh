#!/bin/bash

# PRODUCTION-GRADE AGENT ORKESTRATORU v2
# Error handling + Auto-retry + Security feedback loop

set -e  # Exit on error (but we'll handle specific errors)

TASK="$1"
TIMESTAMP=$(date +%s)
PLAN_FILE=".claude/plans/${TIMESTAMP}-plan.md"
DIFF_FILE=".claude/diffs/${TIMESTAMP}-changes.diff"
AUDIT_REPORT=".claude/diffs/${TIMESTAMP}-audit.md"
LOG_FILE=".claude/logs/${TIMESTAMP}-workflow.log"

MAX_RETRIES=3
RETRY_COUNT=0

mkdir -p .claude/plans .claude/diffs .claude/logs

# Logging helper
log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log_error() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] ❌ ERROR: $1" | tee -a "$LOG_FILE" >&2
}

# Validate input
if [ -z "$TASK" ]; then
  log_error "No task provided"
  echo "Usage: $0 'Task description'"
  exit 1
fi

log "🚀 Starting workflow: $TASK"
log "Files: Plan=$PLAN_FILE, Diff=$DIFF_FILE, Audit=$AUDIT_REPORT"
echo ""

# ============================================
# PHASE 1: ARCHITECT
# ============================================
phase1_architect() {
  log "🏗️  PHASE 1: ARCHITECT (Sonnet 4.6)"
  echo "================================================"

  # Architect creates plan
  if ! claude-code agent --type architect --prompt \
  "Task: $TASK

Create a detailed implementation plan with:
1. Files to create/modify (exact paths)
2. Function signatures
3. Data flow
4. Security considerations
5. Edge cases

Output should be production-ready markdown." > "$PLAN_FILE" 2>> "$LOG_FILE"; then
    log_error "Architect failed to create plan"
    exit 1
  fi

  if [ ! -s "$PLAN_FILE" ]; then
    log_error "Plan file is empty"
    exit 1
  fi

  log "✅ Plan created: $PLAN_FILE ($(wc -l < "$PLAN_FILE") lines)"
  echo ""

  # Show plan to user
  cat "$PLAN_FILE"
  echo ""

  # User approval
  read -p "🤔 Approve this plan? (y/n/edit): " APPROVAL

  case "$APPROVAL" in
    y|Y)
      log "✅ Plan approved by user"
      return 0
      ;;
    e|E|edit)
      log "📝 User requested plan edit"
      ${EDITOR:-nano} "$PLAN_FILE"
      log "✅ Plan manually edited"
      return 0
      ;;
    *)
      log "❌ Plan rejected by user"
      exit 1
      ;;
  esac
}

# ============================================
# PHASE 2: DEVELOPER (with retry support)
# ============================================
phase2_developer() {
  local ATTEMPT=$1
  local FEEDBACK=${2:-""}

  log "👨‍💻 PHASE 2: DEVELOPER (Attempt $ATTEMPT/$MAX_RETRIES)"
  echo "================================================"

  # Build prompt with feedback if this is a retry
  local PROMPT="Implement the following plan:

$(cat "$PLAN_FILE")

Rules:
- Only modify files mentioned in the plan
- Follow existing code style in the codebase
- Use structured logging (logger.debug/info/warn/error)
- Add minimal comments (only non-obvious logic)
- Stage ALL changes with 'git add'"

  if [ -n "$FEEDBACK" ]; then
    PROMPT="$PROMPT

⚠️  SECURITY AUDIT FAILED ON PREVIOUS ATTEMPT!

Previous Issues Found:
$FEEDBACK

FIX THESE ISSUES in this implementation. Pay special attention to:
1. Input validation
2. SQL injection prevention
3. XSS protection
4. No exposed secrets
5. Proper authentication checks"
  fi

  # Reset staged changes if this is a retry
  if [ "$ATTEMPT" -gt 1 ]; then
    log "🔄 Resetting previous failed implementation..."
    git reset HEAD . >> "$LOG_FILE" 2>&1 || true
    git checkout . >> "$LOG_FILE" 2>&1 || true
  fi

  # Developer implements
  if ! claude-code agent --type developer --prompt "$PROMPT" 2>> "$LOG_FILE"; then
    log_error "Developer implementation failed"
    return 1
  fi

  # Check if files were actually changed
  if ! git diff --cached --quiet 2>/dev/null; then
    log "✅ Implementation complete (files modified)"
    return 0
  elif git diff --quiet 2>/dev/null; then
    log_error "No files were modified by developer"
    return 1
  else
    log "✅ Implementation complete (unstaged changes exist)"
    # Stage them if developer forgot
    git add -A >> "$LOG_FILE" 2>&1
    return 0
  fi
}

# ============================================
# PHASE 3: SECURITY AUDITOR
# ============================================
phase3_security_audit() {
  log "🔒 PHASE 3: SECURITY AUDITOR (Haiku 4.5)"
  echo "========================================================="

  # Generate diff
  git diff --cached > "$DIFF_FILE" 2>> "$LOG_FILE"

  if [ ! -s "$DIFF_FILE" ]; then
    log_error "No staged changes to audit"
    return 1
  fi

  DIFF_SIZE=$(wc -l < "$DIFF_FILE")
  log "📊 Reviewing $DIFF_SIZE lines of changes..."

  # Security audit with structured output
  if ! claude-code agent --type security-auditor --prompt \
  "You are a security auditor. Review this git diff for vulnerabilities.

Git Diff:
\`\`\`diff
$(cat "$DIFF_FILE")
\`\`\`

Check for:
1. SQL injection vectors (unsafe queries, unparameterized SQL)
2. XSS vulnerabilities (unescaped output, dangerouslySetInnerHTML)
3. Exposed secrets (API keys, passwords, tokens in code)
4. Missing authentication checks (public endpoints that should be protected)
5. Insecure dependencies (vulnerable packages)

Output format:
✅ PASS - if no issues
❌ FAIL - with numbered list of issues (file:line format)

Be strict but reasonable. Only flag real security issues, not code style." > "$AUDIT_REPORT" 2>> "$LOG_FILE"; then
    log_error "Security audit execution failed"
    return 1
  fi

  # Parse audit result
  if grep -q "✅ PASS" "$AUDIT_REPORT"; then
    log "✅ Security audit: PASS"
    cat "$AUDIT_REPORT"
    return 0
  elif grep -q "❌ FAIL" "$AUDIT_REPORT"; then
    log_error "Security audit: FAIL"
    echo ""
    cat "$AUDIT_REPORT"
    echo ""
    return 1
  else
    log_error "Security audit: UNKNOWN (could not parse result)"
    cat "$AUDIT_REPORT"
    return 1
  fi
}

# ============================================
# MAIN WORKFLOW WITH RETRY LOOP
# ============================================

# Phase 1: Architect (no retry, must be approved)
phase1_architect

# Phase 2 & 3: Developer + Security (with retry loop)
SECURITY_FEEDBACK=""

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  RETRY_COUNT=$((RETRY_COUNT + 1))

  # Phase 2: Developer
  if ! phase2_developer $RETRY_COUNT "$SECURITY_FEEDBACK"; then
    log_error "Developer phase failed on attempt $RETRY_COUNT"

    if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
      read -p "🔄 Retry implementation? (y/n): " RETRY_CHOICE
      if [ "$RETRY_CHOICE" != "y" ]; then
        log "❌ User chose not to retry"
        exit 1
      fi
      continue
    else
      log_error "Max retries reached for developer phase"
      exit 1
    fi
  fi

  # Phase 3: Security Audit
  if phase3_security_audit; then
    # SUCCESS! Security passed
    echo ""
    log "✅ WORKFLOW COMPLETE - SECURITY PASSED"
    echo "==========================================="
    echo "📁 Plan:  $PLAN_FILE"
    echo "📄 Diff:  $DIFF_FILE"
    echo "🔒 Audit: $AUDIT_REPORT"
    echo "📋 Log:   $LOG_FILE"
    echo ""
    echo "Next steps:"
    echo "1. Review changes: git diff --cached"
    echo "2. Commit: git commit -m 'feat: $TASK'"
    echo "3. Or rollback: git reset HEAD ."

    # Log cost tracking
    TOTAL_TOKENS=$((2000 + 1500 * RETRY_COUNT + 500))
    ./scripts/cost-tracker.sh workflow "$TOTAL_TOKENS" "$TASK (${RETRY_COUNT} attempts)" >> "$LOG_FILE" 2>&1 || true

    exit 0
  else
    # FAILED! Security found issues
    log "⚠️  Security audit failed on attempt $RETRY_COUNT"

    if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
      # Extract issues for feedback
      SECURITY_FEEDBACK=$(cat "$AUDIT_REPORT")

      echo ""
      log "🔄 Retry $RETRY_COUNT/$MAX_RETRIES: Sending security feedback to developer..."
      echo ""
      sleep 2
      continue
    else
      log_error "Max retries reached. Security issues remain."
      echo ""
      echo "❌ WORKFLOW FAILED AFTER $MAX_RETRIES ATTEMPTS"
      echo "=============================================="
      echo "Security issues could not be automatically fixed."
      echo ""
      echo "Manual intervention required:"
      echo "1. Review issues: cat $AUDIT_REPORT"
      echo "2. Fix manually or adjust plan"
      echo "3. Run workflow again"
      echo ""
      echo "Changes are staged but NOT committed."

      exit 1
    fi
  fi
done

# Should never reach here
log_error "Unexpected exit from retry loop"
exit 1
