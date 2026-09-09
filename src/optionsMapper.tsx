// Options mapper - extract and transform data and settings from the update options into a strongly-typed state object for the visual.
// @ts-nocheck
import powerbi from "powerbi-visuals-api";
import { FONT_SIZE, FONT_FAMILY } from "./constants";
import { interactivityFilterService } from "powerbi-visuals-utils-interactivityutils";
import {
  valueFormatter as vf,
  textMeasurementService as tms,
} from "powerbi-visuals-utils-formattingutils";
import { pixelConverter as PixelConverter } from "powerbi-visuals-utils-typeutils";
import { getInitRange } from "./dateutils";
import { startOfDay, endOfDay } from "date-fns";
import {
  VisualState,
  ViewportData,
  CategoryData,
  dateCardProps,
  dateRange,
} from "./interface";
import { IAdvancedFilter } from "powerbi-models";
import { VisualSettingsModel } from "./vsettings";

const { extractFilterColumnTarget } = interactivityFilterService;

/**
 * Quick structural validation of update options.
 */
export const optionsAreValid = (
  options: powerbi.extensibility.visual.VisualUpdateOptions,
): boolean => {
  try {
    const dataView = options?.dataViews?.[0];
    return !!(
      dataView?.metadata?.columns?.length &&
      options.viewport &&
      dataView.categorical?.categories?.[0]?.source?.type?.dateTime
    );
  } catch {
    return false;
  }
};

/**
 * Extracts settings properties into strongly-typed dateCardProps.
 */
export const settingProps = (
  options: powerbi.extensibility.visual.VisualUpdateOptions,
  formatSettings: VisualSettingsModel,
  initialised: boolean,
): Omit<dateCardProps, "dates"> => {
  // 🟢 CORRECT: Destructure matching your exact class property definitions
  const { style, calendar, layout, period } = formatSettings;

  const {
    periodDay: day,
    periodWeek: week,
    periodPay: pay,
    periodMonth: month,
    periodQuarter: quarter,
    periodYear: year,
  } = period;

  const {
    layoutCurrent: current,
    layoutMove: move,
    layoutTimeline: timeline,
    layoutHelp: help,
  } = layout;

  const stepInit = String(calendar.stepInit.value);
  const singleDay = calendar.singleDay.value;
  const limitToScope = calendar.limitToScope.value;
  const forceStartRange = calendar.forceStartRange.value;
  const showCurrentInScopeOnly = current.showCurrentInScopeOnly.value;
  const scaleIconText = current.scaleIconText.value;

  const rangeScope = mapDataView(options).category?.rangeValues;
  const weekStartDay = getDayNum(week.weekStartDay.value);
  const yearStartMonth = getNum(year.yearStartMonth.value);
  const startRange = String(calendar.startRange.value);

  // just compute a startup default
  const startupFilter = getInitRange(
    startRange,
    weekStartDay,
    yearStartMonth,
    rangeScope,
  );

  return {
    landingOff: optionsAreValid(options),
    // dates: startupFilter,          // parent will override
    startupFilter, // 👈 expose this
    rangeScope,
    startRange,
    weekStartDay,
    yearStartMonth,
    stepInit,
    singleDay,
    limitToScope,
    forceStartRange,

    stepSkip: {
      day: nonNeg(day.daySkip.value),
      week: nonNeg(week.weekSkip.value),
      pay: nonNeg(pay.paySkip.value),
      month: nonNeg(month.monthSkip.value),
      quarter: nonNeg(quarter.quarterSkip.value),
      year: 1,
    },
    stepViz: {
      day: day.showDay.value,
      week: week.showWeek.value,
      pay: pay.showPay.value,
      month: month.showMonth.value,
      quarter: quarter.showQuarter.value,
      year: year.showYear.value,
    },
    stepFmt: {
      day: String(day.fmtDay.value),
      week: String(week.fmtWeek.value),
      pay: String(pay.fmtPay.value),
      month: String(month.fmtMonth.value),
      quarter: String(quarter.fmtQuarter.value),
      year: String(year.fmtYear.value),
    },
    payProps: {
      desc: String(pay.payCustomLabel.value),
      ref: pay.payRefDate.value,
      len: nonNeg(pay.payLength.value),
    },
    showHelpIcon: help.showHelpIcon.value,
    showTooltip: help.showTooltip.value,
    showExtendedTooltip: help.showExtendedTooltip.value,
    showMove: move.showMove.value,
    showExpand: move.showExpand.value,
    showCurrent: current.showCurrent.value,
    showMore: current.showMore.value,
    showIconText: current.showIconText.value,
    scaleIconText,
    showCurrentInScopeOnly,
    enableSlider: timeline.enableSlider.value,
    showSlider: timeline.showSlider.value,
    show2ndSlider: timeline.show2ndSlider.value,
    themeFont: style.themeFont.value,
    themeColor: style.themeColor.value.value.valueOf(),
    themeMode: style.themeMode.value,
    fontColor: style.fontColor.value.value.valueOf(),
    // fontSize: nonNeg(style.fontSize.value),

    // Point directly to the flat card slices instead of through .font
    // fontBold: style.fontBold.value,
    // fontItalic: style.fontItalic.value,
    fontSize: nonNeg(style.fontSize.value),
    fontBold: style.bold.value,
    fontItalic: style.italic.value,
  };
};

const getDayNum = (n: number | string): 0 | 1 | 2 | 3 | 4 | 5 | 6 =>
  (getNum(n) % 7) as 0 | 1 | 2 | 3 | 4 | 5 | 6;

const getNum = (n: number | string): number =>
  typeof n === "number" ? n : parseInt(n, 10);

const nonNeg = (n: number | string): number => {
  const v = typeof n === "number" ? n : parseInt(String(n), 10);
  return isNaN(v) ? 0 : Math.max(0, v);
};

const parseDate = (value: any): Date | null => {
  const date = new Date(value);
  return isNaN(date.getTime())
    ? null
    : new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

/**
 * Extract categorical data from the DataView and measure labels.
 */
export const mapDataView = (
  options: powerbi.extensibility.visual.VisualUpdateOptions,
): Partial<VisualState> => {
  const dataView = options.dataViews[0];
  const category = dataView.categorical?.categories?.[0];
  const categorySource = category?.source;

  if (!category || !categorySource) {
    return {};
  }

  const filterTarget = extractFilterColumnTarget(categorySource);
  const categoriesFormatter = vf.create({
    format: vf.getFormatStringByColumn(categorySource),
  });

  const values = category.values;
  const formattedValues = values.map((v) => categoriesFormatter.format(v));

  const rangeScopeVals: dateRange = {
    start: parseDate(values[0]),
    end: parseDate(values[values.length - 1]),
  };

  const maxCategoryNameWidth = formattedValues.reduce(
    (acc, val) =>
      Math.max(
        acc,
        tms.measureSvgTextWidth({
          text: val,
          fontFamily: FONT_FAMILY,
          fontSize: PixelConverter.toString(FONT_SIZE),
        }),
      ),
    0,
  );

  return {
    category: {
      displayName: categorySource.displayName,
      count: values.length,
      rangeValues: rangeScopeVals,
      formatter: categoriesFormatter,
      maxWidth: maxCategoryNameWidth,
      filterTarget,
    } as CategoryData,
  };
};

/**
 * Restore filter state from jsonFilters if present.
 */
export const restoreRangeFilter = (
  options: powerbi.extensibility.visual.VisualUpdateOptions,
): dateRange | undefined => {
  const { jsonFilters, dataViews } = options;
  const dataView = dataViews[0];
  const column = dataView?.metadata?.columns?.[0];
  if (!jsonFilters || !column) return;

  const filter = jsonFilters.find(
    (f): f is IAdvancedFilter =>
      !!(f as IAdvancedFilter).target &&
      !!(f as IAdvancedFilter).logicalOperator &&
      !!(f as IAdvancedFilter).conditions,
  );
  if (!filter) return;

  const [table, col] = String(column.queryName).split(".");
  const target = filter.target as { table: string; column: string };
  if (
    filter.logicalOperator === "And" &&
    target.table === table &&
    target.column === col
  ) {
    const greaterThan = filter.conditions.find(
      (c) => c.operator === "GreaterThanOrEqual",
    );
    const lessThan = filter.conditions.find(
      (c) => c.operator === "LessThanOrEqual",
    );

    if (greaterThan && lessThan) {
      return {
        start: startOfDay(parseDate(greaterThan.value)),
        end: endOfDay(parseDate(lessThan.value)),
      };
    }
  }
};

export const mapViewport = (viewport: powerbi.IViewport): ViewportData => ({
  width: viewport.width,
  height: viewport.height,
});

export const mapOptionsToState = (
  options: powerbi.extensibility.visual.VisualUpdateOptions,
  formatSettings: VisualSettingsModel,
  initialised: boolean,
): VisualState => ({
  category: mapDataView(options).category,
  viewport: mapViewport(options.viewport),
  settings: settingProps(options, formatSettings, initialised),
});

export default mapOptionsToState;
