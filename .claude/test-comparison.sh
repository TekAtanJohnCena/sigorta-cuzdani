#!/bin/bash

# Comparison Tool - API Test Suite
# Run this after authentication

echo "🧪 Testing Policy Comparison API Endpoints"
echo "=========================================="
echo ""

# Note: These tests require authentication
# You need to:
# 1. Login to the app in browser
# 2. Copy your Firebase ID token from browser DevTools
# 3. Export TOKEN=<your-token>

if [ -z "$TOKEN" ]; then
  echo "❌ ERROR: TOKEN not set"
  echo "Please set your Firebase ID token:"
  echo "  export TOKEN='your-firebase-id-token'"
  exit 1
fi

BASE_URL="http://localhost:3000"

echo "📊 Test 1: Create Comparison (requires 2+ policy IDs)"
echo "─────────────────────────────────────────────────"
echo "Note: Replace POLICY_ID_1 and POLICY_ID_2 with real IDs from your Firestore"
echo ""

# Example (will fail without real IDs):
# curl -X POST "$BASE_URL/api/comparisons" \
#   -H "Content-Type: application/json" \
#   -H "Authorization: Bearer $TOKEN" \
#   -d '{"policyIds":["POLICY_ID_1","POLICY_ID_2"]}'

echo "📊 Test 2: Generate Share Link"
echo "─────────────────────────────────────────────────"
echo "Required: comparisonId from Test 1"
echo ""

# curl -X POST "$BASE_URL/api/comparisons/share" \
#   -H "Content-Type: application/json" \
#   -H "Authorization: Bearer $TOKEN" \
#   -d '{"comparisonId":"COMPARISON_ID","policyIds":["POLICY_ID_1","POLICY_ID_2"]}'

echo "📊 Test 3: Access Public Share (no auth)"
echo "─────────────────────────────────────────────────"
echo "Required: token from Test 2"
echo ""

# curl -s "$BASE_URL/api/comparisons/SHARE_TOKEN"

echo "📊 Test 4: Export PDF"
echo "─────────────────────────────────────────────────"
echo "Required: policyIds"
echo ""

# curl -X POST "$BASE_URL/api/comparisons/pdf" \
#   -H "Content-Type: application/json" \
#   -H "Authorization: Bearer $TOKEN" \
#   -d '{"policyIds":["POLICY_ID_1","POLICY_ID_2"]}' \
#   --output comparison.pdf

echo ""
echo "✅ Test script ready!"
echo "To run actual tests:"
echo "  1. Get policy IDs: Go to /dashboard/policies and copy 2 policy IDs"
echo "  2. Get auth token: DevTools → Application → IndexedDB → firebaseLocalStorage"
echo "  3. Export TOKEN and run tests manually"
