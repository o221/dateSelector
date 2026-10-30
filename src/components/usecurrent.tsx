import * as React from "react";
import Box from "@mui/material/Box";
import ToggleButton from "@mui/material/ToggleButton";
import Typography from "@mui/material/Typography";
import { endOfDay, startOfDay } from "date-fns";

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
  const safeScaleIconText = scaleIconText ?? false;
  const safeShowCurrentInScopeOnly = showCurrentInScopeOnly ?? true;

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
    () => (safeScaleIconText ? clamp(themeFontSize * 1.2, 12, 24) : 16),
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
    () => (safeShowIconText ? clamp(labelFontSize * 0.35, 3, 6) : 0),
    [clamp, labelFontSize, safeShowIconText],
  );

  /*
   * Gap between separate controls.
   *
   * This is intentionally independent of the icon/text gap.
   */
  const controlGap = React.useMemo(
    () => (safeShowIconText ? 2 : 0),
    [safeShowIconText],
  );

  const [ttl, setTtl] = React.useState(true);

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

  const toggleTtl = React.useCallback(() => {
    setTtl((prev) => !prev);
  }, []);

  /*
   * --------------------------------------------------------------------------
   * Render
   * --------------------------------------------------------------------------
   */

  if (!safeShowCurrent) {
    return null;
  }

  return (
    <Box
      sx={{
        pl: 0,

        /*
         * The controls are independent items rather than a MUI ButtonGroup.
         *
         * This allows the browser to determine each item's natural width
         * from its actual contents.
         */
        display: "inline-flex",
        alignItems: "center",
        gap: `${controlGap}px`,

        /*
         * Prevent the collection itself from introducing unexpected wrapping.
         */
        whiteSpace: "nowrap",
      }}
    >
      {safeCurrent
        .filter((item: any) => {
          if (item.thisRange !== null) {
            const showItem = ttl ? item.menu !== "2" : item.menu === "2";

            const withinScope = safeShowCurrentInScopeOnly
              ? isRangeFullyContainedInScope(item.thisRange, normalizedScope)
              : true;

            return item.show && showItem && withinScope;
          }

          return showMore;
        })
        .map((item: any, index: number) => {
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

          return (
            <DateIntervalPicker
              handleVal={handleDate}
              item={item}
              key={`dip${item.thisRange}${index}`}
              localization={i18n}
            >
              <RngeTooltip
                title={undefined}
                key={`rtt${item.thisRange}${index}`}
                detailRow={
                  item.menu !== "2" && item.menu !== "12"
                    ? `${i18n.getDisplayName(
                        "useCurrentRightClick",
                      )} [${item.plural}]`
                    : ""
                }
                placement="bottom"
                topRow={
                  item.tip +
                  (item.step === safeStepValue && item.menu !== "2"
                    ? " (T)"
                    : "")
                }
              >
                <ToggleButton
                  size="small"
                  color="primary"
                  selected={isSelected}
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
                    "&.Mui-selected": {
                      border: 1,
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
                        width: `${iconSize}px`,
                        height: `${iconSize}px`,
                        flex: `0 0 ${iconSize}px`,

                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",

                        lineHeight: 1,
                        color: "inherit",

                        "& svg": {
                          width: "100%",
                          height: "100%",
                          display: "block",
                        },
                      }}
                    >
                      {item.icon}
                    </Box>

                    {safeShowIconText && (
                      <Typography
                        component="span"
                        sx={{
                          color: isSelected ? "inherit" : "text.secondary",

                          display: "inline-block",

                          fontSize: `${labelFontSize}px`,
                          lineHeight: 1,

                          whiteSpace: "nowrap",

                          m: 0,
                          p: 0,
                        }}
                      >
                        {item.thisPeriod}
                      </Typography>
                    )}
                  </Box>
                </ToggleButton>
              </RngeTooltip>
            </DateIntervalPicker>
          );
        })}
    </Box>
  );
}
