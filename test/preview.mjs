import http from 'node:http';
const target='http://localhost:8787';
http.createServer(async(req,res)=>{
 if(req.url==='/__qa-mobile'){
  res.setHeader('Content-Type','text/html; charset=utf-8');
  res.end('<!doctype html><html><head><title>Prueba móvil 390px</title></head><body style="margin:0;background:#ddd;display:flex;justify-content:center"><iframe title="Tablero en móvil" src="/" style="width:390px;height:844px;border:0;background:white"></iframe></body></html>');return;
 }
 try{
 const headers={...req.headers};delete headers.host;
 if(headers.origin)headers.origin=target;
 const chunks=[];for await(const chunk of req)chunks.push(chunk);
 const upstream=await fetch(target+req.url,{method:req.method,headers,body:['GET','HEAD'].includes(req.method)?undefined:Buffer.concat(chunks)});
 const out=new Headers(upstream.headers);out.delete('content-encoding');out.delete('content-length');
 if(out.has('content-security-policy'))out.set('content-security-policy',out.get('content-security-policy').replace("frame-ancestors 'none'","frame-ancestors 'self'"));
 res.writeHead(upstream.status,Object.fromEntries(out));res.end(Buffer.from(await upstream.arrayBuffer()));
 }catch{res.writeHead(502);res.end('Preview unavailable');}
}).listen(8789,'127.0.0.1',()=>console.log('QA móvil: http://localhost:8789/__qa-mobile'));
