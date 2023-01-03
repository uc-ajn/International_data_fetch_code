import { parse } from "csv-parse";
import fs from "fs"; 
import ObjectsToCsv from 'objects-to-csv';
import puppeteer from 'puppeteer';

let details = []

fs.createReadStream("./dataBase/list.csv")
    .pipe(parse({ delimiter: ",", from_line: 2 }))
    .on("data", function (row) {
            let org = row[0];
            let country = row[1];
            details.push({ org, country })
    })
    .on("end", async function () {
        console.log("Org are fetched");
        await getData();
    })
    .on("error", function (error) {
        console.log(error.message);
    });

async function getData() {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    for (let i = 0; i < 100; i++) { //details.length 
        console.log('Org length', details.length);
        await page.goto('https://www.google.com/');
        await page.waitForSelector('body > div.L3eUgb > div.o3j99.ikrT4e.om7nvf > form > div:nth-child(1) > div.A8SBwf > div.RNNXgb > div > div.a4bIc > input');
        let org = `${details[i].org} ${details[i].country} linkedin `;
        let org_name = details[i].org;
        let org_country  = details[i].country;
        console.log("org :",org); 
        await page.type('body > div.L3eUgb > div.o3j99.ikrT4e.om7nvf > form > div:nth-child(1) > div.A8SBwf > div.RNNXgb > div > div.a4bIc > input', org);
        await page.keyboard.press('Enter');
        try {
            await page.waitForSelector(`#rso > div:nth-child(1) > div > div > div:nth-child(1) > div > div > div.Z26q7c.UK95Uc.jGGQ5e > div > a`);
            const hrefs = await page.$eval(`#rso > div:nth-child(1) > div > div > div:nth-child(1) > div > div > div.Z26q7c.UK95Uc.jGGQ5e > div > a`, (elm) => elm.href);
            await hrefs.includes('linkedin.com/in/')  ? CsvWriter([{i,org_name,org_country}]) : CsvWriter([{i,org_name,org_country,hrefs}])
        } catch (error) {
            try {
                await page.waitForSelector(`#rso > div:nth-child(1) > div > div > div.Z26q7c.UK95Uc.jGGQ5e > div > a`);
                const hrefs = await page.$eval(`#rso > div:nth-child(1) > div > div > div.Z26q7c.UK95Uc.jGGQ5e > div > a`, (elm) => elm.href);
                console.log("found_2",i,hrefs);    
                if (hrefs.includes('linkedin.com/in/')) {
                    CsvWriter([{i,org_name,org_country}]);
                } else {
                    if (hrefs.includes('linkedin.com'))
                        CsvWriter([{i,org_name,org_country,hrefs}]);
                    else  
                        CsvWriter([{i,org_name,org_country}]);  
                }
            } catch (error) {
                CsvWriter([{i,org_name,org_country}]);  
                console.log("Not found");
            }
        }
    }
    await browser.close();
};

async function CsvWriter(fullData) {
    const csv = new ObjectsToCsv(fullData)
    console.log('CSV Creating...')
    await csv.toDisk(`./org_linkedin_id/International_org_linkedin.csv`, { append: true }).then(
        console.log("Succesfully Data save into CSV")
    )
}
