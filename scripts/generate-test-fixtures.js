#!/usr/bin/env node

/**
 * Script to generate test fixtures and expected outputs
 * This helps maintain consistency in tests and makes it easier
 * to update expected results when CLI behavior changes
 */

import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixturesDir = path.join(__dirname, '../tests/setup/fixtures')

async function generateFixtures() {
  await fs.ensureDir(fixturesDir)
  
  // Generate expected project structures
  const projectStructures = {
    minimal: {
      'package.json': 'file',
      'uniweb.config.js': 'file'
    },
    singleSite: {
      'package.json': 'file',
      'uniweb.config.js': 'file',
      'site.yml': 'file',
      'pages': {
        'index': {
          'page.yml': 'file'
        }
      },
      'public': {}
    },
    workspace: {
      'package.json': 'file',
      'uniweb.config.js': 'file',
      'sites': {},
      'src': {}
    }
  }

  // Save fixtures
  for (const [type, structure] of Object.entries(projectStructures)) {
    await fs.writeJson(
      path.join(fixturesDir, `${type}-project-structure.json`),
      structure,
      { spaces: 2 }
    )
  }

  // Generate sample content
  const sampleContent = {
    heroSection: `---
component: HeroSection
layout: centered
theme: dark
---

# Welcome to Our Platform

Discover how our innovative solutions can transform your business.

![Hero Image](/images/hero.jpg)

[Get Started](#getting-started){button-primary}
[Learn More](#about){button-secondary}`,

    featureGrid: `---
component: FeatureGrid
columns: 3
showIcons: true
---

# Our Features

## Fast Performance
Lightning-fast load times and optimized delivery.

## Secure by Design
Built with security best practices from the ground up.

## Scalable Architecture
Grows with your business needs.`,

    contactForm: `---
component: ContactForm
layout: stacked
showLabels: true
---

# Get In Touch

We'd love to hear from you. Send us a message and we'll respond as soon as possible.`
  }

  for (const [name, content] of Object.entries(sampleContent)) {
    await fs.writeFile(
      path.join(fixturesDir, `${name}.md`),
      content
    )
  }

  console.log('✅ Test fixtures generated successfully!')
}

generateFixtures().catch(console.error)

# Developer Usage Examples

# Running specific test categories
npm run test:unit           # Only unit tests
npm run test:integration    # Only integration tests  
npm run test:exercises      # Only exercise validation
npm run test:performance    # Only performance tests

# Running tests with different reporters
npm run test -- --reporter=verbose
npm run test -- --reporter=dot
npm run test -- --ui       # Visual test interface

# Running specific test files
npx vitest tests/unit/init.test.js
npx vitest tests/integration/content-workflow.test.js

# Running tests in watch mode for development
npm run test:watch

# Running tests with coverage
npm run test:coverage

# Generating performance reports
./scripts/performance-report.sh

# Validating individual exercises
./scripts/validate-single-exercise.sh portfolio
./scripts/validate-single-exercise.sh blog
./scripts/validate-single-exercise.sh component-library

# Running the complete test suite
./scripts/run-tests.sh