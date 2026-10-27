import http from 'node:http';
import {readFile, stat, realpath} from 'node:fs/promises';
import {resolve, relative, extname, isAbsolute} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
const defaultRoot=fileURLToPath(new URL('../dist/',import.meta.url));
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon','.txt':'text/plain; charset=utf-8'};
const within=(base,target)=>{const rel=relative(base,target);return rel===''||(!rel.startsWith('..')&&!isAbsolute(rel));};
export async function startServer({port=4173,host='127.0.0.1',root=defaultRoot}={}){
 const base=await realpath(root);
 const server=http.createServer(async(req,res)=>{
  const reply=(status,text)=>{res.writeHead(status,{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:text);};
  if(!['GET','HEAD'].includes(req.method)){res.setHeader('Allow','GET, HEAD');reply(405,'Method not allowed');return;}
  try{
   const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
   if(pathname.includes('\0')||pathname.includes('\\')){reply(400,'Invalid path');return;}
   let target=resolve(base,'.'+pathname);
   if(!within(base,target)){reply(403,'Forbidden');return;}
   const info=await stat(target);
   if(info.isDirectory())target=resolve(target,'index.html');
   target=await realpath(target);
   if(!within(base,target)){reply(403,'Forbidden');return;}
   const bytes=await readFile(target);
   res.writeHead(200,{'Content-Type':types[extname(target)]||'application/octet-stream','Content-Length':bytes.length,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
   res.end(req.method==='HEAD'?undefined:bytes);
  }catch(error){reply(error instanceof URIError?400:['ENOENT','ENOTDIR','EISDIR'].includes(error.code)?404:500,error instanceof URIError?'Invalid URL':'Not available');}
 });
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,host,resolve);});
 return server;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const args=process.argv.slice(2);let port=4173;
 if(args.length&&!(args.length===2&&args[0]==='--port'&&/^\d+$/.test(args[1]))){console.error('Usage: node scripts/serve.mjs [--port 4173]');process.exit(1);}
 if(args.length)port=Number(args[1]);
 if(port<1||port>65535){console.error('Port must be between 1 and 65535.');process.exit(1);}
 try{const server=await startServer({port});console.log(`SEE;LINE demo: http://127.0.0.1:${port}/?lang=ko\nChinese: http://127.0.0.1:${port}/?lang=zh\nEnglish: http://127.0.0.1:${port}/?lang=en\nPress Ctrl+C to stop.`);process.once('SIGINT',()=>server.close());process.once('SIGTERM',()=>server.close());}
 catch(error){console.error(error.code==='EADDRINUSE'?`Port ${port} is in use. Try: npm run dev -- --port ${port+1}`:error.message);process.exitCode=1;}
}
