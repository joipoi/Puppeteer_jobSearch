const puppeteer = require('puppeteer');

const selectors = require('./selectors');
const utils = require('./utils');

let mainPage;
let mainData;

async function makeJson() {
  const browser = await puppeteer.launch();

  const page = await browser.newPage();

  await page.setViewport({width: 1600, height: 950}); 
    
  await page.goto('https://arbetsformedlingen.se/platsbanken/annonser');


  await page.locator(selectors.jobBtn).click();

  const elements = await page.$$(selectors.jobAreaList);
  let jsonData = [];
  for (const element of elements) {
    let text = await page.evaluate(el => el.textContent.trim(), element);
    await element.click();
    let kommunerUL = await page.$('ul[aria-label="Yrke"]');
    let citiesArr = await page.evaluate(ul =>   Array.from(ul.querySelectorAll('li')).map(li => li.textContent), kommunerUL);

    let dataRow = {type: text, specificJobTypes: citiesArr};
   jsonData.push(dataRow);

    if(text === "Transport"){
      break;
    }
     
  }
  console.log(jsonData);
  
  
 

}


async function initBrowser(targetState, targetCity, targetJobType, targetJob, searchString){
    const browser = await puppeteer.launch();
    //use this if you want to see the browser
    //const browser = await puppeteer.launch({headless: false,slowMo: 100, args: ['--window-size=1600,950']});
    
      const page = await browser.newPage();
      mainPage = page;
    
      await page.setViewport({width: 1600, height: 950}); 
    
      await page.goto('https://arbetsformedlingen.se/platsbanken/annonser');

      await increaseAdsPerPage(page);

     if (searchString != "") {
      await selectKeyWords(page, searchString);
  }
      if(targetState != "Välj Landskap"){
        await selectLocation(page, targetState, targetCity);
      }
    
      if(targetJobType != "Välj Jobtyp"){
        console.log(targetJobType);
        await selectJobArea(page, targetJobType, targetJob);
      }
     
      if(targetState != "Välj Landskap" || targetJobType != "Välj Jobtyp"){
        await page.waitForSelector('.search-criteria');
      }else{
        await page.waitForSelector(selectors.searchResult);
      }
      
      const jobData = await readResults(page);

      return jobData;
    }
    
    async function selectLocation(page, targetState, targetCity) {
      await page.locator(selectors.ortBtn).click();
    
      const ort = await utils.getElementByText(page, selectors.ortList, targetState);
      await ort.click();
  
      const kommun = await utils.getElementByText(page, selectors.kommunList, targetCity);
      const kommunInput = await kommun.$('input');
      await kommunInput.click(); 
    
      await page.locator(selectors.locationConfirmBtn).click();
    }
    
    
    async function selectJobArea(page, targetJobType, targetJob){
      await page.locator(selectors.jobBtn).click();
    
      const jobTypes = await utils.getElementByText(page, selectors.jobAreaList, targetJobType);
      await jobTypes.click();
    
      const job = await utils.getElementByText(page, selectors.jobList, targetJob);
      const jobInput = await job.$('input');
      await jobInput.click();

      await page.locator(selectors.jobConfirmBtn).click();
    }

    async function increaseAdsPerPage(page){
      await page.locator(selectors.adsPerPage).click();
    }
    
    async function selectKeyWords(page, searchString){
      await page.locator(selectors.searchForm).fill(searchString);

      await page.locator(selectors.searchButton).click();
    }
    
    async function readResults(page) {
      let formattedData = [];
      const searchResult = await page.$$(selectors.searchResult);
  
      for (const element of searchResult) {
          const jobData = await page.evaluate(el => {
              const anchor = el.querySelector('a');
              const link = anchor ? anchor.href : null;
              const name = anchor ? anchor.textContent : null;
              const companyElement = el.querySelector('.pb-company-name');
              const company = companyElement ? companyElement.textContent : null;
              const date = el.querySelector('.bottom__left div:nth-child(2)').textContent;
  
              return { link, name, company, date };
          }, element);
  
          formattedData.push(jobData);
      }
      mainData = formattedData;
      return formattedData;
  }

  async function getExperienceRequirements() {
    let dataArr = [];
    for(let i = 0; i < 5; i++ ){
      const jobLink = mainData[i].link;
      await mainPage.goto(jobLink, { waitUntil: 'networkidle0' });
      const jobInfo = await mainPage.evaluate(selector => {
        const element = document.querySelector('.qualifications-container .sentence-break');
        return element ? element.textContent : null; 
    }, selectors.jobInfo);

    dataArr.push(jobInfo);
    await mainPage.goBack();
    }
    return dataArr;
  }

    module.exports = {
        initBrowser,
        getExperienceRequirements,
        makeJson,
      };