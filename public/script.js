const stateSelect = document.getElementById('stateSelect');
const citySelect = document.getElementById('citySelect');
const jobTypeSelect = document.getElementById('jobTypeSelect');
const jobSelect = document.getElementById('jobSelect');
const searchInput = document.getElementById('searchInput');
const experienceBtn = document.getElementById('getExperienceRequirements');
const filterBtn = document.getElementById('filterBtn');
const getJobsBtn = document.getElementById('getJobsBtn');
const loadingText = document.getElementById('loadingText');
const nameFilter = document.getElementById('nameFilter');
const companyFilter = document.getElementById('companyFilter');
const filtersUL = document.getElementById('filtersUL');
const clearFiltersBtn = document.getElementById('clearFiltersBtn');

let jobData;
let filtersArr = [];


init();

function init(){
  initSelects();

  document.getElementById('include-name-filter').addEventListener('click', () => {
    addFilter('jobbnamn', true, nameFilter.value);
  });
  document.getElementById('exclude-name-filter').addEventListener('click', () => {
    addFilter('jobbnamn', false, nameFilter.value);
  });
  document.getElementById('include-company-filter').addEventListener('click', () => {
    addFilter('företag', true, companyFilter.value);
  });
  document.getElementById('exclude-company-filter').addEventListener('click', () => {
    addFilter('företag', false, nameFilter.value);
  });

}
function addFilter(filterType, isInclude, text ){
  let filter = {text: text, filterType: filterType, isInclude: isInclude};
  filtersArr.push(filter);
  let filterLine = document.createElement('li');
  let icon = isInclude ? "+" : "-";
  filterLine.textContent = `${icon} (${filterType}) ${text}  `;
  filtersUL.appendChild(filterLine);
  clearFiltersBtn.disabled = false;

  filterResults();
  if(filterType === "jobbnamn"){
    nameFilter.value = "";
  }else if(filterType === "företag"){
    companyFilter.value = "";
  }
}
function clearFilters(){
  filtersArr = [];
  filterResults();
  filtersUL.innerHTML = "";
  clearFiltersBtn.disabled = true;
  
}

function filterResults() {
  const results = jobData;

  const filters = {
    includeJobNames: [],
    excludeJobNames: [],
    includeCompanies: [],
    excludeCompanies: [],
    startDate: document.getElementById('startDateInput').value,
    endDate: document.getElementById('endDateInput').value,
  };

  filtersArr.forEach(filter => {
    const { text, filterType, isInclude } = filter;
    if (filterType === "jobbnamn") {
        if (isInclude) {
            filters.includeJobNames.push(text);
        } else {
            filters.excludeJobNames.push(text);
        }
    } else if (filterType === "företag") {
        if (isInclude) {
            filters.includeCompanies.push(text);
        } else {
            filters.excludeCompanies.push(text);
        }
    }
});

  const filteredResults = results.filter(result => applyFilters(result, filters));

  dataToHTML(filteredResults);
}

function applyFilters(result, filters) {
  const jobName = result.name.toLowerCase();
  const companyName = result.company.toLowerCase();

  const jobDate = new Date(result.date.replace(' ', 'T'));

  const startDate = filters.startDate ? new Date(filters.startDate) : null;
  const endDate = filters.endDate ? new Date(filters.endDate) : null;


  const includesJobNames = filters.includeJobNames.length === 0 || 
  filters.includeJobNames.some(name => jobName.includes(name.toLowerCase()));

  const excludesJobNames = filters.excludeJobNames.length === 0 || 
  filters.excludeJobNames.every(name => !jobName.includes(name.toLowerCase()));
 
  const includesCompanies = filters.includeCompanies.length === 0 || 
  filters.includeCompanies.some(company => companyName.includes(company.toLowerCase()));

  const excludesCompanies = filters.excludeCompanies.length === 0 || 
  filters.excludeCompanies.some(company => !companyName.includes(company.toLowerCase()));

  const isDateInRange = (startDate === null || jobDate >= startDate) &&
  (endDate === null || jobDate <= endDate);

  return includesJobNames && excludesJobNames && includesCompanies && excludesCompanies && isDateInRange;
}

function initSelects(){

  fetch('options.json')
  .then(response => response.json())
  .then(data => {

      data.states.forEach(state => {
          const option = document.createElement('option');
          option.value = state.name;
          option.textContent = state.name;
          stateSelect.appendChild(option);
      });

      data.jobTypes.forEach(jobTypes => {
        const option = document.createElement('option');
        option.value = jobTypes.type;
        option.textContent = jobTypes.type;
        jobTypeSelect.appendChild(option);
    });

      stateSelect.addEventListener('change', function() {
        if(stateSelect[0].text === "Välj Landskap"){
            stateSelect.remove(0);
        }

          citySelect.innerHTML = ''; 
          const selectedState = this.value;

          if (selectedState) {
              const cities = data.states.find(state => state.name === selectedState).cities;
              cities.forEach(city => {
                  const option = document.createElement('option');
                  option.value = city;
                  option.textContent = city;
                  citySelect.appendChild(option);
              });
          } 
      });

        // Update job select
        jobTypeSelect.addEventListener('change', function() {
            if(jobTypeSelect[0].text === "Välj Jobtyp"){
                jobTypeSelect.remove(0);
            }
            jobSelect.innerHTML = ''; 
            const selectedJobType = this.value;
  
            if (selectedJobType) {
                const jobs = data.jobTypes.find(jobType => jobType.type === selectedJobType).specificJobTypes;
                jobs.forEach(job => {
                    const option = document.createElement('option');
                    option.value = job;
                    option.textContent = job;
                    jobSelect.appendChild(option);
                });
            } 
        });

  })
  .catch(error => console.error('Error loading the JSON data:', error));
}


  function dataToHTML(data) {
    const resultsUL = document.getElementById('resultsUL');
    resultsUL.innerHTML = "";

    data.forEach(item => {
        const liElement = document.createElement('li');
        liElement.classList.add('job-list-item');

        const linkElement = document.createElement('a');
        linkElement.href = item.link;
        linkElement.textContent = `${item.name}`;
        linkElement.target = "_blank";
        linkElement.classList.add('job-link');

        const companyElement = document.createElement('span');
        companyElement.textContent = ` ${item.company}`;
        companyElement.classList.add('job-company');

        const dateElement = document.createElement('span');
        dateElement.textContent = ` ${item.date}`;
        dateElement.classList.add('job-date');

        liElement.appendChild(linkElement);
        liElement.appendChild(companyElement);
        liElement.appendChild(dateElement);

        resultsUL.appendChild(liElement);
    });
}

  function parseDateString(dateString) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const todayRegex = /Publicerad idag, kl\. (\d{1,2}\.\d{2})/;
    const yesterdayRegex = /Publicerad igår, kl\. (\d{1,2}\.\d{2})/;
    const dateRegex = /Publicerad (\d{1,2}) (\w+), kl\. (\d{1,2}\.\d{2})/;

    // Check if the date string is "today"
    const todayMatch = dateString.match(todayRegex);
    if (todayMatch) {
        return new Date(today.getFullYear(), today.getMonth(), today.getDate()); 
    }

    // Check if the date string is "yesterday"
    const yesterdayMatch = dateString.match(yesterdayRegex);
    if (yesterdayMatch) {
        return new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()); 
    }

    // Check if the date string is in the format "6 december, kl. 16.53"
    const dateMatch = dateString.match(dateRegex);
    if (dateMatch) {
        const day = parseInt(dateMatch[1], 10);
        const monthName = dateMatch[2];
        
        const month = getMonthFromSwedishName(monthName);
        
        return new Date(today.getFullYear(), month, day); 
    }

    return null;
}
  
  function getMonthFromSwedishName(monthName) {
    const months = {
      januari: 0,
      februari: 1,
      mars: 2,
      april: 3,
      maj: 4,
      juni: 5,
      juli: 6,
      augusti: 7,
      september: 8,
      oktober: 9,
      november: 10,
      december: 11,
    };
    return months[monthName.toLowerCase()] || -1; // Return -1 if month not found
  }

  //post requests

  async function getJobs() {
    const selectedState = stateSelect.value;
    const selectedCity = citySelect.value;
    const selectedJobType = jobTypeSelect.value;
    const selectedJob = jobSelect.value;
    const searchString = searchInput.value;

    experienceBtn.disabled = true;
    getJobsBtn.disabled = true;
    loadingText.hidden = false;

        try {
            const response = await axios.post('/getJobs', {
              selectedCity: selectedCity,
              selectedState: selectedState,
              selectedJobType: selectedJobType,
              selectedJob: selectedJob,
              searchString: searchString
            });
            console.log("Response received:", response.data);

            jobData = response.data.map(item => {
              const parsedDate = parseDateString(item.date);
              const formattedDate = parsedDate ? parsedDate.toLocaleDateString('sv-SE') : item.jobDate;
  
              return {
                  ...item,
                  date: formattedDate 
              };
          });
          dataToHTML(jobData);
          experienceBtn.disabled = false;
          filterBtn.disabled = false;
          getJobsBtn.disabled = false;
          loadingText.hidden = true;
           
          } catch (error) {
            console.error("Error:", error); 
          } 
  }

  async function getExperienceRequirements(){
    experienceBtn.disabled = true;
    getJobsBtn.disabled = true;
    loadingText.hidden = false;

    try {
      const response = await axios.post('/getExperienceRequirements');
     const data = response.data;
     const jobElems = resultsUL.children;
     for(let i = 0; i < data.length; i++){
      if(data[i]){
        jobElems[i].innerHTML += data[i];
      }else{
        jobElems[i].innerHTML += "Ingen erfarenhet krävs";
      }
     }
     experienceBtn.disabled = false;
     getJobsBtn.disabled = false;
     loadingText.hidden = true;
     
    } catch (error) {
      console.error("Error:", error); 
    } 
  }