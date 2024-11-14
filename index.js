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

async function getPrecosProdutosPac(url, searchItem){
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto(url); 

    await page.waitForSelector('#cb1-edit');

    await page.type('#cb1-edit', searchItem);

    await Promise.all([
        page.waitForNavigation(),
        page.click('.nav-search-btn'),
        page.waitForSelector('a.ui-search-link__title-card'),
    ]);

    const links = await page.$$eval('a.ui-search-link__title-card', elements => elements.map(link => link.href));      


    let index = 1;
    var array = [];
    for (const element of links) {
        await page.goto(element);

        await page.waitForSelector('.ui-pdp-title');

        const title = await page.$eval('.ui-pdp-title', element => element.innerText);
        const price = await page.$eval('.andes-money-amount__fraction', element => element.innerText);

        const object = {title, price};

        array.push(object);
        index++;
    }

    await browser.close();

    return await array;
} 

const url = 'https://www.mercadolivre.com.br';
console.log(getPrecosProdutosPac(url, 'celular'));
