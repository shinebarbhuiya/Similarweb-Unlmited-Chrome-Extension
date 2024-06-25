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
                    <div class="max-w-md mx-auto">
                        <h2 class="text-3xl font-bold mb-4">${data.SiteName}</h2>
                        <p class="mb-4">${data.Description}</p>

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

                        <div class="mb-6">
                            <h3 class="text-lg font-bold mb-2">Top Keywords</h3>
                            <ul class="list-disc list-inside">
                                ${data.TopKeywords.map(keyword => `<li>${keyword}</li>`).join('')}
                            </ul>
                        </div>

                        <div class="mb-6">
                            <h3 class="text-lg font-bold mb-2">Ranking</h3>
                            <p><strong>Global Rank:</strong> ${data.GlobalRank.Rank}</p>
                            <p><strong>Country Rank:</strong> ${data.CountryRank.Rank} (${data.CountryRank.CountryCode})</p>
                            <p><strong>Category Rank:</strong> ${data.CategoryRank.Rank} (${data.CategoryRank.Category})</p>
                        </div>

                        <div class="mb-6">
                            <h3 class="text-lg font-bold mb-2">Geography - Top 5 Countries</h3>
                            <canvas id="countryShareChart" class="mb-4"></canvas>
                            <ul class="list-disc list-inside">
                                ${data.TopCountryShares.map(country => {
                                    const countryName = data.Countries.find(c => c.Code === country.CountryCode).Name;
                                    return `<li>${countryName} <img src="https://flagcdn.com/16x12/${country.CountryCode.toLowerCase()}.png" width="16" height="12">: ${(country.Value * 100).toFixed(2)}%</li>`;
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
                                    ${Object.entries(data.TrafficSources).map(([key, value]) => `
                                        <tr>
                                            <td class="border px-4 py-2">${key}</td>
                                            <td class="border px-4 py-2">${(value * 100).toFixed(2)}%</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>

                        <img src="${data.LargeScreenshot}" alt="Site Screenshot" class="w-full mb-4">
                    </div>
                `;

                content.innerHTML = siteInfo;

                // Chart Initialization
                const initializeChart = (id, type, labels, data, colors) => {
                    const ctx = document.getElementById(id).getContext('2d');
                    new Chart(ctx, {
                        type: type,
                        data: {
                            labels: labels,
                            datasets: [{
                                data: data,
                                backgroundColor: colors
                            }]
                        }
                    });
                };

                initializeChart('countryShareChart', 'pie', 
                    data.TopCountryShares.map(country => data.Countries.find(c => c.Code === country.CountryCode).Name),
                    data.TopCountryShares.map(country => country.Value),
                    ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
                );

                initializeChart('trafficSourcesChart', 'pie', 
                    ['Social', 'Paid Referrals', 'Mail', 'Referrals', 'Search', 'Direct'],
                    [
                        data.TrafficSources.Social,
                        data.TrafficSources['Paid Referrals'],
                        data.TrafficSources.Mail,
                        data.TrafficSources.Referrals,
                        data.TrafficSources.Search,
                        data.TrafficSources.Direct
                    ],
                    ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
                );

                const monthlyVisitsChartCtx = document.getElementById('monthlyVisitsChart').getContext('2d');
                new Chart(monthlyVisitsChartCtx, {
                    type: 'line',
                    data: {
                        labels: Object.keys(data.EstimatedMonthlyVisits),
                        datasets: [{
                            label: 'Estimated Monthly Visits',
                            data: Object.values(data.EstimatedMonthlyVisits),
                            fill: false,
                            borderColor: '#36A2EB',
                            tension: 0.1
                        }]
                    }
                });
            })
            .catch(error => {
                loader.style.display = 'none';
                content.innerHTML = `<p class="text-red-500">Error fetching data: ${error}</p>`;
            });
    });
});