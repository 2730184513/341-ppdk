import fs from 'node:fs';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import standalone from 'ajv/dist/standalone/index.js';

const contract = JSON.parse(fs.readFileSync('../contracts/http/openapi.json', 'utf8'));
const ajv = new Ajv2020({
  strict: false,
  allErrors: true,
  code: { source: true, esm: true },
  inlineRefs: false,
});
addFormats(ajv);
ajv.addSchema({ $id: 'ppdk', ...contract });
const names = Object.keys(contract.components.schemas);
const refs = Object.fromEntries(names.map((name) => [name, `ppdk#/components/schemas/${name}`]));
for (const ref of Object.values(refs)) ajv.getSchema(ref);
const source = standalone(ajv, refs);
// AJV standalone emits runtime CommonJS helpers; explicit ESM imports let Vite bundle them.
const modules = new Map();
const body = source.replace(/require\("([^"]+)"\)/g, (_, name) => {
  if (!modules.has(name)) modules.set(name, `runtime${modules.size}`);
  return modules.get(name);
});
const imports = [...modules]
  .map(
    ([name, variable]) =>
      `import * as ${variable}Module from ${JSON.stringify(name + '.js')};\nconst ${variable} = ${variable}Module.default && typeof ${variable}Module.default === 'object' ? ${variable}Module.default : ${variable}Module;`,
  )
  .join('\n');
fs.writeFileSync(
  'src/api/validators.generated.js',
  '// Generated from frozen OpenAPI; do not edit.\n' + imports + '\n' + body + '\n',
);
fs.writeFileSync(
  'src/api/validators.generated.d.ts',
  'import type { ValidateFunction } from "ajv";\n' +
    names.map((name) => `export const ${name}: ValidateFunction;`).join('\n') +
    '\n',
);
console.log(`Generated ${names.length} standalone AJV validators.`);
