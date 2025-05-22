#!/bin/bash
set -e

EXERCISE=$1

if [ -z "$EXERCISE" ]; then
    echo "Usage: $0 <exercise-name>"
    echo "Available exercises: portfolio, blog, component-library"
    exit 1
fi

echo "🧪 Validating Exercise: $EXERCISE"
echo "================================"

case $EXERCISE in
    "portfolio")
        echo "Testing Portfolio Exercise..."
        npx vitest tests/exercises/portfolio-exercise.test.js --reporter=verbose
        ;;
    "blog")
        echo "Testing Blog Exercise..."
        npx vitest tests/exercises/blog-exercise.test.js --reporter=verbose
        ;;
    "component-library")
        echo "Testing Component Library Exercise..."
        npx vitest tests/exercises/component-library-exercise.test.js --reporter=verbose
        ;;
    *)
        echo "❌ Unknown exercise: $EXERCISE"
        exit 1
        ;;
esac

echo "✅ Exercise validation completed!"