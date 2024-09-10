import { Dirent } from "node:fs";
import {
  copyFile,
  mkdir,
  readFile,
  readdir,
  writeFile,
} from "node:fs/promises";
import { createInterface } from "node:readline/promises";
import slugify from "slugify";
import { getAngularJson } from "./helper-types";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const multiline = (text: string) =>
  text
    .trim()
    .split("\n")
    .map((l) => l.trim())
    .join("\n");

const confirm = async (question: string) => {
  const answer = await rl.question(question.trim() + " (y/N): " + "\n");
  return answer.toLowerCase() === "y";
};

const sortByDepth = (a: Dirent, b: Dirent) => {
  return a.parentPath.split("/").length - b.parentPath.split("/").length;
};

const replaceStringInFile = async (
  path: string,
  search: string,
  replace: string
) => {
  console.log(`Modifying ${path}`);
  const content = await readFile(path, "utf8");
  const newContent = content.replace(search, replace);
  await writeFile(path, newContent);
};

const copyTemplatePlugin = async (pluginName: string) => {
  console.log("Copying template plugin to new plugin directory");

  const source = "plugins/template";
  const target = `plugins/${pluginName}`;

  const entries = await readdir(source, {
    withFileTypes: true,
    recursive: true,
  });
  const directories = entries.filter((e) => e.isDirectory()).sort(sortByDepth);
  const files = entries.filter((e) => e.isFile());
  for (const entry of directories) {
    const targetPath =
      entry.parentPath.replace(source, target) + "/" + entry.name;
    console.log(`Creating directory: ${targetPath}`);
    await mkdir(targetPath, { recursive: true });
  }
  for (const entry of files) {
    const sourcePath = entry.parentPath + "/" + entry.name;
    const targetPath =
      entry.parentPath.replace(source, target) +
      "/" +
      entry.name.replace("template", pluginName);
    console.log(`Copying file: ${sourcePath} -> ${targetPath}`);
    await copyFile(sourcePath, targetPath);
  }
};

const modifyConfigFiles = async (pluginName: string) => {
  console.log("Modifying config files for new plugin");

  const indexPath = `plugins/${pluginName}/src/index.ts`;
  const packageJsonPath = `plugins/${pluginName}/package.json`;
  const ngPackageJsonPath = `plugins/${pluginName}/ng-package.json`;

  await replaceStringInFile(
    indexPath,
    "template.plugin",
    `${pluginName}.plugin`
  );
  await replaceStringInFile(
    packageJsonPath,
    "@kompakkt/plugin-template",
    `@kompakkt/plugin-${pluginName}`
  );
  await replaceStringInFile(
    ngPackageJsonPath,
    "kompakkt/plugin-template",
    `kompakkt/plugin-${pluginName}`
  );
};

const updateAngularConfig = async (pluginName: string) => {
  console.log("Updating angular.json");
  const angularConfig = await getAngularJson();
  const stringified = JSON.stringify(
    angularConfig.projects["@kompakkt/plugin-template"],
    null,
    2
  );
  const updated = stringified.replaceAll("template", pluginName);
  const packageName = `@kompakkt/plugin-${pluginName}`;
  angularConfig.projects[packageName] = JSON.parse(updated);
  await writeFile("angular.json", JSON.stringify(angularConfig, null, 2));
};

const main = async () => {
  // Extract the plugin name from the command line arguments
  const pluginName = await (async () => {
    let name = process.argv.at(-1);
    if (!name || name?.endsWith("create-new-plugin.ts")) {
      console.error("Please specify a plugin name.");
      process.exit(1);
    }

    if (name.startsWith("@kompakkt/")) {
      name = name.replace("@kompakkt/", "");
    }

    const slugged = slugify(name, {
      lower: true,
      replacement: "-",
      trim: true,
      strict: true,
    });

    if (name !== slugged) {
      // Ask for confirmation
      if (
        !(await confirm(
          `Plugin name "${name}" will be changed to "${slugged}". Continue?`
        ))
      ) {
        console.log("Aborted");
        process.exit(0);
      }
    }

    return slugged;
  })();

  const packageName = `@kompakkt/plugin-${pluginName}`;
  const sourceDirectory = `./plugins/${pluginName}`;
  const outputDirectory = `./dist/kompakkt/${pluginName}`;

  console.log(
    multiline(`
    Plugin details:
    Name: ${pluginName}
    Package Name: ${packageName}
    Source directory: ${sourceDirectory}
    Output directory: ${outputDirectory}`)
  );

  if (!(await confirm(`Continue?`))) {
    console.log("Aborted");
    process.exit(0);
  }

  await copyTemplatePlugin(pluginName);
  await modifyConfigFiles(pluginName);
  await updateAngularConfig(pluginName);

  console.log(
    `Success. You can now run "ng build ${packageName}" to build the plugin.`
  );
  process.exit(0);
};

main();
