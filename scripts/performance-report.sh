#!/bin/bash
set -e

echo "⚡ Generating Performance Report"
echo "==============================="

# Run performance tests and capture output
npm run benchmark > performance-report.txt 2>&1

echo "Performance test results saved to performance-report.txt"

# Extract key metrics
echo ""
echo "📊 Key Performance Metrics:"
echo "--------------------------"

# Parse the performance output for key metrics
grep -E "(completed in|average time|operations per second)" performance-report.txt || echo "No performance metrics found"

echo ""
echo "Full report available in performance-report.txt"