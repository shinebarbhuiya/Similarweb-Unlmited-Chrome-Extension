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
                        <h2 class="text-2xl font-bold mb-4">${data.SiteName}</h2>
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
                                <li>Time on Site: ${data.Engagments.TimeOnSite} seconds</li>
                            </ul>
                        </div>

                        <div class="mb-6">
                            <h3 class="text-lg font-bold mb-2">Geography - Top 5 Countries</h3>
                            <canvas id="countryShareChart" class="mb-4"></canvas>
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
                        </div>

                        <img src="${data.LargeScreenshot}" alt="Site Screenshot" class="w-full mb-4">
                    </div>
                `;

                content.innerHTML = siteInfo;

                // Chart initialization code remains the same
                // ...
            })
            .catch(error => {
                loader.style.display = 'none';
                content.innerHTML = `<p class="text-red-500">Error fetching data: ${error}</p>`;
            });
    });
});