import { defineConfig, devices } from 'playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['list'], ['html', { open: 'never' }], ['json', { outputFile: 'test-results/results.json' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  webServer: {
    command: 'node app/server.mjs',
    url: 'http://127.0.0.1:4173/health',
    reuseExistingServer: false,
    timeout: 15000
  },
  projects: [
    { name: 'chromium', testMatch: '**/*.ui.spec.mjs', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', testMatch: '**/*.ui.spec.mjs', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', testMatch: '**/*.ui.spec.mjs', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chromium', testMatch: '**/*.ui.spec.mjs', use: { ...devices['Pixel 7'] } },
    { name: 'api', testMatch: '**/*.api.spec.mjs' }
  ]
});
