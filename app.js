const $=s=>document.querySelector(s),keyToday=()=>{let d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`},read=(k,f)=>{try{return JSON.parse(localStorage.getItem(k))??f}catch{return f}},fmt=n=>Math.round(n).toLocaleString('pt-BR');
let entries=read('hd_entries',[]),goal=Number(read('hd_goal',2000))||2000,reminder=read('hd_reminder',{enabled:false,start:'08:00',end:'20:00',interval:60}),period='week',toastTimer;
function total(day){return entries.filter(e=>e.date===day).reduce((s,e)=>s+e.amount,0)}function save(){localStorage.setItem('hd_entries',JSON.stringify(entries));markLocalChange()}function toast(t){$('#toast').textContent=t;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),2200)}
function add(n){if(!Number.isFinite(n)||n<1||n>5000)return;entries.push({id:Date.now()+Math.random(),date:keyToday(),time:new Date().toISOString(),amount:n});save();render();toast(`${fmt(n)} ml adicionados! 💧`)}
function home(){let sum=total(keyToday()),pct=Math.min(100,Math.round(sum/goal*100)),left=Math.max(0,goal-sum);$('#goalText').textContent=fmt(goal)+' ml';$('#consumed').textContent=fmt(sum);$('#percent').textContent=pct+'%';$('#ringValue').style.strokeDashoffset=571.77-571.77*pct/100;$('#remaining').textContent=left?`💧 Faltam ${fmt(left)} ml`:'Meta diária alcançada!';$('#status').textContent=pct>=100?'Parabéns! 🎉':pct>=50?'Você está no caminho!':'Vamos começar!';let list=entries.filter(e=>e.date===keyToday()).sort((a,b)=>new Date(b.time)-new Date(a.time));$('#count').textContent=`${list.length} ${list.length===1?'registro':'registros'}`;$('#entries').innerHTML=list.length?list.map(e=>`<div class="entry"><div class="entryicon">💧</div><div class="entryinfo"><b>Água</b><small>${new Date(e.time).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</small></div><span class="entryamount">+${fmt(e.amount)} ml</span><button class="remove" data-remove="${e.id}">×</button></div>`).join(''):'<div class="empty">Ainda não há registros. Adicione seu primeiro copo! 💧</div>'}
function chart(){let c=$('#chart'),w=c.getBoundingClientRect().width||300,dpr=devicePixelRatio||1;c.width=w*dpr;c.height=230*dpr;let x=c.getContext('2d');x.scale(dpr,dpr);let days=[];if(period==='week'){for(let i=6;i>=0;i--){let d=new Date();d.setDate(d.getDate()-i);days.push(d)}}else{let d=new Date();for(let i=1;i<=d.getDate();i++)days.push(new Date(d.getFullYear(),d.getMonth(),i))}let k=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,vals=days.map(d=>total(k(d))),max=Math.ceil(Math.max(goal,...vals,500)/500)*500,left=37,right=8,top=15,bottom=34,cw=w-left-right,ch=230-top-bottom;x.font='10px Arial';x.textAlign='right';x.textBaseline='middle';x.fillStyle='#91a0b2';for(let i=0;i<=4;i++){let v=max*i/4,y=top+ch-ch*i/4;x.strokeStyle='#edf1f6';x.beginPath();x.moveTo(left,y);x.lineTo(w-right,y);x.stroke();x.fillText(fmt(v),left-6,y)}let gy=top+ch-goal/max*ch;x.setLineDash([4,4]);x.strokeStyle='#f0a94a';x.beginPath();x.moveTo(left,gy);x.lineTo(w-right,gy);x.stroke();x.setLineDash([]);let slot=cw/days.length,bw=Math.max(4,Math.min(25,slot*.56));vals.forEach((v,i)=>{let bx=left+i*slot+(slot-bw)/2,bh=v/max*ch,by=top+ch-bh;x.fillStyle=v>=goal?'#19a7c8':'#328be0';x.beginPath();x.roundRect(bx,by,bw,Math.max(2,bh),4);x.fill();if(period==='week'||days.length<16){x.fillStyle='#8291a4';x.textAlign='center';x.textBaseline='top';x.fillText(period==='week'?['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][days[i].getDay()]:days[i].getDate(),bx+bw/2,top+ch+8)}});$('#chartTitle').textContent=period==='week'?'Últimos 7 dias':'Este mês';$('#average').textContent=fmt(vals.reduce((a,b)=>a+b,0)/vals.length)+' ml';$('#best').textContent=fmt(Math.max(0,...vals))+' ml';let hits=vals.filter(v=>v>=goal).length;$('#hit').textContent=`${hits} ${hits===1?'dia':'dias'}`}
function settings(){ $('#goalInput').value=goal;$('#reminderToggle').checked=reminder.enabled;$('#start').value=reminder.start;$('#end').value=reminder.end;$('#interval').value=reminder.interval;$('#reminderFields').classList.toggle('visible',reminder.enabled)}function render(){home();chart();settings()}
function go(name){document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active',s.id===name));document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b.dataset.go===name));if(name==='history')chart();scrollTo({top:0,behavior:'smooth'})}
document.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>add(Number(b.dataset.add)));$('#other').onclick=()=>{$('#customAmount').value='';$('#modal').showModal()};$('#close').onclick=()=>$('#modal').close();$('#customForm').onsubmit=e=>{e.preventDefault();let n=Number($('#customAmount').value);if(n>0&&n<=5000){$('#modal').close();add(n)}else toast('Informe um valor entre 1 e 5.000 ml.')};$('#entries').onclick=e=>{let b=e.target.closest('[data-remove]');if(!b)return;entries=entries.filter(v=>String(v.id)!==b.dataset.remove);save();render();toast('Registro removido.')};document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>go(b.dataset.go));$('#settingsShortcut').onclick=()=>go('settings');document.querySelectorAll('[data-period]').forEach(b=>b.onclick=()=>{period=b.dataset.period;document.querySelectorAll('[data-period]').forEach(t=>t.classList.toggle('chosen',t===b));chart()});$('#saveGoal').onclick=()=>{let n=Number($('#goalInput').value);if(n<250||n>10000||!Number.isFinite(n)){toast('Escolha uma meta entre 250 e 10.000 ml.');return}goal=n;localStorage.setItem('hd_goal',JSON.stringify(goal));markLocalChange();render();toast('Meta atualizada!')};
$('#reminderToggle').onchange=async e=>{if(e.target.checked){if(!('Notification'in window)){e.target.checked=false;toast('Notificações indisponíveis neste navegador.');return}let p=await Notification.requestPermission();if(p!=='granted'){e.target.checked=false;toast('Permita notificações no navegador.');return}}reminder.enabled=e.target.checked;localStorage.setItem('hd_reminder',JSON.stringify(reminder));settings();scheduleReminder()};$('#saveReminder').onclick=()=>{reminder={enabled:$('#reminderToggle').checked,start:$('#start').value,end:$('#end').value,interval:Number($('#interval').value)};localStorage.setItem('hd_reminder',JSON.stringify(reminder));scheduleReminder();toast('Lembretes salvos.')};function scheduleReminder(){clearTimeout(window.hdTimer);if(!reminder.enabled||!('Notification'in window)||Notification.permission!=='granted')return;let now=new Date(),[sh,sm]=reminder.start.split(':').map(Number),[eh,em]=reminder.end.split(':').map(Number),start=new Date(),end=new Date();start.setHours(sh,sm,0,0);end.setHours(eh,em,0,0);let next;if(now<start)next=start;else if(now>=end){next=new Date(start);next.setDate(next.getDate()+1)}else next=new Date(now.getTime()+reminder.interval*60000);window.hdTimer=setTimeout(()=>{if(reminder.enabled)new Notification('Hidro Diário 💧',{body:'Que tal fazer uma pausa para beber água?' });scheduleReminder()},Math.max(1000,Math.min(next-now,2147480000)))}
$('#export').onclick=()=>{let blob=new Blob([JSON.stringify({goal,entries,reminder},null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='hidro-diario-dados.json';a.click();URL.revokeObjectURL(a.href);toast('Dados exportados.')};$('#clear').onclick=()=>{if(confirm('Apagar todos os registros? Esta ação não pode ser desfeita.')){entries=[];save();render();toast('Registros apagados.')}};let now=new Date();$('#date').textContent=now.toLocaleDateString('pt-BR',{day:'2-digit',month:'short'});$('#weekday').textContent=now.toLocaleDateString('pt-BR',{weekday:'long'}).toUpperCase();render();scheduleReminder();addEventListener('resize',()=>{if($('#history').classList.contains('active'))chart()});if('serviceWorker'in navigator&&location.protocol!=='file:')addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));


// --- SINCRONIZAÇÃO COM GOOGLE DRIVE (Apps Script) ---
const syncConfig=read('hd_sync_config',{url:'',token:''});
let syncUpdatedAt=Number(read('hd_sync_updated_at',0))||0, syncTimer=null, syncBusy=false;
function syncUi(status,kind=''){
  const el=$('#syncStatus'),dot=$('#syncDot');
  if(el)el.textContent=status;
  if(dot)dot.className='sync-dot '+kind;
}
function markLocalChange(){
  syncUpdatedAt=Date.now();
  localStorage.setItem('hd_sync_updated_at',JSON.stringify(syncUpdatedAt));
  if(syncConfig.url&&syncConfig.token){
    syncUi('Alterações aguardando sincronização','busy');
    clearTimeout(syncTimer);syncTimer=setTimeout(()=>syncWithDrive(false),1200);
  }
}
function jsonpRead(){
  return new Promise((resolve,reject)=>{
    if(!syncConfig.url||!syncConfig.token)return reject(new Error('Configure a conexão primeiro.'));
    const cb='hdDriveCallback_'+Date.now()+'_'+Math.floor(Math.random()*100000);
    const script=document.createElement('script');
    const timer=setTimeout(()=>{cleanup();reject(new Error('Tempo esgotado ao consultar o Drive.'))},15000);
    function cleanup(){clearTimeout(timer);delete window[cb];script.remove()}
    window[cb]=data=>{cleanup();resolve(data)};
    script.onerror=()=>{cleanup();reject(new Error('Não foi possível consultar o Apps Script. Verifique a URL e a implantação.'))};
    script.src=syncConfig.url+'?action=read&token='+encodeURIComponent(syncConfig.token)+'&callback='+cb+'&_='+Date.now();
    document.body.appendChild(script);
  });
}
async function syncWithDrive(showMessage=true){
  if(syncBusy||!syncConfig.url||!syncConfig.token)return;
  syncBusy=true;syncUi('Verificando Google Drive...','busy');
  try{
    const remote=await jsonpRead();
    if(!remote||remote.ok!==true)throw new Error(remote?.error||'Resposta inválida do Drive.');
    const remoteTime=Number(remote.updatedAt)||0;
    if(remote.data&&remoteTime>syncUpdatedAt){
      entries=Array.isArray(remote.data.entries)?remote.data.entries:[];
      goal=Number(remote.data.goal)||2000;
      localStorage.setItem('hd_entries',JSON.stringify(entries));
      localStorage.setItem('hd_goal',JSON.stringify(goal));
      syncUpdatedAt=remoteTime;localStorage.setItem('hd_sync_updated_at',JSON.stringify(syncUpdatedAt));
      render();
      syncUi('Histórico atualizado pelo Google Drive','ok');
      if(showMessage)toast('Dados recuperados do Google Drive.');
    }else{
      const payload={goal,entries,updatedAt:syncUpdatedAt||Date.now()};
      const body=JSON.stringify({token:syncConfig.token,data:payload});
      await fetch(syncConfig.url,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body});
      // Confirma a gravação consultando novamente o arquivo remoto.
      await new Promise(r=>setTimeout(r,1800));
      const check=await jsonpRead();
      if(!check||check.ok!==true||Number(check.updatedAt)<payload.updatedAt)throw new Error('Não foi possível confirmar a gravação no Drive.');
      syncUi('Sincronizado com o Google Drive','ok');
      if(showMessage)toast('Dados enviados ao Google Drive!');
    }
  }catch(err){
    syncUi('Falha na sincronização: '+err.message,'error');
    if(showMessage)toast('Falha na sincronização. Confira URL e chave.');
  }finally{syncBusy=false}
}
$('#saveSync').onclick=()=>{
  const url=$('#syncUrl').value.trim(),token=$('#syncToken').value.trim();
  if(!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec/.test(url)||!token){toast('Informe a URL /exec e a chave de acesso.');return}
  syncConfig.url=url;syncConfig.token=token;
  localStorage.setItem('hd_sync_config',JSON.stringify(syncConfig));
  syncUi('Conexão salva. Testando...','busy');syncWithDrive(true);
};
$('#syncNow').onclick=()=>syncWithDrive(true);
$('#syncUrl').value=syncConfig.url||'';
$('#syncToken').value=syncConfig.token||'';
if(syncConfig.url&&syncConfig.token)syncWithDrive(false);
