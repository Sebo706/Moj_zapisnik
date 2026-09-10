const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/sebastian.olsavsky/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');

const APP_URL='http://localhost:4174';
const APP_NAME='Môj zápisník';
const DB_NAME='moj-zapisnik';
const TODAY_HEADING='Dnešný prehľad';

function dateOffset(days){const date=new Date();date.setDate(date.getDate()+days);return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
async function streamText(download){const stream=await download.createReadStream();const chunks=[];for await(const chunk of stream)chunks.push(chunk);return Buffer.concat(chunks).toString('utf8');}
async function prepareContext(browser,viewport={width:390,height:844}){
  const context=await browser.newContext({viewport});
  await context.addInitScript(()=>{
    Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>true});
    Object.defineProperty(navigator,'share',{configurable:true,value:async data=>{window.__lastShare={title:data.title,text:data.text,url:data.url||'',fileCount:data.files?.length||0,files:[]};for(const file of data.files||[])window.__lastShare.files.push({name:file.name,type:file.type,text:await file.text()});}});
  });
  return context;
}

(async()=>{
  const browser=await chromium.launch({headless:true,channel:'msedge'});
  const context=await prepareContext(browser),page=await context.newPage(),errors=[],external=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('request',request=>{if(!request.url().startsWith(APP_URL)&&!request.url().startsWith('blob:'))external.push(request.url());});
  const nav=name=>page.locator('nav').getByRole('button',{name,exact:true}).click();
  try{
    await page.goto(APP_URL);await page.getByRole('heading',{name:TODAY_HEADING}).waitFor();
    assert.match(await page.locator('.brand').innerText(),new RegExp(APP_NAME));
    const databases=await page.evaluate(()=>indexedDB.databases());assert.equal(databases.some(db=>db.name===DB_NAME),true);
    assert.equal(await page.locator('.card').count(),3);if(await page.locator('#more').count())await page.locator('#more').click();
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);

    await nav('Záznamy');
    assert.equal(await page.getByRole('button',{name:'Otvorené',exact:true}).getAttribute('aria-pressed'),'true');
    assert.equal(await page.locator('.advanced-filters').isVisible(),false);
    assert.equal(await page.locator('.card.completed').count(),0);
    await page.locator('#toggle-filters').click();assert.equal(await page.locator('.advanced-filters').isVisible(),true);
    assert.deepEqual(await page.locator('#priority-filter option').allTextContents(),['Všetky priority','Vysoká','Normálna','Nízka']);
    await page.locator('#priority-filter').selectOption('Vysoká');assert.ok(await page.locator('.card').count()>0);
    await page.locator('#clear-filters').click();assert.equal(await page.locator('#priority-filter').inputValue(),'Všetky priority');

    const lowText='Nízka priorita ZXLOW, keď bude čas skontrolovať testovací kryt.';
    const recognized=await page.evaluate(async text=>{const {recognize}=await import('/js/recognition.js');return recognize(text,new Date(2026,8,9,12));},lowText);
    assert.equal(recognized.priority,'Nízka');
    await nav('Nový');await page.locator('#text').fill(lowText);assert.match(await page.locator('#recognized').innerText(),/Nízka priorita/);await page.locator('#save').click();
    await page.locator('#search').fill('ZXLOW');assert.equal(await page.locator('.card').count(),1);assert.match(await page.locator('.badge').innerText(),/Nízka/);
    await nav('Dnes');assert.doesNotMatch(await page.locator('main').innerText(),/ZXLOW/);
    await nav('Záznamy');await page.locator('#search').fill('ZXLOW');await page.locator('[data-detail]').click();await page.locator('[data-edit]').click();await page.locator('#edit-fields').click();await page.locator('#due').fill(dateOffset(-1));await page.locator('#save').click();
    await nav('Dnes');if(!await page.getByText(/ZXLOW/).count())await page.locator('#more').click();await page.getByText(/ZXLOW/).waitFor();assert.match(await page.locator('main').innerText(),/ZXLOW[\s\S]*po termíne/);

    const calendarText='Testovací termín ZXCAL skontrolovať zariadenie.';
    await nav('Nový');await page.locator('#text').fill(calendarText);await page.locator('#edit-fields').click();await page.locator('#due').fill(dateOffset(5));await page.locator('#time').fill('10:30');await page.locator('#save').click();await page.locator('#search').fill('ZXCAL');
    const calendarCard=page.locator('.card').filter({hasText:'ZXCAL'});assert.equal(await calendarCard.locator('[data-calendar]').count(),1);
    const downloadPromise=page.waitForEvent('download');await calendarCard.locator('[data-calendar]').click();const calendarDownload=await downloadPromise,ics=await streamText(calendarDownload);
    assert.match(ics,/BEGIN:VCALENDAR/);assert.match(ics,/TRIGGER:-P3D/);assert.match(ics,/TRIGGER:PT0M/);assert.match(ics,/DTSTART:\d{8}T103000/);

    await calendarCard.locator('[data-share]').click();const shareLink=await page.evaluate(()=>window.__lastShare.url);assert.match(shareLink,/#import=/);assert.equal(await page.evaluate(()=>window.__lastShare.fileCount),0);
    const receiverContext=await prepareContext(browser),receiver=await receiverContext.newPage(),receiverErrors=[];receiver.on('pageerror',error=>receiverErrors.push(error.message));
    await receiver.goto(shareLink);await receiver.locator('#import-dialog').waitFor({state:'visible'});assert.match(await receiver.locator('#import-summary').innerText(),/ZXCAL/);await receiver.locator('#confirm-import').click();await receiver.locator('#import-dialog').waitFor({state:'hidden'});
    await receiver.locator('#search').fill('ZXCAL');assert.equal(await receiver.locator('.card').count(),1);await receiver.reload();await receiver.getByRole('heading',{name:TODAY_HEADING}).waitFor();await receiver.locator('nav').getByRole('button',{name:'Záznamy',exact:true}).click();await receiver.locator('#search').fill('ZXCAL');assert.equal(await receiver.locator('.card').count(),1);
    await receiver.goto(shareLink);await receiver.locator('#import-dialog').waitFor({state:'visible'});await receiver.locator('#confirm-import').click();await receiver.locator('#import-dialog').waitFor({state:'hidden'});await receiver.locator('#search').fill('ZXCAL');assert.equal(await receiver.locator('.card').count(),1);

    const photoText='Testovací záznam ZXPHOTO s fotografiou.';
    await nav('Nový');await page.locator('#text').fill(photoText);const png=await page.evaluate(()=>{const canvas=document.createElement('canvas');canvas.width=240;canvas.height=160;const ctx=canvas.getContext('2d');ctx.fillStyle='#1974ee';ctx.fillRect(0,0,240,160);ctx.fillStyle='white';ctx.font='22px sans-serif';ctx.fillText('TEST FOTO',55,85);return canvas.toDataURL('image/png').split(',')[1];});
    await page.locator('#photo-input').setInputFiles({name:'test.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')});await page.getByText('1 fotografia pridaná').waitFor();await page.locator('#save').click();await page.locator('#search').fill('ZXPHOTO');await page.locator('[data-share]').click();await page.waitForFunction(()=>window.__lastShare?.fileCount===1);
    const sharedFile=await page.evaluate(()=>window.__lastShare);assert.equal(sharedFile.fileCount,1);assert.match(sharedFile.files[0].name,/moj-zapisnik.*\.json$/);assert.match(sharedFile.files[0].text,/data:image\/jpeg;base64/);
    await receiver.locator('#import-record').click();await receiver.locator('#import-input').setInputFiles({name:sharedFile.files[0].name,mimeType:'application/json',buffer:Buffer.from(sharedFile.files[0].text)});await receiver.locator('#import-dialog').waitFor({state:'visible'});assert.match(await receiver.locator('#import-summary').innerText(),/ZXPHOTO[\s\S]*s fotografiou/);await receiver.locator('#confirm-import').click();await receiver.locator('#import-dialog').waitFor({state:'hidden'});await receiver.locator('#search').fill('ZXPHOTO');assert.equal(await receiver.locator('.card').count(),1);await receiver.locator('[data-detail]').click();assert.equal(await receiver.locator('[data-photo]').count(),1);
    await receiver.reload();await receiver.getByRole('heading',{name:TODAY_HEADING}).waitFor();assert.deepEqual(receiverErrors,[]);await receiverContext.close();

    await nav('Záznamy');await page.locator('#search').fill('');await page.getByRole('button',{name:'Po termíne',exact:true}).click();assert.match(await page.locator('main').innerText(),/ZXLOW[\s\S]*po termíne/);
    if(!await page.locator('.advanced-filters').isVisible())await page.locator('#toggle-filters').click();await page.locator('#priority-filter').selectOption('Nízka');assert.ok(await page.locator('.card').count()>=1);await page.locator('#search').fill('ZXLOW');assert.equal(await page.locator('.card').count(),1);
    await page.getByRole('button',{name:'Otvorené',exact:true}).click();await page.locator('[data-done]').click();await page.getByRole('button',{name:'Hotové',exact:true}).click();assert.equal(await page.locator('.card').count(),1);
    await page.locator('#clear-filters').click();await page.locator('#search').fill('');await page.getByRole('button',{name:'Otvorené',exact:true}).click();const openCount=await page.locator('.card').count();await page.locator('#select-all').click();assert.equal(await page.locator('[data-select]:checked').count(),openCount);await page.locator('#share-selected').click();await page.waitForFunction(()=>window.__lastShare?.fileCount===1);assert.equal(await page.evaluate(()=>window.__lastShare.fileCount),1);

    await nav('Nový');await page.locator('[data-mode="voice"]').click();await page.waitForFunction(()=>document.querySelector('#voice-note').textContent.length>0);assert.match(await page.locator('#voice-note').innerText(),/nie je dostup|nie je k dispozícii|nie sú|Počúvam/);
    await nav('Dnes');await page.setViewportSize({width:1440,height:1000});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await page.setViewportSize({width:320,height:740});await nav('Záznamy');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
    console.log(JSON.stringify({result:'PASS',checks:['separate local database','three priorities and low recognition','low without date stays out of Today','overdue low appears in Today','simple and advanced filters','calendar export with 3-day and due-time reminders','one-record import link','photo transfer in import file','reload persistence','duplicate-safe source ids','bulk-selected records','voice fallback','320/390/1440px layouts','no page errors','no external requests']},null,2));
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});
