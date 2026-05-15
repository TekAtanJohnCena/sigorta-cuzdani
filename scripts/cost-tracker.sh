#!/bin/bash

# Token kullanımını loglayıp rapor et

LOG_FILE=".claude/cost-tracking.log"
mkdir -p .claude

echo "$(date +%Y-%m-%d\ %H:%M:%S) | Agent: $1 | Tokens: $2 | Task: $3" >> "$LOG_FILE"

# Günlük rapor
echo ""
echo "📊 TODAY'S TOKEN USAGE:"
echo "======================="
grep "$(date +%Y-%m-%d)" "$LOG_FILE" | awk '{sum+=$6} END {print "Total tokens: " sum}'
echo ""

# Agent bazlı breakdown
echo "By Agent:"
grep "$(date +%Y-%m-%d)" "$LOG_FILE" | awk '{agent[$4]++; tokens[$4]+=$6} END {for (a in agent) print a ": " tokens[a] " tokens"}'
