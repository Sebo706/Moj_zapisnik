const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/sebastian.olsavsky/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const path=require('node:path');

(async()=>{
  const browser=await chromium.launch({headless:true,channel:'msedge'});
  const context=await browser.newContext({viewport:{width:390,height:844}});
  const page=await context.newPage(),errors=[],external=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('request',request=>{if(!request.url().startsWith('http://localhost:4174')&&!request.url().startsWith('blob:'))external.push(request.url());});
  await page.addInitScript(()=>{Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>true});Object.defineProperty(navigator,'share',{configurable:true,value:async data=>{window.__lastShare={text:data.text,fileCount:data.files?.length||0};}});});
  const nav=name=>page.locator('nav').getByRole('button',{name,exact:true}).click();

  try{
    await page.goto('http://localhost:4174');
    await page.getByRole('heading',{name:'Dnešný prehľad'}).waitFor();
    assert.match(await page.locator('.brand').innerText(),/Môj zápisník/);
    assert.equal(await page.locator('.brand-mark').getAttribute('src'),'assets/icons/app-icon-192.png');
    const databases=await page.evaluate(()=>indexedDB.databases());assert.equal(databases.some(db=>db.name==='moj-zapisnik'),true);assert.equal(databases.some(db=>db.name==='vyrobny-zapisnik'),false);
    const manifestResponse=await page.request.get('http://localhost:4174/manifest.webmanifest');assert.equal(manifestResponse.ok(),true);const manifest=await manifestResponse.json();assert.equal(manifest.name,'Môj zápisník');assert.equal(manifest.theme_color,'#078b91');
    assert.equal(await page.locator('.card').count(),3);await page.locator('#more').click();assert.equal(await page.locator('.card').count(),4);
    await page.screenshot({path:path.join(__dirname,'mobile-today.png'),fullPage:true});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);

    const recognized=await page.evaluate(async()=>{const {recognize}=await import('/js/recognition.js');const now=new Date(2026,8,9,12);return [
      recognize('Dôležité: zajtra ráno zavolať zubárovi.',now),
      recognize('Kúpiť mlieko dnes cestou domov.',now),
      recognize('Poznámka: recept na cestoviny.',now),
      recognize('Nápad: rodinný výlet v sobotu.',now),
      recognize('Zaplatiť účet dnes o 18:00.',now),
      recognize('Pracovná porada v piatok.',now),
      recognize('Objednať darček 31.2.2026.',now),
      recognize('Nie je dôležité, pozrieť pozajtra večer.',now)
    ];});
    assert.deepEqual(recognized[0],{type:'Úloha',category:'Zdravie',priority:'Vysoká',place:'Lekár',due:'2026-09-10',time:'08:00'});
    assert.equal(recognized[1].type,'Nákup');assert.equal(recognized[1].category,'Nákupy');assert.equal(recognized[1].place,'Obchod');assert.equal(recognized[1].due,'2026-09-09');
    assert.equal(recognized[2].type,'Poznámka');assert.equal(recognized[3].type,'Nápad');assert.equal(recognized[3].category,'Rodina');assert.equal(recognized[3].due,'2026-09-12');
    assert.equal(recognized[4].category,'Financie');assert.equal(recognized[4].time,'18:00');assert.equal(recognized[5].category,'Práca');assert.equal(recognized[5].due,'2026-09-11');assert.equal(recognized[6].due,'');assert.equal(recognized[7].priority,'Normálna');assert.equal(recognized[7].time,'18:00');

    await nav('Záznamy');const count=await page.locator('.card').count();assert.equal(await page.locator('[data-share]').count(),count);await page.locator('#select-all').click();assert.equal(await page.locator('[data-select]:checked').count(),count);await page.locator('#share-selected').click();assert.match(await page.evaluate(()=>window.__lastShare.text),/Môj zápisník/);await page.screenshot({path:path.join(__dirname,'mobile-record-sharing.png'),fullPage:true});

    await nav('Nový');await page.locator('#text').fill('Dôležité ZX51: zajtra ráno zavolať zubárovi.');assert.match(await page.locator('#recognized').innerText(),/Zdravie.*Vysoká.*Lekár/s);
    await page.locator('#edit-fields').click();await page.locator('#category').selectOption('Rodina');await page.locator('#text').press('End');await page.locator('#text').pressSequentially(' Dohodnúť kontrolu.');assert.equal(await page.locator('#category').inputValue(),'Rodina');
    const png=await page.evaluate(()=>{const canvas=document.createElement('canvas');canvas.width=300;canvas.height=200;const ctx=canvas.getContext('2d');ctx.fillStyle='#078b91';ctx.fillRect(0,0,300,200);ctx.fillStyle='white';ctx.font='24px sans-serif';ctx.fillText('TESTOVACIA FOTOGRAFIA',10,100);return canvas.toDataURL('image/png').split(',')[1];});
    await page.locator('#photo-input').setInputFiles({name:'test.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')});await page.getByText('1 fotografia pridaná').waitFor();await page.screenshot({path:path.join(__dirname,'mobile-form.png'),fullPage:true});await page.locator('#save').click();
    await page.locator('#search').fill('ZX51');assert.equal(await page.locator('.card').count(),1);await page.reload();await page.getByRole('heading',{name:'Dnešný prehľad'}).waitFor();await nav('Záznamy');await page.locator('#search').fill('ZX51');assert.equal(await page.locator('.card').count(),1);
    await page.locator('[data-share]').click();assert.equal(await page.evaluate(()=>window.__lastShare.fileCount),1);await page.locator('[data-detail]').click();await page.locator('[data-photo]').click();await page.locator('#photo-dialog').waitFor({state:'visible'});assert.equal(await page.locator('#large-photo').evaluate(img=>img.complete&&img.naturalWidth>0),true);await page.locator('#close-photo').click();
    await page.locator('[data-edit]').click();await page.locator('#text').fill('Osobný testovací záznam ZX51 upravený');await page.locator('#save').click();await page.locator('#search').fill('ZX51');assert.match(await page.locator('.card-text').innerText(),/upravený/);await page.locator('[data-done]').click();await page.getByRole('button',{name:'Hotové',exact:true}).click();assert.equal(await page.locator('.card').count(),1);await page.reload();await nav('Záznamy');await page.getByRole('button',{name:'Hotové',exact:true}).click();await page.locator('#search').fill('ZX51');assert.equal(await page.locator('.card').count(),1);
    await page.locator('[data-detail]').click();await page.locator('[data-done]').click();await page.getByRole('button',{name:'✓ Hotovo',exact:true}).waitFor();

    await nav('Záznamy');await page.locator('#search').fill('');await page.getByRole('button',{name:'Poznámky',exact:true}).click();assert.equal(await page.locator('.card').count(),1);await page.getByRole('button',{name:'Nákupy',exact:true}).click();assert.equal(await page.locator('.card').count(),1);await page.locator('#search').fill('mlieko');assert.equal(await page.locator('.card').count(),1);await page.locator('#search').fill('NičTaké123');assert.equal(await page.locator('.card').count(),0);
    await nav('Nápady');assert.equal(await page.locator('.card').count(),2);await page.locator('#add-idea').click();await page.locator('#text').fill('Nápad ZX52: vytvoriť zoznam kníh.');await page.locator('#save').click();assert.equal(await page.locator('.card').count(),3);await nav('Dnes');assert.doesNotMatch(await page.locator('.cards').innerText(),/ZX52/);

    await nav('Nový');await page.locator('[data-mode="voice"]').click();await page.waitForFunction(()=>document.querySelector('#voice-note').textContent.length>0);assert.match(await page.locator('#voice-note').innerText(),/nie je dostup|nie je k dispozícii|nie sú|Počúvam/);
    await nav('Dnes');await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:path.join(__dirname,'desktop-today.png'),fullPage:true});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.setViewportSize({width:320,height:740});await nav('Záznamy');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
    console.log(JSON.stringify({result:'PASS',checks:['separate IndexedDB','personal icon and manifest','personal demo data','8 Slovak recognition cases','today priorities','create, edit, complete and reopen','reload persistence','photo attach, persist, open and share','search and personal filters','separate ideas','single and bulk sharing','voice fallback','320/390/1440px layouts','no page errors','no external requests']},null,2));
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});
