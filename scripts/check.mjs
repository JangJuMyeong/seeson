import {readdir,readFile,access} from 'node:fs/promises';
import {resolve,dirname,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const root=fileURLToPath(new URL('../',import.meta.url));
async function walk(dir){const out=[];for(const e of await readdir(resolve(root,dir),{withFileTypes:true})){if(e.name==='vendor'||e.name==='media')continue;const p=dir+'/'+e.name;if(e.isDirectory())out.push(...await walk(p));else out.push(p);}return out;}
const sources=[...await walk('dist'),...await walk('scripts'),...await walk('tests')].filter(p=>['.js','.mjs'].includes(extname(p)));
for(const path of sources){const r=spawnSync(process.execPath,['--check',resolve(root,path)],{encoding:'utf8'});if(r.status!==0)throw new Error(`${path}\n${r.stderr}`);}
JSON.parse(await readFile(resolve(root,'package.json'),'utf8'));
try{JSON.parse(await readFile(resolve(root,'.openai/hosting.json'),'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;}
const docs=['README.md','AGENTS.md','CLAUDE.md','GEMINI.md',...await walk('docs'),...await walk('skills')].filter(p=>p.endsWith('.md'));
let links=0;
for(const p of docs){const text=await readFile(resolve(root,p),'utf8');for(const match of text.matchAll(/!?\[[^\]]*\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)){const href=match[1];if(/^[a-z]+:|^#/i.test(href))continue;const target=decodeURIComponent(href.split('#')[0]);await access(resolve(root,dirname(p),target));links++;}}
const html=await readFile(resolve(root,'dist/index.html'),'utf8');for(const m of html.matchAll(/(?:src|href)="(\.\/[^"?]+)"/g))await access(resolve(root,'dist',m[1]));
console.log(`PASS: ${sources.length} JS modules; JSON manifests; ${links} local documentation links; entry assets.`);
