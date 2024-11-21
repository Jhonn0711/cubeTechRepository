const { get } = require('http');
const readlineSync = require('readline-sync');
const puppeteer = require('puppeteer');

console.log('Bem vindo ao meu robozinho de scrapping 🤖');
    
async function bot(){
    const browser = await puppeteer.launch({headless: true}); // .launch abre o browser; headless: true para não exibir o navegador em tela e false para exibir o processo;
    const page = await browser.newPage(); //abre uma nova página;
    await page.goto('https://exemple.com'); //a página que vai abrir é 'https://exemple.com'; 
    await page.screenshot({path: 'exemplo.png'}); // printa a pagina web que foi aberta;

    await browser.close(); // close para evitar vários navegadores/abas de navegador;
}

async function getMoneyConvert(){ //busca a moeda desejada pelo usuário;
    const coinBase = readlineSync.question('Qual a moeda base para conversão?') || 'dolar';
    const convertCoin = readlineSync.question('Qual a moeda desejada?') || 'real';

    const url = `https://www.google.com/search?client=opera-gx&q=${coinBase}+para+${convertCoin}&sourceid=opera&ie=UTF-8&oe=UTF-8s`;

    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto(url);

    
    const result = await page.evaluate(() =>{
        return document.querySelector('.lWzCpb.a61j6').value;
    }); 
    
    console.log(`O valor de 1 ${coinBase} é equivalente a ${result} ${convertCoin}`)
    
    return;
}

async function getPrecosProdutosPac(url, searchItem, urlVal){

    var array = [];

    let browser = await puppeteer.launch({headless: false});
    let page = await browser.newPage();
    await page.goto(url); 
    await page.setViewport({
        width: 1920,
        height: 1080 
    });
    
    switch(urlVal){
        //mercado livre
        case 1:
            await page.waitForSelector('#cb1-edit');

            await page.type('#cb1-edit', searchItem);

            await Promise.all([
                page.waitForNavigation(),
                page.click('.nav-search-btn'),
                page.waitForSelector('a.ui-search-link__title-card'),
            ]);

            var links = await page.$$eval('a.ui-search-link__title-card', elements => elements.map(link => link.href));      


            var index = 1;

            for (const element of links) {
                await page.goto(element);

                await page.waitForSelector('.ui-pdp-title');

                const title = await page.$eval('.ui-pdp-title', element => element.innerText);
                const price = await page.$eval('.andes-money-amount__fraction', element => element.innerText);

                const object = {title, price};

                array.push(object);
                index++;
            }
            break;

        //angeloni
        case 2:
            await page.waitForSelector('#downshift-1-input');
            await page.type('#downshift-1-input', searchItem);

            await Promise.all([
                page.waitForNavigation(),
                page.click('.vtex-store-components-3-x-searchBarIcon'),
                page.waitForSelector('.vtex-product-summary-2-x-containerNormal a'),
            ]);

            var links = await page.$$eval('.vtex-product-summary-2-x-containerNormal a', elements => elements.map(link => link.href));      
            console.log(links);
            // var index = 1;
            // for (const element of links) {
            //     await page.goto(element);

            //     await page.waitForSelector('.ui-pdp-title');

            //     const title = await page.$eval('.ui-pdp-title', element => element.innerText);
            //     const price = await page.$eval('.andes-money-amount__fraction', element => element.innerText);

            //     const object = {title, price};

            //     array.push(object);
            //     index++;
            // }

            // await browser.close();            
            break;


        case 3:
            await page.waitForSelector('#downshift-1-input');
            await page.type('#downshift-1-input', searchItem);
            
            await Promise.all([
                page.waitForNavigation(),
                page.click('.vtex-store-components-3-x-searchBarIcon'),
                page.click('#cookiescript_accept'),
                page.waitForSelector('div#gallery-layout-container'),
            ]);

            var links = await page.$$eval('div#gallery-layout-container a.vtex-product-summary-2-x-clearLink', elements => elements.map(link => link.href));      

            for (const element of links) {
                await page.goto(element);
            
                try {
                    await page.waitForSelector('.vtex-store-components-3-x-productBrand--quickview', { timeout: 5000 });

                    const title = await page.$eval('.vtex-store-components-3-x-productBrand--quickview', el => el.innerText);
            
                    let prices = [];
                    
                    if (await page.$('.giassi-apps-custom-0-x-priceUnit')) {
                        await page.waitForSelector('.giassi-apps-custom-0-x-priceUnit', { timeout: 500 });
                        const priceUnit = await page.$eval('.giassi-apps-custom-0-x-priceUnit', el => el.innerText);
                        prices.push(priceUnit);
                    }
                    if (await page.$('.giassi-apps-custom-0-x-priceTotalUnita')) {
                        await page.waitForSelector('.giassi-apps-custom-0-x-priceTotalUnita', { timeout: 500 });
                        const priceTotalUnita = await page.$eval('.giassi-apps-custom-0-x-priceTotalUnita', el => el.innerText);
                        prices.push(priceTotalUnita);
                    }
                    if (await page.$('.giassi-apps-custom-0-x-priceTotalUnit')) {
                        await page.waitForSelector('.giassi-apps-custom-0-x-priceTotalUnit', { timeout: 500 });
                        const priceTotalUnit = await page.$eval('.giassi-apps-custom-0-x-priceTotalUnit', el => el.innerText);
                        prices.push(priceTotalUnit);
                    }
                    if (await page.$('.giassi-apps-custom-1-x-priceTotalUnit')) {
                        await page.waitForSelector('.giassi-apps-custom-1-x-priceTotalUnit', { timeout: 500 });
                        const priceTotalUnit = await page.$eval('.giassi-apps-custom-1-x-priceTotalUnit', el => el.innerText);
                        prices.push(priceTotalUnit);
                    }
                    if(await page.$('.vtex-rich-text-0-x-paragraph--text-prod-indisponivel')){
                        await page.waitForSelector('.vtex-rich-text-0-x-paragraph--text-prod-indisponivel', { timeout: 500 });
                        prices.push('Produto indisponível no momento!');
                    }
                    if (await page.$('.giassi-apps-custom-1-x-priceUnit')) {
                        await page.waitForSelector('.giassi-apps-custom-1-x-priceUnit', { timeout: 500 });
                        const priceUnit = await page.$eval('.giassi-apps-custom-1-x-priceUnit', el => el.innerText);
                        prices.push(priceUnit);
                    }
                    if (await page.$('.giassi-apps-custom-1-x-priceTotalUnita')) {
                        await page.waitForSelector('.giassi-apps-custom-1-x-priceTotalUnita', { timeout: 500 });
                        const priceTotalUnita = await page.$eval('.giassi-apps-custom-1-x-priceTotalUnita', el => el.innerText);
                        prices.push(priceTotalUnita);
                    }
            
                    await page.waitForSelector('.vtex-store-components-3-x-content div[style="display:contents"]');

                    const price = prices.length > 0 ? prices.join(" | ") : "Preço não encontrado";
                    const desc = await page.$eval(
                        '.vtex-store-components-3-x-content div[style="display:contents"]',
                        el => el.innerText.trim()
                    );  
                    const link = element;      
                    
                    var t = (title).split(' ');
                    nome_item = t[0]+'_'+t[1]+'_'+t[2]+'_'+t[3]+'_'+t[4];

                    array.push({ title, price, desc, link });
            
                    await page.screenshot({ path: `imagem_${(nome_item).toLowerCase()}.png` });
                } catch (error) {
                    console.error(`Erro ao processar o link ${element}:`, error.message);
                }
            }
            

            await browser.close();
            break;
    }

    return await array;
}



const mercadolivre = 'https://www.mercadolivre.com.br';
const angeloni = 'https://www.angeloni.com.br/eletro/';
const giassi =  'https://www.giassi.com.br/';
const bistek =  'https://www.bistek.com.br/';
const americanas =  'https://www.americanas.com.br/';
const magazineluiza = 'https://www.magazineluiza.com.br/';
const casasbahia =  'https://www.casasbahia.com.br/';
const kalunga =  'https://www.kalunga.com.br/';
const correaback =  'https://www.correaback.com.br/';
const madeiramadeira =  'https://www.madeiramadeira.com.br/';
const mobly =  'https://www.mobly.com.br/';
const leroymerlin =  'https://www.leroymerlin.com.br/';
const colombo =  'https://www.colombo.com.br/';
const koerich = 'https://www.koerich.com.br/';
const casasdaagua =  'https://www.casasdaagua.com.br/';
const cassol =  'https://www.cassol.com.br/';
const queroquero =  'https://www.queroquero.com.br/';
const havan =  'https://www.havan.com.br/';
const digitusul =  'https://www.digitusul.com.br/';
const dell = 'https://www.dell.com/pt-br';
const kabum = 'https://www.kabum.com.br/';
const milium =  'https://www.milium.com.br/';
const casadoeletricistasc =  'https://www.casadoeletricistasc.com.br/';
const casadosuniformes =  'https://www.casadosuniformes.com.br/';
const fatimacrianca =  'https://www.fatimacrianca.com.br/';
const fatimaesportes =  'https://www.fatimaesportes.com.br/';
const centauro =  'https://www.centauro.com.br/';
const netshoes =  'https://www.netshoes.com.br/';

getPrecosProdutosPac(giassi, 'peru', 3).then(retorno => {
    console.log(retorno);
}).catch(error => {
    console.error("Erro ao obter os preços:", error);
});
