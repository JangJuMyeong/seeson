import test from 'node:test';
import assert from 'node:assert/strict';
import {startServer} from '../scripts/serve.mjs';
async function fixture(t){const server=await startServer({port:0});t.after(()=>new Promise(resolve=>server.close(resolve)));return `http://127.0.0.1:${server.address().port}`;}
test('local server delivers language entrypoints, ES modules and the official logo',async t=>{
 const base=await fixture(t);
 for(const language of ['ko','zh','en']){const r=await fetch(`${base}/?lang=${language}`);assert.equal(r.status,200);assert.match(r.headers.get('content-type'),/text\/html/);assert.match(await r.text(),/id="language"/);}
 const module=await fetch(base+'/care-model.js');assert.match(module.headers.get('content-type'),/javascript/);assert.match(await module.text(),/applyEvent/);
 const logo=await fetch(base+'/assets/cg-invites-white.png');assert.equal(logo.status,200);assert.equal(logo.headers.get('content-type'),'image/png');assert.ok((await logo.arrayBuffer()).byteLength>100);
 const head=await fetch(base+'/app.js',{method:'HEAD'});assert.equal(head.status,200);assert.equal(await head.text(),'');
});
test('local server rejects unsupported writes and paths outside dist',async t=>{
 const base=await fixture(t);
 assert.equal((await fetch(base+'/',{method:'POST',body:'demo'})).status,405);
 assert.equal((await fetch(base+'/%2e%2e%2fpackage.json')).status,403);
 assert.equal((await fetch(base+'/.git/config')).status,404);
 assert.equal((await fetch(base+'/missing.js')).status,404);
 assert.equal((await fetch(base+'/%zz')).status,400);
});
