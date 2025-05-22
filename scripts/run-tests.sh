# scripts/run-tests.sh
#!/bin/bash
set -e

echo "🧪 Running Uniweb CLI Tests"
echo "=========================="

# Check if CLI is installed
if ! command -v uniweb &> /dev/null; then
    echo "❌ Uniweb CLI not found. Please install it globally first:"
    echo "   npm install -g @uniwebcms/toolkit"
    exit 1
fi

echo "✅ Uniweb CLI found: $(uniweb --version)"

# Install test dependencies
echo "📦 Installing test dependencies..."
npm install

# Run different test suites
echo ""
echo "🔧 Running unit tests..."
npm run test:unit

echo ""
echo "🔗 Running integration tests..."
npm run test:integration

echo ""
echo "📚 Validating exercises..."
npm run validate-exercises

echo ""
echo "⚡ Running performance benchmarks..."
npm run benchmark

echo ""
echo "✅ All tests completed successfully!"
