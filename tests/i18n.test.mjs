import test from 'node:test';
import assert from 'node:assert/strict';
import {copy} from '../dist/i18n.js';
test('all three locales expose the same nonempty interface keys',()=>{
 const keys=Object.keys(copy.ko).sort();
 for(const language of ['ko','zh','en']){
  assert.deepEqual(Object.keys(copy[language]).sort(),keys,language);
  for(const key of keys)assert.ok(typeof copy[language][key]==='string'&&copy[language][key].trim(),`${language}.${key}`);
 }
});
test('the distinct brand names and core care stages stay available in every locale',()=>{
 assert.equal(copy.ko.brand,'시선');assert.equal(copy.zh.brand,'见线');assert.equal(copy.en.brand,'SEE;LINE');
 for(const locale of Object.values(copy))for(const key of ['w','m1','m3','w2','defer','no','guideSource','aboutLimit'])assert.ok(locale[key]);
});
