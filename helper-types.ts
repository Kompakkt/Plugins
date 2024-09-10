import { readFile } from 'node:fs/promises';

export type AngularConfig = {
  $schema: string;
  version: number;
  newProjectRoot: string;
  projects: { [key: string]: Project };
};

export type Project = {
  projectType: string;
  root: string;
  sourceRoot: string;
  prefix: string;
  architect: {
    build: Build;
  };
};

export type Build = {
  builder: string;
  options: {
    project: string;
  };
  configurations: {
    production: {
      tsConfig: string;
    };
    development: {
      tsConfig: string;
    };
  };
  defaultConfiguration: string;
};

export const getAngularJson = (() => {
  let cached: AngularConfig | null = null;
  return async () => {
    if (cached === null) {
      const angularJson = await readFile("./angular.json", "utf8");
      cached = JSON.parse(angularJson) as AngularConfig;
    }
    return cached;
  };
})();
