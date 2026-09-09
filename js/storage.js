let db;
export async function openStore(){
  db=await new Promise((resolve,reject)=>{const req=indexedDB.open('moj-zapisnik',1);req.onupgradeneeded=()=>{req.result.createObjectStore('records',{keyPath:'id'});req.result.createObjectStore('meta');};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);req.onblocked=()=>reject(new Error('Zavrite ostatné karty aplikácie a obnovte stránku.'));});
}
function request(store,mode,action){return new Promise((resolve,reject)=>{const tx=db.transaction(store,mode);const req=action(tx.objectStore(store));tx.oncomplete=()=>resolve(req.result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('Uloženie bolo prerušené.'));});}
export const allRecords=()=>request('records','readonly',s=>s.getAll());
export const saveRecord=record=>request('records','readwrite',s=>s.put(record));
export async function seed(records){if(await request('meta','readonly',s=>s.get('seeded')))return;await new Promise((resolve,reject)=>{const tx=db.transaction(['records','meta'],'readwrite');records.forEach(r=>tx.objectStore('records').put(r));tx.objectStore('meta').put(true,'seeded');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});}
