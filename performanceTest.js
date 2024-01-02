const fs = require('fs');
const {Builder} = require('selenium-webdriver');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Function to measure performance
async function measurePerformance(url, numberOfTimes) {
    let driver = await new Builder().forBrowser('chrome').build();
    let allMetrics = [];

    for (let i = 0; i < numberOfTimes; i++) {
        await driver.get(url);
        let metrics = await driver.executeScript("return window.performance.getEntries();");
        allMetrics.push(...metrics);
    }

    await driver.quit();
    return allMetrics;
}

// Function to calculate average performance
function calculateAverage(metrics) {
    let totalDuration = metrics.reduce((sum, entry) => sum + entry.duration, 0);
    return totalDuration / metrics.length;
}

// Function to write JSON data to file
function writeJSONToFile(data, filename) {
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
}

async function writeCSV(data, filename) {
    const csvWriter = createCsvWriter({
        path: filename,
        header: [
            {id: 'name', title: 'NAME'},
            {id: 'duration', title: 'DURATION'}
        ]
    });

    const records = data.map(entry => ({name: entry.name, duration: entry.duration}));
    await csvWriter.writeRecords(records); // Await the completion of the write process
}



// Main execution
(async () => {
    const url = 'https://en.wikipedia.org/wiki/Software_metric';
    const metrics = await measurePerformance(url, 10);
    const averagePerformance = calculateAverage(metrics);

    console.log("Average Performance: ", averagePerformance);
    writeJSONToFile(metrics, 'performance.json');
    await writeCSV(metrics, 'performance.csv'); // Await the completion of CSV writing
})();
