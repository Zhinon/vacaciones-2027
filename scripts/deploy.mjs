import {readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
const config=JSON.parse(await readFile(new URL('../wrangler.jsonc',import.meta.url),'utf8'));
const args=process.argv.slice(2);
if(!args.includes('--dry-run')&&config.d1_databases.some(db=>db.database_id==='00000000-0000-0000-0000-000000000000')){
  console.error('Falta conectar D1 de producción. Creá la base con wrangler d1 create vacaciones-2027 y copiá su database_id en wrangler.jsonc. Consultá README.md.');
  process.exit(1);
}
const result=spawnSync(process.execPath,[new URL('../node_modules/wrangler/bin/wrangler.js',import.meta.url).pathname,'deploy',...args],{stdio:'inherit'});
process.exit(result.status??1);
