const { get } = require('http');
const readlineSync = require('readline-sync');
const puppeteer = require('puppeteer');
    
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
                page.waitForSelector('.ui-search-layout--stack'),
            ]);

            console.log('links');

            var links = await page.$$eval('.poly-component__title a', elements =>
                elements.slice(0, 10).map(link => link.href)
            );

            for (const element of links) {
                await page.goto(element);

                await page.waitForSelector('.ui-pdp-title');
                
                let prices = [];

                if (await page.$('.andes-money-amount__currency-symbol')) {
                    // await page.waitForSelector('.andes-money-amount__currency-symbol', { timeout: 500 });
                    const currencySymbol = await page.$eval('.andes-money-amount__currency-symbol', el => el.innerText);
                    prices.push(currencySymbol);
                }

                if (await page.$('.andes-money-amount__fraction')) {
                    // await page.waitForSelector('.andes-money-amount__fraction', { timeout: 500 });
                    const fraction = await page.$eval('.andes-money-amount__fraction', el => el.innerText);
                    prices.push(fraction);
                }

                if (await page.$('.andes-money-amount__cents')) {
                    // await page.waitForSelector('.andes-money-amount__cents', { timeout: 500 });
                    const cents = await page.$eval('.andes-money-amount__cents', el => el.innerText);
                    prices.push(','+cents);
                }

                let title = await page.$eval('.ui-pdp-title', element => element.innerText);
                let price = prices.length > 0 ? prices.join("") : "Preço não encontrado";
                let desc = await page.$eval('.ui-pdp-description__content', el => el.innerText);
                desc = desc.slice(0,500);
                let link = element;
                let site = url;
                var t = (title).split(' ');
                nome_item = t[0]+'_'+t[1]+'_'+t[2]+'_'+t[3]+'_'+t[4];
                
                array.push({ title, price, desc, link, site });
                await page.screenshot({ path: `mercadolivre_${(nome_item).toLowerCase()}.png` });
            }

            break;

        //angeloni
        case 2:
            // await page.waitForSelector('#downshift-0-input');
            // await page.type('#downshift-0-input', searchItem);

            // await Promise.all([
            //     page.waitForNavigation(),
            //     // page.waitForSelector('a.vtex-product-summary-2-x-clearLink--shelf-product'),
            //     page.click('.vtex-store-components-3-x-searchBarIcon--header-options-bottom-search'),
            // ]);

            // // await page.waitForSelector('.vtex-product-summary-2-x-clearLink--shelf-product', { timeout: 500 });

            // var links = await page.$$eval(
            //     '.vtex-search-result-3-x-gallery div a.vtex-product-summary-2-x-clearLink--shelf-product'/* , 
            //     elements => elements.map(link => link.href) */
            // );

            // if (links.length === 0) {
            //     console.log("Nenhum link encontrado. Verifique o seletor ou o estado da página.");
            // } else {
            //     console.log(links);
            // }

            // break;
            // for (const element of links) {
            //     try{

            //         await page.goto(element);            
                
            //     } catch (error) {
            //         console.error(`Erro ao processar o link ${element}:`, error.message);
            //     }
            // }
            
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
                    if (await page.$('.giassi-apps-custom-0-x-listprice')) {
                        await page.waitForSelector('.giassi-apps-custom-0-x-listprice', { timeout: 500 });
                        const priceTotalUnita = await page.$eval('.giassi-apps-custom-0-x-listprice', el => el.innerText);
                        prices.push('Valor original: '+priceTotalUnita+' | Promoções:');
                    }
                    if (await page.$('.giassi-apps-custom-1-x-listprice')) {
                        await page.waitForSelector('.giassi-apps-custom-1-x-listprice', { timeout: 500 });
                        const priceTotalUnita = await page.$eval('.giassi-apps-custom-1-x-listprice', el => el.innerText);
                        prices.push('Valor original: '+priceTotalUnita+' | Promoções:');
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
                    var site = url;

                    array.push({ title, price, desc, link, site });
            
                    await page.screenshot({ path: `imagem_${(nome_item).toLowerCase()}.png` });
                } catch (error) {
                    console.error(`Erro ao processar o link ${element}:`, error.message);
                }
            }
            
            break;
        
        //bistek
        case 4:
            await page.waitForSelector('#avantivtexio-multi-items-search-1-x-searchBar--search-custom');
            await page.type('#avantivtexio-multi-items-search-1-x-searchBar--search-custom', searchItem);
    }
    await browser.close();
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

(async ()=>{

    var item = await readlineSync.question('Qual item vc deseja buscar?');
    var teste = await getPrecosProdutosPac(bistek, item, 4);
    console.log(teste);
})()