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
  mf=new Miniflare(convertV4MiniflareOptions({modules:true,script:await readFile(new URL('../src/worker.js',import.meta.url),'utf8'),compatibilityDate:'2026-11-13',d1Databases:['DB'],bindings:{ADMIN_KEY:key},serviceBindings:{ASSETS:()=>new Response('asset')}}));
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
