#!/bin/bash

# MALIYET-ODAKLI AGENT ORKESTRATORU
# Usage: ./scripts/orchestrator.sh "feature: Add policy export"

set -e

TASK="$1"
PLAN_FILE=".claude/plans/$(date +%s)-plan.md"
DIFF_FILE=".claude/diffs/$(date +%s)-changes.diff"

mkdir -p .claude/plans .claude/diffs

echo "🏗️  PHASE 1: ARCHITECT (Sonnet 4.6 with caching)"
echo "================================================"

# Architect sadece plan yapar
claude-code agent --type architect --prompt \
"Task: $TASK

Create a detailed implementation plan with:
1. Files to create/modify
2. Function signatures
3. Data flow
4. Edge cases

Output to: $PLAN_FILE" > "$PLAN_FILE"

echo "✅ Plan created: $PLAN_FILE"
echo ""

# Kullanıcıya planı göster ve onay al
cat "$PLAN_FILE"
echo ""
read -p "🤔 Approve this plan? (y/n): " APPROVAL

if [ "$APPROVAL" != "y" ]; then
  echo "❌ Plan rejected. Exiting."
  exit 1
fi

echo ""
echo "👨‍💻 PHASE 2: DEVELOPER (Sonnet 4.6 with caching)"
echo "================================================"

# Developer planı uygular
claude-code agent --type developer --prompt \
"Implement the following plan:

$(cat $PLAN_FILE)

Rules:
- Only modify files mentioned in the plan
- Follow existing code style
- Add minimal comments
- Stage changes with git add"

echo "✅ Implementation complete"
echo ""

echo "🔒 PHASE 3: SECURITY AUDITOR (Haiku 4.5 - COST OPTIMIZED)"
echo "========================================================="

# Sadece değişen satırları oku
git diff --cached > "$DIFF_FILE"

DIFF_SIZE=$(wc -l < "$DIFF_FILE")
echo "📊 Reviewing $DIFF_SIZE lines of changes..."

# Haiku modeli kullanarak düşük maliyetli audit
claude-code agent --type security-auditor --prompt \
"Security audit the following git diff:

$(cat $DIFF_FILE)

Check ONLY:
1. SQL injection vectors
2. XSS vulnerabilities
3. Exposed secrets/keys
4. Insecure dependencies

Output: PASS or FAIL with issues"

echo ""
echo "✅ WORKFLOW COMPLETE"
echo "==================="
echo "Plan: $PLAN_FILE"
echo "Diff: $DIFF_FILE"
echo "Next: Review and commit changes"
