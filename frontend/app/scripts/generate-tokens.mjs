import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { format, resolveConfig } from 'prettier';

const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const input = path.join(app, '../docs/frontend/design-tokens.json');
const output = path.join(app, 'src/styles/tokens.css');
const tokens = JSON.parse(fs.readFileSync(input, 'utf8'));
const kebab = (name) => name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
const declarations = [];
const declare = (name, value) => declarations.push(`  --${name}: ${value};`);

for (const [name, primitive] of Object.entries(tokens.semantic)) {
  const color = tokens.primitive[primitive];
  if (!/^#[\da-f]{6}$/i.test(color)) throw Error(`Unknown semantic color: ${name}`);
  declare(kebab(name), color.toLowerCase());
}
for (const value of tokens.spacing) declare(`space-${value}`, `${value}px`);
for (const [name, value] of Object.entries(tokens.radius))
  declare(`radius-${kebab(name)}`, `${value}px`);
declare('font-family', tokens.typography.family);
declare('font-root-size', `${tokens.typography.body.size}px`);
for (const [name, values] of Object.entries(tokens.typography)) {
  if (name === 'family') continue;
  declare(`font-${kebab(name)}-size`, `${values.size / tokens.typography.body.size}rem`);
  declare(`font-${kebab(name)}-line-height`, values.lineHeight);
  declare(`font-${kebab(name)}-weight`, values.weight);
}
for (const [name, values] of Object.entries(tokens.components)) {
  for (const [property, value] of Object.entries(values)) {
    const key = `${kebab(name)}-${kebab(property)}`;
    if (typeof value === 'number') declare(key, `${value}px`);
    else if (value in tokens.semantic) declare(key, `var(--${kebab(value)})`);
    else if (typeof value === 'boolean') continue;
    else throw Error(`Unsupported component token: ${key}`);
  }
}
for (const [name, value] of Object.entries(tokens.layout)) {
  if (typeof value === 'number') declare(`layout-${kebab(name)}`, `${value}px`);
}
for (const [name, value] of Object.entries(tokens.targets))
  declare(`target-${kebab(name)}`, `${value}px`);
declare('focus-width', `${tokens.focus.width}px`);
declare('focus-offset', `${tokens.focus.offset}px`);
declare('focus-isolation', `var(--${kebab(tokens.focus.isolationSurface)})`);
for (const [name, value] of Object.entries(tokens.elevation))
  declare(`elevation-${kebab(name)}`, value);
for (const [name, value] of Object.entries(tokens.layers)) declare(`layer-${kebab(name)}`, value);
for (const name of ['statusMs', 'overlayMs', 'reducedMotionMs']) {
  declare(`motion-${kebab(name)}`, `${tokens.motion[name]}ms`);
}

// Existing class consumers keep these aliases while appearance moves to its owner.
const aliases = {
  raised: 'surface-raised',
  subtle: 'surface-subtle',
  muted: 'text-muted',
  'success-bg': 'success-surface',
  'info-bg': 'info-surface',
  'warning-bg': 'warning-surface',
  'danger-bg': 'danger-surface',
  'content-max': 'layout-content-max',
  'page-gutter': 'layout-teacher-gutter',
  'form-max': 'layout-login-form-max',
  'reading-max': 'layout-reading-max',
};
for (const [alias, owner] of Object.entries(aliases)) declare(alias, `var(--${owner})`);

// CSS variables cannot be used in media queries; derive thresholds from JSON.
const [compact, tablet] = tokens.layout.breakpoints;
if (!(compact > 0 && tablet > compact)) throw Error('Invalid responsive breakpoints');
const source = [
  '/* Generated from docs/frontend/design-tokens.json. Run npm run generate:tokens. */',
  ':root {',
  ...declarations,
  '}',
  `@media (max-width: ${tablet - 1}px) {`,
  '  :root {',
  '    --page-gutter: var(--layout-tablet-gutter);',
  '  }',
  '}',
  `@media (max-width: ${compact - 1}px) {`,
  '  :root {',
  '    --page-gutter: var(--layout-compact-gutter);',
  '  }',
  '}',
  '',
].join('\n');
const css = await format(source, { ...(await resolveConfig(output)), parser: 'css' });

const args = process.argv.slice(2);
if (args.some((arg) => arg !== '--check')) throw Error('Only --check is supported');
if (args.includes('--check')) {
  if (!fs.existsSync(output) || fs.readFileSync(output, 'utf8') !== css) {
    throw Error('Generated tokens are stale. Run npm run generate:tokens.');
  }
  console.log('Design tokens match the generated CSS.');
} else {
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, css);
  console.log('Generated src/styles/tokens.css from the design authority.');
}
