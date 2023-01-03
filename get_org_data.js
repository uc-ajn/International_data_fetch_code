import axios from "axios";
import * as cheerio from 'cheerio';
import { parse } from "csv-parse";
import fs from "fs"; 
import ObjectsToCsv from 'objects-to-csv';
import puppeteer from 'puppeteer';
import lang_code from  './dataBase/language_code.js';

let details = []
let fullData = []

const regex = /(\d)\s+(?=\d)/g;
const subst = `$1`;

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
    for (let i = 9100; i < 9200; i++) { //details.length
        console.log('Org length', details.length);
        await page.goto('https://www.google.com/maps/@28.628223,77.389849,15z');
        await page.waitForSelector('#searchboxinput');
        let org = `"${details[i].org} ${details[i].country}"`;
        let org_name = details[i].org;
        let country  = details[i].country;
        console.log("org",org); 
        await page.type('#searchboxinput', org);
        await page.waitForSelector('#searchbox-searchbutton');
        await page.click('#searchbox-searchbutton');       
        try {
            await page.waitForSelector(`#QA0Szd > div > div > div.w6VYqd > div.bJzME.tTVLSc > div > div.e07Vkf.kA9KIf > div > div > div:nth-child(7) > div:nth-child(3) > button > div.AeaXub > div.rogA2c > div.Io6YTe.fontBodyMedium`);
            const AddessRow = await page.$(`#QA0Szd > div > div > div.w6VYqd > div.bJzME.tTVLSc > div > div.e07Vkf.kA9KIf > div > div > div:nth-child(7) > div:nth-child(3) > button > div.AeaXub > div.rogA2c > div.Io6YTe.fontBodyMedium`);
            const Address = await (await AddessRow.getProperty('textContent')).jsonValue()
            let phone = await page.$(`#QA0Szd > div > div > div.w6VYqd > div.bJzME.tTVLSc > div > div.e07Vkf.kA9KIf > div > div > div:nth-child(7) > div:nth-child(6) > button > div.AeaXub > div.rogA2c > div.Io6YTe.fontBodyMedium`);
            let phoneNo = await (await phone.getProperty('textContent')).jsonValue();
            let websiteRow = await page.$(`#QA0Szd > div > div > div.w6VYqd > div.bJzME.tTVLSc > div > div.e07Vkf.kA9KIf > div > div > div:nth-child(7) > div:nth-child(5) > a > div.AeaXub > div.rogA2c.ITvuef > div.Io6YTe.fontBodyMedium`);                           
            let iswebsite = await (await websiteRow.getProperty('textContent')).jsonValue();
            let website = validURL(iswebsite) ? iswebsite : ' ';
            console.log("Addess: ", Address);
            console.log("Website: ", website);
            console.log("Phone: ", phoneNo);
            fullData.push({i,org_name,country,Address,website,phoneNo});
        } catch (error) {
            console.log("Not found in 1");
            try { 
                const AddessRow = await page.$(`#QA0Szd > div > div > div.w6VYqd > div.bJzME.tTVLSc > div > div.e07Vkf.kA9KIf > div > div > div:nth-child(7) > div:nth-child(3) > button > div.AeaXub > div.rogA2c > div.Io6YTe.fontBodyMedium`);
                const Address = await (await AddessRow.getProperty('textContent')).jsonValue()
                const phone = await page.$(`#QA0Szd > div > div > div.w6VYqd > div.bJzME.tTVLSc > div > div.e07Vkf.kA9KIf > div > div > div:nth-child(7) > div:nth-child(5) > button > div.AeaXub > div.rogA2c > div.Io6YTe.fontBodyMedium`); 
                const isphoneNo = await (await phone.getProperty('textContent')).jsonValue();
                const str = `${isphoneNo}`;
                let phoneNo = str.replace(regex, subst);
                console.log('Substitution phoneNo: ', phoneNo);
                phoneNo = !isNaN(phoneNo) ? phoneNo : '';
                const websiteRow = await page.$(`#QA0Szd > div > div > div.w6VYqd > div.bJzME.tTVLSc > div > div.e07Vkf.kA9KIf > div > div > div:nth-child(7) > div:nth-child(4) > a > div.AeaXub > div.rogA2c.ITvuef > div.Io6YTe.fontBodyMedium`)
                let iswebsite = await (await websiteRow.getProperty('textContent')).jsonValue();
                let website = validURL(iswebsite) ? iswebsite : ' ';
                console.log("Addess: ", Address);
                console.log("Website: ", website);
                console.log("Phone: ", phoneNo);
                fullData.push({i,org_name,country,Address,website,phoneNo});
            } catch (error) {
                console.log("Not found in 2");
                try {
                    const AddessRow = await page.$('#QA0Szd > div > div > div.w6VYqd > div.bJzME.tTVLSc > div > div.e07Vkf.kA9KIf > div > div > div:nth-child(9) > div:nth-child(3) > button > div.AeaXub > div.rogA2c > div.Io6YTe.fontBodyMedium');
                    const Address = await (await AddessRow.getProperty('textContent')).jsonValue()
                    const phone = await page.$('#QA0Szd > div > div > div.w6VYqd > div.bJzME.tTVLSc > div > div.e07Vkf.kA9KIf > div > div > div:nth-child(9) > div:nth-child(5) > button > div.AeaXub > div.rogA2c > div.Io6YTe.fontBodyMedium'); 
                    const isphoneNo = await (await phone.getProperty('textContent')).jsonValue();
                    const str = `${isphoneNo}`;
                    let phoneNo = str.replace(regex, subst);
                    console.log('Substitution phoneNo: ', phoneNo);
                    phoneNo = !isNaN(phoneNo) ? phoneNo : '';
                    const websiteRow = await page.$('#QA0Szd > div > div > div.w6VYqd > div.bJzME.tTVLSc > div > div.e07Vkf.kA9KIf > div > div > div:nth-child(9) > div:nth-child(6) > button > div.AeaXub > div.rogA2c > div.Io6YTe.fontBodyMedium');
                    let iswebsite = await (await websiteRow.getProperty('textContent')).jsonValue();
                    let website = validURL(iswebsite) ? iswebsite : ' ';
                    console.log("Addess: ", Address);
                    console.log("Website: ", website);
                    console.log("Phone: ", phoneNo);
                    fullData.push({i,org_name,country,Address,website,phoneNo});
                } catch (error) {
                    console.log("Not found in 3");
                    try {
                        const AddessRow = await page.$('#QA0Szd > div > div > div.w6VYqd > div.bJzME.tTVLSc > div > div.e07Vkf.kA9KIf > div > div > div:nth-child(9) > div:nth-child(3) > button > div.AeaXub > div.rogA2c > div.Io6YTe.fontBodyMedium');
                        const Address = await (await AddessRow.getProperty('textContent')).jsonValue()
                        const phone = await page.$('#QA0Szd > div > div > div.w6VYqd > div.bJzME.tTVLSc > div > div.e07Vkf.kA9KIf > div > div > div:nth-child(9) > div:nth-child(5) > button > div.AeaXub > div.rogA2c > div.Io6YTe.fontBodyMedium'); 
                        const isphoneNo = await (await phone.getProperty('textContent')).jsonValue();
                        const str = `${isphoneNo}`;
                        let phoneNo = str.replace(regex, subst);
                        console.log('Substitution phoneNo: ', phoneNo);
                        phoneNo = !isNaN(phoneNo) ? phoneNo : '';
                        const websiteRow = await page.$('#QA0Szd > div > div > div.w6VYqd > div.bJzME.tTVLSc > div > div.e07Vkf.kA9KIf > div > div > div:nth-child(9) > div:nth-child(6) > button > div.AeaXub > div.rogA2c > div.Io6YTe.fontBodyMedium');
                        let iswebsite = await (await websiteRow.getProperty('textContent')).jsonValue();
                        let website = validURL(iswebsite) ? iswebsite : ' ';
                        console.log("Addess: ", Address);
                        console.log("Website: ", website);
                        console.log("Phone: ", phoneNo);
                        fullData.push({i,org_name,country,Address,website,phoneNo});
                    } catch (error) {
                            console.log("Not found in 4");
                            try {
                                const AddessRow = await page.$('#QA0Szd > div > div > div.w6VYqd > div.bJzME.tTVLSc > div > div.e07Vkf.kA9KIf > div > div > div:nth-child(9) > div:nth-child(3) > button > div.AeaXub > div.rogA2c > div.Io6YTe.fontBodyMedium');
                                const Address = await (await AddessRow.getProperty('textContent')).jsonValue()
                                const phone = await page.$('#QA0Szd > div > div > div.w6VYqd > div.bJzME.tTVLSc > div > div.e07Vkf.kA9KIf > div > div > div:nth-child(9) > div:nth-child(5) > button > div.AeaXub > div.rogA2c > div.Io6YTe.fontBodyMedium'); 
                                const isphoneNo = await (await phone.getProperty('textContent')).jsonValue();
                                const str = `${isphoneNo}`;
                                let phoneNo = str.replace(regex, subst);
                                console.log('Substitution phoneNo: ', phoneNo);
                                phoneNo = !isNaN(phoneNo) ? phoneNo : '';
                                const websiteRow = await page.$('#QA0Szd > div > div > div.w6VYqd > div.bJzME.tTVLSc > div > div.e07Vkf.kA9KIf > div > div > div:nth-child(9) > div:nth-child(6) > button > div.AeaXub > div.rogA2c > div.Io6YTe.fontBodyMedium');
                                let iswebsite = await (await websiteRow.getProperty('textContent')).jsonValue();
                                let website = validURL(iswebsite) ? iswebsite : ' ';
                                console.log("Addess: ", Address);
                                console.log("Website: ", website);
                                console.log("Phone: ", phoneNo);
                                fullData.push({i,org_name,country,Address,website,phoneNo});
                            } catch (error) {
                                try {
                                    const AddessRow = await page.$('#QA0Szd > div > div > div.w6VYqd > div.bJzME.tTVLSc > div > div.e07Vkf.kA9KIf > div > div > div:nth-child(7) > div:nth-child(3) > button > div.AeaXub > div.rogA2c > div.Io6YTe.fontBodyMedium');
                                    const Address = await (await AddessRow.getProperty('textContent')).jsonValue()
                                    const phone = await page.$('#QA0Szd > div > div > div.w6VYqd > div.bJzME.tTVLSc > div > div.e07Vkf.kA9KIf > div > div > div:nth-child(7) > div:nth-child(5) > button > div.AeaXub > div.rogA2c > div.Io6YTe.fontBodyMedium'); 
                                    const isphoneNo = await (await phone.getProperty('textContent')).jsonValue();
                                    const str = `${isphoneNo}`;
                                    let phoneNo = str.replace(regex, subst);
                                    console.log('Substitution phoneNo: ', phoneNo);
                                    phoneNo = !isNaN(phoneNo) ? phoneNo : '';
                                    let website = '';
                                    console.log("Addess: ", Address);
                                    console.log("Website: ", website);
                                    console.log("Phone: ", phoneNo);
                                    fullData.push({i,org_name,country,Address,website,phoneNo});
                                } catch (error) {
                                    try {
                                        const AddessRow = await page.$(`#QA0Szd > div > div > div.w6VYqd > div.bJzME.tTVLSc > div > div.e07Vkf.kA9KIf > div > div > div:nth-child(7) > div:nth-child(3) > button > div.AeaXub > div.rogA2c > div.Io6YTe.fontBodyMedium`);
                                        const Address = await (await AddessRow.getProperty('textContent')).jsonValue()
                                        const phone = await page.$(`#QA0Szd > div > div > div.w6VYqd > div.bJzME.tTVLSc > div > div.e07Vkf.kA9KIf > div > div > div:nth-child(7) > div:nth-child(4) > button > div.AeaXub > div.rogA2c > div.Io6YTe.fontBodyMedium`);
                                        const isphoneNo = await (await phone.getProperty('textContent')).jsonValue();
                                        const str = `${isphoneNo}`;
                                        let phoneNo = str.replace(regex, subst);
                                        console.log('Substitution phoneNo: ', phoneNo);
                                        phoneNo = !isNaN(phoneNo) ? phoneNo : '';
                                        const website = " ";
                                        console.log("Addess: ", Address);
                                        console.log("Website: ", website);
                                        console.log("Phone: ", phoneNo);
                                        fullData.push({i,org_name,country,Address,website,phoneNo});
                                    } catch (error) {
                                        try {
                                            const AddessRow = await page.$('#QA0Szd > div > div > div.w6VYqd > div.bJzME.tTVLSc > div > div.e07Vkf.kA9KIf > div > div > div:nth-child(7) > div:nth-child(3) > button > div.AeaXub > div.rogA2c > div.Io6YTe.fontBodyMedium');
                                            const Address = await (await AddessRow.getProperty('textContent')).jsonValue()
                                            const phone = await page.$('#QA0Szd > div > div > div.w6VYqd > div.bJzME.tTVLSc > div > div.e07Vkf.kA9KIf > div > div > div:nth-child(7) > div:nth-child(8) > button > div.AeaXub > div.rogA2c > div.Io6YTe.fontBodyMedium'); 
                                            const isphoneNo = await (await phone.getProperty('textContent')).jsonValue();
                                            const str = `${isphoneNo}`;
                                            let phoneNo = str.replace(regex, subst);
                                            console.log('Substitution phoneNo: ', phoneNo);
                                            phoneNo = !isNaN(phoneNo) ? phoneNo : '';
                                            const websiteRow = await page.$('#QA0Szd > div > div > div.w6VYqd > div.bJzME.tTVLSc > div > div.e07Vkf.kA9KIf > div > div > div:nth-child(7) > div:nth-child(7) > a > div.AeaXub > div.rogA2c.ITvuef > div.Io6YTe.fontBodyMedium');
                                            let iswebsite = await (await websiteRow.getProperty('textContent')).jsonValue();
                                            let website = validURL(iswebsite) ? iswebsite : ' ';
                                            console.log("Addess: ", Address);
                                            console.log("Website: ", website);
                                            console.log("Phone: ", phoneNo);
                                            fullData.push({i,org_name,country,Address,website,phoneNo});
                                        } catch (error) {
                                            try {
                                                const AddessRow = await page.$('#QA0Szd > div > div > div.w6VYqd > div.bJzME.tTVLSc > div > div.e07Vkf.kA9KIf > div > div > div:nth-child(9) > div:nth-child(3) > button > div.AeaXub > div.rogA2c > div.Io6YTe.fontBodyMedium');
                                                const Address = await (await AddessRow.getProperty('textContent')).jsonValue()
                                                const phone = await page.$('#QA0Szd > div > div > div.w6VYqd > div.bJzME.tTVLSc > div > div.e07Vkf.kA9KIf > div > div > div:nth-child(9) > div:nth-child(7) > button > div.AeaXub > div.rogA2c > div.Io6YTe.fontBodyMedium'); 
                                                const isphoneNo = await (await phone.getProperty('textContent')).jsonValue();
                                                const str = `${isphoneNo}`;
                                                let phoneNo = str.replace(regex, subst);
                                                console.log('Substitution phoneNo: ', phoneNo);
                                                phoneNo = !isNaN(phoneNo) ? phoneNo : '';
                                                const websiteRow = await page.$('#QA0Szd > div > div > div.w6VYqd > div.bJzME.tTVLSc > div > div.e07Vkf.kA9KIf > div > div > div:nth-child(9) > div:nth-child(6) > a > div.AeaXub > div.rogA2c.ITvuef > div.Io6YTe.fontBodyMedium');
                                                let iswebsite = await (await websiteRow.getProperty('textContent')).jsonValue();
                                                let website = validURL(iswebsite) ? iswebsite : ' ';
                                                console.log("Addess: ", Address);
                                                console.log("Website: ", website);
                                                console.log("Phone: ", phoneNo);
                                                fullData.push({i,org_name,country,Address,website,phoneNo});
                                            } catch (error) {
                                                fullData.push({i,org_name,country,Address : '',website : '',phoneNo : ''});
                                                console.log('Not Found');      
                                            }
                                        }
                                    }
                                }
                            }
                    }
                } 
            }
        }
        try {
            let web_domain =  fullData[0].website;  
            console.log('web_domain',web_domain);                               
            let res = await axios.get(`https://www.${web_domain}`);
            const $ = cheerio.load(res.data); 
            let language_code = await $("html").attr('lang').toUpperCase();
            console.log("language_code",language_code);
            language_code = await language_code.includes("-") ? language_code.slice(0,language_code.indexOf("-")) : language_code;
            console.log(language_code);
            for (var key in lang_code) {
                if (key == language_code){
                    console.log("languge code",lang_code[key]);
                    fullData[0].language = lang_code[key];
                    break;
                }
            }

            CsvWriter(fullData);
            fullData = [];
        } catch (error) {
                CsvWriter(fullData);
                fullData = [];
                console.log('Not Found language')
        } 
    }
    await browser.close();
};

async function CsvWriter(fullData) {
    const csv = new ObjectsToCsv(fullData)
    console.log('CSV Creating...')
    await csv.toDisk(`./data/International_data_9100.csv`, { append: true }).then(
        console.log("Succesfully Data save into CSV")
    )
}

function validURL(url) {
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i');
    return !!pattern.test(url);
  }
