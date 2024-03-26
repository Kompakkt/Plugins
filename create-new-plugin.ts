import { exec } from 'node:child_process';

// Extract the plugin name from the command line arguments
const pluginName = process.argv.at(-1);

if (!pluginName) {
  console.error('Please specify a plugin name.');
  process.exit(1);
}

// Construct the command
const command = `nx g @nx/angular:lib --importPath '@kompakkt/${pluginName}-plugin' --directory plugins/${pluginName} ${pluginName}`;

// Execute the command
exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  console.log(stdout);
  if (stderr?.length) console.error(`ERROR: ${stderr}`);
});
