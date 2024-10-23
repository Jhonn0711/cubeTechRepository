const { get } = require('http');
const readlineSync = require('readline-sync');
const puppeteer = require('puppeteer');

console.log('Bem vindo ao meu robozinho que brinca de scrapping');
    
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

    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.goto(url);

    
    const result = await page.evaluate(() =>{
        return document.querySelector('.lWzCpb.a61j6').value;
    }); 
    
    console.log(`O valor de 1 ${coinBase} é equivalente a ${result} ${convertCoin}`)
    
    await browser.close();
    return;
}

async function getPrecosProdutosPac(url, searchItem){
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto(url); 

    await page.waitForSelector('#cb1-edit');

    await page.type('#cb1-edit', searchItem);
    await page.click('.nav-search-btn');

    return await browser.close();
} 

const url = 'https://www.mercadolivre.com.br/ofertas/frete-gratis#DEAL_ID=DDDD&S=MKT&V=1&T=MS&L=MKTPLACE_MULTICATEG_RTM_SEG_FRETE_NB_DESKWEB&me.audience=unknown&me.bu=3&me.bu_line=26&me.component_id=main_slider_web_ml_0&me.content_id=MS_FRETE_NB_DESKWEB&me.flow=-1&me.logic=user_journey&me.position=0&audience=unknown&bu=3&bu_line=26&component_id=main_slider_web_ml_0&content_id=MS_FRETE_NB_DESKWEB&flow=-1&logic=user_journey&position=0&c_id=/home/exhibitors-carousel/element&c_campaign=MKTPLACE_MULTICATEG_RTM_SEG_FRETE_NB_DESKWEB&c_element_order=1&c_uid=9af08759-e37c-4fa9-a9a4-936dacd31e8c';

getPrecosProdutosPac(url, 'macbook');
