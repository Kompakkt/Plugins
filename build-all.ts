import { getAngularJson } from './helper-types';
import { $ } from 'bun';
import { readdir, rename, mkdir, exists } from 'node:fs/promises';
import { join } from 'node:path';

const hardRequirements = ['@kompakkt/extender'];

const getProjectNames = async () => {
  const angularJson = await getAngularJson();
  return Object.keys(angularJson.projects).filter(p => !hardRequirements.includes(p));
};

const buildProject = async (projectName: string, hardRequirementWasRebuilt: boolean) => {
  const angularJson = await getAngularJson();
  const projectRoot = angularJson.projects[projectName].root;
  const lastModifiedSource = await (async () => {
    const entries = await readdir(projectRoot, { recursive: true, withFileTypes: true });
    const fileEntries = entries.filter(e => e.isFile());
    return Math.max(...entries.map(f => Bun.file(join(f.parentPath, f.name)).lastModified));
  })();
  const lastModifiedBuild = await (async () => {
    const buildPath = join('dist', 'kompakkt', projectName.replace('@kompakkt', ''));
    if (!(await exists(buildPath))) return 0;
    const entries = await readdir(buildPath, {
      recursive: true,
      withFileTypes: true,
    });
    const fileEntries = entries.filter(e => e.isFile());
    return Math.max(...entries.map(f => Bun.file(join(f.parentPath, f.name)).lastModified));
  })();

  const needsRebuild = hardRequirementWasRebuilt || lastModifiedSource > lastModifiedBuild;
  if (!needsRebuild) {
    console.log(`Skipping ${projectName} as it is up to date`);
    return false;
  }

  const start = performance.now();
  const { stderr, exitCode } = await $`bun run build ${projectName}`.quiet().nothrow();
  if (exitCode !== 0) {
    console.error(`Error building ${projectName}`);
    console.error(stderr.toString('utf8'));
    return false;
  }
  const end = performance.now();
  console.log(`Built ${projectName} in ${Math.ceil(end - start)}ms`);
  return true;
};

const buildAll = async () => {
  const projectNames = await getProjectNames();

  console.log('Building strong dependencies in sequence');
  let hardRequirementWasRebuilt = false;
  for (const hardRequirement of hardRequirements) {
    const result = await buildProject(hardRequirement, hardRequirementWasRebuilt);
    if (result) hardRequirementWasRebuilt = true;
  }

  console.log('Building remaining projects in parallel');
  const results = await Promise.all(
    projectNames.map(projectName => buildProject(projectName, hardRequirementWasRebuilt)),
  );

  const anyRebuilt = results.some(result => result) || hardRequirementWasRebuilt;
  return anyRebuilt;
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
};

const main = async () => {
  const anyRebuilt = await buildAll();
  if (!anyRebuilt) {
    console.log('Nothing changed.');
    return;
  }
  await packAll();
};

main();
