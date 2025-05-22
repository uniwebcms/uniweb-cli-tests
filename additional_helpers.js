// Additional specialized helpers

// === BATCH OPERATION HELPERS ===
export class BatchOperations {
  constructor(env) {
    this.env = env
    this.operations = []
  }

  addPage(name, options = {}) {
    this.operations.push({ type: 'addPage', name, options })
    return this
  }

  addSection(name, options = {}) {
    this.operations.push({ type: 'addSection', name, options })
    return this
  }

  setSection(name, content, options = {}) {
    this.operations.push({ type: 'setSection', name, content, options })
    return this
  }

  async execute() {
    for (const op of this.operations) {
      switch (op.type) {
        case 'addPage':
          await this.env.addPage(op.name, op.options)
          break
        case 'addSection':
          await this.env.addSection(op.name, op.options)
          break
        case 'setSection':
          await this.env.setSection(op.name, op.content, op.options)
          break
      }
    }
    return this.env
  }
}

// Usage:
// await env.batch()
//   .addPage('about')
//   .addSection('hero', { page: 'about' })
//   .setSection('hero', '# About Me', { page: 'about' })
//   .execute()

// === CONTENT BUILDERS ===
export class ContentBuilder {
  constructor() {
    this.frontMatter = {}
    this.body = []
  }

  component(name) {
    this.frontMatter.component = name
    return this
  }

  param(key, value) {
    this.frontMatter[key] = value
    return this
  }

  title(text) {
    this.body.push(`# ${text}`)
    return this
  }

  paragraph(text) {
    this.body.push(text)
    return this
  }

  heading(level, text) {
    this.body.push(`${'#'.repeat(level)} ${text}`)
    return this
  }

  list(items) {
    items.forEach(item => this.body.push(`- ${item}`))
    return this
  }

  image(src, alt) {
    this.body.push(`![${alt}](${src})`)
    return this
  }

  link(text, url, attributes = {}) {
    const attrs = Object.keys(attributes).length > 0 
      ? `{${Object.keys(attributes).join(' ')}}` 
      : ''
    this.body.push(`[${text}](${url})${attrs}`)
    return this
  }

  build() {
    const frontMatterString = Object.keys(this.frontMatter).length > 0
      ? `---\n${Object.entries(this.frontMatter).map(([k, v]) => `${k}: ${v}`).join('\n')}\n---\n\n`
      : ''
    
    return frontMatterString + this.body.join('\n\n')
  }
}

// Usage:
// const content = new ContentBuilder()
//   .component('HeroSection')
//   .param('theme', 'dark')
//   .title('Welcome')
//   .paragraph('This is our amazing platform')
//   .link('Get Started', '/signup', { 'button-primary': true })
//   .build()

// === MOCK DATA HELPERS ===
export class MockDataHelper {
  static createSamplePages(count = 5) {
    return Array.from({ length: count }, (_, i) => ({
      name: `page-${i + 1}`,
      title: `Page ${i + 1}`,
      sections: [`hero-${i + 1}`, `content-${i + 1}`, `footer-${i + 1}`]
    }))
  }

  static createSampleSections(pageNames) {
    const sections = []
    pageNames.forEach(pageName => {
      sections.push({
        name: `hero-${pageName}`,
        content: new ContentBuilder()
          .component('HeroSection')
          .title(`Welcome to ${pageName}`)
          .paragraph(`This is the ${pageName} page hero section`)
          .build()
      })
      sections.push({
        name: `content-${pageName}`,
        content: new ContentBuilder()
          .component('ContentSection')
          .heading(2, 'Our Services')
          .list(['Service 1', 'Service 2', 'Service 3'])
          .build()
      })
    })
    return sections
  }

  static createMultilingualContent(baseContent, locales) {
    const translations = {
      'fr': {
        'Welcome': 'Bienvenue',
        'Our Services': 'Nos Services',
        'Get Started': 'Commencer'
      },
      'es': {
        'Welcome': 'Bienvenido',
        'Our Services': 'Nuestros Servicios',
        'Get Started': 'Empezar'
      }
    }

    return locales.map(locale => ({
      locale,
      content: this.translateContent(baseContent, translations[locale] || {})
    }))
  }

  static translateContent(content, dictionary) {
    let translated = content
    Object.entries(dictionary).forEach(([original, translation]) => {
      translated = translated.replace(new RegExp(original, 'g'), translation)
    })
    return translated
  }
}

// === SCENARIO BUILDERS ===
export class ScenarioBuilder {
  constructor(env) {
    this.env = env
  }

  // Build a complete blog scenario
  async createBlogScenario() {
    await this.env
      .initProject('blog', { singleSite: true })
      .addPage('blog')
      .addPage('about')
      .addPage('contact')

    const blogContent = new ContentBuilder()
      .component('BlogList')
      .param('postsPerPage', 10)
      .title('Latest Posts')
      .paragraph('Stay updated with our latest articles and insights')
      .build()

    await this.env.setSection('hero', blogContent, { page: 'blog' })

    return this.env
  }

  // Build a portfolio scenario
  async createPortfolioScenario() {
    await this.env
      .initProject('portfolio', { singleSite: true })
      .addPage('work')
      .addPage('about')
      .addPage('contact')

    const sections = [
      { name: 'hero', page: 'index', content: this.createHeroContent('John Doe', 'Creative Developer') },
      { name: 'skills', page: 'about', content: this.createSkillsContent(['React', 'Node.js', 'Design']) },
      { name: 'projects', page: 'work', content: this.createProjectsContent() }
    ]

    for (const section of sections) {
      await this.env.setSection(section.name, section.content, { page: section.page })
    }

    return this.env
  }

  // Build a multilingual e-commerce scenario
  async createEcommerceScenario() {
    await this.env
      .initProject('shop', { singleSite: true })
      .addPage('products')
      .addPage('cart')
      .addPage('checkout')
      .addLocale('fr,es')

    // Add product data
    const productData = {
      products: [
        { id: 1, name: 'Product 1', price: 99.99 },
        { id: 2, name: 'Product 2', price: 149.99 }
      ]
    }

    await this.env.writeJson('data/products.json', productData)

    return this.env
  }

  createHeroContent(name, title) {
    return new ContentBuilder()
      .component('HeroSection')
      .param('layout', 'centered')
      .param('theme', 'dark')
      .title(`Hello, I'm ${name}`)
      .paragraph(`${title} passionate about creating amazing digital experiences`)
      .link('View My Work', '/work', { 'button-primary': true })
      .build()
  }

  createSkillsContent(skills) {
    return new ContentBuilder()
      .component('SkillsGrid')
      .param('columns', 3)
      .title('My Skills')
      .paragraph('Technologies and tools I work with')
      .list(skills)
      .build()
  }

  createProjectsContent() {
    return new ContentBuilder()
      .component('ProjectGrid')
      .param('layout', 'masonry')
      .title('Featured Projects')
      .heading(2, 'Project Alpha')
      .paragraph('A revolutionary web application built with React and Node.js')
      .image('/images/project-alpha.jpg', 'Project Alpha Screenshot')
      .heading(2, 'Project Beta')
      .paragraph('Mobile-first e-commerce platform with advanced analytics')
      .image('/images/project-beta.jpg', 'Project Beta Screenshot')
      .build()
  }
}

// === ASSERTION CHAIN HELPERS ===
export class AssertionChain {
  constructor(env) {
    this.env = env
    this.assertions = []
  }

  fileExists(path, message) {
    this.assertions.push(async () => {
      await this.env.expectFileExists(path, message)
    })
    return this
  }

  fileContains(path, content, message) {
    this.assertions.push(async () => {
      await this.env.expectFileContains(path, content, message)
    })
    return this
  }

  yamlProperty(path, property, value, message) {
    this.assertions.push(async () => {
      await this.env.expectYamlProperty(path, property, value, message)
    })
    return this
  }

  directoryStructure(expectedStructure) {
    this.assertions.push(async () => {
      const actualStructure = await this.env.getDirectoryStructure()
      expect(actualStructure).toMatchObject(expectedStructure)
    })
    return this
  }

  async verify() {
    for (const assertion of this.assertions) {
      await assertion()
    }
  }
}

// Usage:
// await env.assert()
//   .fileExists('pages/about/hero.md')
//   .fileContains('pages/about/hero.md', '# About Me')
//   .yamlProperty('pages/about/page.yml', 'sections', ['hero'])
//   .verify()

// === PERFORMANCE HELPERS ===
export class PerformanceHelper {
  constructor(env) {
    this.env = env
    this.metrics = {}
  }

  async timeOperation(name, operation) {
    const start = Date.now()
    const result = await operation()
    const duration = Date.now() - start
    
    this.metrics[name] = duration
    return { result, duration }
  }

  expectOperationFasterThan(operationName, maxMs) {
    const duration = this.metrics[operationName]
    expect(duration, `Expected ${operationName} to complete in under ${maxMs}ms, but took ${duration}ms`).toBeLessThan(maxMs)
  }

  getMetrics() {
    return { ...this.metrics }
  }

  async benchmarkBulkOperations(operationCount = 100) {
    const { result, duration } = await this.timeOperation('bulk-pages', async () => {
      for (let i = 0; i < operationCount; i++) {
        await this.env.addPage(`test-page-${i}`)
      }
    })

    const avgTimePerOperation = duration / operationCount
    return { totalTime: duration, avgTimePerOperation, operationCount }
  }
}

// === TEST EXTENSION METHODS ===
// Add these methods to the TestEnvironment class
export const TestEnvironmentExtensions = {
  // Batch operations
  batch() {
    return new BatchOperations(this)
  },

  // Content building
  buildContent() {
    return new ContentBuilder()
  },

  // Scenario building
  scenarios() {
    return new ScenarioBuilder(this)
  },

  // Assertion chaining
  assert() {
    return new AssertionChain(this)
  },

  // Performance testing
  performance() {
    return new PerformanceHelper(this)
  },

  // JSON file operations
  async writeJson(filePath, data) {
    const fullPath = path.join(this.tempDir, filePath)
    await fs.ensureDir(path.dirname(fullPath))
    await fs.writeJson(fullPath, data, { spaces: 2 })
  },

  async readJson(filePath) {
    return fs.readJson(path.join(this.tempDir, filePath))
  },

  // Advanced structure verification
  async expectProjectType(type) {
    switch (type) {
      case 'blog':
        await this.expectFilesExist('pages/blog', 'pages/about', 'pages/contact')
        break
      case 'portfolio':
        await this.expectFilesExist('pages/work', 'pages/about', 'pages/contact')
        break
      case 'ecommerce':
        await this.expectFilesExist('pages/products', 'pages/cart', 'pages/checkout')
        break
    }
  },

  // Mock external dependencies
  async mockComponentLibrary(name, components) {
    const moduleConfig = {
      name,
      version: '1.0.0',
      components: components.map(comp => typeof comp === 'string' ? { name: comp } : comp)
    }
    
    await this.writeJson(`src/${name}/module.yml`, moduleConfig)
    
    // Create basic component files
    for (const component of components) {
      const compName = typeof component === 'string' ? component : component.name
      await fs.ensureDir(path.join(this.tempDir, `src/${name}/components/${compName}`))
      await fs.writeFile(
        path.join(this.tempDir, `src/${name}/components/${compName}/index.js`),
        `export default function ${compName}({ content, params, block }) { return null; }`
      )
    }
  }
}

// Usage examples in tests:
/*
// Using batch operations
await env.batch()
  .addPage('about')
  .addSection('hero', { page: 'about' })
  .setSection('hero', content, { page: 'about' })
  .execute()

// Using content builder
const heroContent = env.buildContent()
  .component('HeroSection')
  .param('theme', 'dark')
  .title('Welcome')
  .paragraph('Great content here')
  .build()

// Using scenarios
await env.scenarios().createPortfolioScenario()

// Using assertion chains
await env.assert()
  .fileExists('pages/about/hero.md')
  .fileContains('pages/about/hero.md', 'Welcome')
  .yamlProperty('pages/about/page.yml', 'sections.0', 'hero')
  .verify()

// Using performance testing
const perf = env.performance()
await perf.timeOperation('page-creation', () => env.addPage('test'))
perf.expectOperationFasterThan('page-creation', 1000)
*/