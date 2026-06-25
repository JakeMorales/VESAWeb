// Karma configuration file
// https://karma-runner.github.io/1.0/config/configuration-file.html
//
// This file uses the .cjs extension because package.json sets "type": "module",
// which would cause Node to parse a plain .js file as ESM and reject module.exports.
// angular.json references this file via the "karmaConfig" option in the test target.

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma'),
    ],
    client: {
      jasmine: {},
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
    },
    jasmineHtmlReporter: {
      suppressAll: true, // removes duplicated traces
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/angular-app'),
      subdir: '.',
      reporters: [{ type: 'html' }, { type: 'text-summary' }],
    },
    reporters: ['progress', 'kjhtml'],
    browsers: ['Chrome'],
    restartOnFileChange: true,
    // Custom launcher used by CI (see .github/workflows/pr-check.yml).
    // --no-sandbox is required when Chrome runs as root inside a GitHub Actions container.
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox'],
      },
    },
  });
};
