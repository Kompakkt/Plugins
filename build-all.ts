import { exec } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { getAngularJson, type AngularConfig } from './helper-types';

const hardRequirements = ['@kompakkt/extender', '@kompakkt/plugin-i18n'];

const execPromise = promisify(exec);

const getProjectNames = async () => {
  const angularJson = await getAngularJson();
  return Object.keys(angularJson.projects).filter(p => !hardRequirements.includes(p));
};

const buildProject = async (projectName: string) => {
  console.log(`Building ${projectName}`);
  return await execPromise(['ng', 'build', projectName].join(' '));
};

const buildAll = async () => {
  for (const hardRequirement of hardRequirements) {
    await buildProject(hardRequirement);
  }

  const projectNames = await getProjectNames();
  for (const projectName of projectNames) {
    await buildProject(projectName);
  }
};

buildAll();
