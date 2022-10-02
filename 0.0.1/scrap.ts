import { parse } from 'https://deno.land/std@0.158.0/flags/mod.ts';
import { writeCSVObjects } from 'https://deno.land/x/csv@v0.7.5/mod.ts';
import { process } from '../lib/processor.ts';
import { CourseSection } from '../lib/types.ts';
import { extractCourses, extractSection } from './extractor.ts';

export const VERSION = '0.0.1';

function printHelp(progName: string, errorMessage?: string) {
  if (errorMessage) {
    console.error(errorMessage);
  }

  console.log('Usage:');
  console.log(
    '\tdeno run --allow-write --allow-net %s -o %coutput-file.csv%c -s %csemester%c %cgroup%c [... %cother_groups%c]',
    progName,
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
    '\tdeno run --allow-write --allow-net %s -o output-01.csv -s 2/2565 954 955',
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
const groups = args._.map((value) => value.toString());

if (args['h'] || args['help']) {
  printHelp(progName);
  Deno.exit(0);
} else if (
  typeof semester === 'undefined' ||
  semester === '' ||
  typeof outputFile === 'undefined' ||
  outputFile === '' ||
  groups.length === 0
) {
  printHelp(progName, 'Invalid arguments!!!');
  Deno.exit(-1);
}

const fp = await Deno.open(outputFile, {
  create: true,
  write: true,
});

//fp.write(Uint8Array.from("\ufeff"));
fp.write(Uint8Array.from([0xef, 0xbb, 0xbf]));

await process(
  semester,
  groups,
  extractCourses,
  extractSection,
  async (courseSections: CourseSection[]) => {
    if (courseSections.length > 0) {
      const tmpObj = courseSections[0];

      await writeCSVObjects(fp, courseSections, {
        header: Object.keys(tmpObj),
      });
    }
  },
);

fp.close();
