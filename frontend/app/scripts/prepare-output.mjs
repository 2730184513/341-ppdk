import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
const app = fs.realpathSync(process.cwd());
const allowed = new Set([
  'dist',
  'dist-live',
  'storybook-static',
  'test-results',
  'playwright-report',
]);
for (const name of process.argv.slice(2)) {
  if (!allowed.has(name)) throw Error('Not an approved generated directory: ' + name);
  const target = path.resolve(app, name);
  if (!fs.existsSync(target)) continue;
  if (fs.lstatSync(target).isSymbolicLink() || !fs.realpathSync(target).startsWith(app + path.sep))
    throw Error('Generated directory resolves outside this app.');
  const trash = path.resolve(app, '../trash files');
  if (fs.existsSync(trash) && fs.lstatSync(trash).isSymbolicLink())
    throw Error('Trash destination is a link.');
  fs.mkdirSync(trash, { recursive: true });
  const workspace = fs.realpathSync(path.dirname(app));
  if (fs.realpathSync(trash) !== path.join(workspace, 'trash files'))
    throw Error('Trash destination resolves outside this workspace.');
  fs.renameSync(target, path.join(trash, name + '-' + randomUUID()));
}
