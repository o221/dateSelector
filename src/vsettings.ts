/*
 * Power BI Visualization Settings
 * Date Range Selector
 */

"use strict";

import powerbi from "powerbi-visuals-api";
import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsCompositeCard = formattingSettings.CompositeCard;
import FormattingSettingsGroup = formattingSettings.Group;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;

import { defaultSettings } from "./initstate";

export class VisualSettingsModel extends FormattingSettingsModel {
  // Instance names and class names must align perfectly for internal v7 mapping
  style = new StyleSettings();
  calendar = new CalendarSettings();
  layout = new LayoutSettings();
  period = new PeriodSettings();

  cards: Array<FormattingSettingsCard> = [
    this.style,
    this.calendar,
    this.layout,
    this.period,
  ];
}

class StyleSettings extends FormattingSettingsCompositeCard {
  name: string = "style";
  displayNameKey = "style_displayName";
  descriptionKey = "style_description";
  analyticsPane: boolean = false;
  uid: string = "styleUid";

  themeFont = new formattingSettings.FontPicker({
    name: "themeFont",
    descriptionKey: "style_themeFont_description",
    // displayNameKey: "style_themeFont_displayName",
    value: defaultSettings.style.themeFont,
  } as unknown as formattingSettings.FontPicker);

  fontFamily = new formattingSettings.FontPicker({
    name: "fontFamily",
    descriptionKey: "style_fontFamily_description",
    //  displayNameKey: "style_fontFamily_displayName",
    value: defaultSettings.style.fontFamily,
  } as unknown as formattingSettings.FontPicker);

  fontSize = new formattingSettings.NumUpDown({
    name: "fontSize",
    descriptionKey: "style_fontSize_description",
    // displayNameKey: "style_fontSize_displayName",
    value: defaultSettings.style.fontSize,
  } as unknown as formattingSettings.NumUpDown);

  italic = new formattingSettings.ToggleSwitch({
    name: "italic",
    descriptionKey: "style_fontItalic_description",
    displayNameKey: "style_fontItalic_displayName",
    value: defaultSettings.style.fontItalic,
    options: {
      displayAsButton: true,
    },
  } as unknown as formattingSettings.ToggleSwitch);

  bold = new formattingSettings.ToggleSwitch({
    name: "bold",
    descriptionKey: "style_fontBold_description",
    displayNameKey: "style_fontBold_displayName",
    value: defaultSettings.style.fontBold,
    options: {
      displayAsButton: true,
    },
  } as unknown as formattingSettings.ToggleSwitch);

  underline = new formattingSettings.ToggleSwitch({
    name: "underline",
    descriptionKey: "style_fontUnderline_description",
    displayNameKey: "style_fontUnderline_displayName",
    value: defaultSettings.style.fontUnderline,
    options: {
      displayAsButton: true,
    },
  } as unknown as formattingSettings.ToggleSwitch);

  fontColor = new formattingSettings.ColorPicker({
    name: "fontColor",
    value: { value: defaultSettings.style.fontColor },
  } as unknown as formattingSettings.ColorPicker);

  themeMode = new formattingSettings.AutoDropdown({
    name: "themeMode",
    descriptionKey: "style_themeMode_description",
    displayNameKey: "style_themeMode_displayName",
    value: defaultSettings.style.themeMode,
  } as unknown as formattingSettings.AutoDropdown);

  themeColor = new formattingSettings.ColorPicker({
    name: "themeColor",
    displayNameKey: "style_themeColor_displayName",
    descriptionKey: "style_themeColor_description",
    value: { value: defaultSettings.style.themeColor },
  } as unknown as formattingSettings.ColorPicker);

  fmtDate = new formattingSettings.AutoDropdown({
    name: "fmtDate",
    descriptionKey: "style_fmtDate_description",
    displayNameKey: "style_fmtDate_displayName",
    value: defaultSettings.style.fmtDate,
  } as unknown as formattingSettings.AutoDropdown);

  // 2. Define your inline groups following the layout pattern
  public textGroup: FormattingSettingsGroup = new formattingSettings.Group({
    name: "textGroup",
    displayNameKey: "style_font_displayName",
    descriptionKey: "style_font_description",
    slices: [
      this.themeFont,
      // this.fontFamily,
      this.fontSize,
      this.bold,
      this.italic,
      this.fontColor,
    ],
  } as unknown as FormattingSettingsGroup);

  public designGroup: FormattingSettingsGroup = new formattingSettings.Group({
    name: "designGroup",
    displayNameKey: "style_theme_displayName",
    descriptionKey: "style_theme_description",
    slices: [
      this.themeColor,
      this.themeMode,
      // this.fmtDate
    ],
  } as unknown as FormattingSettingsGroup);

  // 3. Swap out "slices" for the "groups" container array on the card
  groups: Array<FormattingSettingsGroup> = [this.textGroup, this.designGroup];
}

class CalendarSettings extends FormattingSettingsCard {
  name: string = "calendar";
  descriptionKey = "calendar_description";
  displayNameKey = "calendar_displayName";
  analyticsPane: boolean = false;
  uid: string = "calendarUid";

  startRange = new formattingSettings.AutoDropdown({
    name: "startRange",
    descriptionKey: "calendar_startRange_description",
    displayNameKey: "calendar_startRange_displayName",
    value: defaultSettings.calendar.startRange,
  } as unknown as formattingSettings.AutoDropdown);

  stepInit = new formattingSettings.AutoDropdown({
    name: "stepInit",
    descriptionKey: "calendar_stepInit_description",
    displayNameKey: "calendar_stepInit_displayName",
    value: defaultSettings.calendar.stepInit,
  } as unknown as formattingSettings.AutoDropdown);

  singleDay = new formattingSettings.ToggleSwitch({
    name: "singleDay",
    descriptionKey: "calendar_singleDay_description",
    displayNameKey: "calendar_singleDay_displayName",
    value: defaultSettings.calendar.singleDay,
  } as unknown as formattingSettings.ToggleSwitch);

  limitToScope = new formattingSettings.ToggleSwitch({
    name: "limitToScope",
    descriptionKey: "calendar_limitToScope_description",
    displayNameKey: "calendar_limitToScope_displayName",
    value: defaultSettings.calendar.limitToScope,
  } as unknown as formattingSettings.ToggleSwitch);

  forceStartRange = new formattingSettings.ToggleSwitch({
    name: "forceStartRange",
    descriptionKey: "calendar_forceStartRange_description",
    displayNameKey: "calendar_forceStartRange_displayName",
    value: defaultSettings.calendar.forceStartRange,
  } as unknown as formattingSettings.ToggleSwitch);

  slices: Array<FormattingSettingsSlice> = [
    this.singleDay,
    this.limitToScope,
    this.startRange,
    this.forceStartRange,
    this.stepInit,
  ];
}

class TimelineSettings extends FormattingSettingsGroup {
  name: string = "timeline";
  displayNameKey = "timeline_displayName";
  descriptionKey = "timeline_description";
  analyticsPane: boolean = false;
  uid: string = "timelineUid";

  enableSlider = new formattingSettings.ToggleSwitch({
    name: "enableSlider",
    descriptionKey: "timeline_enableSlider_description",
    displayNameKey: "timeline_enableSlider_displayName",
    value: defaultSettings.layout.timelineSettings.enableSlider,
  } as unknown as formattingSettings.ToggleSwitch);

  showSlider = new formattingSettings.ToggleSwitch({
    name: "showSlider",
    descriptionKey: "timeline_showSlider_description",
    displayNameKey: "timeline_showSlider_displayName",
    value: defaultSettings.layout.timelineSettings.showSlider,
  } as unknown as formattingSettings.ToggleSwitch);

  show2ndSlider = new formattingSettings.ToggleSwitch({
    name: "show2ndSlider",
    descriptionKey: "timeline_show2ndSlider_description",
    displayNameKey: "timeline_show2ndSlider_displayName",
    value: defaultSettings.layout.timelineSettings.show2ndSlider,
  } as unknown as formattingSettings.ToggleSwitch);

  slices: Array<FormattingSettingsSlice> = [
    this.enableSlider,
    this.showSlider,
    this.show2ndSlider,
  ];
}

class CurrentSettings extends FormattingSettingsGroup {
  name: string = "current";
  descriptionKey = "current_description";
  displayNameKey = "current_displayName";
  analyticsPane: boolean = false;
  uid: string = "currentUid";

  showCurrent = new formattingSettings.ToggleSwitch({
    name: "showCurrent",
    descriptionKey: "showCurrent_description",
    displayNameKey: "showCurrent_displayName",
    value: defaultSettings.layout.currentSettings.showCurrent,
  } as unknown as formattingSettings.ToggleSwitch);

  showIconText = new formattingSettings.ToggleSwitch({
    name: "showIconText",
    descriptionKey: "current_showIconText_description",
    displayNameKey: "current_showIconText_displayName",
    value: defaultSettings.layout.currentSettings.showIconText,
  } as unknown as formattingSettings.ToggleSwitch);

  showMore = new formattingSettings.ToggleSwitch({
    name: "showMore",
    descriptionKey: "current_showMore_description",
    displayNameKey: "current_showMore_displayName",
    value: defaultSettings.layout.currentSettings.showMore,
  } as unknown as formattingSettings.ToggleSwitch);

  scaleIconText = new formattingSettings.ToggleSwitch({
    name: "scaleIconText",
    descriptionKey: "current_scaleIconText_description",
    displayNameKey: "current_scaleIconText_displayName",
    value: defaultSettings.layout.currentSettings.scaleIconText,
  } as unknown as formattingSettings.ToggleSwitch);

  showCurrentInScopeOnly = new formattingSettings.ToggleSwitch({
    name: "showCurrentInScopeOnly",
    descriptionKey: "current_showCurrentInScopeOnly_description",
    displayNameKey: "current_showCurrentInScopeOnly_displayName",
    value: defaultSettings.layout.currentSettings.showCurrentInScopeOnly,
  } as unknown as formattingSettings.ToggleSwitch);

  topLevelSlice: formattingSettings.SimpleSlice = this.showCurrent;
  slices: Array<FormattingSettingsSlice> = [
    this.showIconText,
    this.scaleIconText,
    this.showCurrentInScopeOnly,
    this.showMore,
  ];
}

class MoveSettings extends FormattingSettingsGroup {
  name: string = "move";
  descriptionKey = "move_description";
  displayNameKey = "move_displayName";
  analyticsPane: boolean = true;
  uid: string = "moveUid";

  showMove = new formattingSettings.ToggleSwitch({
    name: "showMove",
    descriptionKey: "move_showMove_description",
    displayNameKey: "move_showMove_displayName",
    value: defaultSettings.layout.moveSettings.showMove,
  } as unknown as formattingSettings.ToggleSwitch);

  showExpand = new formattingSettings.ToggleSwitch({
    name: "showExpand",
    descriptionKey: "move_showExpand_description",
    displayNameKey: "move_showExpand_displayName",
    value: defaultSettings.layout.moveSettings.showExpand,
  } as unknown as formattingSettings.ToggleSwitch);

  topLevelSlice: formattingSettings.SimpleSlice = this.showMove;
  slices: Array<FormattingSettingsSlice> = [this.showExpand];
}

class HelpSettings extends FormattingSettingsGroup {
  name: string = "tooltip";
  descriptionKey = "assist_description";
  displayNameKey = "assist_displayName";
  uid: string = "tooltipUid";
  analyticsPane: boolean = true;
  visible: boolean = true;

  showTooltip = new formattingSettings.ToggleSwitch({
    name: "showTooltip",
    displayNameKey: "assist_showToolTip_displayName",
    descriptionKey: "assist_showToolTip_description",
    value: defaultSettings.layout.helpSettings.showTooltip,
  } as unknown as formattingSettings.ToggleSwitch);

  showExtendedTooltip = new formattingSettings.ToggleSwitch({
    name: "showExtendedTooltip",
    displayNameKey: "assist_showExtendedToolTip_displayName",
    descriptionKey: "assist_showExtendedToolTip_description",
    value: defaultSettings.layout.helpSettings.showExtendedTooltip,
  } as unknown as formattingSettings.ToggleSwitch);

  showHelpIcon = new formattingSettings.ToggleSwitch({
    name: "showHelpIcon",
    descriptionKey: "assist_showHelpIcon_description",
    displayNameKey: "assist_showHelpIcon_displayName",
    value: defaultSettings.layout.helpSettings.showHelpIcon,
  } as unknown as formattingSettings.ToggleSwitch);

  topLevelSlice: formattingSettings.SimpleSlice = this.showTooltip;
  slices: Array<FormattingSettingsSlice> = [
    this.showExtendedTooltip,
    this.showHelpIcon,
  ];
}

class LayoutSettings extends FormattingSettingsCompositeCard {
  name: string = "layout";
  displayNameKey = "layout_displayName";
  descriptionKey = "layout_description";
  analyticsPane: boolean = false;
  visible: boolean = true;

  // Replaced `new timelineSettings(Object())` with proper parameters matching the base Group class signature
  layoutTimeline = new TimelineSettings({ name: "timeline" });
  layoutMove = new MoveSettings({ name: "move" });
  layoutCurrent = new CurrentSettings({ name: "current" });
  layoutHelp = new HelpSettings({ name: "tooltip" });

  groups: Array<FormattingSettingsGroup> = [
    this.layoutCurrent,
    this.layoutMove,
    this.layoutTimeline,
    this.layoutHelp,
  ];
}

class DaySettings extends FormattingSettingsGroup {
  name: string = "day";
  descriptionKey = "day_description";
  displayNameKey = "day_displayName";
  analyticsPane: boolean = false;
  uid: string = "dayUid";

  showDay = new formattingSettings.ToggleSwitch({
    name: "showDay",
    value: defaultSettings.period.daySettings.showDay,
  } as unknown as formattingSettings.ToggleSwitch);

  fmtDay = new formattingSettings.AutoDropdown({
    name: "fmtDay",
    displayNameKey: "fmtDay_displayName",
    descriptionKey: "fmtDay_description",
    value: defaultSettings.period.daySettings.fmtDay,
  } as unknown as formattingSettings.AutoDropdown);

  daySkip = new formattingSettings.NumUpDown({
    name: "daySkip",
    displayNameKey: "daySkip_displayName",
    descriptionKey: "daySkip_description",
    value: defaultSettings.period.daySettings.daySkip,
    options: {
      minValue: {
        type: powerbi.visuals.ValidatorType.Min,
        value: 0,
      },
      maxValue: {
        type: powerbi.visuals.ValidatorType.Max,
        value: 365,
      },
    },
  } as unknown as formattingSettings.NumUpDown);

  topLevelSlice: formattingSettings.SimpleSlice = this.showDay;
  slices: Array<FormattingSettingsSlice> = [this.daySkip, this.fmtDay];
}

class WeekSettings extends FormattingSettingsGroup {
  name: string = "week";
  descriptionKey = "week_description";
  displayNameKey = "week_displayName";
  analyticsPane: boolean = false;
  uid: string = "weekUid";

  showWeek = new formattingSettings.ToggleSwitch({
    name: "showWeek",
    value: defaultSettings.period.weekSettings.showWeek,
  } as unknown as formattingSettings.ToggleSwitch);

  fmtWeek = new formattingSettings.AutoDropdown({
    name: "fmtWeek",
    displayNameKey: "fmtWeek_displayName",
    descriptionKey: "fmtWeek_description",
    value: defaultSettings.period.weekSettings.fmtWeek,
  } as unknown as formattingSettings.AutoDropdown);

  weekSkip = new formattingSettings.NumUpDown({
    name: "weekSkip",
    displayNameKey: "weekSkip_displayName",
    descriptionKey: "weekSkip_description",
    value: defaultSettings.period.weekSettings.weekSkip,
    options: {
      minValue: {
        type: powerbi.visuals.ValidatorType.Min,
        value: 0,
      },
      maxValue: {
        type: powerbi.visuals.ValidatorType.Max,
        value: 50,
      },
    },
  } as unknown as formattingSettings.NumUpDown);

  weekStartDay = new formattingSettings.AutoDropdown({
    name: "weekStartDay",
    descriptionKey: "weekStartDay_description",
    displayNameKey: "weekStartDay_displayName",
    value: defaultSettings.period.weekSettings.weekStartDay,
  } as unknown as formattingSettings.AutoDropdown);

  topLevelSlice: formattingSettings.SimpleSlice = this.showWeek;
  slices: Array<FormattingSettingsSlice> = [
    this.weekStartDay,
    this.weekSkip,
    this.fmtWeek,
  ];
}

class PaySettings extends FormattingSettingsGroup {
  name: string = "pay";
  displayNameKey = "pay_displayName";
  descriptionKey = "pay_description";
  analyticsPane: boolean = false;
  uid: string = "payUid";

  showPay = new formattingSettings.ToggleSwitch({
    name: "showPay",
    value: defaultSettings.period.paySettings.showPay,
  } as unknown as formattingSettings.ToggleSwitch);

  fmtPay = new formattingSettings.AutoDropdown({
    name: "fmtPay",
    displayNameKey: "fmtPay_displayName",
    descriptionKey: "fmtPay_description",
    value: defaultSettings.period.paySettings.fmtPay,
  } as unknown as formattingSettings.AutoDropdown);

  paySkip = new formattingSettings.NumUpDown({
    name: "paySkip",
    descriptionKey: "paySkip_description",
    displayNameKey: "paySkip_displayName",
    value: defaultSettings.period.paySettings.paySkip,
    options: {
      minValue: {
        type: powerbi.visuals.ValidatorType.Min,
        value: 0,
      },
      maxValue: {
        type: powerbi.visuals.ValidatorType.Max,
        value: 100,
      },
    },
  } as unknown as formattingSettings.NumUpDown);

  payLength = new formattingSettings.NumUpDown({
    name: "payLength",
    descriptionKey: "payLength_description",
    displayNameKey: "payLength_displayName",
    value: defaultSettings.period.paySettings.payLength,
  } as unknown as formattingSettings.NumUpDown);

  payRefDay = new formattingSettings.NumUpDown({
    name: "payRefDay",
    displayNameKey: "payRefDay_displayName",
    descriptionKey: "payRefDay_description",
    value: defaultSettings.period.paySettings.payRefDay,
  } as unknown as formattingSettings.NumUpDown);

  payRefMonth = new formattingSettings.AutoDropdown({
    name: "payRefMonth",
    displayNameKey: "payRefMonth_displayName",
    descriptionKey: "payRefMonth_description",
    value: defaultSettings.period.paySettings.payRefMonth,
  } as unknown as formattingSettings.AutoDropdown);

  payRefYear = new formattingSettings.NumUpDown({
    name: "payRefYear",
    displayNameKey: "payRefYear_displayName",
    descriptionKey: "payRefYear_description",
    value: defaultSettings.period.paySettings.payRefYear,
  } as unknown as formattingSettings.NumUpDown);

  payRefDate = new formattingSettings.DatePicker({
    placeholder: "Pay Period Reference Date",
    name: "payRefDate",
    displayNameKey: "payRefDate_displayName",
    descriptionKey: "payRefDate_description",
    value: new Date().toISOString(), // Fixes the serialization crash
  } as unknown as formattingSettings.DatePicker);

  payCustomLabel = new formattingSettings.TextInput({
    name: "payCustomLabel",
    displayNameKey: "payCustomLabel_displayName",
    descriptionKey: "payCustomLabel_description",
    placeholder: "Enter custom pay label",
    value: defaultSettings.period.paySettings.payCustomLabel,
  } as unknown as formattingSettings.TextInput);

  topLevelSlice: formattingSettings.SimpleSlice = this.showPay;
  slices: Array<FormattingSettingsSlice> = [
    this.payCustomLabel,
    this.paySkip,
    this.fmtPay,
    this.payLength,
    this.payRefDate,
  ];
}

class MonthSettings extends FormattingSettingsGroup {
  name: string = "month";
  descriptionKey = "month_description";
  displayNameKey = "month_displayName";
  analyticsPane: boolean = false;
  uid: string = "monthUid";

  showMonth = new formattingSettings.ToggleSwitch({
    name: "showMonth",
    value: defaultSettings.period.monthSettings.showMonth,
  } as unknown as formattingSettings.ToggleSwitch);

  fmtMonth = new formattingSettings.AutoDropdown({
    name: "fmtMonth",
    displayNameKey: "fmtMonth_displayName",
    descriptionKey: "fmtMonth_description",
    value: defaultSettings.period.monthSettings.fmtMonth,
  } as unknown as formattingSettings.AutoDropdown);

  monthSkip = new formattingSettings.NumUpDown({
    name: "monthSkip",
    displayNameKey: "monthSkip_displayName",
    descriptionKey: "monthSkip_description",
    value: defaultSettings.period.monthSettings.monthSkip,
    options: {
      minValue: {
        type: powerbi.visuals.ValidatorType.Min,
        value: 0,
      },
      maxValue: {
        type: powerbi.visuals.ValidatorType.Max,
        value: 24,
      },
    },
  } as unknown as formattingSettings.NumUpDown);

  topLevelSlice: formattingSettings.SimpleSlice = this.showMonth;
  slices: Array<FormattingSettingsSlice> = [this.monthSkip, this.fmtMonth];
}

class QuarterSettings extends FormattingSettingsGroup {
  name: string = "quarter";
  descriptionKey = "quarter_description";
  displayNameKey = "quarter_displayName";
  analyticsPane: boolean = false;
  uid: string = "quarterUid";

  showQuarter = new formattingSettings.ToggleSwitch({
    name: "showQuarter",
    value: defaultSettings.period.quarterSettings.showQuarter,
  } as unknown as formattingSettings.ToggleSwitch);

  fmtQuarter = new formattingSettings.AutoDropdown({
    name: "fmtQuarter",
    displayNameKey: "fmtQuarter_displayName",
    descriptionKey: "fmtQuarter_description",
    value: defaultSettings.period.quarterSettings.fmtQuarter,
  } as unknown as formattingSettings.AutoDropdown);

  quarterSkip = new formattingSettings.NumUpDown({
    name: "quarterSkip",
    displayNameKey: "quarterSkip_displayName",
    descriptionKey: "quarterSkip_description",
    value: defaultSettings.period.quarterSettings.quarterSkip,
    options: {
      minValue: {
        type: powerbi.visuals.ValidatorType.Min,
        value: 0,
      },
      maxValue: {
        type: powerbi.visuals.ValidatorType.Max,
        value: 12,
      },
    },
  } as unknown as formattingSettings.NumUpDown);

  topLevelSlice: formattingSettings.SimpleSlice = this.showQuarter;
  slices: Array<FormattingSettingsSlice> = [this.quarterSkip, this.fmtQuarter];
}

class YearSettings extends FormattingSettingsGroup {
  name: string = "year";
  displayNameKey = "year_displayName";
  descriptionKey = "year_description";
  analyticsPane: boolean = false;
  uid: string = "yearUid";

  showYear = new formattingSettings.ToggleSwitch({
    name: "showYear",
    value: defaultSettings.period.yearSettings.showYear,
  } as unknown as formattingSettings.ToggleSwitch);

  fmtYear = new formattingSettings.AutoDropdown({
    name: "fmtYear",
    displayNameKey: "fmtYear_displayName",
    descriptionKey: "fmtYear_description",
    value: defaultSettings.period.yearSettings.fmtYear,
  } as unknown as formattingSettings.AutoDropdown);

  yearSkip = new formattingSettings.NumUpDown({
    name: "yearSkip",
    displayNameKey: "yearSkip_displayName",
    descriptionKey: "yearSkip_description",
    value: defaultSettings.period.yearSettings.yearSkip,
    options: {
      minValue: {
        type: powerbi.visuals.ValidatorType.Min,
        value: 0,
      },
      maxValue: {
        type: powerbi.visuals.ValidatorType.Max,
        value: 10,
      },
    },
  } as unknown as formattingSettings.NumUpDown);

  yearStartMonth = new formattingSettings.AutoDropdown({
    name: "yearStartMonth",
    descriptionKey: "yearStartMonth_description",
    displayNameKey: "yearStartMonth_displayName",
    value: defaultSettings.period.yearSettings.yearStartMonth,
  } as unknown as formattingSettings.AutoDropdown);

  topLevelSlice: formattingSettings.SimpleSlice = this.showYear;
  slices: Array<FormattingSettingsSlice> = [
    this.yearStartMonth,
    this.yearSkip,
    this.fmtYear,
  ];
}

class PeriodSettings extends FormattingSettingsCompositeCard {
  name: string = "period";
  displayNameKey = "period_displayName";
  descriptionKey = "period_description";
  analyticsPane: boolean = false;
  visible: boolean = true;

  periodDay = new DaySettings({ name: "day" });
  periodWeek = new WeekSettings({ name: "week" });
  periodPay = new PaySettings({ name: "pay" });
  periodMonth = new MonthSettings({ name: "month" });
  periodQuarter = new QuarterSettings({ name: "quarter" });
  periodYear = new YearSettings({ name: "year" });

  groups: Array<FormattingSettingsGroup> = [
    this.periodDay,
    this.periodWeek,
    this.periodPay,
    this.periodMonth,
    this.periodQuarter,
    this.periodYear,
  ];
}
