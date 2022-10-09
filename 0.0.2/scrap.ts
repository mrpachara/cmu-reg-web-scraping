import { parse } from 'https://deno.land/std@0.158.0/flags/mod.ts';
// @deno-types="https://deno.land/x/sheetjs@v0.18.3/types/index.d.ts"
import {
  utils as xlsxUtils,
  write as xlsxWrite,
} from 'https://deno.land/x/sheetjs@v0.18.3/xlsx.mjs';
import { process } from './processor.ts';
import { CourseSection } from './types.ts';
import { extractCourses, extractSection } from './extractor.ts';

export const VERSION = '0.0.2';

function printHelp(progName: string, errorMessage?: string) {
  if (errorMessage) {
    console.error(errorMessage);
  }

  console.log('Usage:');
  console.log(
    '\tdeno run --allow-write --allow-net %s -o %coutput-file.ext%c -s %csemester%c [-t %ccsv%c|%cxlsx%c] %cgroup%c [... %cother_groups%c]',
    progName,
    'font-style: italic',
    'font-style: initial',
    'font-style: italic',
    'font-style: initial',
    'font-style: italic',
    'font-style: initial',
    'font-style: italic',
    'font-style: initial',
    'font-style: italic',
    'font-style: initial',
    'font-style: italic',
    'font-style: initial',
  );
  console.log();
  console.log('Example:');
  console.log(
    '\tdeno run --allow-write --allow-net %s -o output-01.xlsx -s 2/2565 -t xlsx 954 955',
    progName,
  );
}

const progName = (() => {
  const url = import.meta.url;
  if (url.startsWith('file:')) {
    return `./${VERSION}/scrap.ts`;
  } else {
    return url;
  }
})();
const args = parse(Deno.args);

const semester = ((value) => (value === undefined ? undefined : String(value)))(
  args['s'] ?? args['semester'],
);
const outputFile = ((value) =>
  value === undefined ? undefined : String(value))(args['o'] ?? args['output']);
const type = ((value) => (value === undefined ? 'csv' : String(value)))(
  args['t'] ?? args['type'],
);
const groups = args._.map((value) => value.toString());

if (args['h'] || args['help']) {
  printHelp(progName);
  Deno.exit(0);
} else if (
  typeof semester === 'undefined' ||
  semester === '' ||
  typeof outputFile === 'undefined' ||
  outputFile === '' ||
  (type !== 'csv' && type !== 'xlsx') ||
  groups.length === 0
) {
  printHelp(progName, 'Invalid arguments!!!');
  Deno.exit(-1);
}

const fp = await Deno.open(outputFile, {
  create: true,
  write: true,
  truncate: true,
});

await process(
  semester,
  groups,
  extractCourses,
  extractSection,
  async (courseSections: CourseSection[]) => {
    if (courseSections.length > 0) {
      const wb = xlsxUtils.book_new();
      xlsxUtils.book_append_sheet(wb, xlsxUtils.json_to_sheet(courseSections));
      const buff = xlsxWrite(wb, { type: 'array', bookType: type });
      await fp.write(buff);
    }
  },
);

fp.close();
