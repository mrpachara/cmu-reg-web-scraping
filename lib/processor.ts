import {
  DOMParser,
  HTMLDocument,
} from 'https://deno.land/x/deno_dom@v0.1.35-alpha/deno-dom-wasm.ts';
import { CourseSection, CoursesExtractor, SectionExtractor } from './types.ts';

type DocData = {
  group: string;
  doc: HTMLDocument;
};

const cmuRegUrl =
  'https://www1.reg.cmu.ac.th/registrationoffice/searchcourse.php';
const domParser = new DOMParser();

export async function process(
  semester: string,
  groups: string[],
  extractCourses: CoursesExtractor,
  extractSection: SectionExtractor,
  output: (courseSections: CourseSection[]) => void,
) {
  const url = new URL(cmuRegUrl);
  url.searchParams.set('tterm', semester);

  const courseSections: CourseSection[] = [];

  const docs = await Promise.all(
    groups.map(async (group) => {
      const formData = new FormData();
      formData.set('fgroup', group);

      console.log('🔃 %s is loading...', group);
      const res = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const error = new Error(res.statusText);
        error.cause = res;

        console.error(
          '%c⚠ %s is fail loaded%c: %s.',
          'color: red;',
          group,
          'color: initial;',
          error.message,
        );
        return error;
      }

      const docHTML = await res.text();
      const doc = domParser.parseFromString(docHTML, 'text/html');

      if (doc === null) {
        const error = new Error('HTML Parses error');

        console.error(
          '%c⚠ %s is fail parsed%c: %s.',
          'color: red;',
          group,
          'color: initial;',
          error.message,
        );
        return error;
      }

      console.log('🏁 %s has been loaded.', group);
      return {
        group: group,
        doc: doc,
      } as DocData;
    }),
  );

  docs
    .filter((doc): doc is DocData => !(doc instanceof Error))
    .forEach(({ group, doc }) => {
      const courseNodes = extractCourses(doc);

      if (courseNodes === null) {
        console.warn('%c⚠ No result for %s.', 'color: yellow;', group);

        return;
      }

      console.log('ℹ %s returns %i cource(s).', group, courseNodes.length);
      courseNodes.forEach(({ code, name, sectionElements }) => {
        sectionElements.forEach((sectionElement) => {
          courseSections.push(extractSection(code, name, sectionElement));
        });
      });
    });

  output(courseSections);
}
