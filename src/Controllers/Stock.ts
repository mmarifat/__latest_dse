/*
Author mmarifat<mma.rifat66@gmail.com>
Email: mma.rifat66@gmail.com
Created on : Friday 16 Aug, 2020 12:05:45 BDT
*/


import {Controller, Get, PathParams, Req, Res} from "@tsed/common";
import * as puppeteer from 'puppeteer'

@Controller('/')
export class scrapDSE {
	@Get('/:month/:year')
	async dse(@Res() res: Res, @Req() req: Req, @PathParams('month') month: string, @PathParams('year') year: string) {
		const tableSelector = 'body > table > tbody > tr:nth-child(2) > td:nth-child(2) > table > tbody > tr:nth-child(2) > td > table> tbody > tr:nth-child(2) > td > table:nth-child(35) > tbody tr'

		const browser = await puppeteer.launch({headless: false})
		const page = await browser.newPage()

		const available: Array<string> = []
		const availableString: Array<Array<string>> = []

		new Promise(async (resolve, reject) => {
			const companies: Array<string> = []
			for (let i = "A".charCodeAt(0); i <= "Z".charCodeAt(0); i++) {
				await page.goto('https://www.dsebd.org/latest_share_price_all_group.php?group=' + String.fromCharCode(i), {
					waitUntil: "networkidle0",
					timeout: 30 * 1000
				})
				companies.push(...await page.$$eval('a', (anchors: any) => [].map.call(anchors, (a: any) => a.href)))
			}
			if (companies.length)
				resolve(companies)
			else
				reject('No Companies Found!')

		}).then(async (companies: Array<string>) => {
			for (const company of companies) {
				await page.goto(company, {
					waitUntil: "networkidle0",
					timeout: 30 * 1000
				})
				const check: Array<string> = await page.$$eval(tableSelector, trs =>
					  trs.map(td => td.textContent.replace(/\s+|\t+|\n+|\r+/g, " ")).filter(m => {
						  if (m.startsWith('Share Holding Percentage', 1)) {
							  return m
						  }
					  })
				)
				if (check.some(match => match.includes(month[0].toUpperCase() + month.slice(1)) && match.includes(', ' + year))) {
					available.push(company)
					availableString.push(check)
				}
			}
		}).then(async () => {
			await browser.close();
			console.log(availableString);
			res.json({available})
		}).catch(async (reason: string) => {
			console.log(reason);
		})
	}
}