const { get } = require('http');
const readlineSync = require('readline-sync');
const puppeteer = require('puppeteer');

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
        //mercado livre funciona
        case 1:
            await page.waitForSelector('#cb1-edit');

            await page.type('#cb1-edit', searchItem);

            await Promise.all([
                page.waitForNavigation(),
                page.click('.nav-search-btn'),
                page.waitForSelector('.ui-search-layout--grid'),
            ]);

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
                let desc = title;

                if (await page.$('.ui-pdp-description__content') != undefined) {
                    let desc = await page.$eval('.ui-pdp-description__content', el => el.innerText);
                    desc = desc.slice(0,500);
                }
                
                let link = element;
                let site = url;

                var titleSemBarra = title.replace(/\//g, '_');
                var t = titleSemBarra.split(' ');
                nome_item = t[0]+'_'+t[1]+'_'+t[2]+'_'+t[3]+'_'+t[4];
                
                array.push({ title, price, desc, link, site });
                await page.screenshot({ path: `mercadolivre_${(nome_item).toLowerCase()}.png` });
            }

            break;
        
        //magazine luiza funciona
        case 2:
            await page.waitForSelector('.kdZZLA');
            await page.type('.kdZZLA', searchItem);

            await Promise.all([
                page.waitForNavigation(),
                page.waitForSelector('.egXHvj'), 
                page.click('.egXHvj'),
                page.click('.khCmGO'),
                page.waitForSelector('ul.gjtbTZ'), 
            ]);

            var links = await page.$$eval('ul.gjtbTZ a.eXlKzg', elements => elements.slice(0, 10).map(link => link.href));

            for(element of links){
                await page.goto(element);

                try{

                    let prices = [];

                    if (await page.$('[data-testid="price-original"]')) {
                        await page.waitForSelector('[data-testid="price-original"]', { timeout: 500 });
                        const priceOriginal = await page.$eval('[data-testid="price-original"]', el => el.innerText.trim());
                        prices.push('Valor original: ' + priceOriginal);
                    }

                    if (await page.$('[data-testid="price-value"]')) {
                        await page.waitForSelector('[data-testid="price-value"]', { timeout: 500 });
                        const priceValue = await page.$eval('[data-testid="price-value"]', el => el.innerText.trim());
                        prices.push('Valor à vista: ' + priceValue);
                    }

                    if (await page.$('[data-testid="installment"]')) {
                        await page.waitForSelector('[data-testid="installment"]', { timeout: 500 });
                        const installment = await page.$eval('[data-testid="installment"]', el => el.innerText.trim());
                        prices.push('Parcelamento: ' + installment);
                    }

                    if (await page.$('.vtex-rich-text-0-x-paragraph--text-prod-indisponivel')) {
                        await page.waitForSelector('.vtex-rich-text-0-x-paragraph--text-prod-indisponivel', { timeout: 500 });
                        prices.push('Produto indisponível no momento!');
                    }

                    let title = await page.$eval('.jjGTqv', el => el.innerText);
                    let price = prices.length > 0 ? prices.join(" | ") : "Preço não encontrado";
                    let desc = description = await page.$eval('[data-testid="product-detail-description"]', el => el.innerText.trim());
                    let link = element;
                    let site = url;


                    array.push({ title, price, desc, link, site });

                    var titleSemBarra = title.replace(/\//g, '_');
                    var t = titleSemBarra.split(' ');
                    nome_item = t[0] + '_' + t[1] + '_' + t[2] + '_' + t[3] + '_' + t[4];


                    await page.screenshot({ path: `magazineluiza_${(nome_item).toLowerCase()}.png` });

                }catch(error){
                    console.error(error);
                }
            }

            break;

        //giassi
        case 3:

            setTimeout(async () => {
                const selectors = [
                    '#downshift-0-input',
                    '#downshift-1-input',
                    '#downshift-2-input',
                    '#downshift-3-input',
                ];
                
                let found = false;
                
                for (const selector of selectors) {
                    const element = await page.$(selector);
                    if (element) {
                        await page.focus(selector);
                        await page.type(selector, searchItem, { delay: 100 });
                        found = true;
                        break;
                    }
                }
            
                if (found) {
                    await page.keyboard.press('Enter');
                }
            },3000);
            
            await Promise.all([
                page.waitForNavigation(),
                page.click('#cookiescript_accept'),
                page.waitForSelector('div#gallery-layout-container'),
            ]);

            var links = await page.$$eval('div#gallery-layout-container a.vtex-product-summary-2-x-clearLink', elements => elements.splice(1,10).map(link => link.href));      

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
                    var site = url;
                    
                    var titleSemBarra = title.replace(/\//g, '_');
                    var t = titleSemBarra.split(' ');
                    nome_item = t[0]+'_'+t[1]+'_'+t[2]+'_'+t[3]+'_'+t[4];

                    array.push({ title, price, desc, link, site });
            
                    await page.screenshot({ path: `giassi_${(nome_item).toLowerCase()}.png` });
                } catch (error) {
                    console.error(`Erro ao processar o link ${element}:`, error.message);
                }
            }

            break;
        
        case 4:
            await page.waitForSelector('input#txtBuscaProd');
            await page.type('input#txtBuscaProd', searchItem);
            
            await Promise.all([
                page.waitForNavigation(),
                page.click('.componentheader__icon--search'),
                page.waitForSelector('div#div_box_produtos_1'),
            ]);

            var links = await page.$$eval('div#div_box_produtos_1 a.blocoproduto__link', elements => elements.splice(1, 10).map(link => link.href));

            for (element of links){
                await page.goto(element);

                await page.waitForSelector('#h5produtoDescricao', { timeout: 5000 });
                const prices = [];

                if (await page.$('#precovista')) {
                    await page.waitForSelector('#precovista', { timeout: 500 });
                    const priceVista = await page.$eval('#precovista', el => el.innerText);
                    prices.push(priceVista.trim());
                }

                if (await page.$('#precovenda')) {
                    await page.waitForSelector('#precovenda', { timeout: 500 });
                    const priceVista = await page.$eval('#precovenda', el => el.innerText);
                    prices.push(priceVista.trim());
                }

                if (await page.$('#total_prazo')) {
                    await page.waitForSelector('#total_prazo', { timeout: 500 });
                    const pricePrazo = await page.$eval('#total_prazo', el => el.innerText);
                    prices.push(pricePrazo.trim());
                }

                if (await page.$('#depor')) {
                    await page.waitForSelector('#depor', { timeout: 500 });
                    const priceOriginal = await page.$eval('#depor', el => el.innerText);
                    prices.push(priceOriginal.trim());
                }

                if (await page.$('#economize')) {
                    await page.waitForSelector('#economize', { timeout: 500 });
                    const discountInfo = await page.$eval('#economize', el => el.innerText);
                    prices.push('Desconto: ' + discountInfo.trim());
                }

                let title = await page.$eval('#h5produtoDescricao', el => el.innerText);
                let price = prices.length > 0 ? prices.join(" | ") : "Preço não encontrado";
                let desc = await page.$eval('#descricaoPadrao', el => {
                    let paragraphs = el.querySelectorAll('p');
                    let textContent = [];
                    for (let p of paragraphs) {
                        textContent.push(p.innerText.trim());
                        if (p.nextElementSibling && p.nextElementSibling.tagName === 'HR') {
                            break;
                        }
                    }
                    return textContent.join(' ');
                });
                let link = element;
                let site = url;
                let sitesDisponivel = [];

                array.push({ title, price, desc, link, site });
                
                var titleSemBarra = title.replace(/\//g, '_');
                var t = titleSemBarra.split(' ');
                nome_item = t[0] + '_' + t[1] + '_' + t[2] + '_' + t[3] + '_' + t[4];

                await page.screenshot({ path: `kalunga_${(nome_item).toLowerCase()}.png` });
            }
            break;
        
        //colombo
        case 5:
            await page.waitForSelector('[data-cy="inp-header-input"]');
            await page.type('[data-cy="inp-header-input"]', searchItem);

            await Promise.all([
                page.waitForNavigation(),
                page.click('[data-cy="btn-header-search"]'),
            ]);

            if(await page.$('.style__TopTextStyled-sc-16m4cra-2')){
                array = await page.$eval('.style__TopTextStyled-sc-16m4cra-2', el => el.innerText);
                break;
            }

            await page.waitForSelector('ul.product-list');
            var links = await page.$$eval('ul.product-list a[data-cy="acr-redirecionar-para-produto"]', elements => elements.slice(1,10).map(link => link.href));
            
            for (element of links){
                await page.goto(element);
                let title = await page.$eval('.kaChaL h1', el => el.innerText);

                await page.waitForSelector('div.price');
                let price = await page.$eval('div.price', (el) => el.innerText);

                let desc = await page.$eval('#product-description .product-text', el => el.innerText);
                let link = element;
                let site = url;

                array.push({ title, price, desc, link, site });

                var titleSemBarra = title.replace(/\//g, '_');
                var t = titleSemBarra.split(' ');
                nome_item = t[0] + '_' + t[1] + '_' + t[2] + '_' + t[3] + '_' + t[4];

                await page.screenshot({ path: `colombo_${(nome_item).toLowerCase()}.png` });
            }

            break;

        //bondfaro
        case 6:
            await page.waitForSelector('.AutoCompleteStyle_input__WAC2Y');
            await page.type('.AutoCompleteStyle_input__WAC2Y', searchItem);

            await Promise.all([
                page.waitForNavigation(),
                page.click('div.AutoCompleteStyle_SearchIconWrapper__lU22r'),
                page.click('.PrivacyPolicy_ButtonLabel__auVE2'),
                page.waitForSelector('div.Hits_Wrapper__iA3rM'),
            ]);

            var links = await page.$$eval('div.Hits_Wrapper__iA3rM .ProductCard_ProductCard_Inner__gapsh', elements => 
                elements.splice(1,10).map(link => link.href)
            );            

            links = links.filter(link => !link.includes('.bondfaro.com.br/lead'));

            if(links.length == 0){
                array = 'Item não encontrado';
                break;
            }

            for (element of links){
                await page.goto(element);
                
                await page.waitForSelector('.Text_MobileTitleLAtLarge__dHS_M');
                let title = await page.$eval('.Text_MobileTitleLAtLarge__dHS_M', el => el.innerText);
                page.waitForSelector('strong.Text_DesktopHeadingM__4_pVt');
                let price = await page.$eval('strong.Text_DesktopHeadingM__4_pVt', el => el.innerText);

                let desc = title;
                let link = element;
                let site = await page.$$eval('.OfferImage_ImageWrapper__zHwzm', (links) => {
                    return links.splice(1,5).map(link => link.href);
                });

                if(site.length > 0){
                    array.push({ title, price, desc, link, site });
                    
                    var titleSemBarra = title.replace(/\//g, '_');
                    var t = titleSemBarra.split(' ');
                    nome_item = t[0] + '_' + t[1] + '_' + t[2] + '_' + t[3] + '_' + t[4];
    
                    await page.screenshot({ path: `bondfaro_${(nome_item).toLowerCase()}.png` });
                }

            }

            break;

        //jacotei
        case 7: 
            await page.waitForSelector('#buscaCentral');
            await page.type('#buscaCentral', searchItem);

            await Promise.all([
                page.waitForNavigation(),
                page.click('#buscarButtonMobile'),
                page.click('.aceitar-termos-politica'),
                page.waitForSelector('div#produtos'),
            ]);

            var links = await page.$$eval('#produtos article', (articles) => {
                return Array.from(articles)
                    .filter((article) => !article.querySelector('button.compareLojas')) // Exclui os artigos com o botão
                    .map((article) => {
                        const link = article.querySelector('.coluna2horizontal a');
                        return link ? link.href : null; // Retorna o href se existir
                    })
                    .filter((href) => href !== null); // Remove valores nulos
            });

            for(element of links){
                await page.goto(element, { waitUntil: 'domcontentloaded' });
                await page.waitForSelector('div#container_topo_produto h1[itemprop="name"]');
                let title = await page.$eval('div#container_topo_produto h1[itemprop="name"]', el=>el.innerText);
                let price = await page.$eval('strong.laranja_padrao', el=>el.innerText);
                
                let desc = await page.$eval('#descricao', el=>el.innerText);
                let link = element;

                let site = await page.$$eval('.link_titulo_produto', (links) => {
                    return links.map(link => link.href);
                });

                if(site.length > 0){
                    array.push({ title, price, desc, link, site });
    
                    var titleSemBarra = title.replace(/\//g, '_');
                    var t = titleSemBarra.split(' ');
                    nome_item = t[0] + '_' + t[1] + '_' + t[2] + '_' + t[3] + '_' + t[4];
    
                    await page.screenshot({ path: `jacotei_${(nome_item).toLowerCase()}.png` });    
                }

            }

            break;

        //ofertaesperta
        case 8: 
            await page.waitForSelector('.search-bar__field');
            await page.type('.search-bar__field', searchItem);

            await Promise.all([
                page.waitForNavigation(),
                page.click('button.search-bar__button'),
                page.waitForSelector('div.cards'),
            ]);

            var links = await page.$$eval('div.card-image a', (anchors) => {
                return anchors.map(anchor => anchor.href).filter(href => href).slice(0, 10);
            });
            
            for(element of links){
                await page.goto(element);

                await page.waitForSelector('.offer-info-title');
                let title = await page.$eval('.offer-info-title', el=>el.innerText);
                let price = await page.$eval('.offer-info-content__actions--price', el=>el.innerText);
                let desc = title;
                let link = element;

                let site = await page.$eval('a.offer-info-content__actions--final-link', (anchor) => {
                    return anchor.href;
                });

                array.push({ title, price, desc, link, site });

                var titleSemBarra = title.replace(/\//g, '_');
                var t = titleSemBarra.split(' ');
                nome_item = t[0] + '_' + t[1] + '_' + t[2] + '_' + t[3] + '_' + t[4];

                await page.screenshot({ path: `ofertaesperta_${(nome_item).toLowerCase()}.png` });
            }

            break;
            
        //ofertacertaonline
        case 9:
            await page.waitForSelector('.search-bar__input');
            await page.type('.search-bar__input', searchItem);

            await Promise.all([
                page.waitForNavigation(),
                page.click('button.search-bar__submit'),
                // page.click('.aceitar-termos-politica'),
                // page.waitForSelector('div.product-list--collection'),
            ]);

            if(await page.$('.empty-state__description')){
                array = await page.$eval('.empty-state__description', el=>el.innerText);
                break;
            }   

            page.waitForSelector('div.product-list--collection')
            var links = await page.$$eval('div.product-list--collection a.product-item__image-wrapper',  elements => 
                elements.slice(1,10).map(link => link.href)
            );


            
            for(element of links){
                await page.goto(element);
                await page.waitForSelector('.price');
                await page.waitForSelector('h1.product-meta__title');

                let title = await page.$eval('h1.product-meta__title', el=>el.innerText);
                let price = await page.$eval('.price', el=>el.innerText);
                let desc = await page.$eval('.text--pull', el=>el.innerText);
                let link = element;
                let site = element;

                array.push({ title, price, desc, link, site });

                var titleSemBarra = title.replace(/\//g, '_');
                var t = titleSemBarra.split(' ');
                nome_item = t[0] + '_' + t[1] + '_' + t[2] + '_' + t[3] + '_' + t[4];

                await page.screenshot({ path: `ofertacertaonline_${(nome_item).toLowerCase()}.png` });
            }

            break;

    }


    await browser.close();
    return await array;
}

































//CATEGORIAS::

//Alimentos e Bebidas:
/* 
    mercadolivre 
    magazineluiza
    giassi
*/

//-------------------------------------------------------------------

//Material limpeza:
/* 
    mercadolivre
    magazineluiza
    giassi
    bondfaro
    ofertaesperta
*/

//-------------------------------------------------------------------

//Mobiliário
/* 
    mercadolivre
    magazineluiza
    bondfaro
    jacotei
*/

//-------------------------------------------------------------------

//Equipamentos de Informática:
/* 
    mercadolivre
    magazineluiza
    colombo
    bondfaro
    jacotei
    ofertaesperta
*/

//-------------------------------------------------------------------

//Vestuário e Calçados
/* 
    mercadolivre
    magazineluiza
    bondfaro
    jacotei
    ofertaesperta
*/

//-------------------------------------------------------------------

//Materiais Esportivos:
/* 
    mercadolivre
    magazineluiza
    bondfaro
    ofertaesperta
    ofertacertaonline
*/

//-------------------------------------------------------------------



//-------------------------------------------------------------------

const mercadolivre = 'https://www.mercadolivre.com.br'; //1
const magazineluiza = 'https://www.magazineluiza.com.br/';  //2
const giassi =  'https://www.giassi.com.br/';  //3
const kalunga =  'https://www.kalunga.com.br/'; //4
const colombo =  'https://www.colombo.com.br/';//5
const bondfaro = 'https://www.bondfaro.com.br'; //6
const jacotei = 'https://www.jacotei.com.br'; //7
const ofertaesperta = 'https://www.ofertaesperta.com'; //8
const ofertacertaonline = 'https://ofertacertaonline.com'; //9

(async ()=>{
    var teste = await getPrecosProdutosPac(ofertacertaonline, 'Bola de basquete', 9);
    console.log(teste);
})();