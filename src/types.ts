import {
  Element,
  HTMLDocument,
} from 'https://deno.land/x/deno_dom@v0.1.35-alpha/deno-dom-wasm.ts';

export type Nullable<T, KS extends keyof T> = {
  [K in keyof T]: KS extends K ? T[K] | null : T[K];
};

export type CourseElementData = {
  code: string;
  name: string;
  sectionElements: Element[];
};

export type CourseSection = {
  status: string;
  condition: string;
  remark: string;
  code: string;
  name: string;
  secLec: string;
  secLab: string;
  creditLec: number;
  creditLab: number;
  scheduleLecDay: string;
  scheduleLecTime: string;
  scheduleLabDay: string;
  scheduleLabTime: string;
  roomLec: string;
  roomLab: string;
  lecturer: string;
  examDate: string;
  examTime: string;
  seat: number;
  enroll: number;
  waitingAdd: number | null;
  waitingIn: number | null;
  waitingOut: number | null;
  waitingDrop: number | null;
};

export type CoursesExtractor = (
  doc: HTMLDocument,
) => CourseElementData[] | null;

export type SectionExtractor = (
  code: string,
  name: string,
  sectionElem: Element,
) => CourseSection;
