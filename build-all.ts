import { getAngularJson } from './helper-types';
import { $ } from 'bun';
import { readdir, rename, mkdir } from "node:fs/promises";
import { join } from 'node:path';

const hardRequirements = ['@kompakkt/extender', '@kompakkt/plugin-i18n'];

const getProjectNames = async () => {
  const angularJson = await getAngularJson();
  return Object.keys(angularJson.projects).filter(p => !hardRequirements.includes(p));
};

const buildProject = async (projectName: string) => {
  const start = performance.now();
  const { exitCode, stderr } = await $`bun run build ${projectName}`.quiet();
  const end = performance.now();
  if (exitCode !== 0) {
    console.error(`Error building ${projectName}`);
    console.error(stderr.toString('utf8'));
    return;
  }
  console.log(`Built ${projectName} in ${Math.ceil(end - start)}ms`);
};

const buildAll = async () => {
  console.log('Building strong dependencies in sequence');
  for (const hardRequirement of hardRequirements) {
    await buildProject(hardRequirement);
  }

  console.log('Building remaining projects in parallel');
  const projectNames = await getProjectNames();
  await Promise.all(projectNames.map(projectName => buildProject(projectName)));
};

const packAll = async () => {
  const outDir = 'dist/kompakkt/';
  const packageDir = 'packages';
  await mkdir(packageDir, { recursive: true });
  console.log('Creating packaged versions');
  const directories = await readdir(outDir);
  for (const dir of directories) {
    const packResult = await $`bun pm pack`.cwd(join(outDir, dir)).text();
    const packName = packResult.split(/\s+/).find(v => v.endsWith('.tgz'));
    if (!packName) {
      console.error(`Error packing ${dir}, could not find pack name`, packResult);
      continue;
    }
    console.log(`Packed ${dir} to ${packName}`);
    await rename(join(outDir, dir, packName), join('packages', packName));
  }
  console.log(`Packing complete. Packed ${directories.length} packages to ./${packageDir}`);
}

const main = async () => {
  await buildAll();
  await packAll();
}

main();
