export const plain = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export const dateValue = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;

export function recognize(text, now = new Date()) {
  const s=plain(text);
  const result={type:'Úloha',category:'Osobné',priority:'Normálna',place:'',due:'',time:''};

  if(/\b(napad|zlepsenie|zlepsit|mohli by sme|bolo by dobre)\b/.test(s)) result.type='Nápad';
  else if(/\b(kupit|nakup|nakupit|objednat|potraviny)\b/.test(s)) result.type='Nákup';
  else if(/\b(poznamka|zapamatat|recept|informacia|kontakt)\b/.test(s)) result.type='Poznámka';

  if(/\b(urgentne|dolezite|nezabudnut|okamzite|nutne)\b/.test(s) && !/\b(nie je urgentne|nie je dolezite|nie je nutne)\b/.test(s)) result.priority='Vysoká';

  if(result.type==='Nákup') result.category='Nákupy';
  else if(/rodin|\bmam|\botec|rodic|\bdet|dcer|\bsyn|manzel/.test(s)) result.category='Rodina';
  else if(/domov|\bdoma\b|domacn|kuchyn|kupeln|uprat|prack|chladnick|oprava doma/.test(s)) result.category='Domácnosť';
  else if(/\bprac|porad|projekt|klient|koleg|kancelar|e-?mail/.test(s)) result.category='Práca';
  else if(/kupit|nakup|objednat|obchod|potravin/.test(s)) result.category='Nákupy';
  else if(/zdrav|lekar|zubar|liek|cvic|\bbeh|trening|vysetr/.test(s)) result.category='Zdravie';
  else if(/financ|ucet|faktur|zaplat|bank|poisten|sporen/.test(s)) result.category='Financie';
  else if(/cestov|vylet|dovolen|hotel|leten|\bcesta|ubyt/.test(s)) result.category='Cestovanie';

  const places=[[/obchod|potravin|kupit|nakup/,'Obchod'],[/\b(doma|domov)\b/,'Doma'],[/\bv praci\b|kancelar/,'Práca'],[/lekar|zubar/,'Lekár'],[/skol/,'Škola'],[/bank/,'Banka']];
  result.place=places.find(([pattern])=>pattern.test(s))?.[1]||'';

  const due=new Date(now); let found=false;
  if(/\bpozajtra\b/.test(s)){due.setDate(due.getDate()+2);found=true;}
  else if(/\bzajtra\b/.test(s)){due.setDate(due.getDate()+1);found=true;}
  else if(/\bdnes\b/.test(s))found=true;
  else {const weekdays=['nedelu','pondelok','utorok','stredu','stvrtok','piatok','sobotu'];const day=weekdays.findIndex(d=>new RegExp(`\\b${d}\\b`).test(s));if(day>=0){due.setDate(due.getDate()+(day-due.getDay()+7)%7);found=true;}}
  const explicit=s.match(/\b(\d{1,2})\.\s*(\d{1,2})\.(?:\s*(\d{4}))?/);
  if(explicit){const y=+(explicit[3]||now.getFullYear()),m=+explicit[2]-1,d=+explicit[1];const check=new Date(y,m,d);if(check.getFullYear()===y&&check.getMonth()===m&&check.getDate()===d){due.setTime(check.getTime());found=true;}else found=false;}
  if(found) result.due=dateValue(due);
  const time=s.match(/\b(?:o\s+)?([01]?\d|2[0-3]):([0-5]\d)\b/);
  if(found&&time) result.time=`${time[1].padStart(2,'0')}:${time[2]}`;
  else if(found&&/\brano\b/.test(s)) result.time='08:00';
  else if(found&&/\bvecer\b/.test(s)) result.time='18:00';
  return result;
}
