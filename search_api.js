import SerpApi from 'google-search-results-nodejs';
import ObjectsToCsv from 'objects-to-csv';
import { parse } from "csv-parse";
import fs from "fs";

const API_KEY = "ae616c4fe2b070880179b4e0e66d1b47044ab1f8c6ca9eede7542222fd7139a1";

const search = new SerpApi.GoogleSearch(API_KEY);

const details = []

fs.createReadStream("./dataBase/B2C_sheet.csv")
    .pipe(parse({ delimiter: ",", from_line: 2 }))
    .on("data", function (row) {
            const first_name = row[1];
            const last_name = row[2];
            const Org = row[3];
            const count = row[4];
            const school = row[5];
            const school_name = row[6];
            details.push({ first_name, last_name, Org, count, school, school_name })
    })
    .on("end", async function () {
        getData();
    })
    .on("error", function (error) {
        console.log(error.message);
    });

async function getData() {
    for (let i = 60; i < 75; i++) {
        const first_name = details[i]?.first_name;
        const last_name  = details[i]?.last_name;
        const org  = details[i]?.Org;
        const count  = details[i]?.count;
        const school  = details[i]?.school;
        const school_name = (details[i]?.school_name)
        const search_q = `${first_name} ${last_name} "${school_name}" site:linkedin.com `;
;       const params = {
            device: "desktop",
            engine: "google",
            q: search_q,
            google_domain: "google.com",
            gl: "us",
            hl: "en"
        };

        const callback = (data) => { 
            console.log('i',i)
            try {
                console.log(data.organic_results[0].link);
                let linkedin_id = data.organic_results[0].link;
                CsvWriter([{i,first_name,last_name,org,count,school,school_name,linkedin_id}])
            } catch (error) {
                CsvWriter([{i,first_name,last_name,org,count,school,school_name}])
                console.log("Not Found");
            }
        };

        search.json(params, callback);
    }
}

async function CsvWriter(fullData) {
    const csv = new ObjectsToCsv(fullData)
    await csv.toDisk(`./data_linkedin_B2C/B2C_linkedin_sheet_api.csv`, { append: true }).then(
    )
}