import {build} from 'esbuild';
import {after,before,test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
let mf;
const key='local-test-only-organizer';
async function request(path,method='GET',body,extra={}){
  const r=await mf.dispatchFetch('https://vacaciones.test/api/'+path,{method,headers:{...(body?{'Content-Type':'application/json'}:{}),...extra},...(body?{body:JSON.stringify(body)}:{})});
  return {status:r.status,data:await r.json()};
}
before(async()=>{
  const bundle=await build({entryPoints:[new URL('../src/worker.js',import.meta.url).pathname],bundle:true,write:false,format:'esm',platform:'browser',target:'es2022'});
  mf=new Miniflare(convertV4MiniflareOptions({modules:true,script:bundle.outputFiles[0].text,compatibilityDate:'2026-11-13',d1Databases:['DB'],bindings:{ADMIN_KEY:key,TRAVELER_DATA_KEY:Buffer.alloc(32,7).toString('base64')},serviceBindings:{ASSETS:()=>new Response('asset')}}));
  const db=await mf.getD1Database('DB');
  await db.exec(await readFile(new URL('../migrations/0001_initial.sql',import.meta.url),'utf8'));
  await db.exec(await readFile(new URL('../migrations/0002_proposals.sql',import.meta.url),'utf8'));
});
after(async()=>{await mf?.dispose();});
test('shared opinions, single favorite, comments, revisions and five-member limit',async()=>{
  let state=await request('state');assert.equal(state.status,200);assert.equal(state.data.proposals.length,6);assert.equal(state.data.participants.length,0);
  const unauth=await request('votes','PUT',{participantId:'missing',proposalId:'maceio-marinas',revision:1,value:'yes'});assert.equal(unauth.status,400);
  const alice=await request('participants','POST',{name:'Ana'});assert.equal(alice.status,201);
  assert.equal((await request('participants','POST',{name:'ana'})).status,409);
  const id=alice.data.id;
  assert.equal((await request('votes','PUT',{participantId:id,proposalId:'maceio-marinas',revision:1,value:'yes'})).status,200);
  assert.equal((await request('votes','PUT',{participantId:id,proposalId:'maceio-marinas',revision:1,value:'maybe'})).status,200);
  state=await request('state');assert.equal(state.data.votes.length,1);assert.equal(state.data.votes[0].value,'maybe');
  assert.equal((await request('favorite','PUT',{participantId:id,proposalId:'maceio-marinas',revision:1})).status,200);
  assert.equal((await request('favorite','PUT',{participantId:id,proposalId:'natal-marsol',revision:1})).status,200);
  state=await request('state');assert.equal(state.data.favorites.length,1);assert.equal(state.data.favorites[0].proposal_id,'natal-marsol');
  assert.equal((await request('votes','PUT',{participantId:id,proposalId:'natal-marsol',revision:1,value:'no'})).status,200);
  assert.equal((await request('state')).data.favorites.length,0);
  const comment=await request('comments','POST',{participantId:id,proposalId:'maceio-marinas',revision:1,body:'Prefiero diez noches. <script>alert(1)</script>'});assert.equal(comment.status,201);
  const bob=await request('participants','POST',{name:'Bruno'});assert.equal(bob.status,201);
  assert.equal((await request('comments','DELETE',{participantId:bob.data.id,id:comment.data.id})).status,404);
  assert.equal((await request('comments','DELETE',{participantId:id,id:comment.data.id})).status,200);
  assert.equal((await request('suggestions','POST',{participantId:id,title:'Otra playa',url:'javascript:alert(1)',note:'Una opción'})).status,400);
  assert.equal((await request('suggestions','POST',{participantId:id,title:'Porto',url:'https://example.com/viaje',note:'Comparar 10 noches'})).status,201);
  const edit={id:'maceio-marinas',revision:1,price:1200,groupTotal:6000,nights:7,evidence:'group',note:'Nueva cotización'};
  assert.equal((await request('admin/proposals','PUT',edit)).status,403);
  assert.equal((await request('admin/proposals','PUT',edit,{Authorization:'Bearer '+key})).status,200);
  state=await request('state');assert.equal(state.data.proposals.find(p=>p.id===edit.id).revision,2);assert.equal(state.data.votes.find(v=>v.proposal_id===edit.id).revision,1);
  assert.equal((await request('votes','PUT',{participantId:id,proposalId:edit.id,revision:1,value:'yes'})).status,409);
  assert.equal((await request('votes','PUT',{participantId:id,proposalId:edit.id,revision:2,value:'yes'})).status,200);
  assert.equal((await request('admin/proposals','PUT',edit,{Authorization:'Bearer '+key})).status,409);
  for(const name of ['Carla','Diego','Elena'])assert.equal((await request('participants','POST',{name})).status,201);
  assert.equal((await request('participants','POST',{name:'Sexto'})).status,409);
  assert.equal((await request('state')).data.participants.length,5);
});
test('rejects cross-origin writes and invalid input',async()=>{
  assert.equal((await request('participants','POST',{name:'Intruso'},{Origin:'https://another.example'})).status,403);
  assert.equal((await request('participants','POST',{name:''})).status,400);
  assert.equal((await request('participants','POST',{name:'a'.repeat(41)})).status,400);
  assert.equal((await request('state','DELETE',{})).status,404);
});
test('flight migration preserves packages and validates ARS group totals and dates',async()=>{
  const db=await mf.getD1Database('DB');
  const before=(await request('state?include=flights')).data;
  await db.exec(await readFile(new URL('../migrations/0004_flight_proposals.sql',import.meta.url),'utf8'));
  const state=(await request('state?include=flights')).data;
  assert.equal(state.proposals.length,17);assert.equal((await request('state')).data.proposals.length,6);
  assert.deepEqual(state.votes,before.votes);
  assert.deepEqual(state.proposals.filter(p=>p.type!=='flight'),before.proposals);
  const flights=state.proposals.filter(p=>p.type==='flight');assert.equal(flights.length,11);
  for(const f of flights){assert.equal(f.currency,'ARS');assert.ok(Math.abs(f.groupTotal/5-f.price)<=1.01);assert.ok(f.tripDays<=14);assert.match(f.departureDate,/^2027-04-(0[1-9]|1[0-5])$/);}
  const f=flights.find(p=>p.id==='vuelo-aua-mdz');
  const edit={id:f.id,revision:f.revision,price:f.price,groupTotal:f.groupTotal,nights:f.nights,dates:f.dates,evidence:'search'};
  assert.equal((await request('admin/proposals','PUT',{...edit,dates:'Otras fechas'},{Authorization:'Bearer '+key})).status,400);
  assert.equal((await request('admin/proposals','PUT',{...edit,groupTotal:6000000},{Authorization:'Bearer '+key})).status,400);
  assert.equal((await request('admin/proposals','PUT',edit,{Authorization:'Bearer '+key})).status,200);
  const updated=(await request('state?include=flights')).data.proposals.find(p=>p.id===f.id);assert.equal(updated.currency,'ARS');assert.equal(updated.revision,2);
});

test('clearing a vote is idempotent, scoped to its participant and proposal, and revision checked',async()=>{
  const initial=(await request('state')).data;
  const [a,b]=initial.participants;
  const [p,q]=initial.proposals;
  const vote=(person,proposal,value,revision=proposal.revision)=>request('votes','PUT',{participantId:person.id,proposalId:proposal.id,revision,value});
  const favorite=proposal=>request('favorite','PUT',{participantId:a.id,proposalId:proposal.id,revision:proposal.revision});
  await vote(b,p,'yes');await vote(a,q,'maybe');
  for(const value of ['yes','maybe','no']){
    assert.equal((await vote(a,p,value)).status,200);
    assert.equal((await vote(a,p,null)).status,200);
    assert.equal((await vote(a,p,null)).status,200);
    const state=(await request('state')).data;
    assert.ok(!state.votes.some(v=>v.participant_id===a.id&&v.proposal_id===p.id));
    assert.ok(state.votes.some(v=>v.participant_id===b.id&&v.proposal_id===p.id&&v.value==='yes'));
    assert.ok(state.votes.some(v=>v.participant_id===a.id&&v.proposal_id===q.id&&v.value==='maybe'));
  }
  await favorite(p);
  assert.equal((await vote(a,p,null,p.revision-1)).status,409);
  assert.ok((await request('state')).data.favorites.some(f=>f.participant_id===a.id&&f.proposal_id===p.id));
  await vote(a,p,null);
  assert.ok(!(await request('state')).data.favorites.some(f=>f.participant_id===a.id&&f.proposal_id===p.id));
  await favorite(q);await vote(a,p,'yes');await vote(a,p,null);
  assert.ok((await request('state')).data.favorites.some(f=>f.participant_id===a.id&&f.proposal_id===q.id));
});

test('private traveler profiles require browser credentials and stay encrypted outside authorized responses',async()=>{
  const db=await mf.getD1Database('DB');await db.exec(await readFile(new URL('../migrations/0005_private_travelers.sql',import.meta.url),'utf8'));
  const people=(await request('state')).data.participants;const [a,b]=people;
  const tokenA='a'.repeat(43),tokenB='b'.repeat(43),intruder='z'.repeat(43);
  const headers=token=>({Authorization:'Bearer '+token});
  const profile={firstNames:'Nombre Prueba',lastNames:'Apellido Prueba',birthDate:'1990-02-15',residenceCountry:'Argentina',email:'prueba@example.test',phone:'+54 261 555 0000',idNumber:'TEST-123456'};
  const put=(id,token,revision,data=profile,extra={})=>request('travelers','PUT',{participantId:id,revision,data},{...headers(token),...extra});
  assert.equal((await request('travelers/self')).status,401);
  assert.equal((await request('travelers/admin')).status,403);
  assert.equal((await put(a.id,tokenA,0,profile,{Origin:'https://other.test'})).status,403);
  assert.equal((await put(a.id,tokenA,0,{...profile,birthDate:'1990-02-31'})).status,400);
  assert.equal((await put(a.id,tokenA,0,{...profile,passportNumber:'TEST-PASSPORT'})).status,400);
  assert.equal((await put(a.id,tokenA,0)).status,200);
  const own=await request('travelers/self','GET',undefined,headers(tokenA));assert.equal(own.status,200);assert.equal(own.data.data.idNumber,profile.idNumber);assert.equal(own.data.participantId,a.id);assert.equal(own.data.data.nationality,'Argentina');assert.equal(own.data.data.idIssuer,'Argentina');assert.ok(!('consentAt' in own.data.data));
  const stored=await db.prepare('SELECT * FROM travelers WHERE participant_id=?').bind(a.id).first();
  assert.ok(!JSON.stringify(stored).includes(profile.idNumber));assert.ok(!JSON.stringify(stored).includes(tokenA));assert.ok(!JSON.stringify(stored).includes(profile.email));
  const publicState=JSON.stringify((await request('state?include=flights')).data);assert.ok(!publicState.includes(profile.idNumber));assert.ok(!publicState.includes('encrypted_data'));assert.ok(!publicState.includes('edit_hash'));
  assert.equal((await request('travelers/self?participantId='+a.id,'GET',undefined,headers(intruder))).status,404);
  assert.equal((await put(a.id,intruder,0,{...profile,idNumber:'STOLEN'})).status,409);
  assert.equal((await put(a.id,intruder,1,{...profile,idNumber:'STOLEN'})).status,409);
  assert.equal((await put(b.id,tokenA,0)).status,403);
  assert.equal((await put(b.id,tokenB,0,{...profile,firstNames:'Otra Persona'})).status,200);
  assert.equal((await put(a.id,tokenA,1,{...profile,phone:'+54 261 555 1111'})).status,200);
  assert.equal((await put(a.id,tokenA,1)).status,409);
  const group=await request('travelers/admin','GET',undefined,headers(key));assert.equal(group.status,200);assert.equal(group.data.travelers.length,2);
  assert.equal((await request('travelers/rotate','POST',{participantId:a.id},headers(tokenB))).status,403);
  const rotate=await request('travelers/rotate','POST',{participantId:a.id},headers(key));assert.equal(rotate.status,200);assert.match(rotate.data.token,/^[A-Za-z0-9_-]{43}$/);
  assert.equal((await request('travelers/self','GET',undefined,headers(tokenA))).status,404);
  assert.equal((await put(a.id,tokenA,2)).status,409);
  const recovered=await request('travelers/self','GET',undefined,headers(rotate.data.token));assert.equal(recovered.status,200);assert.equal(recovered.data.data.phone,'+54 261 555 1111');
  assert.equal((await request('travelers/self','DELETE',{revision:1},headers(rotate.data.token))).status,409);
  assert.equal((await request('travelers/self','DELETE',{revision:recovered.data.revision},headers(rotate.data.token))).status,200);
  assert.equal((await request('travelers/self','GET',undefined,headers(tokenB))).status,200);
  assert.equal((await request('travelers/self','GET',undefined,headers(rotate.data.token))).status,404);
});
