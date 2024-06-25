function formatNumber(num) {
    if (num < 1000) {
        return num; // No formatting needed if less than 1000
    } else if (num >= 1000 && num < 1000000) {
        return (num / 1000).toFixed(1) + 'K'; // Convert to K format
    } else if (num >= 1000000 && num < 1000000000) {
        return (num / 1000000).toFixed(1) + 'M'; // Convert to M format
    } else if (num >= 1000000000 && num < 1000000000000) {
        return (num / 1000000000).toFixed(1) + 'B'; // Convert to B format
    } else if (num >= 1000000000000 && num < 1000000000000000) {
        return (num / 1000000000000).toFixed(1) + 'T'; // Convert to T format
    } else if (num >= 1000000000000000 && num < 1000000000000000000) {
        return (num / 1000000000000000).toFixed(1) + 'Q'; // Convert to Q format
    } else {
        return (num / 1000000000000000000).toFixed(1) + 'Qn'; // Convert to Qn format
    }
}


function formatDuration(seconds) {
    // Convert seconds to hours, minutes, and remaining seconds
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    // Format the time as hh:mm:ss
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;

    return formattedTime;
}

// Function to estimate earnings based on monthly visits
function estimateEarnings(monthlyVisits) {
    // Example fixed rate per visit (adjust according to your specific scenario)
    const ratePerVisit = 0.02; // $0.10 per visit

    // Calculate estimated earnings
    const estimatedEarnings = monthlyVisits * ratePerVisit;

    // Format the estimated earnings using formatNumber function
    const formattedEarnings = formatNumber(estimatedEarnings);

    return formattedEarnings;
}

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
                            <h3 class="text-lg font-bold mb-2">Visits Over Time</h3>
                            <canvas id="monthlyVisitsChart" class="mb-4" width="300" height="200"></canvas>
                            <div class="mt-4 text-xl border-2 border-dashed p-4">
                                <p><strong>Bounce Rate:</strong> ${(data.Engagments.BounceRate * 100).toFixed(2)}%</p>
                                <p><strong>Pages per Visit:</strong> ${Math.round(data.Engagments.PagePerVisit * 10) / 10}</p>
                                <p><strong>Monthly Visits:</strong> <span class="inline-block font-bold bg-green-100 px-4 py-2 text-xl">${formatNumber(data.Engagments.Visits)} </span> </p>
                                <p><strong>Per Month Earnings:</strong> <span class="inline-block font-bold bg-orange-100 px-4 py-2 text-xl"> $${estimateEarnings(data.Engagments.Visits)}</span> </p>
                                <p><strong>Avg. Visit Duration:</strong> ${formatDuration(data.Engagments.TimeOnSite)}</p>
                            </div>
                        </div>

                        <div class="mb-6 border-2 border-dashed p-4">
                            <h3 class="text-lg font-bold mb-2">Ranking</h3>
                            <p><strong>Global Rank:</strong> ${data.GlobalRank.Rank}</p>
                            <p><strong>Country Rank:</strong> ${data.CountryRank.Rank} (${data.CountryRank.CountryCode})</p>
                            <p><strong>Category Rank:</strong> ${data.CategoryRank.Rank} (${data.CategoryRank.Category})</p>
                        </div>

                        <div class="mb-6 border-2 border-dashed p-4">
                            <h3 class="text-lg font-bold mb-2">Geography - Top 5 Countries</h3>
                            <canvas id="countryShareChart" class="mb-4" width="100" height="100"></canvas>
                            <ul class="list-disc list-inside">
                                ${data.TopCountryShares.map((country, index) => {
                                    const countryName = data.Countries.find(c => c.Code === country.CountryCode).Name;
                                    return `<li class="flex items-center gap-2">
                                                <span class="inline-block w-4 h-4 mr-2" style="background-color: ${['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'][index]};"></span>
                                                <img src="https://flagcdn.com/16x12/${country.CountryCode.toLowerCase()}.png" width="16" height="12"> ${countryName}: <span class="text-md font-bold ">${(country.Value * 100).toFixed(2)}% </span>
                                            </li>`;
                                }).join('')}
                            </ul>
                        </div>

                        <div class="mb-6 border-2 border-dashed p-4">
                            <h3 class="text-lg font-bold mb-2">Traffic Sources</h3>
                            <canvas id="trafficSourcesChart" class="mb-4" width="100" height="100"></canvas>
                            <table class="w-full mt-4">
                                <thead>
                                    <tr class="text-left">
                                        <th class="px-4 py-2">Source</th>
                                        <th class="px-4 py-2">Percentage</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${['Direct', 'Search', 'Referrals', 'Social', 'Mail', 'Paid Referrals'].map((source, index) => `
                                    <tr>
                                        <td class="border px-4 py-2 flex items-center">
                                            <span class="inline-block w-4 h-4 mr-2" style="background-color: ${['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'][index]};"></span>
                                            ${source}
                                        </td>
                                        <td class="border px-4 py-2">${(data.TrafficSources[source] * 100).toFixed(2)}%</td>
                                    </tr>
                                    `).join('')}
                                </tbody>
                            </table>
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
                    labels: ['Direct', 'Search', 'Referrals', 'Social', 'Mail', 'Paid Referrals'],
                    datasets: [{
                        data: [
                            data.TrafficSources.Direct,
                            data.TrafficSources.Search,
                            data.TrafficSources.Referrals,
                            data.TrafficSources.Social,
                            data.TrafficSources.Mail,
                            data.TrafficSources['Paid Referrals']
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
                    labels: Object.keys(data.EstimatedMonthlyVisits).map(dateStr => {
                        const date = new Date(dateStr);
                        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                        return monthNames[date.getMonth()];
                    }),
                    datasets: [{
                        label: 'Estimated Monthly Visits',
                        data: Object.values(data.EstimatedMonthlyVisits),
                        fill: true,
                        backgroundColor: '#96DED1', // Color for the fill area
                        borderColor: '#36A2EB',
                        tension: 0.1
                    }]
                };
                new Chart(monthlyVisitsChartCtx, {
                    type: 'line',
                    data: monthlyVisitsData,
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    callback: function (value, index, values) {
                                        return formatNumber(value);
                                    }
                                }
                            }
                        }
                    }
                });
            })
            .catch(error => {
                loader.style.display = 'none';
                content.innerHTML = `<p class="text-red-500">Error fetching data: ${error}</p>`;
            });
    });
});

// document.addEventListener('DOMContentLoaded', function () {
//     const loader = document.getElementById('loader');
//     const content = document.getElementById('content');

//     loader.style.display = 'block';

//     chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//         const url = new URL(tabs[0].url);
//         const domain = url.hostname;

//         fetch(`https://smweb.shinealom.workers.dev/api/v1/data?domain=${domain}`)
//             .then(response => response.json())
//             .then(data => {
//                 loader.style.display = 'none';

//                 const siteInfo = `
//                     <div class="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg text-lg">
//                         <h2 class="text-5xl font-bold mb-4">${data.SiteName}</h2>
//                         <p class="mb-4">${data.Description}</p>

//                         <div class="mb-6">
//                             <h3 class="text-lg font-bold mb-2">Visits Over Time</h3>
//                             <canvas id="monthlyVisitsChart" class="mb-4"></canvas>
//                             <div class="mt-4 text-xl border-2 border-dashed p-4">
//                                 <p><strong>Bounce Rate:</strong> ${(data.Engagments.BounceRate * 100).toFixed(2)}%</p>
//                                 <p><strong>Pages per Visit:</strong> ${data.Engagments.PagePerVisit}</p>
//                                 <p><strong>Monthly Visits:</strong> <span class="inline-block font-bold bg-green-100 px-4 py-2 text-xl">${formatNumber(data.Engagments.Visits)} </span> </p>
//                                 <p><strong>Avg. Visit Duration:</strong> ${formatDuration(data.Engagments.TimeOnSite)}</p>
//                             </div>
//                         </div>

//                         <div class="mb-6 border-2 border-dashed p-4">
//                             <h3 class="text-lg font-bold mb-2 text-4xl">Ranking</h3>
//                             <p><strong>Global Rank:</strong> ${data.GlobalRank.Rank}</p>
//                             <p><strong>Country Rank:</strong> ${data.CountryRank.Rank} (${data.CountryRank.CountryCode})</p>
//                             <p><strong>Category Rank:</strong> ${data.CategoryRank.Rank} (${data.CategoryRank.Category})</p>
//                         </div>

//                         <div class="mb-6">
//                             <h3 class="text-lg font-bold mb-2">Geography - Top 5 Countries</h3>
//                             <canvas id="countryShareChart" class="mb-4"></canvas>
//                             <ul class="list-disc list-inside">
//                                 ${data.TopCountryShares.map(country => {
//                                     const countryName = data.Countries.find(c => c.Code === country.CountryCode).Name;
//                                     return `<li class="flex items-center gap-2"><img src="https://flagcdn.com/16x12/${country.CountryCode.toLowerCase()}.png" width="16" height="12"> ${countryName}: <span class="text-md font-bold ">${(country.Value * 100).toFixed(2)}% </span></li>`;
//                                 }).join('')}
//                             </ul>
//                         </div>

//                         <div class="mb-6">
//                             <h3 class="text-lg font-bold mb-2">Traffic Sources</h3>
//                             <canvas id="trafficSourcesChart" class="mb-4"></canvas>
//                             <table class="w-full mt-4">
//                                 <thead>
//                                     <tr class="text-left">
//                                         <th class="px-4 py-2">Source</th>
//                                         <th class="px-4 py-2">Percentage</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     ${['Direct', 'Search', 'Referrals', 'Social', 'Mail', 'Paid Referrals'].map((source, index) => `
//                                     <tr>
//                                         <td class="border px-4 py-2 flex items-center">
//                                             <span class="inline-block w-4 h-4 mr-2" style="background-color: ${['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'][index]};"></span>
//                                             ${source}
//                                         </td>
//                                         <td class="border px-4 py-2">${(data.TrafficSources[source] * 100).toFixed(2)}%</td>
//                                     </tr>
//                                     `).join('')}
//                                 </tbody>
//                             </table>
//                         </div>

//                         <img src="${data.LargeScreenshot}" alt="Site Screenshot" class="w-full mb-4">
//                     </div>
//                 `;

//                 content.innerHTML = siteInfo;

//                 // Country Share Pie Chart
//                 const countryShareChartCtx = document.getElementById('countryShareChart').getContext('2d');
//                 const countryShareData = {
//                     labels: data.TopCountryShares.map(country => {
//                         const countryName = data.Countries.find(c => c.Code === country.CountryCode).Name;
//                         return countryName;
//                     }),
//                     datasets: [{
//                         data: data.TopCountryShares.map(country => country.Value),
//                         backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
//                     }]
//                 };
//                 new Chart(countryShareChartCtx, {
//                     type: 'pie',
//                     data: countryShareData
//                 });

//                 // Traffic Sources Pie Chart
//                 const trafficSourcesChartCtx = document.getElementById('trafficSourcesChart').getContext('2d');
//                 const trafficSourcesData = {
//                     labels: ['Direct', 'Search', 'Referrals', 'Social', 'Mail', 'Paid Referrals'],
//                     datasets: [{
//                         data: [
//                             data.TrafficSources.Direct,
//                             data.TrafficSources.Search,
//                             data.TrafficSources.Referrals,
//                             data.TrafficSources.Social,
//                             data.TrafficSources.Mail,
//                             data.TrafficSources['Paid Referrals']
//                         ],
//                         backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
//                     }]
//                 };
//                 new Chart(trafficSourcesChartCtx, {
//                     type: 'pie',
//                     data: trafficSourcesData
//                 });

//                 // Monthly Visits Line Chart
//                 const monthlyVisitsChartCtx = document.getElementById('monthlyVisitsChart').getContext('2d');
//                 const monthlyVisitsData = {
//                     labels: Object.keys(data.EstimatedMonthlyVisits),
//                     datasets: [{
//                         label: 'Estimated Monthly Visits',
//                         data: Object.values(data.EstimatedMonthlyVisits),
//                         fill: false,
//                         borderColor: '#36A2EB',
//                         tension: 0.1
//                     }]
//                 };
//                 new Chart(monthlyVisitsChartCtx, {
//                     type: 'line',
//                     data: monthlyVisitsData
//                 });
//             })
//             .catch(error => {
//                 loader.style.display = 'none';
//                 content.innerHTML = `<p class="text-red-500">Error fetching data: ${error}</p>`;
//             });
//     });
// });


// <div class="mb-6">
                        //     <h3 class="text-lg font-bold mb-2">Engagements</h3>
                        //     <ul class="list-disc list-inside">
                        //         <li>Bounce Rate: ${(data.Engagments.BounceRate * 100).toFixed(2)}%</li>
                        //         <li>Pages per Visit: ${data.Engagments.PagePerVisit}</li>
                        //         <li>Visits: <span class="font-bold">${formatNumber(data.Engagments.Visits)}</span> </li>
                        //         <li>Time on Site: <span class="font-bold">${formatDuration(data.Engagments.TimeOnSite)} seconds</span></li>
                        //     </ul>
                        // </div>