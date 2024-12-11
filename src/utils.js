const puppeteer = require('puppeteer');

async function getElementByText(page, selector, targetText){
  const elements = await page.$$(selector);
    for (const element of elements) {
      const text = await page.evaluate(el => el.textContent.trim(), element);
      if (text === targetText) {
        return element;
      }
    }
  }

module.exports = {
    getElementByText
  };