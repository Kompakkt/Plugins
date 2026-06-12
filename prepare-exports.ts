import { exists } from 'node:fs/promises';
import { join } from 'node:path';
import { $ } from 'bun';
import { getAngularJson } from './helper-types';

const buildProject = async (projectName: string): Promise<boolean> => {
  console.log(`Building ${projectName} with ng-packagr...`);
  const start = performance.now();
  const result = await $`bun run build ${projectName}`.quiet().nothrow();
  if (result.exitCode !== 0) {
    console.error(`Failed to build ${projectName}:`);
    console.error(result.stderr.toString('utf8'));
    return false;
  }
  const end = performance.now();
  console.log(`Built ${projectName} in ${Math.ceil(end - start)}ms`);
  return true;
};

const main = async () => {
  const angularJson = await getAngularJson();
  const exports: Record<string, string> = {};

  // Build the extender first (other plugins import from it)
  const extenderName = '@kompakkt/extender';
  const extenderDist = join('dist', 'kompakkt', 'extender');
  if (!(await exists(extenderDist))) {
    const ok = await buildProject(extenderName);
    if (!ok) {
      console.error(`Cannot continue: ${extenderName} failed to build`);
      process.exit(1);
    }
  } else {
    console.log(`${extenderName} dist exists, skipping build (run "bun run build ${extenderName}" to force)`);
  }
  exports['./extender'] = './' + extenderDist;

  // Build remaining projects in parallel
  const remaining = Object.entries(angularJson.projects).filter(
    ([name]) => name !== extenderName,
  );

  const buildResults = await Promise.all(
    remaining.map(async ([name]) => {
      const distFolder = name.replace('@kompakkt/', '');
      const distPath = join('dist', 'kompakkt', distFolder);
      if (!(await exists(distPath))) {
        const ok = await buildProject(name);
        return { name, distPath, ok };
      }
      console.log(`${name} dist exists, skipping build`);
      return { name, distPath, ok: true };
    }),
  );

  for (const { name, distPath, ok } of buildResults) {
    if (!ok) continue;
    const exportName = name.replace('@kompakkt/', './').replace('plugin-', '');
    exports[exportName] = './' + distPath;
  }

  const packageJson = await Bun.file('package.json').json();
  packageJson.exports = exports;
  await Bun.write('package.json', JSON.stringify(packageJson, null, 2));

  console.log('\nExports written to package.json:');
  for (const [key, value] of Object.entries(exports)) {
    console.log(`  ${key} -> ${value}`);
  }
};

main();
