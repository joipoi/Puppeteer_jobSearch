# Puppeteer_jobSearch
This does web scraping for the swedish job listing website: https://arbetsformedlingen.se/platsbanken/annonser.
If you are not swedish it probably won't be useful to you but the code could still be interesting.

[Puppeteer](https://pptr.dev/) works by starting a browser and clicking on elements, so the data can take some seconds to be loaded.

## Installing / Getting started
Download or clone

Gp to the project root and run:
```shell
npm install
```
Start the server by running 
```shell
node src/index.js
```
Find the webserver at localhost on port 80

## Features
- web server with express
- api calls with axios
- web scraping with puppeteer
- Search by location or jobtype or search terms
- Filter further by jobname, company, date
- Get experience requirement for some of the jobs(unfinished)
