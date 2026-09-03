const $=id=>document.getElementById(id),pad=n=>String(n).padStart(2,'0');
const form=$('workorderForm'),result=$('result'),settingsDialog=$('settingsDialog');
let config={fleetEmail:'',orgCode:'PO',aircraft:[]};
const nlDate=v=>new Intl.DateTimeFormat('nl-NL',{day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date(v+'T12:00:00'));
const cleanReg=v=>v.trim().toUpperCase().replace(/\s+/g,'');
const esc=v=>{const e=document.createElement('div');e.textContent=v??'';return e.innerHTML};
const pilot=()=>JSON.parse(localStorage.getItem('po-pilot')||'{}');
async function hash(value){const bytes=new TextEncoder().encode(value),digest=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('')}
async function init(){
  let central=config;
  try{central=await fetch('data/club-config.json',{cache:'no-store'}).then(r=>r.json())}catch{}
  const local=JSON.parse(localStorage.getItem('po-club-config')||'null');
  config=local?{...central,...local,pilots:central.pilots||[],tasks:central.tasks||[]}:central;
  $('fleetEmail').value=config.fleetEmail||'';$('orgCode').value=config.orgCode||'PO';renderAircraftSelect();
  $('pilotName').innerHTML='<option value="">Selecteer uw naam…</option>'+(config.pilots||[]).map(p=>`<option value="${esc(p.name)}">${esc(p.name)}</option>`).join('');
  $('date').valueAsDate=new Date();updateNumber();
  const p=pilot(),isAuthorised=(config.pilots||[]).some(item=>item.name===p.name);
  if(!p.name||!p.licence||!isAuthorised){localStorage.removeItem('po-pilot');$('pilotDialog').showModal()}
}
function renderAircraftSelect(){
  $('registration').innerHTML='<option value="">Selecteer registratie…</option>'+config.aircraft.map((a,i)=>`<option value="${i}">${esc(a.registration)} · ${esc(a.callSign||'')} · ${esc(a.type)}</option>`).join('');
  $('task').innerHTML='<option value="">Selecteer eerst een vliegtuig…</option>';$('ampTask').value='';$('aircraftInfo').hidden=true;
}
function selectedAircraft(){return $('registration').value===''?undefined:config.aircraft[Number($('registration').value)]}
function workorderNumber(){const a=selectedAircraft();if(!$('date').value||!a)return '—';const d=new Date($('date').value+'T12:00:00'),reg=cleanReg(a.registration).replace(/[^A-Z0-9]/g,'');return `${config.orgCode||'PO'}-${reg}-${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}`}
function updateNumber(){$('woNumber').textContent=workorderNumber()}
function selectAircraft(){
  const a=selectedAircraft();updateNumber();
  if(!a){$('task').innerHTML='<option value="">Selecteer eerst een vliegtuig…</option>';$('ampTask').value='';$('aircraftInfo').hidden=true;return}
  $('aircraftInfo').innerHTML=`<div><strong>Call sign</strong>${esc(a.callSign||'—')}</div><div><strong>Type</strong>${esc(a.type)}</div><div><strong>Fabrikant</strong>${esc(a.manufacturer)}</div><div><strong>Serienummer</strong>${esc(a.serialNumber)}</div>`;
  const tasks=a.tasks?.length?a.tasks:(config.tasks||[]);
  $('aircraftInfo').hidden=false;$('task').innerHTML=tasks.length?'<option value="">Selecteer piloot-eigenaar-taak…</option>'+tasks.map((t,i)=>`<option value="${i}">${esc(t.label)}</option>`).join(''):'<option value="">Nog geen taken ingesteld</option>';$('ampTask').value='';
}
function availableTasks(){const a=selectedAircraft();return a?.tasks?.length?a.tasks:(config.tasks||[])}
function selectTask(){const t=$('task').value===''?undefined:availableTasks()[Number($('task').value)];$('ampTask').value=t?.ampText||''}
function buildData(){const a=selectedAircraft(),p=pilot(),t=availableTasks()[Number($('task').value)];return{number:workorderNumber(),date:nlDate($('date').value),registration:a.registration,type:a.type,manufacturer:a.manufacturer,serialNumber:a.serialNumber,task:t.label,ampTask:t.ampText,work:$('work').value.trim(),licence:p.licence,name:p.name,documentation:$('documentation').value.trim()}}
function logText(d){return `Piloot-eigenaar onderhoud uitgevoerd: ${d.task}. AMP-taak: ${d.ampTask}. Zie workorder ${d.number} voor de verrichte werkzaamheden en gebruikte onderhoudsgegevens. Voltooid op ${d.date}. Vrijgegeven voor gebruik overeenkomstig EASA Part-ML, ML.A.803. Uitvoerder: ${d.name}, SPL ${d.licence}. Handtekening: __________________.`}
function render(d){$('resultNumber').textContent=d.number;$('summary').innerHTML=`<dt>Datum</dt><dd>${esc(d.date)}</dd><dt>Vliegtuig</dt><dd>${esc(d.registration)} · ${esc(d.manufacturer)} ${esc(d.type)} · S/N ${esc(d.serialNumber)}</dd><dt>Taak</dt><dd>${esc(d.task)}</dd><dt>AMP-taak</dt><dd>${esc(d.ampTask)}</dd><dt>Werkzaamheden</dt><dd>${esc(d.work)}</dd><dt>Uitvoerder</dt><dd>${esc(d.name)} · SPL ${esc(d.licence)}</dd><dt>Documentatie</dt><dd>${esc(d.documentation)}</dd>`;$('logbookText').textContent=logText(d);result.hidden=false;result.scrollIntoView({behavior:'smooth',block:'start'})}
function renderEditor(){
  $('aircraftEditor').innerHTML=config.aircraft.map((a,i)=>`<div class="aircraft-card" data-index="${i}"><div class="card-grid"><label><span>Registratie</span><input data-key="registration" value="${esc(a.registration)}"></label><label><span>Call sign</span><input data-key="callSign" value="${esc(a.callSign||'')}"></label><label><span>Type</span><input data-key="type" value="${esc(a.type)}"></label><label><span>Fabrikant</span><input data-key="manufacturer" value="${esc(a.manufacturer)}"></label><label><span>Serienummer</span><input data-key="serialNumber" value="${esc(a.serialNumber)}"></label></div><label><span>AMP-taken: één regel per taak als Naam | exacte AMP-tekst</span><textarea data-key="tasks" rows="4">${esc(a.tasks.map(t=>`${t.label} | ${t.ampText}`).join('\n'))}</textarea></label><button type="button" class="remove" data-remove="${i}">VERWIJDER</button></div>`).join('');
}
function readEditor(){
  document.querySelectorAll('.aircraft-card').forEach(card=>{
    const i=Number(card.dataset.index),get=k=>card.querySelector(`[data-key="${k}"]`).value.trim();
    config.aircraft[i]={
      registration:cleanReg(get('registration')),
      callSign:get('callSign'),type:get('type'),manufacturer:get('manufacturer'),serialNumber:get('serialNumber'),
      tasks:get('tasks').split('\n').filter(Boolean).map(line=>{
        const [label,...rest]=line.split('|');
        return{label:label.trim(),ampText:rest.join('|').trim()||label.trim()};
      })
    };
  });
}
function downloadConfig(){readEditor();const blob=new Blob([JSON.stringify(config,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='club-config.json';a.click();URL.revokeObjectURL(a.href)}
$('savePilot').addEventListener('click',e=>{e.preventDefault();const f=$('pilotForm'),name=$('pilotName').value;if(!f.reportValidity())return;if(!(config.pilots||[]).some(p=>p.name===name)){alert('Selecteer een piloot-eigenaar uit de vaste clublijst.');return}localStorage.setItem('po-pilot',JSON.stringify({name,licence:$('pilotLicence').value.trim().toUpperCase()}));$('pilotDialog').close()});
$('settingsButton').addEventListener('click',()=>{const first=!localStorage.getItem('po-admin-hash');$('loginHint').textContent=first?'Kies bij het eerste gebruik een beheerderswachtwoord. Dit blijft op dit apparaat bewaard.':'Voer het beheerderswachtwoord in.';$('passwordLabel').textContent=first?'Nieuw wachtwoord':'Wachtwoord';$('confirmPasswordWrap').hidden=!first;$('adminPasswordConfirm').required=first;$('loginDialog').showModal()});
$('loginButton').addEventListener('click',async e=>{e.preventDefault();const first=!localStorage.getItem('po-admin-hash'),password=$('adminPassword').value;if(password.length<6){$('adminPassword').setCustomValidity('Gebruik minimaal 6 tekens.');$('adminPassword').reportValidity();return}$('adminPassword').setCustomValidity('');if(first&&password!==$('adminPasswordConfirm').value){$('adminPasswordConfirm').setCustomValidity('Wachtwoorden zijn niet gelijk.');$('adminPasswordConfirm').reportValidity();return}const value=await hash(password);if(!first&&value!==localStorage.getItem('po-admin-hash')){$('adminPassword').setCustomValidity('Onjuist wachtwoord.');$('adminPassword').reportValidity();return}if(first)localStorage.setItem('po-admin-hash',value);$('loginDialog').close();$('adminPassword').value='';$('adminPasswordConfirm').value='';renderEditor();settingsDialog.showModal()});
$('addAircraft').addEventListener('click',()=>{readEditor();config.aircraft.push({registration:'',callSign:'',type:'',manufacturer:'',serialNumber:'',tasks:[]});renderEditor()});
$('aircraftEditor').addEventListener('click',e=>{if(e.target.dataset.remove!==undefined){readEditor();config.aircraft.splice(Number(e.target.dataset.remove),1);renderEditor()}});
$('saveSettings').addEventListener('click',e=>{e.preventDefault();readEditor();config.fleetEmail=$('fleetEmail').value.trim();config.orgCode=($('orgCode').value.trim().toUpperCase()||'PO').replace(/[^A-Z0-9]/g,'');localStorage.setItem('po-club-config',JSON.stringify(config));settingsDialog.close();renderAircraftSelect();updateNumber()});
$('exportConfig').addEventListener('click',downloadConfig);
$('registration').addEventListener('change',selectAircraft);$('task').addEventListener('change',selectTask);$('date').addEventListener('change',updateNumber);
form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;render(buildData())});
$('copyButton').addEventListener('click',async()=>{await navigator.clipboard.writeText($('logbookText').textContent);$('copyButton').textContent='GEKOPIEERD';setTimeout(()=>$('copyButton').textContent='KOPIEER',1600)});
$('printButton').addEventListener('click',()=>window.print());
$('mailButton').addEventListener('click',()=>{const d=buildData();if(!config.fleetEmail){alert('De vlootbeheerder moet eerst een e-mailadres instellen.');return}const subject=`Workorder ${d.number} – ${d.registration}`,body=`Beste vlootbeheerder,\n\nHierbij meld ik de uitvoering van piloot-eigenaar onderhoud.\n\nWorkorder: ${d.number}\nDatum: ${d.date}\nVliegtuig: ${d.registration}, ${d.manufacturer} ${d.type}, S/N ${d.serialNumber}\nTaak: ${d.task}\nAMP-taak: ${d.ampTask}\n\nVerrichte werkzaamheden:\n${d.work}\n\nGebruikte documentatie:\n${d.documentation}\n\nUitvoerder: ${d.name}\nSPL-nummer: ${d.licence}\n\nLogboekverwijzing:\n${logText(d)}\n\nMet vriendelijke groet,\n${d.name}`;location.href=`mailto:${encodeURIComponent(config.fleetEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`});
init();
