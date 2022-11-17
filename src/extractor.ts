import {
  Element,
  HTMLDocument,
} from 'https://deno.land/x/deno_dom@v0.1.35-alpha/deno-dom-wasm.ts';
import {
  CourseElementData,
  CourseSection,
  CoursesExtractor,
  Nullable,
  SectionExtractor,
} from './types.ts';
import { getFirstLine, normailizeText } from './utils.ts';

export const extractCourses: CoursesExtractor = (
  doc: HTMLDocument,
): CourseElementData[] | null => {
  const resultTables = doc.querySelectorAll(
    'table.table.table-bordered.table-striped',
  );

  if (resultTables.length < 2) {
    console.debug('result length: ', resultTables.length);
    return null;
  }

  const resultTable = resultTables[1] as Element;
  const courseDatas = resultTable.querySelectorAll(':scope>tbody');

  return [...courseDatas].reduce((results, node, i) => {
    if (i % 2 === 0) {
      const title = getFirstLine(node.textContent.trim()).trim();
      const [, code = 'Unknown', name = 'Unknown'] = (
        title.match(/^([^\-\s]*)\s*-\s*(.*)$/u) || []
      ).map((value) => value.trim());

      results.push({
        code: code,
        name: name,
        sectionElements: null,
      });
    } else {
      const data = results.pop()!;
      const elem = node as Element;
      const sectionNodes = elem.querySelectorAll(
        ':scope>tr:not(:first-child):not(:nth-child(2))',
      );
      data.sectionElements = [...sectionNodes] as Element[];
      results.push(data);
    }

    return results;
  }, [] as Nullable<CourseElementData, 'sectionElements'>[]) as CourseElementData[];
};

export const extractSection: SectionExtractor = (
  code: string,
  name: string,
  sectionElem: Element,
): CourseSection => {
  const columnNodes = sectionElem.querySelectorAll(':scope>td');

  const status = normailizeText(columnNodes[0].textContent)
    .filter((value) => value !== '')
    .join(', ');
  const condition = normailizeText(columnNodes[1].textContent)
    .filter((value) => value !== '')
    .join(', ');
  const remark =
    normailizeText(columnNodes[2].textContent.replace(name, ''))[0] || '';
  const secLec = normailizeText(columnNodes[3].textContent)[0];
  const secLab = normailizeText(columnNodes[4].textContent)[0];
  const creditLec = parseInt(normailizeText(columnNodes[5].textContent)[0]);
  const creditLab = parseInt(normailizeText(columnNodes[6].textContent)[0]);
  const [scheduleLecDay, scheduleLabDay = ''] = normailizeText(
    columnNodes[7].textContent,
  );
  const [scheduleLecTime, scheduleLabTime = ''] = normailizeText(
    columnNodes[8].textContent,
  );
  const [roomLec, roomLab = ''] = normailizeText(columnNodes[9].textContent);
  const lecturer = normailizeText(columnNodes[10].textContent)
    .filter((value) => value !== '')
    .join(', ');
  const examDate = normailizeText(columnNodes[11].textContent)[0];
  const examTime = normailizeText(columnNodes[12].textContent)[0];
  const seat = parseInt(normailizeText(columnNodes[13].textContent)[0]);
  const enroll = parseInt(normailizeText(columnNodes[14].textContent)[0]);

  const [waitingAdd, waitingIn, waitingOut, waitingDrop] = [15, 16, 17, 18]
    .map((i) => parseInt(normailizeText(columnNodes[i].textContent)[0]))
    .map((num) => (isNaN(num) ? null : num));

  return {
    status,
    condition,
    remark,
    code,
    name,
    secLec,
    secLab,
    creditLec,
    creditLab,
    scheduleLecDay,
    scheduleLecTime,
    scheduleLabDay,
    scheduleLabTime,
    roomLec,
    roomLab,
    lecturer,
    examDate,
    examTime,
    seat,
    enroll,
    waitingAdd,
    waitingIn,
    waitingOut,
    waitingDrop,
  };
};
