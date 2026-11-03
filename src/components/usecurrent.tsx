import * as React from "react";
import Box from "@mui/material/Box";
import Badge from "@mui/material/Badge";
import ToggleButton from "@mui/material/ToggleButton";
import Typography from "@mui/material/Typography";
import { endOfDay, format, startOfDay } from "date-fns";
import LinearScale from "@mui/icons-material/LinearScale";

import { dateCardProps, dateRange } from "../interface";
import RngeTooltip from "./rngetooltip";
import DateIntervalPicker from "./dateintervalpicker";
import { useLocalization } from "../localeutils";
import { clampRangeToScope, isRangeFullyContainedInScope } from "../dateutils";

export default function UseCurrent(props: dateCardProps) {
  const {
    rangeScope,
    showMore,
    showCurrent,
    showIconText,
    showStartIconText,
    scaleIconText,
    showCurrentInScopeOnly,
    current,
    dates,
    stepValue,
    singleDay,
    fontSize,
    handleVal,
    handleStep,
    localization,
    startupFilter,
    startRange,
    showStartupRangeButton,
    hideIfCurrent,
  } = props;


  const fallbackLocalization = useLocalization();
  const i18n = localization ?? fallbackLocalization;

  const safeRangeScope = rangeScope ?? {
    start: new Date(),
    end: new Date(),
  };

  const normalizedScope = React.useMemo(
    () => ({
      start: startOfDay(safeRangeScope.start),
      end: endOfDay(safeRangeScope.end),
    }),
    [safeRangeScope],
  );

  const safeStepValue = stepValue ?? "day";
  const safeCurrent = current ?? [];
  const safeShowCurrent = showCurrent ?? false;
  const safeShowIconText = showIconText ?? false;
  const safeShowStartIconText = showStartIconText ?? false;
  const safeScaleIconText = scaleIconText ?? false;
  const safeShowCurrentInScopeOnly = showCurrentInScopeOnly ?? true;

  const currentPeriodLabelEnabled = safeShowIconText;
  const startupPeriodLabelEnabled = safeShowStartIconText;

  const toDate = React.useCallback((value: unknown): Date | null => {
    if (value instanceof Date) {
      return isNaN(value.getTime()) ? null : value;
    }

    if (typeof value === "string" || typeof value === "number") {
      const parsed = new Date(value);
      return isNaN(parsed.getTime()) ? null : parsed;
    }

    return null;
  }, []);

  const isSameLocalDay = React.useCallback(
    (left: unknown, right: unknown): boolean => {
      const leftDate = toDate(left);
      const rightDate = toDate(right);
      if (!leftDate || !rightDate) {
        return false;
      }

      return (
        leftDate.getFullYear() === rightDate.getFullYear() &&
        leftDate.getMonth() === rightDate.getMonth() &&
        leftDate.getDate() === rightDate.getDate()
      );
    },
    [toDate],
  );

  const isSameRangeByLocalDay = React.useCallback(
    (left?: dateRange | null, right?: dateRange | null): boolean => {
      if (!left || !right) {
        return false;
      }

      return (
        isSameLocalDay(left.start, right.start) &&
        isSameLocalDay(left.end, right.end)
      );
    },
    [isSameLocalDay],
  );

  /*
   * --------------------------------------------------------------------------
   * Layout / sizing
   * --------------------------------------------------------------------------
   *
   * There is deliberately only one source of scale here: the theme font size.
   *
   * The browser is responsible for determining the width of the text.
   * We do NOT estimate text width from character count because that becomes
   * unreliable as soon as the theme font changes.
   */

  const clamp = React.useCallback(
    (value: number, min: number, max: number) =>
      Math.min(max, Math.max(min, value)),
    [],
  );

  const themeFontSize = fontSize ?? 10;

  /*
   * Label font:
   * - fixed 10px when scaling is disabled
   * - proportional to the theme font when scaling is enabled
   */
  const labelFontSize = React.useMemo(
    () => (safeScaleIconText ? clamp(themeFontSize * 0.66, 8, 18) : 8),
    [clamp, safeScaleIconText, themeFontSize],
  );

  /*
   * Icon:
   * Keep the icon slightly larger than the accompanying label.
   *
   * The explicit width/height gives us a predictable footprint regardless
   * of which MUI icon is supplied.
   */
  const iconSize = React.useMemo(
    () => (safeScaleIconText ? clamp(themeFontSize * 1.2, 12, 24) : 18),
    [clamp, safeScaleIconText, themeFontSize],
  );

  /*
   * Padding around each clickable item.
   */
  const controlPadding = React.useMemo(
    () => (safeScaleIconText ? clamp(themeFontSize * 0.25, 2, 6) : 2),
    [clamp, safeScaleIconText, themeFontSize],
  );

  /*
   * Gap between icon and its label.
   */
  const iconTextGap = React.useMemo(
    () =>
      currentPeriodLabelEnabled || startupPeriodLabelEnabled
        ? clamp(labelFontSize * 0.35, 3, 6)
        : 0,
    [
      clamp,
      currentPeriodLabelEnabled,
      labelFontSize,
      startupPeriodLabelEnabled,
    ],
  );

  /*
   * Gap between separate controls.
   *
   * This is intentionally independent of the icon/text gap.
   */
  const controlGap = React.useMemo(
    () => (currentPeriodLabelEnabled || startupPeriodLabelEnabled ? 2 : 0),
    [currentPeriodLabelEnabled, startupPeriodLabelEnabled],
  );

  const [ttl, setTtl] = React.useState(true);

  const startupRangeButton = React.useMemo(() => {
    if (!showStartupRangeButton || !startupFilter) {
      return null;
    }

    const alreadyPresent = safeCurrent.some(
      (item: any) =>
        item.thisRange && isSameRangeByLocalDay(item.thisRange, startupFilter),
    );

    if (alreadyPresent && hideIfCurrent) {
      return null;
    }

    const fallbackRangeLabel =
      i18n.getDisplayName("calendar_startRange_displayName") ||
      i18n.getDisplayName("startRange_sync") ||
      "Start Range";

    const buttonLabel =
      startRange && startRange !== "custom"
        ? i18n.getDisplayName(`startRange_${startRange}`) || fallbackRangeLabel
        : fallbackRangeLabel;

    const isSelected = !!(dates && isSameRangeByLocalDay(dates, startupFilter));
    const rangeDescription = buttonLabel;
    const tooltipRangeText = `${format(startupFilter.start, "yyyy-MM-dd")} - ${format(startupFilter.end, "yyyy-MM-dd")}`;

    console.log("[UseCurrent] startupRangeButton built successfully", {
      buttonLabel,
      isSelected,
      rangeDescription,
    });

    return {
      menu: "startupRange",
      tip: buttonLabel,
      plural: buttonLabel,
      step: safeStepValue,
      show: true,
      thisPeriod: rangeDescription,
      thisRange: startupFilter,
      icon: <LinearScale style={{ fontSize: "inherit" }} color="primary" />,
      isSelected,
      tooltipText: isSelected
        ? rangeDescription
        : `${i18n.getDisplayName("dateRangeResetTo")} ${rangeDescription}`,
      detailText: tooltipRangeText,
    };
  }, [
    showStartupRangeButton,
    startupFilter,
    safeCurrent,
    i18n,
    isSameRangeByLocalDay,
    safeStepValue,
    startRange,
    dates,
    hideIfCurrent,
  ]);

  const currentItems = React.useMemo(() => {
    const visible = safeCurrent.filter((item: any) => {
      if (item.thisRange !== null) {
        const showItem = ttl ? item.menu !== "2" : item.menu === "2";

        const withinScope = safeShowCurrentInScopeOnly
          ? isRangeFullyContainedInScope(item.thisRange, normalizedScope)
          : true;

        return item.show && showItem && withinScope;
      }

      return showMore;
    });

    return visible;
  }, [safeCurrent, safeShowCurrentInScopeOnly, normalizedScope, ttl, showMore]);

  const visibleItems = React.useMemo(() => {
    const items = safeShowCurrent ? currentItems : [];
    // Startup range button is shown independently of safeShowCurrent
    const result = startupRangeButton ? [startupRangeButton, ...items] : items;
    console.log("[UseCurrent] visibleItems updated:", {
      startupRangeButton,
      itemCount: result.length,
      safeShowCurrent,
      currentItemsCount: currentItems.length,
    });
    return result;
  }, [currentItems, startupRangeButton, safeShowCurrent]);

  /*
   * --------------------------------------------------------------------------
   * Event handlers
   * --------------------------------------------------------------------------
   */

  const handleDate = React.useCallback(
    (val: dateRange) => {
      const newDates: [Date, Date] = [
        val.start,
        singleDay ? val.start : val.end,
      ];

      handleVal?.(newDates);
    },
    [handleVal, singleDay],
  );

  const handleStepChange = React.useCallback(
    (val: string) => {
      const newValue = val === "today" ? "day" : val;
      handleStep?.(newValue);
    },
    [handleStep],
  );

  const formatToolTipRange = React.useCallback(
    (range?: dateRange | null) => {
      if (!range) {
        return undefined;
      }

      const start = toDate(range.start);
      const end = toDate(range.end);

      if (!start || !end) {
        return undefined;
      }

      return `${format(start, "yyyy-MM-dd")} - ${format(end, "yyyy-MM-dd")}`;
    },
    [toDate],
  );

  const toggleTtl = React.useCallback(() => {
    setTtl((prev) => !prev);
  }, []);

  /*
   * --------------------------------------------------------------------------
   * Render
   * --------------------------------------------------------------------------
   */

  if (!safeShowCurrent && !startupRangeButton) {
    console.log("[UseCurrent] Early return - both hidden:", {
      safeShowCurrent,
      startupRangeButton,
    });
    return null;
  }

  return (
    <Box
      sx={{
        pl: 0,
        display: "inline-flex",
        alignItems: "center",
        gap: `${controlGap}px`,
        whiteSpace: "nowrap",
      }}
    >
      {visibleItems.map((item: any, index: number) => {
        const isStartupRangeButton = item.menu === "startupRange";
        console.log(`[UseCurrent] Rendering item ${index}:`, {
          menu: item.menu,
          isStartupRangeButton,
          tip: item.tip,
        });
        const selectedRange: dateRange | null = item.thisRange
          ? {
              start: item.thisRange.start,
              end: singleDay ? item.thisRange.start : item.thisRange.end,
            }
          : null;
        const selectedComparableRange =
          selectedRange && props.limitToScope
            ? clampRangeToScope(selectedRange, normalizedScope)
            : selectedRange;
        const isSelected = !!(
          selectedComparableRange &&
          dates &&
          isSameRangeByLocalDay(dates, selectedComparableRange)
        );
        const effectiveSelected = isStartupRangeButton
          ? (item.isSelected ?? isSelected)
          : isSelected;
        const shouldShowButtonText = isStartupRangeButton
          ? startupPeriodLabelEnabled
          : currentPeriodLabelEnabled;
        const buttonLabel = item.thisPeriod ?? item.tip;

        const buttonContents = (
          <ToggleButton
            size="small"
            color="primary"
            selected={effectiveSelected}
            value={item.tip.toLowerCase().trim()}
            onClick={() => {
              if (item.thisRange) {
                handleDate(item.thisRange);
                handleStepChange(item.step);
              } else {
                toggleTtl();
              }
            }}
            sx={{
              minWidth: 0,
              p: `${controlPadding}px`,
              textTransform: "none",
              borderRadius: "5px",
              border: 0,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              whiteSpace: "nowrap",
              color: "inherit",
              backgroundColor: "transparent",
              "&.Mui-selected": {
                border: 1,
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
            }}
          >
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: `${iconTextGap}px`,
                lineHeight: 1,
                whiteSpace: "nowrap",
              }}
            >
              <Box
                sx={{
                  width: isStartupRangeButton
                    ? `${Math.max(iconSize, 18)}px`
                    : `${iconSize}px`,
                  height: isStartupRangeButton
                    ? `${Math.max(iconSize, 18)}px`
                    : `${iconSize}px`,
                  flex: isStartupRangeButton
                    ? `0 0 ${Math.max(iconSize, 18)}px`
                    : `0 0 ${iconSize}px`,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  lineHeight: 1,
                  color: "inherit",
                  "& svg": {
                    width: isStartupRangeButton
                      ? `${Math.max(iconSize, 18)}px`
                      : `${iconSize}px`,
                    height: isStartupRangeButton
                      ? `${Math.max(iconSize, 18)}px`
                      : `${iconSize}px`,
                    display: "block",
                  },
                }}
              >
                {item.icon}
              </Box>

              {!isStartupRangeButton && currentPeriodLabelEnabled && (
                <Typography
                  component="span"
                  sx={{
                    color: effectiveSelected ? "inherit" : "text.secondary",
                    display: "inline-block",
                    fontSize: `${labelFontSize}px`,
                    lineHeight: 1,
                    whiteSpace: "nowrap",
                    m: 0,
                    p: 0,
                    fontWeight: effectiveSelected ? 600 : 400,
                  }}
                >
                  {buttonLabel}
                </Typography>
              )}

              {isStartupRangeButton && startupPeriodLabelEnabled && (
                <Typography
                  component="span"
                  sx={{
                    color: effectiveSelected ? "inherit" : "text.secondary",
                    display: "inline-block",
                    fontSize: `${labelFontSize}px`,
                    lineHeight: 1,
                    whiteSpace: "nowrap",
                    m: 0,
                    p: 0,
                    fontWeight: effectiveSelected ? 600 : 400,
                  }}
                >
                  {buttonLabel}
                </Typography>
              )}
            </Box>
          </ToggleButton>
        );

        const tooltip = isStartupRangeButton ? (
          <RngeTooltip
            key={`rtt${item.thisRange ?? item.menu}${index}`}
            title={item.tooltipText ?? item.tip}
            detailRow={
              item.detailText ?? formatToolTipRange(item.thisRange) ?? undefined
            }
            placement="bottom"
          >
            {buttonContents}
          </RngeTooltip>
        ) : (
          <DateIntervalPicker
            handleVal={handleDate}
            item={item}
            key={`dip${item.thisRange ?? item.menu}${index}`}
            localization={i18n}
          >
            <RngeTooltip
              title={undefined}
              key={`rtt${item.thisRange ?? item.menu}${index}`}
              detailRow={
                item.menu !== "2" && item.menu !== "12"
                  ? `${i18n.getDisplayName("useCurrentRightClick")} [${item.plural}]`
                  : ""
              }
              placement="bottom"
              topRow={
                item.tip +
                (item.step === safeStepValue && item.menu !== "2" ? " (T)" : "")
              }
            >
              {buttonContents}
            </RngeTooltip>
          </DateIntervalPicker>
        );

        return (
          <React.Fragment
            key={`fragment${item.thisRange ?? item.menu}${index}`}
          >
            {tooltip}
          </React.Fragment>
        );
      })}
    </Box>
  );
}
