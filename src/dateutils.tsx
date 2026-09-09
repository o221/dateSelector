// @ts-nocheck
import * as React from "react";
import Today from "@mui/icons-material/Today";
import DateRange from "@mui/icons-material/DateRange";
import Payment from "@mui/icons-material/Payment";
import EventNote from "@mui/icons-material/EventNote";
import DynamicFeed from "@mui/icons-material/DynamicFeed";
import LineStyle from "@mui/icons-material/LineStyle";
import SwitchLeft from "@mui/icons-material/SwitchLeft";
import PlayArrow from "@mui/icons-material/PlayArrow";
import SkipPrevious from "@mui/icons-material/SkipPrevious";
import SkipNext from "@mui/icons-material/SkipNext";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardDoubleArrowLeft from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import KeyboardDoubleArrowRight from "@mui/icons-material/KeyboardDoubleArrowRight";
import SettingsEthernet from "@mui/icons-material/SettingsEthernet";
import MultipleStop from "@mui/icons-material/MultipleStop";
import {
  startOfDay,
  endOfDay,
  format,
  formatDistance,
  differenceInDays,
  eachDayOfInterval,
  eachYearOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  eachQuarterOfInterval,
  startOfToday,
  startOfWeek,
  startOfMonth,
  startOfQuarter,
  startOfYear,
  endOfToday,
  endOfWeek,
  endOfMonth,
  endOfQuarter,
  endOfYear,
  addMonths,
  addDays,
  subDays,
  subWeeks,
  addWeeks,
  subMonths,
  subQuarters,
  addQuarters,
  subYears,
  addYears,
  isAfter,
  lastDayOfMonth,
  isLastDayOfMonth,
  isFirstDayOfMonth,
  isWithinInterval,
  getDay,
  parseISO,
  clamp,
  isDate,
} from "date-fns";
import { step, dateRange, SliderProps } from "./interface";
import { DATEUTILS } from "./constants";
import { useDateFnsLocale, useLocalization } from "./localeutils";
//
const { periodThis, periodGranularity } = DATEUTILS;

// Arrow icons mapping
export const arrowIcons = {
  arrowLeft: <KeyboardArrowLeft fontSize="inherit" />,
  arrowDoubleLeft: <KeyboardDoubleArrowLeft fontSize="inherit" />,
  arrowRight: <KeyboardArrowRight fontSize="inherit" />,
  arrowDoubleRight: <KeyboardDoubleArrowRight fontSize="inherit" />,
};

type MoveParms = {
  isBack: boolean;
  placement: "left" | "right" | "bottom";
  iconLabel: string;
  reduceExpand: string;
  iconT: React.ReactElement;
  iconB: React.ReactElement;
  topRow1: string;
  detailRow1: string;
  topRow2: string;
  detailRow2: string;
};

// --- add helpers ---
function normDay(d: Date | null): Date | null {
  if (!d) return null;
  const x = new Date(d);
  // compare by UTC day to ignore local time shifts
  return new Date(
    Date.UTC(x.getUTCFullYear(), x.getUTCMonth(), x.getUTCDate()),
  );
}

export function equalRanges(
  a?: dateRange | null,
  b?: dateRange | null,
): boolean {
  if (!a && !b) return true;
  if (!a || !b) return false;
  const sa = normDay(a.start)?.getTime();
  const ea = normDay(a.end)?.getTime();
  const sb = normDay(b.start)?.getTime();
  const eb = normDay(b.end)?.getTime();
  return sa === sb && ea === eb;
}

/**
 * Type guard: check if an object is already a valid dateRange (both start & end are Date instances).
 */
export function isDateRange(obj: any): obj is dateRange {
  return obj && typeof obj === "object" && isDate(obj.start) && isDate(obj.end);
}

export const isRangeFullyContainedInScope = (
  range?: dateRange | null,
  scope?: dateRange | null,
): boolean => {
  if (
    !range ||
    !scope ||
    !range.start ||
    !range.end ||
    !scope.start ||
    !scope.end
  ) {
    return false;
  }

  const normalizedScope = {
    start: startOfDay(scope.start),
    end: endOfDay(scope.end),
  };

  return (
    isWithinInterval(range.start, normalizedScope) &&
    isWithinInterval(range.end, normalizedScope)
  );
};

/**
 * Convert a plain object with Date or ISO string fields into a proper dateRange.
 * Falls back to parsing if not already Date.
 */
export function toDateRange(input: {
  start: Date | string | number;
  end: Date | string | number;
}): dateRange {
  if (isDateRange(input)) {
    return input; // already good
  }
  const start = isDate(input.start)
    ? input.start
    : parseISO(String(input.start));
  const end = isDate(input.end) ? input.end : parseISO(String(input.end));
  return { start, end };
}

/**
 * A utility function to build parameters for the DateMove component.
 * This function no longer uses a hook directly and is now a pure function.
 * @param {string} bf - Back ("b") or Forward ("f").
 * @param {boolean} vert - Is the layout vertical?
 * @param {boolean} ctrl - Is the control (Shift) key pressed?
 * @param {string} stepValue - The current step value (e.g., "day", "week").
 * @param {object} localization - An object containing localization display names.
 * @returns {MoveParms} - The parameters for the move component.
 */
export const getMoveParms = (
  bf: string,
  vert: boolean,
  ctrl: boolean,
  stepValue: string,
  localization: any,
): MoveParms => {
  const isBack = bf === "b";

  const stepLabels = {
    day: localization.getDisplayName("Step_Day"),
    week: localization.getDisplayName("Step_Week"),
    pay: localization.getDisplayName("Step_Pay"),
    month: localization.getDisplayName("Step_Month"),
    quarter: localization.getDisplayName("Step_Quarter"),
    year: localization.getDisplayName("Step_Year"),
  };

  const periodLabel = stepLabels[stepValue];
  const moveLabel = isBack
    ? localization.getDisplayName("dateUtilsMoveBack")
    : localization.getDisplayName("dateUtilsMoveForward");
  const reduceExpand = ctrl
    ? localization.getDisplayName("dateUtilsMoveReduceBy")
    : localization.getDisplayName("dateUtilsMoveExtend");

  const iconT = isBack ? arrowIcons.arrowLeft : arrowIcons.arrowRight;
  const iconB = ctrl
    ? isBack
      ? arrowIcons.arrowDoubleRight
      : arrowIcons.arrowDoubleLeft
    : isBack
      ? arrowIcons.arrowDoubleLeft
      : arrowIcons.arrowDoubleRight;

  // --- Helpers to keep template clean ---
  const ctrlHint = (): string => {
    if (!ctrl) return isBack ? " (ctrl + <)" : " (ctrl + >)";
    return isBack ? " (shift + >)" : " (shift + <)";
  };

  const directionWord = (): string =>
    !ctrl
      ? moveLabel.toLowerCase()
      : isBack
        ? localization.getDisplayName("dateUtilsMoveForward")
        : localization.getDisplayName("dateUtilsMoveBack");

  // --- Tooltip content ---
  const topRow1 = `${moveLabel} a ${periodLabel}${isBack ? " (L)" : " (N)"}`;
  const detailRow1 = `${localization.getDisplayName(
    "dateUtilsMoveTheSelectedRange",
  )}${moveLabel.toLowerCase()}${localization.getDisplayName(
    "dateUtilsMoveByTheStepLevel",
  )}`;

  const topRow2 = `${reduceExpand} ${periodLabel} ${directionWord()}${ctrlHint()}`;
  const detailRow2 = `${reduceExpand}${localization.getDisplayName(
    "dateUtilsMoveTheSelectedRange",
  )}${moveLabel.toLowerCase()}${localization.getDisplayName(
    "dateUtilsMoveByTheStepLevel",
  )}`;

  return {
    isBack,
    placement: vert ? (isBack ? "left" : "right") : "bottom",
    iconLabel: moveLabel,
    iconT,
    iconB,
    reduceExpand,
    topRow1,
    detailRow1,
    topRow2,
    detailRow2,
  };
};

export const getIntervalFunction = (stepValue: string) => {
  switch (stepValue) {
    case "day":
      return addDays;
    case "week":
      return addWeeks;
    case "pay":
      return addWeeks;
    case "month":
      return addMonths;
    case "quarter":
      return addQuarters;
    case "year":
      return addYears;
    default:
      return null;
  }
};

// --- Date Range Functions ---
export const day = (
  i: number,
  startBaseDate: Date = startOfToday(),
  endBaseDate?: Date,
): dateRange => ({
  start: subDays(startBaseDate, i),
  end: subDays(endBaseDate ? endOfDay(endBaseDate) : endOfToday(), i),
});

export const week = (
  i: number,
  weekStartDay: 0 | 1 | 2 | 3 | 4 | 5 | 6,
  startBaseDate: Date = startOfToday(),
  full?: boolean,
): dateRange => {
  const j = full
    ? weekStartDay === getDay(addDays(startBaseDate, 1))
      ? i
      : i + 1
    : i;
  return {
    start: startOfWeek(subWeeks(startBaseDate, j), {
      weekStartsOn: weekStartDay,
    }),
    end: endOfWeek(subWeeks(startBaseDate, j), { weekStartsOn: weekStartDay }),
  };
};

export const month = (
  i: number,
  startBaseDate: Date = startOfToday(),
  endBaseDate?: Date,
): dateRange => ({
  start: startOfMonth(subMonths(startBaseDate, i)),
  end: endOfMonth(subMonths(endBaseDate ? endBaseDate : endOfToday(), i)),
});

export const quarter = (i: number): dateRange => ({
  start: startOfQuarter(subQuarters(startOfToday(), i)),
  end: endOfQuarter(subQuarters(endOfToday(), i)),
});

export const year = (i: number, yearStartMonth: number): dateRange => ({
  start: subMonths(
    subMonths(
      addMonths(startOfYear(startOfToday()), yearStartMonth),
      Number(format(startOfToday(), "L")) <= yearStartMonth ? 12 : 0,
    ),
    i * 12,
  ),
  end: subMonths(
    subMonths(
      addMonths(endOfYear(endOfToday()), yearStartMonth),
      Number(format(endOfToday(), "L")) <= yearStartMonth ? 12 : 0,
    ),
    i * 12,
  ),
});

// --- Initial Range Setup ---
export const getInitRange = (
  startRange: string,
  weekStartDay: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 0,
  yearStartMonth: number = 0,
  rangeScope: dateRange,
  rtn: string = "",
) => {
  const _rnge = {
    today: day(0),
    yesterday: day(1),
    tomorrow: day(-1),
    thisWeek: week(0, weekStartDay),
    lastWeek: week(1, weekStartDay),
    nextWeek: week(-1, weekStartDay),
    thisMonth: month(0),
    lastMonth: month(1),
    nextMonth: month(-1),
    thisQuarter: quarter(0),
    lastQuarter: quarter(1),
    thisYear: year(0, yearStartMonth),
    lastYear: year(1, yearStartMonth),
    nextYear: year(-1, yearStartMonth),
    ytdToday: { start: year(0, yearStartMonth).start, end: endOfToday() },
    ytdLastMonth: {
      start:
        year(0, yearStartMonth).start > month(1).end
          ? year(1, yearStartMonth).start
          : year(0, yearStartMonth).start,
      end: month(1).end,
    },
    ytdThisMonth: { start: year(0, yearStartMonth).start, end: month(0).end },
    ytdCalToday: { start: year(0, 0).start, end: endOfToday() },
    ytdCalLastMonth: { start: year(0, 0).start, end: month(1).end },
    ytdCalThisMonth: { start: year(0, 0).start, end: month(0).end },
    ytToday: {
      start: addDays(subMonths(startOfToday(), 12), 1),
      end: endOfToday(),
    },
    yearToLastMonth: {
      start: startOfMonth(subMonths(startOfToday(), 12)),
      end: endOfMonth(subMonths(endOfToday(), 1)),
    },
    yearToThisMonth: {
      start: startOfMonth(subMonths(startOfToday(), 11)),
      end: endOfMonth(subMonths(endOfToday(), 0)),
    },
    firstWeekOfScope: week(0, weekStartDay, rangeScope.start),
    lastWeekOfScope: week(0, weekStartDay, rangeScope.end, true),
    firstMonthOfScope: month(0, rangeScope.start, rangeScope.start),
    lastMonthOfScope: month(0, rangeScope.end, endOfDay(rangeScope.end)),
    monthFromScopeEnd: day(0, subMonths(rangeScope.end, 12), rangeScope.end),
    days30FromScopeEnd: day(0, subDays(rangeScope.end, 29), rangeScope.end),
  };
  return rtn !== ""
    ? _rnge
    : _rnge[startRange]
      ? _rnge[startRange]
      : rangeScope;
};

// --- Pay Period Calculation ---
function getPayPeriod(
  referenceDay: Date,
  periodOne: Date,
  periodLength: number,
) {
  const daysPeriodOneFromRef = differenceInDays(
    startOfDay(periodOne),
    startOfDay(referenceDay),
  );
  const periodNumber = Math.floor(daysPeriodOneFromRef / periodLength);
  const periodStart = addDays(referenceDay, periodNumber * periodLength);
  const periodEnd = addDays(periodStart, periodLength - 1);
  return { start: periodStart, end: periodEnd };
}

// --- Move Functions ---
const moveFns = {
  day: (_rnge: dateRange) => ({
    b: [subDays(_rnge.start, 1), subDays(_rnge.end, 1)],
    f: [addDays(_rnge.start, 1), addDays(_rnge.end, 1)],
    eb: [subDays(_rnge.start, 1), subDays(_rnge.end, 0)],
    ef: [subDays(_rnge.start, 0), addDays(_rnge.end, 1)],
    rb: [subDays(_rnge.start, 0), subDays(_rnge.end, 1)],
    rf: [addDays(_rnge.start, 1), subDays(_rnge.end, 0)],
  }),
  week: (_rnge: dateRange) => ({
    b: [subWeeks(_rnge.start, 1), subWeeks(_rnge.end, 1)],
    f: [addWeeks(_rnge.start, 1), addWeeks(_rnge.end, 1)],
    eb: [subWeeks(_rnge.start, 1), subDays(_rnge.end, 0)],
    ef: [subDays(_rnge.start, 0), addWeeks(_rnge.end, 1)],
    rb: [subDays(_rnge.start, 0), subWeeks(_rnge.end, 1)],
    rf: [addWeeks(_rnge.start, 1), subDays(_rnge.end, 0)],
  }),
  pay: (_rnge: dateRange) => {
    const len = differenceInDays(_rnge.end, _rnge.start) + 1;
    return {
      b: [subDays(_rnge.start, len), subDays(_rnge.end, len)],
      f: [addDays(_rnge.start, len), addDays(_rnge.end, len)],
      eb: [subDays(_rnge.start, len), subDays(_rnge.end, 0)],
      ef: [subDays(_rnge.start, 0), addDays(_rnge.end, len)],
      rb: [subDays(_rnge.start, 0), subDays(_rnge.end, len)],
      rf: [addDays(_rnge.start, len), subDays(_rnge.end, 0)],
    };
  },
  month: (_rnge: dateRange) => {
    const ld = isLastDayOfMonth(_rnge.end) && isFirstDayOfMonth(_rnge.start);
    const dd = differenceInDays(_rnge.end, _rnge.start);
    return {
      b: [
        subMonths(_rnge.start, 1),
        isLastDayOfMonth(_rnge.end)
          ? lastDayOfMonth(subMonths(_rnge.end, 1))
          : addDays(subMonths(_rnge.start, 1), dd),
      ],
      f: [
        addMonths(_rnge.start, 1),
        ld
          ? lastDayOfMonth(addMonths(_rnge.end, 1))
          : addDays(addMonths(_rnge.start, 1), dd),
      ],
      eb: [subMonths(_rnge.start, 1), subDays(_rnge.end, 0)],
      ef: [
        _rnge.start,
        ld ? lastDayOfMonth(addMonths(_rnge.end, 1)) : addMonths(_rnge.end, 1),
      ],
      rb: [
        _rnge.start,
        ld ? lastDayOfMonth(subMonths(_rnge.end, 1)) : subMonths(_rnge.end, 1),
      ],
      rf: [addMonths(_rnge.start, 1), subDays(_rnge.end, 0)],
    };
  },
  quarter: (_rnge: dateRange) => {
    const ld = isLastDayOfMonth(_rnge.end) && isFirstDayOfMonth(_rnge.start);
    return {
      b: [
        subQuarters(_rnge.start, 1),
        ld
          ? lastDayOfMonth(subQuarters(_rnge.end, 1))
          : subQuarters(_rnge.end, 1),
      ],
      f: [
        addQuarters(_rnge.start, 1),
        ld
          ? lastDayOfMonth(addQuarters(_rnge.end, 1))
          : addQuarters(_rnge.end, 1),
      ],
      eb: [subQuarters(_rnge.start, 1), subDays(_rnge.end, 0)],
      ef: [
        _rnge.start,
        ld
          ? lastDayOfMonth(addQuarters(_rnge.end, 1))
          : addQuarters(_rnge.end, 1),
      ],
      rb: [
        _rnge.start,
        ld
          ? lastDayOfMonth(subQuarters(_rnge.end, 1))
          : subQuarters(_rnge.end, 1),
      ],
      rf: [addQuarters(_rnge.start, 1), subDays(_rnge.end, 0)],
    };
  },
  year: (_rnge: dateRange) => ({
    b: [subYears(_rnge.start, 1), subYears(_rnge.end, 1)],
    f: [addYears(_rnge.start, 1), addYears(_rnge.end, 1)],
    eb: [subYears(_rnge.start, 1), subDays(_rnge.end, 0)],
    ef: [subDays(_rnge.start, 0), addMonths(_rnge.end, 12)],
    rb: [subDays(_rnge.start, 0), subMonths(_rnge.end, 12)],
    rf: [addYears(_rnge.start, 1), subDays(_rnge.end, 0)],
  }),
};

export const getRange = (fn: string, step: string, dates: dateRange) => {
  const [start, end] = moveFns[step]?.(dates)[fn];
  if (isAfter(start, end)) {
    return [end, start]; // normalize instead of reverting
  }
  return [start, end];
};

export const clampRangeToScope = (
  range: dateRange,
  scope?: dateRange,
): dateRange => {
  if (!scope) {
    return range;
  }

  const normalizedScope = isAfter(scope.start, scope.end)
    ? { start: scope.end, end: scope.start }
    : scope;

  const clampedStart = clamp(range.start, normalizedScope);
  const clampedEnd = clamp(range.end, normalizedScope);

  return isAfter(clampedStart, clampedEnd)
    ? { start: clampedEnd, end: clampedStart }
    : { start: clampedStart, end: clampedEnd };
};

export type IncrementType = {
  menu: string;
  tip: string;
  plural: string;
  step: string;
  show: boolean;
  thisPeriod: string;
  thisRange: dateRange;
  icon: React.ReactElement;
};

// --- Current Period Parameters ---
export const Increment = (
  stepViz: step<boolean>,
  weekStartDay: 0 | 1 | 2 | 3 | 4 | 5 | 6,
  yearStartMonth: number,
  localization: any,
  payProps?: any,
  showMore?: boolean,
  scope?: dateRange,
) => {
  const _rnge = getInitRange(
    "today",
    weekStartDay,
    yearStartMonth,
    { start: null, end: null },
    "matrix",
  );
  return [
    {
      menu: periodThis.day,
      tip: localization.getDisplayName("startRange_today"),
      plural: localization.getDisplayName("Step_Days"),
      step: periodGranularity.day,
      show: stepViz.day,
      thisPeriod: localization.getDisplayName("buttonText_today"),
      thisRange: _rnge["today"],
      icon: <Today style={{ fontSize: "inherit" }} color="primary" />,
    },
    {
      menu: periodThis.week,
      tip: localization.getDisplayName("startRange_thisWeek"),
      plural: localization.getDisplayName("Step_Weeks"),
      step: periodGranularity.week,
      show: stepViz.week,
      thisPeriod: localization.getDisplayName("buttonText_thisWeek"),
      thisRange: _rnge["thisWeek"],
      icon: <DateRange style={{ fontSize: "inherit" }} color="primary" />,
    },
    {
      menu: periodThis.pay,
      tip: payProps?.desc,
      plural: localization.getDisplayName("Step_Weeks"),
      step: periodGranularity.pay,
      show: stepViz.pay,
      thisPeriod: payProps?.desc,
      thisRange: getPayPeriod(payProps?.ref, startOfToday(), payProps?.len),
      icon: <Payment style={{ fontSize: "inherit" }} color="primary" />,
    },
    {
      menu: periodThis.month,
      tip: localization.getDisplayName("startRange_thisMonth"),
      plural: localization.getDisplayName("Step_Months"),
      step: periodGranularity.month,
      show: stepViz.month,
      thisPeriod: localization.getDisplayName("buttonText_thisMonth"),
      thisRange: _rnge["thisMonth"],
      icon: <EventNote style={{ fontSize: "inherit" }} color="primary" />,
    },
    {
      menu: periodThis.quarter,
      tip: localization.getDisplayName("startRange_thisQuarter"),
      plural: localization.getDisplayName("Step_Quarters"),
      step: periodGranularity.quarter,
      show: stepViz.quarter,
      thisPeriod: localization.getDisplayName("buttonText_thisQuarter"),
      thisRange: _rnge["thisQuarter"],
      icon: <DynamicFeed style={{ fontSize: "inherit" }} color="primary" />,
    },
    {
      menu: periodThis.year,
      tip: localization.getDisplayName("startRange_thisYear"),
      plural: localization.getDisplayName("Step_Years"),
      step: periodGranularity.year,
      show: stepViz.year,
      thisPeriod: localization.getDisplayName("buttonText_thisYear"),
      thisRange: _rnge["thisYear"],
      icon: <LineStyle style={{ fontSize: "inherit" }} color="primary" />,
    },
    {
      menu: periodThis.more,
      tip: localization.getDisplayName("dateUtilsMore"),
      plural: null,
      step: null,
      show: (stepViz.day || stepViz.year || stepViz.month) && showMore,
      thisPeriod: localization.getDisplayName("dateUtilsMore"),
      thisRange: null,
      icon: (
        <MultipleStop
          style={{ fontSize: 12, opacity: 0.5 }}
          color="secondary"
        />
      ),
    },
    {
      menu: periodThis.range,
      tip: localization.getDisplayName("startRange_rangeScope"),
      plural: null,
      step: periodGranularity.range,
      show: true,
      thisPeriod: localization.getDisplayName("buttonText_rangeScope"),
      thisRange: scope, // [parseJSON(scope.start.toString()) , parseJSON(scope.end.toString())],
      icon: (
        <SettingsEthernet style={{ fontSize: "inherit" }} color="primary" />
      ),
    },
    {
      menu: periodThis.ytd,
      tip: localization.getDisplayName("startRange_ytdToday"),
      plural: null,
      step: periodGranularity.ytd,
      show: stepViz.day || stepViz.year,
      thisPeriod: localization.getDisplayName("buttonText_ytdToday"),
      thisRange: _rnge["ytdToday"],
      icon: (
        <PlayArrow
          style={{ fontSize: "inherit", opacity: 0.7 }}
          color="primary"
        />
      ),
    },
    {
      menu: periodThis.yearPast,
      tip: localization.getDisplayName("startRange_ytToday"),
      plural: null,
      step: periodGranularity.yearPast,
      show: stepViz.day || stepViz.year,
      thisPeriod: localization.getDisplayName("buttonText_ytToday"),
      thisRange: _rnge["ytToday"],
      icon: (
        <SwitchLeft
          style={{ fontSize: "inherit", opacity: 0.7 }}
          color="primary"
        />
      ),
    },
    {
      menu: periodThis.ytdLastMonth,
      tip: localization.getDisplayName("startRange_ytdLastMonth"),
      plural: null,
      step: periodGranularity.ytdLastMonth,
      show: stepViz.month || stepViz.year,
      thisPeriod: localization.getDisplayName("buttonText_ytdLastMonth"),
      thisRange: _rnge["ytdLastMonth"],
      icon: (
        <SkipPrevious
          style={{ fontSize: "inherit", opacity: 0.7 }}
          color="primary"
        />
      ),
    },
    {
      menu: periodThis.ytdThisMonth,
      tip: localization.getDisplayName("startRange_ytdThisMonth"),
      plural: null,
      step: periodGranularity.ytdThisMonth,
      show: stepViz.month || stepViz.year,
      thisPeriod: localization.getDisplayName("buttonText_ytdThisMonth"),
      thisRange: _rnge["ytdThisMonth"],
      icon: (
        <SkipNext
          style={{ fontSize: "inherit", opacity: 0.7 }}
          color="primary"
        />
      ),
    },
  ];
};

// --- Slider Mark Functions ---
export const sliderMarkNumber = (val: Date, min: Date) =>
  Math.max(0, differenceInDays(val, min));

export const sliderMarkDate = (val: number, min: Date) => addDays(min, val);

// export const useSliderMarkText = () => {
//   const locale = useDateFnsLocale();
//   return (num: number, min: Date, fmt = "d-MMM-yy") =>
//     format(addDays(min, num), fmt, { locale });
// };

type Step = "day" | "week" | "pay" | "month" | "quarter" | "year";

export const stepMinor: Record<Step, Step> = {
  day: "month",
  week: "month",
  pay: "month",
  month: "year",
  quarter: "month",
  year: "month",
};

export const stepMajor: Record<Step, Step> = {
  day: "day",
  week: "week",
  pay: "pay",
  month: "month",
  quarter: "quarter",
  year: "year",
};

function eachPaydayOfInterval(range: dateRange, pay) {
  const result = subDays(
    range.start,
    differenceInDays(range.start, pay.ref) % pay.len,
  );
  return eachDayOfInterval(
    { start: result, end: range.end },
    { step: pay.len },
  );
}

// --- Timeline Setup ---
export function closest(needle, haystack) {
  return haystack.reduce((a, b) => {
    const aDiff = Math.abs(a - needle);
    const bDiff = Math.abs(b - needle);
    if (aDiff === bDiff) {
      return a > b ? a : b;
    } else {
      return bDiff < aDiff ? b : a;
    }
  });
}

export const createMarks = (
  period: string,
  range: dateRange,
  weekStart: 0 | 1 | 2 | 3 | 4 | 5 | 6,
  yearStart: number,
  pay: any,
) => {
  const periodHandlers = {
    day: () => eachDayOfInterval(range),
    week: () => eachWeekOfInterval(range, { weekStartsOn: weekStart }),
    month: () => eachMonthOfInterval(range),
    pay: () => eachPaydayOfInterval(range, pay),
    quarter: () => eachQuarterOfInterval(range),
    year: () =>
      eachYearOfInterval({ start: range.start, end: range.end }).map((x) =>
        addMonths(x, yearStart),
      ),
  };

  const result = periodHandlers[period] ? periodHandlers[period]() : [];
  const resultSet = new Set([range.start, ...result, range.end]);

  // Filter out any non-Date objects before sorting.
  return Array.from(resultSet)
    .filter((d): d is Date => d instanceof Date)
    .sort((a, b) => a.getTime() - b.getTime());
};

export const sliderMarkText = (
  num: number,
  min: Date,
  locale: any,
  fmt = "d-MMM-yy",
) => {
  return format(addDays(min, num), fmt, { locale });
};

export const doMarks = (
  _val: any,
  _fmt: any,
  _min: Date,
  _skip: number,
  _offset: number,
  locale: any,
) => {
  return _val.map((x: Date, i: number) => {
    const v: number = sliderMarkNumber(_skip === 0 ? startOfToday() : x, _min);
    const dateValue =
      _offset === 0
        ? _min
        : addYears(_min, sliderMarkDate(v, _min).getMonth() <= _offset ? 1 : 0);
    const l =
      (i + 1) % _skip === 0 || i === 0 || i === _val.length - 1
        ? sliderMarkText(v, dateValue, locale, _fmt)
        : "";
    return { value: v, label: l };
  });
};

const buildMarks = (period: string, props: SliderProps, locale: any) => {
  const marks = createMarks(
    period,
    props.rangeScope,
    props.weekStartDay,
    props.yearStartMonth,
    props.payProps,
  );
  const fmt = props.stepFmt[period];
  const step = props.stepSkip[period];
  const offset = period === "year" ? props.yearStartMonth : 0;
  return doMarks(marks, fmt, props.rangeScope.start, step, offset, locale);
};

export const mainMarks = (props: SliderProps, locale: any) => {
  const _val = stepMajor[props.stepValue];
  if (_val != null) {
    return buildMarks(_val, props, locale);
  }
  return null;
};

export const superMarks = (props: SliderProps, locale: any) => {
  const _val = stepMinor[props.stepValue];
  if (_val != null) {
    return buildMarks(_val, props, locale);
  }
  return null;
};

export const uniqueDate = (_array: Date[]) =>
  Array.from(new Set(_array.map((s) => s.getTime()))).map((s) => new Date(s));

// --- Date field input parameters and checks ---
// ✅ Fixed: Hooks are now called at the top level of the custom hook
export const useInputParms = () => {
  const locale = useDateFnsLocale();
  const localization = useLocalization();

  // ✅ Return a memoized function that uses the captured locale/localization
  return React.useCallback(
    (dates: dateRange, rangeScope: dateRange) => {
      // ✅ Always reflect the selected range
      const selStart = startOfDay(dates.start);
      const selEnd = endOfDay(dates.end);

      // ✅ Validation only
      const startInRange = isWithinInterval(dates.start, rangeScope);
      const endInRange = isWithinInterval(dates.end, rangeScope);

      const clampedStart = clamp(dates.start, rangeScope);
      const clampedEnd = clamp(dates.end, rangeScope);

      const _start = startOfDay(clampedStart);
      const _end = endOfDay(clampedEnd);

      const formatDate = (d: Date) => format(d, "EEE, d MMM yy", { locale });

      try {
        const days = differenceInDays(_end, _start);
        const startDate = formatDate(_start);
        const endDate = formatDate(_end);
        const duration = formatDistance(_start, _end, { locale });

        return {
          // 🔑 Always show the *selected* range, not clamped scope
          string:
            days > 0
              ? `${duration
                  .toLowerCase()
                  .replace(/\b\w/g, (s) =>
                    s.toUpperCase(),
                  )}: ${startDate} - ${endDate}`
              : ` ${endDate}`,

          // 🔑 Info row only warns if selection is outside scope
          info:
            startInRange && endInRange
              ? ""
              : ` [${formatDate(dates.start)} - ${formatDate(dates.end)} ${localization.getDisplayName(
                  "dateUtilsExceedsScope",
                )}]`,

          duration,
          fmDoW: format(selStart, "EEEE", { locale }),
          toDoW: format(selEnd, "EEE", { locale }),
          fmValid: startInRange,
          toValid: endInRange,
        };
      } catch {
        return {
          string: localization.getDisplayName("dateUtilsInvalid"),
          duration: "",
          fmDoW: "",
          toDoW: "",
          fmValid: false,
          toValid: false,
        };
      }
    },
    [locale, localization],
  );
};
