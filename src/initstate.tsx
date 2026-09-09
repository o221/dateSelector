import { Settings, dateCardProps } from "./interface";
//import { defaultSettings } from "./vinitsettings";
import { startOfToday, format } from "date-fns";
//,startOfYear, endOfYear

export const defaultSettings = {
  general: {
    landingOff: false,
    rangeScope: { start: null, end: null },
  },
  style: {
    fmtDate: "d-MM-yyyy",
    themeColor: "#607d8b",
    themeMode: "light",
    themeFont: "Segoe UI",
    fontFamily: '"Segoe UI", wf_segoe-ui_normal, helvetica, arial, sans-serif',
    fontSize: 10,
    fontBold: false,
    fontUnderline: false,
    fontItalic: false,
    fontColor: "#000000",
  },
  calendar: {
    singleDay: false,
    startRange: "sync",
    stepInit: "day",
    payLength: 14,
    fmtDate: "EEE, d MMM yy",
    limitToScope: false,
    forceStartRange: false,
  },
  layout: {
    timelineSettings: {
      enableSlider: true,
      showSlider: false,
      show2ndSlider: true,
    },
    currentSettings: {
      showCurrent: true,
      showIconText: false,
      scaleIconText: false,
      showMore: false,
      showCurrentInScopeOnly: true,
    },
    moveSettings: {
      showMove: true,
      showExpand: true,
    },
    helpSettings: {
      showHelpIcon: false,
      showTooltip: true,
      showExtendedTooltip: false,
    },
  },
  period: {
    daySettings: {
      showDay: true,
      fmtDay: "d-MMM",
      daySkip: 0,
    },
    weekSettings: {
      showWeek: true,
      weekStartDay: 1,
      weekSkip: 4,
      fmtWeek: "w",
    },
    paySettings: {
      payCustomLabel: "Pay Period", // ← Added text input here: "Pay Period",
      showPay: false,
      paySkip: 4,
      payLength: 14,
      fmtPay: "d-MMM",
      payRefDay: new Date().getDate(),
      payRefYear: new Date().getFullYear(),
      payRefMonth: new Date().getMonth(),
      payRefDate: format(startOfToday(), "yyyy-MM-dd"),
    },
    monthSettings: {
      showMonth: true,
      monthSkip: 1,
      fmtMonth: "MMMMM",
    },
    quarterSettings: {
      showQuarter: false,
      fmtQuarter: "QQQ",
      quarterSkip: 1,
    },
    yearSettings: {
      showYear: true,
      fmtYear: "yyyy",
      yearStartMonth: 0,
      yearSkip: 1,
    },
  },
} satisfies Settings;

const { general, period, calendar, style, layout } = defaultSettings;

const {
  daySettings,
  weekSettings,
  paySettings,
  monthSettings,
  quarterSettings,
  yearSettings,
} = period;

export const initialState: dateCardProps = {
  landingOff: general.landingOff,
  rangeScope: general.rangeScope as unknown as dateCardProps["rangeScope"],
  weekStartDay: weekSettings.weekStartDay, // 0 = Sun
  yearStartMonth: yearSettings.yearStartMonth, // 0 = Jan
  stepInit: calendar.stepInit,
  stepSkip: {
    day: daySettings.daySkip,
    week: weekSettings.weekSkip,
    pay: paySettings.paySkip,
    month: monthSettings.monthSkip,
    quarter: quarterSettings.quarterSkip,
    year: yearSettings.yearSkip,
  },
  stepViz: {
    day: daySettings.showDay,
    week: weekSettings.showWeek,
    pay: paySettings.showPay,
    month: monthSettings.showMonth,
    quarter: quarterSettings.showQuarter,
    year: yearSettings.showYear,
  },
  stepFmt: {
    day: daySettings.fmtDay,
    week: weekSettings.fmtWeek,
    pay: paySettings.fmtPay,
    month: monthSettings.fmtMonth,
    quarter: quarterSettings.fmtQuarter,
    year: yearSettings.fmtYear,
  },
  payProps: {
    desc: paySettings.payCustomLabel,
    ref: new Date(
      paySettings.payRefYear,
      paySettings.payRefMonth,
      paySettings.payRefDay,
    ),
    len: paySettings.payLength,
  },
  themeColor: style.themeColor,
  themeFont: style.themeFont,
  themeMode: style.themeMode,
  fontSize: style.fontSize,
  showCurrent: layout.currentSettings.showCurrent,
  showHelpIcon: layout.helpSettings.showHelpIcon,
  showMore: layout.currentSettings.showMore,
  showIconText: layout.currentSettings.showIconText,
  scaleIconText: layout.currentSettings.scaleIconText,
  showCurrentInScopeOnly: layout.currentSettings.showCurrentInScopeOnly,
  singleDay: calendar.singleDay,
  enableSlider: layout.timelineSettings.enableSlider,
  showSlider: layout.timelineSettings.showSlider,
  show2ndSlider: layout.timelineSettings.show2ndSlider,
  showMove: layout.moveSettings.showMove,
  showExpand: layout.moveSettings.showExpand,
};
