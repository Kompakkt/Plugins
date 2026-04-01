type PackageJSON = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};

const main = async () => {
  const glob = new Bun.Glob('**/package.json');
  const files = await Array.fromAsync(glob.scan({ cwd: process.cwd() }));

  console.log(files);

  const mainPackageContent = await Bun.file('package.json')
    .json()
    .then((data: PackageJSON) => data);

  const getDependencyVersion = (depName: string): string | undefined => {
    return (
      mainPackageContent.dependencies?.[depName] ||
      mainPackageContent.devDependencies?.[depName] ||
      mainPackageContent.peerDependencies?.[depName]
    );
  };

  for (const file of files) {
    if (file === 'package.json') continue;
    const content = await Bun.file(file)
      .json()
      .then((data: PackageJSON) => data);

    for (const dep of Object.keys(content.peerDependencies || {})) {
      const mainVersion = getDependencyVersion(dep);
      if (mainVersion && content.peerDependencies) {
        content.peerDependencies[dep] = mainVersion;
        console.log(`Updated ${dep} in ${file} to version ${mainVersion}`);
      }
    }

    for (const dep of Object.keys(content.dependencies || {})) {
      const mainVersion = getDependencyVersion(dep);
      if (mainVersion && content.dependencies) {
        content.dependencies[dep] = mainVersion;
        console.log(`Updated ${dep} in ${file} to version ${mainVersion}`);
      }
    }

    await Bun.write(file, JSON.stringify(content, null, 2));
  }
};

main();
