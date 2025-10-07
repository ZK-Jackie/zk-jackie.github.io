import { Command, Option } from 'commander';

const program = new Command();

program
  .name('Stack Explorer - CLI')
  .description('A CLI tool for Stack Explorer')
  .version('1.0.0');

program
  .addOption(
    new Option(`--mode <mode>`, 'Running modes')
      .choices(['development', 'github', 'cloudflare', 'production'])
      .default('development')
  );

program
  .command('build')
  .description('Build the project')
  .addOption(
    new Option(`--outDir <directory>`, 'Specify the output directory for the build.')
      .default('dist')
  )
  .action(() => {
    console.log('Building the project...');
  });

program
  .command('dev')
  .description('Run in development mode')
  .action(() => {
    console.log('Running in development mode...');
  });

program
  .command('preview')
  .description('Preview the production build')
  .action(() => {
    console.log('Previewing the production build...');
  });

program
  .command('check')
  .description('Check the project for issues')
  .action(() => {
    console.log('Checking the project for issues...');
  });

program
  .command('sync')
  .description('Sync the assets')
  .action(() => {
    console.log('Syncing the assets...');
  });

program.parse(process.argv);

export const { mode: runtimeMode } = program.opts();