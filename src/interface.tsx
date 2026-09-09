import { valueFormatter as vf } from "powerbi-visuals-utils-formattingutils";
import IValueFormatter = vf.IValueFormatter;
import { IFilterColumnTarget } from "powerbi-models";

export interface VisualState {
  viewport?: ViewportData;
  settings: dateCardProps;
  category?: CategoryData;
  currentFilter?: dateRange | null;
  landingOff?: boolean;
}

export interface ViewportData {
  width: number;
  height: number;
}

export interface CategoryData {
  displayName: string;
  count: number;
  rangeValues: dateRange;
  maxWidth: number;
  formatter: IValueFormatter;
  filterTarget: IFilterColumnTarget;
}

export interface Settings {
  general?: {
    dates?: dateRange; // date range object representing the selected date range
    rangeScope?: dateRange | { start: null; end: null }; // initial scope can be unset
    landingOff?: boolean; // boolean value indicating whether to display landing page
    filter?: dateRange; // date range object representing the initial filter state
    startupFilter?: dateRange; // date range object representing the initial filter state
  };
  style?: {
    fmtDate?: string;
    themeColor?: string;
    themeMode?: any;
    themeFont?: string;
    fontFamily?: string;
    fontSize?: number;
    fontBold?: boolean;
    fontUnderline?: boolean;
    fontItalic?: boolean;
    fontColor?: string;
  };
  calendar?: {
    singleDay?: boolean;
    limitToScope?: boolean;
    startRange?: string;
    stepInit?: string;
    payLength?: number;
    fmtDate?: string;
    forceStartRange?: boolean;
  };
  layout?: {
    timelineSettings: {
      enableSlider?: boolean;
      showSlider?: boolean;
      show2ndSlider?: boolean;
    };
    currentSettings: {
      showCurrent?: boolean;
      showIconText?: boolean;
      scaleIconText?: boolean;
      showMore?: boolean;
      showCurrentInScopeOnly?: boolean;
    };
    moveSettings: {
      showMove?: boolean;
      showExpand?: boolean;
    };
    helpSettings: {
      showTooltip?: boolean;
      showHelpIcon?: boolean;
      showExtendedTooltip?: boolean;
    };
  };
  period?: {
    daySettings?: {
      showDay?: boolean;
      fmtDay?: string;
      daySkip?: number;
    };
    weekSettings?: {
      showWeek?: boolean;
      weekStartDay?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
      weekSkip?: number;
      fmtWeek?: string;
    };
    paySettings?: {
      payCustomLabel?: string;
      payDesc?: string;
      showPay?: boolean;
      paySkip?: number;
      payLength?: number;
      fmtPay?: string;
      payRefDay?: number;
      payRefYear?: number;
      payRefMonth?: number;
      payRefDate?: string;
    };
    monthSettings?: {
      showMonth?: boolean;
      monthSkip?: number;
      fmtMonth?: string;
    };
    quarterSettings?: {
      showQuarter?: boolean;
      fmtQuarter?: string;
      quarterSkip?: number;
    };
    yearSettings?: {
      showYear?: boolean;
      fmtYear?: string;
      yearStartMonth?: number;
      yearSkip?: number;
    };
  };
  action?: {
    handleVal?: (val: any) => void;
    onFilterChanged?: (val: dateRange) => void;
    setStepValue?: (value: string) => void;
    setStepOpen?: (value: boolean) => void;
    toggleSlider?: () => void;
  };
}

export interface dateCardProps {
  // date range object representing the selected date range
  dates?: dateRange;

  // date range object representing the scope of available dates to choose from
  rangeScope?: dateRange;

  // boolean value indicating whether to display landing page
  landingOff?: boolean;

  startRange?: string;
  // date range object representing the initial filter state
  startupFilter?: dateRange;
  forceStartRange?: boolean;

  // boolean value indicating whether to display step controls for selecting dates
  stepViz?: step<boolean>;

  // string value representing the format of the granularity display for the step controls
  stepFmt?: step<string>;

  // number value representing the number of steps to skip in the step controls
  stepSkip?: step<number>;

  // string value representing the initial granularity display format for the step controls
  stepInit?: string;

  // string value representing the period of the step controls
  stepPeriod?: string;

  // boolean value indicating whether to display visualization options for the date range
  showMore?: boolean;

  // payment-related object representing payment-related properties
  payProps?: pay;

  // string value representing the date format to use
  fmtDate?: string;

  // number value representing the day of the week to start the calendar on
  weekStartDay?: 0 | 1 | 2 | 3 | 4 | 5 | 6;

  // number value representing the month to start the year on
  yearStartMonth?: number;

  // boolean value indicating whether to show the date range slider
  showSlider?: boolean;

  // boolean value indicating whether to show a second date range slider
  show2ndSlider?: boolean;

  // boolean value indicating whether to show the current date range
  showCurrent?: boolean;

  // boolean value indicating whether the icon badge text should scale with the icon
  scaleIconText?: boolean;

  // boolean value indicating whether current-period buttons should only render when fully contained in scope
  showCurrentInScopeOnly?: boolean;

  // string value representing the font color to use
  fontColor?: string;

  // string value representing the font color to use
  fontBold?: boolean;

  // string value representing the font color to use
  fontUnderline?: boolean;

  // string value representing the font color to use
  fontItalic?: boolean;

  // string value representing the theme color to use
  themeColor?: string;

  // value representing the theme font to use
  themeFont?: string;

  // value representing the input font size to use
  fontSize?: number;

  // value representing the theme font size to use
  themeFontSize?: number;

  // value representing the theme mode to use
  themeMode?: any; //'light' | 'dark'

  // boolean values to show tooltip datail level
  showHelpIcon?: boolean;
  showTooltip?: boolean;
  showExtendedTooltip?: boolean;

  // boolean value indicating whether to show the icon text
  showIconText?: boolean;

  // boolean value indicating whether to constrain to a single day
  singleDay?: boolean;

  // boolean value indicating whether to constrain slelction to date range scope
  limitToScope?: boolean;

  // boolean value indicating whether to show arrows to move/expand by period step
  showMove?: boolean;

  // boolean value indicating whether to show arrows to expand by period step
  showExpand?: boolean;

  // boolean value indicating whether to show timeline toggle button
  enableSlider?: boolean;

  stepOpen?: boolean;
  stepValue?: string;
  current?: any;
  // function to handle the selected value(s)
  handleVal?: (val: any) => void;
  handleViz?: (val: any) => void;
  handleClick?: () => void;
  handleStep?: (value: string) => void;
  onFilterChanged?: (result: dateRange) => void;
  setStepValue?: (value: string) => void;
  setStepOpen?: (value: boolean) => void;

  //extras for topRow
  openSlider?: boolean;
  toggleSlider?: () => void;
  toggleStepOpen?: () => void;
  localization?: {
    getDisplayName: (key: string) => string;
  };
}

export interface topRowProps {
  props: dateCardProps;
  openSlider: boolean;
  landingOff?: boolean;
  toggleSlider: () => void;
  dates?: dateRange;
  rangeScope?: dateRange;
  payProps?: pay;
  handleVal?: (val: any) => void;
  stepViz?: step<boolean>;
  stepOpen: boolean;
  stepValue: string;
  handleClick: () => void;
  setStepValue: (value: string) => void;
  setStepOpen: (value: boolean) => void;
  showMore: boolean;
  showCurrent: boolean;
  showIconText: boolean;
  current: any;
  singleDay?: boolean;
  limitToScope?: boolean;
  showMove?: boolean;
  showExpand?: boolean;
  enableSlider?: boolean;
}

export interface dateMoveProps extends dateCardProps {
  bf?: string;
  vertical?: boolean;
  reverse?: boolean;
  handleVal?: (val: any) => void;
}

export interface stepProps {
  // value: string;
  stepViz?: step<boolean>;
  stepValue?: string;
  payProps?: pay;
  viz?: boolean;
  fontSize?: number;
  handleStep?: (newValue: string) => void;
  handleViz?: (viz: boolean) => void;
  handleClick?: (event: React.MouseEvent<HTMLElement>) => void;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  localization?: {
    getDisplayName: (key: string) => string;
  };
}

export interface ToggleSliderButtonProps {
  openSlider: boolean;
  toggleSlider: () => void;
  localization?: {
    getDisplayName: (key: string) => string;
  };
}

export interface UseCurrentProps {
  rangeScope?: dateRange;
  weekStartDay?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  yearStartMonth?: number;
  payProps?: pay;
  stepViz?: step<boolean>;
  showCurrent?: boolean;
  stepValue?: string;
  showIconText?: boolean;
  scaleIconText?: boolean;
  showMore?: boolean;
  showCurrentInScopeOnly?: boolean;
  current: any;
  handleVal?: (val: any) => void;
  handleStep?: (newValue: string) => void;
  handleViz?: (viz: boolean) => void;
  singleDay?: boolean;
  limitToScope?: boolean;
}

export interface DateRangeProps {
  dates: dateRange;
  rangeScope?: dateRange;
  handleVal?: (val: any) => void;
  fmtDate?: string;
  singleDay?: boolean;
  limitToScope?: boolean;
}

export interface SliderProps {
  dates?: dateRange;
  rangeScope?: dateRange;
  weekStartDay?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  yearStartMonth?: number;
  stepValue?: string;
  payProps?: pay;
  stepFmt?: step<string>;
  stepSkip?: step<number>;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleVal?: (val: any) => void;
  toggleSlider?: () => void;
  show2ndSlider?: boolean;
  handleStep?: (val: string) => void;
  singleDay?: boolean;
}

export interface dateRange {
  start: Date;
  end: Date;
}

export interface step<T> {
  day: T;
  week: T;
  pay: T;
  month: T;
  quarter: T;
  year: T;
}

export interface pay {
  desc: string;
  ref: Date;
  len: number;
}

export interface current {
  tip: string;
  show: boolean;
  thisPeriod: string;
  thisRange: any;
  icon: React.ReactSVGElement;
}

export interface themeProps {
  themeFont: string;
  themeColor: string;
  themeMode: any; // "light" | "dark";
  themeFontSize?: number; // value representing the theme font size to use
  fontColor: string;
  fontSize: number;
  fontBold: boolean;
  fontUnderline?: boolean;
  fontItalic?: boolean;
}

export interface payProps {
  desc: string;
  ref: Date;
  len: number;
}

interface stepPeriodVals {
  show?: boolean;
  skip?: number;
  format?: string;
}

export interface stepPeriod {
  day: stepPeriodVals;
  week: stepPeriodVals;
  pay: stepPeriodVals;
  month: stepPeriodVals;
  quarter: stepPeriodVals;
  year: stepPeriodVals;
}
