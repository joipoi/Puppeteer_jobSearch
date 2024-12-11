const express = require('express');
const router = express.Router();
const browser = require('../browser');

router.post('/getJobs', async (req, res) => {
    let data = req.body;
    let city = data.selectedCity;
    let state = data.selectedState;
    let jobType = data.selectedJobType;
    let job = data.selectedJob;
    let searchString = data.searchString;

    const jobData = await browser.initBrowser(state, city, jobType, job, searchString);
    
    return res.json(jobData); 
});


router.post('/getExperienceRequirements', async (req, res) => {

    const jobData = await browser.getExperienceRequirements();
    
    return res.json(jobData); 
}); 
module.exports = router;