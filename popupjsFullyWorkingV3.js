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
                    <div class="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg">
                        <h2 class="text-5xl font-bold mb-4">${data.SiteName}</h2>
                        <p class="mb-4">${data.Description}</p>
                        

                        <div class="mb-6">
                            <h3 class="text-lg font-bold mb-2">Ranking</h3>
                            <p><strong>Global Rank:</strong> ${data.GlobalRank.Rank}</p>
                            <p><strong>Country Rank:</strong> ${data.CountryRank.Rank} (${data.CountryRank.CountryCode})</p>
                            <p><strong>Category Rank:</strong> ${data.CategoryRank.Rank} (${data.CategoryRank.Category})</p>
                        </div>

                        <div class="mb-6">
                            <h3 class="text-lg font-bold mb-2">Engagements</h3>
                            <ul class="list-disc list-inside">
                                <li>Bounce Rate: ${(data.Engagments.BounceRate * 100).toFixed(2)}%</li>
                                <li>Pages per Visit: ${data.Engagments.PagePerVisit}</li>
                                <li>Visits: ${data.Engagments.Visits}</li>
                                <li>Time on Site: <span class="font-bold">${Math.floor(data.Engagments.TimeOnSite / 60)} minutes ${(data.Engagments.TimeOnSite % 60).toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })} seconds</span></li>
                                


                            </ul>
                        </div>

                        <div class="mb-6">
                            <h3 class="text-lg font-bold mb-2">Geography - Top 5 Countries</h3>
                            <canvas id="countryShareChart" class="mb-4"></canvas>
                            <ul class="list-disc list-inside">
                                ${data.TopCountryShares.map(country => {
                                    const countryName = data.Countries.find(c => c.Code === country.CountryCode).Name;
                                    return `<li class="flex  items-center gap-2"><img src="https://flagcdn.com/16x12/${country.CountryCode.toLowerCase()}.png" width="16" height="12"> ${countryName}: <span class="text-md font-bold ">${(country.Value * 100).toFixed(2)}% </span></li>`;
                                }).join('')}
                            </ul>
                        </div>

                        <div class="mb-6">
                            <h3 class="text-lg font-bold mb-2">Traffic Sources</h3>
                            <canvas id="trafficSourcesChart" class="mb-4"></canvas>
                            <table class="w-full mt-4">
                                <thead>
                                    <tr class="text-left">
                                        <th class="px-4 py-2">Source</th>
                                        <th class="px-4 py-2">Percentage</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td class="border px-4 py-2">Direct</td>
                                        <td class="border px-4 py-2">${(data.TrafficSources.Direct * 100).toFixed(2)}%</td>
                                    </tr>
                                    <tr>
                                        <td class="border px-4 py-2">Search</td>
                                        <td class="border px-4 py-2">${(data.TrafficSources.Search * 100).toFixed(2)}%</td>
                                    </tr>
                                    <tr>
                                        <td class="border px-4 py-2">Referrals</td>
                                        <td class="border px-4 py-2">${(data.TrafficSources.Referrals * 100).toFixed(2)}%</td>
                                    </tr>
                                    <tr>
                                        <td class="border px-4 py-2">Social</td>
                                        <td class="border px-4 py-2">${(data.TrafficSources.Social * 100).toFixed(2)}%</td>
                                    </tr>
                                    <tr>
                                        <td class="border px-4 py-2">Mail</td>
                                        <td class="border px-4 py-2">${(data.TrafficSources.Mail * 100).toFixed(2)}%</td>
                                    </tr>
                                    <tr>
                                        <td class="border px-4 py-2">Paid Referrals</td>
                                        <td class="border px-4 py-2">${(data.TrafficSources['Paid Referrals'] * 100).toFixed(2)}%</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div class="mb-6">
                            <h3 class="text-lg font-bold mb-2">Visits Over Time</h3>
                            <canvas id="monthlyVisitsChart" class="mb-4"></canvas>
                            <div class="mt-4">
                                <p><strong>Bounce Rate:</strong> ${(data.Engagments.BounceRate * 100).toFixed(2)}%</p>
                                <p><strong>Pages per Visit:</strong> ${data.Engagments.PagePerVisit}</p>
                                <p><strong>Monthly Visits:</strong> ${data.Engagments.Visits}</p>
                                <p><strong>Avg. Visit Duration:</strong> ${new Date(data.Engagments.TimeOnSite * 1000).toISOString().substr(11, 8)}</p>
                            </div>
                        </div>

                        <img src="${data.LargeScreenshot}" alt="Site Screenshot" class="w-full mb-4">
                    </div>
                `;

                content.innerHTML = siteInfo;

                // Country Share Pie Chart
                const countryShareChartCtx = document.getElementById('countryShareChart').getContext('2d');
                const countryShareData = {
                    labels: data.TopCountryShares.map(country => {
                        const countryName = data.Countries.find(c => c.Code === country.CountryCode).Name;
                        return countryName;
                    }),
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
                const monthlyVisitsData = {
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
                content.innerHTML = `<p class="text-red-500">Error fetching data: ${error}</p>`;
            });
    });
});