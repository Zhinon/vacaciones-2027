// Passenger details never enter the public state. A name is not a read credential.
const encoder=new TextEncoder(),decoder=new TextDecoder();
const b64=bytes=>btoa(String.fromCharCode(...bytes));
const unb64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const newToken=()=>b64(crypto.getRandomValues(new Uint8Array(32))).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
async function digest(token){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(token)))].map(v=>v.toString(16).padStart(2,'0')).join('');}
async function key(env,ApiError){try{const raw=unb64(env.TRAVELER_DATA_KEY||'');if(raw.length!==32)throw 0;return await crypto.subtle.importKey('raw',raw,'AES-GCM',false,['encrypt','decrypt']);}catch{throw new ApiError(503,'Los datos privados todavía no están habilitados.');}}
async function encrypt(data,id,k){const iv=crypto.getRandomValues(new Uint8Array(12));const sealed=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:encoder.encode(id)},k,encoder.encode(JSON.stringify(data)));return JSON.stringify({v:1,iv:b64(iv),data:b64(new Uint8Array(sealed))});}
async function decrypt(row,k){const p=JSON.parse(row.encrypted_data);if(p.v!==1)throw Error('Unsupported encrypted envelope');return JSON.parse(decoder.decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(p.iv),additionalData:encoder.encode(row.participant_id)},k,unb64(p.data))));}
export async function travelersApi(request,env,path,{member,admin,body,json,ApiError}){
 const db=env.DB;
 if((request.headers.get('Origin')&&request.headers.get('Origin')!==new URL(request.url).origin)||request.headers.get('Sec-Fetch-Site')==='cross-site')throw new ApiError(403,'Abrí la página para realizar esta acción.');
 const k=await key(env,ApiError);
 if(path==='/api/travelers/admin'&&request.method==='GET'){
  await admin(request,env);
  const rows=(await db.prepare('SELECT participant_id,encrypted_data,revision,updated_at FROM travelers').all()).results;
  return json({travelers:await Promise.all(rows.map(async row=>({participantId:row.participant_id,data:await decrypt(row,k),revision:row.revision,updatedAt:row.updated_at})))});
 }
 if(path==='/api/travelers/rotate'&&request.method==='POST'){
  await admin(request,env);const b=await body(request);await member(db,b.participantId);
  const token=newToken();const r=await db.prepare('UPDATE travelers SET edit_hash=?,revision=revision+1 WHERE participant_id=?').bind(await digest(token),b.participantId).run();
  if(!r.meta.changes)throw new ApiError(404,'Todavía no hay datos para esta persona.');return json({token});
 }
 const token=request.headers.get('Authorization')?.replace(/^Bearer /,'')||'';
 if(!/^[A-Za-z0-9_-]{43}$/.test(token))throw new ApiError(401,'Este navegador no tiene acceso a esos datos.');
 const hash=await digest(token);
 if(path==='/api/travelers/self'&&request.method==='GET'){
  const row=await db.prepare('SELECT * FROM travelers WHERE edit_hash=?').bind(hash).first();
  if(!row)throw new ApiError(404,'No hay datos disponibles para este acceso.');
  return json({participantId:row.participant_id,data:await decrypt(row,k),revision:row.revision,updatedAt:row.updated_at});
 }
 if(path==='/api/travelers'&&request.method==='PUT'){
  const b=await body(request);await member(db,b.participantId);
  if(!Number.isInteger(b.revision)||b.revision<0)throw new ApiError(400,'Actualizá el formulario antes de guardar.');
  const data=validateTraveler(b.data,ApiError);const encrypted=await encrypt(data,b.participantId,k);
  const existing=await db.prepare('SELECT participant_id FROM travelers WHERE edit_hash=?').bind(hash).first();
  if(existing&&existing.participant_id!==b.participantId)throw new ApiError(403,'Este acceso pertenece a otra persona.');
  const r=await db.prepare("INSERT INTO travelers(participant_id,edit_hash,encrypted_data) SELECT ?,?,? WHERE ?=0 ON CONFLICT(participant_id) DO NOTHING").bind(b.participantId,hash,encrypted,b.revision).run();
  if(!r.meta.changes){const updated=await db.prepare("UPDATE travelers SET encrypted_data=?,revision=revision+1,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE participant_id=? AND edit_hash=? AND revision=?").bind(encrypted,b.participantId,hash,b.revision).run();if(!updated.meta.changes)throw new ApiError(409,'Ya hay datos protegidos o cambiaron desde que los abriste. Si este no es tu navegador habitual, pedile al organizador un enlace de acceso.');}
  return json({ok:true});
 }
 if(path==='/api/travelers/self'&&request.method==='DELETE'){
  const b=await body(request);if(!Number.isInteger(b.revision)||b.revision<1)throw new ApiError(400,'Actualizá antes de borrar.');
  const r=await db.prepare('DELETE FROM travelers WHERE edit_hash=? AND revision=?').bind(hash,b.revision).run();
  if(!r.meta.changes)throw new ApiError(409,'Los datos cambiaron o el acceso ya no es válido.');return json({ok:true});
 }
 throw new ApiError(404,'No encontramos esa acción.');
}
export function validateTraveler(input,ApiError){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new ApiError(400,'Completá tus datos.');
 const out={};const required=['firstNames','lastNames','birthDate','nationality','residenceCountry','email','phone'];
 const fields={firstNames:100,lastNames:100,birthDate:10,sex:1,nationality:80,residenceCountry:80,email:180,phone:35,idNumber:35,idIssuer:80,idExpiry:10,passportNumber:35,passportIssuer:80,passportExpiry:10};
 for(const [name,max] of Object.entries(fields)){const value=input[name]??(name==='nationality'?'Argentina':'');if(typeof value!=='string'||value.trim().length>max)throw new ApiError(400,'Revisá la longitud de los campos.');out[name]=value.trim();}
 if(!out.nationality)out.nationality='Argentina';
 out.idIssuer=out.idNumber?(out.idIssuer||'Argentina'):'';
 out.passportIssuer=out.passportNumber?(out.passportIssuer||'Argentina'):'';
 if(required.some(name=>!out[name]))throw new ApiError(400,'Completá los campos obligatorios.');
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(out.email))throw new ApiError(400,'Revisá el correo electrónico.');
 if(!/^\+?[0-9 ()-]{6,35}$/.test(out.phone))throw new ApiError(400,'Ingresá un teléfono con código de país.');
 if(!['','F','M','X'].includes(out.sex))throw new ApiError(400,'Revisá el sexo indicado en el documento.');
 for(const name of ['birthDate','idExpiry','passportExpiry'])if(out[name]&&(!/^\d{4}-\d{2}-\d{2}$/.test(out[name])||Number.isNaN(Date.parse(out[name]))||new Date(out[name]).toISOString().slice(0,10)!==out[name]))throw new ApiError(400,'Revisá las fechas.');
 if(out.birthDate>new Date().toISOString().slice(0,10)||out.birthDate<'1900-01-01')throw new ApiError(400,'Revisá la fecha de nacimiento.');
 if(!out.idNumber&&!out.passportNumber)throw new ApiError(400,'Completá al menos un documento: DNI o pasaporte.');
 if(out.idNumber&&!out.idIssuer)throw new ApiError(400,'Indicá el país emisor del DNI.');
 if((out.passportNumber||out.passportIssuer||out.passportExpiry)&&!(out.passportNumber&&out.passportIssuer&&out.passportExpiry))throw new ApiError(400,'Completá número y vencimiento del pasaporte, o dejá ambos vacíos.');
 return out;
}
