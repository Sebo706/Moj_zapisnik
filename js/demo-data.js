import {dateValue} from './recognition.js';

export function demoData(){
  const today=new Date(),tomorrow=new Date(),weekend=new Date(),later=new Date();
  tomorrow.setDate(today.getDate()+1);weekend.setDate(today.getDate()+3);later.setDate(today.getDate()+14);
  return [
    ['Dôležité: dnes zaplatiť skúšobný účet za elektrinu.','Úloha','Financie','Vysoká','Doma',dateValue(today),'18:00'],
    ['Kúpiť mlieko, chlieb a ovocie dnes cestou domov.','Nákup','Nákupy','Normálna','Obchod',dateValue(today),''],
    ['Zavolať zubárovi zajtra ráno a dohodnúť testovací termín.','Úloha','Zdravie','Normálna','Lekár',dateValue(tomorrow),'08:00'],
    ['Pripraviť vymyslené podklady na pracovnú poradu.','Úloha','Práca','Normálna','Práca',dateValue(today),'14:00'],
    ['Vyzdvihnúť skúšobný balík po práci.','Úloha','Osobné','Normálna','',dateValue(today),'16:30'],
    ['Poznámka: do cestovín nabudúce pridať menej soli.','Poznámka','Osobné','Normálna','Doma','',''],
    ['Nápad: vytvoriť malú policu na knihy v obývačke.','Nápad','Domácnosť','Normálna','Doma','',''],
    ['Mohli by sme cez víkend naplánovať rodinný výlet.','Nápad','Rodina','Normálna','','',''],
    ['Rezervovať testovací hotel na výlet.','Úloha','Cestovanie','Normálna','',dateValue(later),''],
    ['Kúpiť vymyslený darček pre kamaráta.','Nákup','Nákupy','Normálna','Obchod',dateValue(weekend),'']
  ].map((r,i)=>({id:`demo-${i}`,text:r[0],type:r[1],category:r[2],priority:r[3],place:r[4],due:r[5],time:r[6],done:i===9,createdAt:new Date(Date.now()-i*3600000).toISOString(),photo:null}));
}
