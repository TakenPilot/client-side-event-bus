process.env.CHROME_BIN = require('puppeteer').executablePath()

module.exports = function(config) {
  config.set({
    browsers: ['ChromeHeadless'],
    frameworks: ['mocha', 'sinon', 'chai'],
    files: [
      'src/index.js',
      'src/index.test.js'
    ]
  });
};
