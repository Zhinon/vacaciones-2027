const securityHeaders = {
  'X-Content-Type-Options':'nosniff',
  'Referrer-Policy':'strict-origin-when-cross-origin',
  'X-Robots-Tag':'noindex, nofollow',
  'Permissions-Policy':'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
};
class ApiError extends Error { constructor(status,message){super(message);this.status=status;} }
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{...securityHeaders,'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});}
function text(value,max,label){if(typeof value!=='string'||!value.trim()||value.trim().length>max)throw new ApiError(400,`${label}: escribí entre 1 y ${max} caracteres.`);return value.trim();}
function url(value){if(value==='')return '';try{const u=new URL(value);if(u.protocol==='https:'||u.protocol==='http:')return u.href;}catch{}throw new ApiError(400,'Usá un enlace completo que empiece con https:// o http://.');}
async function body(request){if(!request.headers.get('Content-Type')?.startsWith('application/json'))throw new ApiError(415,'El formato de la solicitud no es válido.');const raw=await request.text();if(raw.length>20000)throw new ApiError(413,'La solicitud es demasiado grande.');try{const v=JSON.parse(raw);if(!v||typeof v!=='object'||Array.isArray(v))throw 0;return v;}catch{throw new ApiError(400,'No se pudo leer la solicitud.');}}
async function member(db,id){if(typeof id!=='string'||!(await db.prepare('SELECT id FROM participants WHERE id=?').bind(id).first()))throw new ApiError(400,'Elegí tu nombre antes de participar.');}
async function proposal(db,id,revision){const p=await db.prepare('SELECT * FROM proposals WHERE id=?').bind(typeof id==='string'?id:'').first();if(!p)throw new ApiError(404,'Esta propuesta ya no está disponible.');if(revision!==p.revision)throw new ApiError(409,'La propuesta cambió. Actualizá la página y revisá tu voto.');return p;}
async function admin(request,env){const key=request.headers.get('Authorization')?.replace(/^Bearer /,'')||'';if(!env.ADMIN_KEY)throw new ApiError(503,'La edición no está habilitada: falta configurar la clave del organizador.');const hash=async x=>new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(x)));const [a,b]=await Promise.all([hash(key),hash(env.ADMIN_KEY)]);if(a.some((v,i)=>v!==b[i]))throw new ApiError(403,'La clave del organizador no es correcta.');}
async function state(db,includeFlights=false){const [p,m,v,f,c,s]=await db.batch(['SELECT * FROM proposals ORDER BY rowid','SELECT id,name FROM participants ORDER BY created_at,id','SELECT * FROM votes','SELECT * FROM favorites','SELECT * FROM comments ORDER BY created_at,id','SELECT * FROM suggestions ORDER BY created_at DESC,id'].map(sql=>db.prepare(sql)));return {proposals:p.results.map(r=>({...JSON.parse(r.data),revision:r.revision})).filter(p=>includeFlights||p.type!=='flight'),participants:m.results,votes:v.results,favorites:f.results,comments:c.results,suggestions:s.results};}
async function api(request,env,path){
  if(!env.DB)throw new ApiError(503,'La base compartida no está conectada. Intentá de nuevo más tarde.');
  const db=env.DB;
  if(request.method==='GET'&&path==='/api/state')return json(await state(db,new URL(request.url).searchParams.get('include')==='flights'));
  if(!['POST','PUT','DELETE'].includes(request.method))throw new ApiError(405,'Esta acción no está disponible.');
  const origin=request.headers.get('Origin');
  if((origin&&origin!==new URL(request.url).origin)||request.headers.get('Sec-Fetch-Site')==='cross-site')throw new ApiError(403,'Abrí el tablero para realizar esta acción.');
  const b=await body(request);
  if(path==='/api/participants'&&request.method==='POST'){
    const name=text(b.name,40,'Nombre'),key=name.normalize('NFKC').toLocaleLowerCase('es');
    const id=crypto.randomUUID();
    try{await db.prepare('INSERT INTO participants(id,name,name_key) VALUES(?,?,?)').bind(id,name,key).run();}
    catch(e){if(String(e).includes('GROUP_FULL'))throw new ApiError(409,'Ya están los cinco. Elegí tu nombre de la lista.');if(String(e).includes('UNIQUE'))throw new ApiError(409,'Ese nombre ya existe. Elegilo de la lista.');throw e;}
    return json({id,name},201);
  }
  if(path==='/api/votes'&&request.method==='PUT'){
    await member(db,b.participantId);await proposal(db,b.proposalId,b.revision);
    if(!['yes','maybe','no'].includes(b.value))throw new ApiError(400,'Elegí una de las tres respuestas.');
    const ops=[db.prepare("INSERT INTO votes(participant_id,proposal_id,value,revision) SELECT ?,?,?,? WHERE EXISTS(SELECT 1 FROM proposals WHERE id=? AND revision=?) ON CONFLICT(participant_id,proposal_id) DO UPDATE SET value=excluded.value,revision=excluded.revision,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now')").bind(b.participantId,b.proposalId,b.value,b.revision,b.proposalId,b.revision)];
    if(b.value!=='yes')ops.push(db.prepare('DELETE FROM favorites WHERE participant_id=? AND proposal_id=?').bind(b.participantId,b.proposalId));
    const result=await db.batch(ops);if(!result[0].meta.changes)throw new ApiError(409,'La propuesta cambió. Actualizá y revisá tu voto.');return json({ok:true});
  }
  if(path==='/api/favorite'&&request.method==='PUT'){
    await member(db,b.participantId);
    if(b.proposalId===null){await db.prepare('DELETE FROM favorites WHERE participant_id=?').bind(b.participantId).run();return json({ok:true});}
    await proposal(db,b.proposalId,b.revision);
    const r=await db.batch([
      db.prepare("INSERT INTO votes(participant_id,proposal_id,value,revision) SELECT ?,?,'yes',? WHERE EXISTS(SELECT 1 FROM proposals WHERE id=? AND revision=?) ON CONFLICT(participant_id,proposal_id) DO UPDATE SET value='yes',revision=excluded.revision").bind(b.participantId,b.proposalId,b.revision,b.proposalId,b.revision),
      db.prepare('INSERT INTO favorites(participant_id,proposal_id,revision) SELECT ?,?,? WHERE EXISTS(SELECT 1 FROM proposals WHERE id=? AND revision=?) ON CONFLICT(participant_id) DO UPDATE SET proposal_id=excluded.proposal_id,revision=excluded.revision').bind(b.participantId,b.proposalId,b.revision,b.proposalId,b.revision)
    ]);if(!r[0].meta.changes)throw new ApiError(409,'La propuesta cambió. Actualizá y revisá tu favorita.');return json({ok:true});
  }
  if(path==='/api/comments'&&request.method==='POST'){
    await member(db,b.participantId);await proposal(db,b.proposalId,b.revision);
    if((await db.prepare('SELECT COUNT(*) AS count FROM comments WHERE participant_id=?').bind(b.participantId).first()).count>=200)throw new ApiError(429,'Llegaste al límite de comentarios. Eliminá alguno antes de agregar otro.');
    const comment=text(b.body,1200,'Comentario'),id=crypto.randomUUID();
    await db.prepare('INSERT INTO comments(id,participant_id,proposal_id,body) VALUES(?,?,?,?)').bind(id,b.participantId,b.proposalId,comment).run();return json({id},201);
  }
  if(path==='/api/comments'&&request.method==='DELETE'){
    await member(db,b.participantId);const r=await db.prepare('DELETE FROM comments WHERE id=? AND participant_id=?').bind(typeof b.id==='string'?b.id:'',b.participantId).run();if(!r.meta.changes)throw new ApiError(404,'Sólo podés borrar comentarios del nombre seleccionado.');return json({ok:true});
  }
  if(path==='/api/suggestions'&&request.method==='POST'){
    await member(db,b.participantId);if((await db.prepare('SELECT COUNT(*) AS count FROM suggestions WHERE participant_id=?').bind(b.participantId).first()).count>=20)throw new ApiError(429,'Llegaste al límite de 20 sugerencias.');
    const title=text(b.title,100,'Propuesta'),link=url(typeof b.url==='string'?b.url:''),note=text(b.note,1200,'Detalle'),id=crypto.randomUUID();await db.prepare('INSERT INTO suggestions(id,participant_id,title,url,note) VALUES(?,?,?,?,?)').bind(id,b.participantId,title,link,note).run();return json({id},201);
  }
  if(path==='/api/admin/proposals'&&request.method==='PUT'){
    await admin(request,env);const row=await proposal(db,b.id,b.revision),p=JSON.parse(row.data);if(p.type==='flight'&&((b.dates!==undefined&&b.dates!==p.dates)||(b.nights!==undefined&&b.nights!==p.nights)))throw new ApiError(400,'Cambiar fechas de vuelo requiere una nueva cotización para cinco.');
    for(const field of ['hotel','dates','origin','note'])if(b[field]!==undefined)p[field]=text(b[field],field==='note'?1200:150,field);
    if(b.source!==undefined)p.source=url(b.source);
    if(!Number.isFinite(b.price)||b.price<=0||b.price>((p.currency||'USD')==='ARS'?100000000:1000000))throw new ApiError(400,`Indicá un precio válido en ${p.currency||'USD'}.`);p.price=b.price;
    if(!Number.isInteger(b.nights)||b.nights<1||b.nights>13)throw new ApiError(400,'La estadía debe tener entre 1 y 13 noches.');p.nights=b.nights;
    if(!['group','search','published','estimate'].includes(b.evidence))throw new ApiError(400,'Indicá el tipo de precio.');p.evidence=b.evidence;
    p.groupTotal=null;if(b.evidence==='group'||b.evidence==='search'){if(!Number.isFinite(b.groupTotal)||b.groupTotal<=0||Math.abs(b.groupTotal/5-b.price)>((p.currency||'USD')==='ARS'?1.01:0.02))throw new ApiError(400,'El total del grupo debe coincidir con el precio por persona × 5, salvo redondeo.');p.groupTotal=b.groupTotal;}
    p.checkedAt=new Date().toISOString().slice(0,10);
    const r=await db.prepare('UPDATE proposals SET data=?,revision=revision+1 WHERE id=? AND revision=?').bind(JSON.stringify(p),b.id,b.revision).run();if(!r.meta.changes)throw new ApiError(409,'Otra edición cambió la propuesta. Actualizá antes de guardar.');return json({ok:true});
  }
  throw new ApiError(404,'No encontramos esa acción.');
}
export default {async fetch(request,env){const path=new URL(request.url).pathname;
  if(path.startsWith('/api/')){try{return await api(request,env,path);}catch(e){if(e instanceof ApiError)return json({error:e.message},e.status);console.error('Database operation failed');return json({error:'No pudimos guardar o cargar los datos. Reintentá en unos segundos.'},503);}}
  const response=await env.ASSETS.fetch(request);const headers=new Headers(response.headers);for(const [k,v] of Object.entries(securityHeaders))headers.set(k,v);return new Response(response.body,{status:response.status,headers});
}};
