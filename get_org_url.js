import { parse } from "csv-parse";
import axios from "axios";
import fs from "fs";
import ObjectsToCsv from 'objects-to-csv';
import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

let details = []

fs.createReadStream("./dataBase/B2C_url_and_name.csv")
    .pipe(parse({ delimiter: ",", from_line: 2 }))
    .on("data", function (row) {
        let school_name = row[1];
        let school_url = row[2];
        details.push( school_name ,school_url )
    })
    .on("end", async function () {
        console.log("B2C School Name and School Url are fetched");
        await getData();
    })
    .on("error", function (error) {
        console.log(error.message);
    });

async function getData() {
    let school_url = [...new Set(details)];
    console.log(school_url.length);
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    for (let i = 450; i < school_url.length; i++) { //details.length 3000-5000
        console.log("Total",school_url.length,"Reamining", school_url.length - i);
        let school_domain = school_url[i];
        try {
            await page.goto(`https://www.google.com/search?q=${school_domain}+Zoominfo`);
            await page.waitForSelector('#rso > div:nth-child(1) > div > div > div.Z26q7c.UK95Uc.jGGQ5e > div > a');
            const url = await page.$eval(`#rso > div:nth-child(1) > div > div > div.Z26q7c.UK95Uc.jGGQ5e > div > a`, (elm) => elm.href);
            console.log( ((url.split("/"))[4]).replaceAll('-', ' ') );
            let school_name = await (url.split("/"))[4].replaceAll('-', ' ')
            console.log(school_domain ,school_name);
            await CsvWriter([{i,school_domain ,school_name}])
        } catch (error) {
            console.log("Not Found");
            await CsvWriter([{i,school_domain}]);
        }
    }
    await browser.close();
};

async function CsvWriter(fullData) {
    const csv = new ObjectsToCsv(fullData)
    console.log('CSV Creating...')
    await csv.toDisk(`./data_linkedin_B2C/B2C_url_and_name.csv`, { append: true }).then(
        console.log("Succesfully Data save into CSV")
    )
}
