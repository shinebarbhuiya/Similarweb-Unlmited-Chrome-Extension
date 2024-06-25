document.addEventListener('DOMContentLoaded', function () {
    const loader = document.getElementById('loader');
    const content = document.getElementById('content');

    loader.style.display = 'block';

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const url = new URL(tabs[0].url);
        const domain = url.hostname;

        fetch(`https://smweb.shinealom.workers.dev/api/v1/data?domain=${domain}`)
            .then(response => response.json())
            .then(data => {
                loader.style.display = 'none';

                const siteInfo = `
                    <h2>${data.SiteName}</h2>
                    <p>${data.Description}</p>
                    <p><strong>Global Rank:</strong> ${data.GlobalRank.Rank}</p>
                    <p><strong>Country Rank:</strong> ${data.CountryRank.Rank} (${data.CountryRank.CountryCode})</p>
                    <p><strong>Category Rank:</strong> ${data.CategoryRank.Rank} (${data.CategoryRank.Category})</p>
                    <p><strong>Engagements:</strong></p>
                    <ul>
                      <li>Bounce Rate: ${data.Engagments.BounceRate}</li>
                      <li>Pages per Visit: ${data.Engagments.PagePerVisit}</li>
                      <li>Visits: ${data.Engagments.Visits}</li>
                      <li>Time on Site: ${data.Engagments.TimeOnSite} seconds</li>
                    </ul>
                    <canvas id="countryShareChart" width="400" height="400"></canvas>
                    <canvas id="trafficSourcesChart" width="400" height="400"></canvas>
                    <canvas id="monthlyVisitsChart" width="400" height="400"></canvas>
                    <img src="${data.LargeScreenshot}" alt="Site Screenshot" style="width:100%;">
                `;

                content.innerHTML = siteInfo;

                // Country Share Pie Chart
                const countryShareChartCtx = document.getElementById('countryShareChart').getContext('2d');
                const countryShareData = {
                    labels: data.TopCountryShares.map(country => country.CountryCode),
                    datasets: [{
                        data: data.TopCountryShares.map(country => country.Value),
                        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
                    }]
                };
                new Chart(countryShareChartCtx, {
                    type: 'pie',
                    data: countryShareData
                });

                // Traffic Sources Pie Chart
                const trafficSourcesChartCtx = document.getElementById('trafficSourcesChart').getContext('2d');
                const trafficSourcesData = {
                    labels: ['Social', 'Paid Referrals', 'Mail', 'Referrals', 'Search', 'Direct'],
                    datasets: [{
                        data: [
                            data.TrafficSources.Social,
                            data.TrafficSources['Paid Referrals'],
                            data.TrafficSources.Mail,
                            data.TrafficSources.Referrals,
                            data.TrafficSources.Search,
                            data.TrafficSources.Direct
                        ],
                        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
                    }]
                };
                new Chart(trafficSourcesChartCtx, {
                    type: 'pie',
                    data: trafficSourcesData
                });

                // Monthly Visits Line Chart
                const monthlyVisitsChartCtx = document.getElementById('monthlyVisitsChart').getContext('2d');
                const monthlyVisitsData =                 {
                    labels: Object.keys(data.EstimatedMonthlyVisits),
                    datasets: [{
                        label: 'Estimated Monthly Visits',
                        data: Object.values(data.EstimatedMonthlyVisits),
                        fill: false,
                        borderColor: '#36A2EB',
                        tension: 0.1
                    }]
                };
                new Chart(monthlyVisitsChartCtx, {
                    type: 'line',
                    data: monthlyVisitsData
                });
            })
            .catch(error => {
                loader.style.display = 'none';
                content.innerHTML = `<p>Error fetching data: ${error}</p>`;
            });
    });
});
