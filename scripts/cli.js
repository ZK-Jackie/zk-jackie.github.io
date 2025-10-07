import { Command, Option } from 'commander';

const program = new Command();

program
  .name('Stack Explorer - Functional Script CLI')
  .description('Utilities for processing project files')
  .version('1.0.0');

program
  .addOption(
    new Option('-T, --target <target>', 'Running purpose')
      .choices(['compression', 'cleanup'])
      .default('compression')
  );

program
  .addOption(
    new Option('-d, --dir <dir>', 'Directory to process')
      .default('dist')
  );

program
  .parse(process.argv);

export const { target, dir } = program.opts();