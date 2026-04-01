import { join } from 'node:path';
import { getAngularJson } from './helper-types';

const main = async () => {
  const angularJson = await getAngularJson();

  const exports: Record<string, string> = {};
  for (const [name, project] of Object.entries(angularJson.projects)) {
    exports[name.replace('@kompakkt/', './').replace('plugin-', '')] =
      './' + join(project.root, 'src/index.ts');
  }

  const packageJson = await Bun.file('package.json').json();
  packageJson.exports = exports;
  await Bun.write('package.json', JSON.stringify(packageJson, null, 2));

  console.log('Exports written to package.json:', exports);
};

main();
