'use strict';
const get=id=>document.getElementById(id);
const rates=[['Стяжка пола','м²',430,610],['Штукатурка стен','м²',310,570],['Грунтовка стен','м²',45,80],['Укладка плитки','м²',950,1200],['Окраска стен','м²',180,240],['Монтаж перегородок','м²',640,720]];
const sample=[['Стяжка пола','м²',28],['Штукатурка стен','м²',46],['Грунтовка стен','м²',46],['Монтаж закладных','шт',8]];
const cols=['Наименование','Ед.','Объём'];
const key=s=>String(s??'').toLowerCase().replace(/ё/g,'е').replace(/²/g,'2').replace(/³/g,'3').replace(/[^а-яa-z0-9]/g,'');
const parsed=n=>typeof n==='number'?n:String(n??'').trim()===''?NaN:Number(String(n).replace(/[\s\u00a0]/g,'').replace(',','.'));
const valid=n=>Number.isFinite(n)&&n>=0&&n<=1e10;
const money=n=>new Intl.NumberFormat('ru-RU',{maximumFractionDigits:2}).format(n);
const round=n=>Math.round((n+Number.EPSILON)*100)/100;
const el=(tag,value)=>{const n=document.createElement(tag);n.textContent=value??'';return n};
let items=[],fileName='';
function record(name,unit,qty){
 const r=rates.find(v=>key(v[0])===key(name)&&key(v[1])===key(unit));
 return {name:String(name),unit:String(unit),qty,material:r?.[2],labor:r?.[3],origin:r?'Демо-справочник':'На согласовании'};
}
function sums(x){return [round(x.qty*x.material),round(x.qty*x.labor)]}
function summary(){
 const known=items.filter(x=>x.material!==undefined),[m,l]=known.reduce(([m,l],x)=>{const [a,b]=sums(x);return [round(m+a),round(l+b)]},[0,0]);
 const suffix=' ₽';get('total').textContent=money(round(m+l))+suffix;get('mat').textContent=money(m)+suffix;get('lab').textContent=money(l)+suffix;
 get('bar').style.width=((m+l)?100*m/(m+l):0)+'%';get('totalLabel').textContent=known.length===items.length?'Итого по ведомости':'Итого по оценённым позициям';
 get('stats').textContent='Позиций: '+items.length+' · Оценено: '+known.length+' · На согласовании: '+(items.length-known.length);
}
function number(label,value){const n=document.createElement('input');n.type='number';n.min=0;n.step='any';n.max='10000000000';n.value=value??'';n.setAttribute('aria-label',label);return n}
function draw(){
 get('source').textContent=fileName;get('rows').replaceChildren();get('pending').replaceChildren();get('review').hidden=items.every(x=>x.material!==undefined);
 items.forEach(x=>{
  const tr=el('tr'),name=el('td',x.name),volume=number('Объём — '+x.name,x.qty),vol=el('td'),amount=el('td');
  if(x.material===undefined)name.append(el('small','На согласовании'));vol.append(volume);
  const refresh=()=>amount.textContent=x.material===undefined?'—':money(round(sums(x)[0]+sums(x)[1]));
  volume.oninput=()=>{const n=parsed(volume.value);if(valid(n)){x.qty=n;refresh();summary();get('notice').textContent=''}else{get('notice').textContent='Укажите неотрицательный объём. Пока используется предыдущее значение.'}};volume.onblur=()=>{volume.value=x.qty};
  tr.append(name,el('td',x.unit),vol,el('td',x.material===undefined?'—':money(x.material)),el('td',x.labor===undefined?'—':money(x.labor)),amount);refresh();get('rows').append(tr);
  if(x.material!==undefined)return;
  const box=el('div');box.className='item';const a=number('Материалы за единицу — '+x.name),b=number('Работа за единицу — '+x.name);
  const l1=el('label','Материалы, ₽ / '+x.unit),l2=el('label','Работа, ₽ / '+x.unit),btn=el('button','Подтвердить');l1.append(a);l2.append(b);
  btn.onclick=()=>{const m=parsed(a.value),l=parsed(b.value);if(!valid(m)||!valid(l)){get('notice').textContent='Введите обе ставки. Нулевую ставку можно указать явно.';(!valid(m)?a:b).focus();return}Object.assign(x,{material:m,labor:l,origin:'Подтверждено вручную'});draw();get('notice').textContent='Позиция «'+x.name+'» включена в итог.'};
  box.append(el('strong',x.name+' · '+x.unit),l1,l2,btn);get('pending').append(box);
 });summary();
}
function reset(){items=sample.map(r=>record(...r));fileName='Пример · Отделочные работы';get('notice').textContent='';draw()}
function save(sheets,name){const book=XLSX.utils.book_new();for(const [title,arr] of sheets){const sh=XLSX.utils.aoa_to_sheet(arr);sh['!cols']=arr[0].map((v,i)=>({wch:i===0?38:22}));XLSX.utils.book_append_sheet(book,sh,title)}XLSX.writeFile(book,name)}
get('template').onclick=()=>save([['Ведомость',[cols,...sample]]],'Ведомость-пример.xlsx');
get('download').onclick=()=>{const table=items.map(x=>{const [m,l]=x.material===undefined?[null,null]:sums(x);return [x.name,x.unit,x.qty,x.material??null,x.labor??null,m,l,m===null?null:round(m+l),x.origin]});const totals=[5,6,7].map(i=>round(table.reduce((n,r)=>n+(r[i]??0),0)));save([['Расчёт',[['Наименование','Ед.','Объём','Материалы за ед.','Работа за ед.','Материалы, ₽','Работы, ₽','Сумма, ₽','Статус'],...table,['Итого по оценённым',null,null,null,null,...totals]]],['Справочник',[['Наименование','Ед.','Материал за ед.','Работа за ед.'],...rates]]],'Сметная-расчёт.xlsx')};
const headers=[['наименование','наименованиеработ','наименованиеработизатрат','название','работа','видработ','работы'],['ед','едизм','единица','единицаизмерения','едизмерения'],['объем','колво','количество','объемработ','обьем']];
function extract(matrix){
 for(let i=0;i<Math.min(35,matrix.length);i++){const row=matrix[i].map(key),idx=headers.map(options=>row.findIndex(v=>options.includes(v)));if(idx.includes(-1))continue;
 const out=[];for(let j=i+1;j<matrix.length;j++){const r=matrix[j];if(!r.some(v=>String(v??'').trim()))continue;const [name,unit,raw]=idx.map(k=>r[k]);if(/^итого|^всего/i.test(String(name)))continue;
 const qty=parsed(raw);if(!String(name??'').trim()||!String(unit??'').trim()||!valid(qty))throw Error('Проверьте наименование, единицу и объём в строке '+(j+1)+'. Исходный расчёт сохранён.');out.push(record(String(name).trim(),String(unit).trim(),qty));}if(!out.length)throw Error('В ведомости нет позиций.');return out;
 }return null;
}
get('file').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>15e6)throw Error('Максимальный размер файла — 15 МБ.');if(!/\.(xlsx|xls|csv)$/i.test(file.name))throw Error('Поддерживаются XLSX, XLS и CSV.');const bytes=await file.arrayBuffer(),csv=/\.csv$/i.test(file.name);let source=bytes;
 if(csv){try{source=new TextDecoder('utf-8',{fatal:true}).decode(bytes)}catch{source=new TextDecoder('windows-1251').decode(bytes)}}
 const wb=XLSX.read(source,csv?{type:'string',raw:true}:{type:'array'});let found=null;
 for(const n of wb.SheetNames){found=extract(XLSX.utils.sheet_to_json(wb.Sheets[n],{header:1,defval:'',blankrows:true}));if(found)break}
 if(!found)throw Error('Не найдены колонки «Наименование», «Ед.» и «Объём». Скачайте шаблон для примера.');
 items=found;fileName=file.name;draw();get('notice').textContent='Ведомость загружена.'}catch(err){get('notice').textContent=err.message}finally{e.target.value=''}};
get('reset').onclick=reset;reset();
