import * as React from "react";
import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import RefreshIcon from "@mui/icons-material/Refresh";
// import Remove from "@mui/icons-material/Remove";
import { useTheme } from "@mui/material/styles";
import { format, parse, isValid, isEqual, isWithinInterval } from "date-fns";

import { useInputParms } from "../dateutils";
import { DateField } from "./datefield";
import { useHelpContext } from "./helpprovider";
import RngeTooltip from "./rngetooltip";
import { dateCardProps, dateRange } from "../interface";
import { useDateFnsLocale, useLocalization } from "../localeutils";
import HorizontalRule from "@mui/icons-material/HorizontalRule";
import LinearScale from "@mui/icons-material/LinearScale";
import Badge from "@mui/material/Badge";
import { styled } from "@mui/material/styles";

// DateRange input with optional reset.
// Uses the sync value if available; otherwise falls back to preset startup filter or scope.
// The reset button appears on the separator only when a startup value exists.

const DateRange = (props: dateCardProps) => {
  const {
    dates,
    rangeScope,
    handleVal,
    singleDay,
    startupFilter,
    startRange,
    localization,
  } = props;
  const fallbackLocalization = useLocalization();
  const i18n = localization ?? fallbackLocalization;
  const applyOnDateSelect = props.applyOnDateSelect ?? false;
  const safeDates = dates ??
    startupFilter ??
    rangeScope ?? { start: new Date(), end: new Date() };
  const safeRangeScope = rangeScope ?? safeDates;

  const locale = useDateFnsLocale();

  const theme = useTheme();
  const { showExtendedTooltip } = useHelpContext();

  const tipDesc = `startRange_${startRange ?? ""}`;
  const tipDescription =
    i18n.getDisplayName(tipDesc) && i18n.getDisplayName(tipDesc) !== tipDesc
      ? i18n.getDisplayName(tipDesc)
      : "Start Range";

  const [startText, setStartText] = useState(() =>
    format(safeDates.start, "yyyy-MM-dd", { locale }),
  );
  const [endText, setEndText] = useState(() =>
    format(safeDates.end, "yyyy-MM-dd", { locale }),
  );

  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    setStartText(format(safeDates.start, "yyyy-MM-dd", { locale }));
    setEndText(format(safeDates.end, "yyyy-MM-dd", { locale }));
  }, [safeDates, locale]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (id === "start") setStartText(value);
    else setEndText(value);

    if (!applyOnDateSelect || value.length !== 10) {
      return;
    }

    const parsedDate = parse(value, "yyyy-MM-dd", new Date());
    if (
      isValid(parsedDate) &&
      format(parsedDate, "yyyy-MM-dd", { locale }) === value
    ) {
      doUpdate(id as "start" | "end", value);
    }
  };

  // const handleDate = (val: dateRange) => {
  //   handleVal([val.start, singleDay ? val.start : val.end]);
  // };

  // ✅ memoized handler avoids redundant renders
  const handleDate = React.useCallback(
    (val: dateRange) => {
      // console.log(
      //   "DateRange dates:",
      //   format(val.start, "dd/MM/yy"),
      //   format(val.end, "dd/MM/yy")
      // );

      const newDates: [Date, Date] = [
        val.start,
        singleDay ? val.start : val.end,
      ];

      setStartText(format(newDates[0], "yyyy-MM-dd", { locale }));
      setEndText(format(newDates[1], "yyyy-MM-dd", { locale }));

      handleVal?.(newDates);
    },
    [handleVal, singleDay, locale],
  );

  const input = useInputParms();

  const dateSpan = React.useMemo(() => {
    return input(safeDates, safeRangeScope);
  }, [input, safeDates, safeRangeScope]);

  const topRow = showExtendedTooltip
    ? i18n.getDisplayName("dateRangeTopRow")
    : dateSpan.string;

  const doUpdate = (id: "start" | "end", value: string) => {
    const dte = parse(value, "yyyy-MM-dd", new Date());
    if (isValid(dte)) {
      // When limitToScope is ON, reject dates that fall outside the scope entirely
      if (props.limitToScope && !isWithinInterval(dte, safeRangeScope)) {
        setStartText(format(safeDates.start, "yyyy-MM-dd", { locale }));
        setEndText(format(safeDates.end, "yyyy-MM-dd", { locale }));
        return;
      }
      if (id === "start") handleVal?.([dte, safeDates.end]);
      else handleVal?.([safeDates.start, dte]);
    } else {
      setStartText(format(safeDates.start, "yyyy-MM-dd", { locale }));
      setEndText(format(safeDates.end, "yyyy-MM-dd", { locale }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    doUpdate(e.target.id as "start" | "end", e.target.value);
  };

  // 🔑 determine if reset is available
  const canReset =
    startupFilter &&
    (!isEqual(safeDates.start, startupFilter.start) ||
      !isEqual(safeDates.end, startupFilter.end));

  const showRefresh = hovered && canReset;

  // Always enforce scope min/max on the native date pickers (blocks out-of-scope
  // dates in the calendar overlay and constrains the day/month/year spinners).
  const scopeMinDate = format(safeRangeScope.start, "yyyy-MM-dd", { locale });
  const scopeMaxDate = format(safeRangeScope.end, "yyyy-MM-dd", { locale });

  return (
    <Grid container spacing={0.5} sx={{ paddingLeft: 0.3 }}>
      <Grid size="grow">
        <RngeTooltip
          topRow={topRow}
          detailRow={dateSpan.string}
          infoRow={dateSpan.info}
          placement="bottom-start"
        >
          <DateField
            id="start"
            value={startText}
            min={scopeMinDate}
            max={
              singleDay
                ? scopeMaxDate
                : endText < scopeMaxDate
                  ? endText
                  : scopeMaxDate
            }
            error={!dateSpan.toValid}
            onBlur={handleBlur}
            doUpdate={doUpdate}
            onChange={handleInput}
            {...props}
          />
        </RngeTooltip>
      </Grid>

      {!singleDay && (
        <>
          <RngeTooltip
            topRow={
              canReset
                ? `${i18n.getDisplayName("dateRangeResetTo")} ${tipDescription}`
                : tipDescription
            }
            infoRow={
              canReset && startupFilter
                ? `${format(startupFilter.start, "yyyy-MM-dd", { locale })}${
                    startupFilter.start !== startupFilter.end
                      ? " - " +
                        format(startupFilter.end, "yyyy-MM-dd", { locale })
                      : ""
                  }`
                : undefined
            }
            placement="bottom-start"
          >
            <span
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            >
              {showRefresh ? (
                <IconButton
                  size="small"
                  onClick={() =>
                    canReset && startupFilter
                      ? handleDate(startupFilter)
                      : undefined
                  }
                >
                  <RefreshIcon
                    style={{ fontSize: theme.typography.fontSize }}
                  />
                </IconButton>
              ) : (
                <IconButton size="small" disabled={!canReset}>
                  {canReset ? (
                    <Badge
                      color="warning"
                      variant="dot"
                      badgeContent=" "
                      sx={{
                        // Use a CSS selector to target the dot class
                        "& .MuiBadge-dot": {
                          width: "4px !important",
                          height: "4px !important",
                          borderRadius: "50% !important",
                          right: 0,
                          top: 0,
                          // Optional: Remove any minimum size constraints that might be overriding
                          minWidth: "2px !important",
                          minHeight: "2px !important",
                          padding: "0 !important",
                        },
                      }}
                    >
                      <LinearScale
                        style={{ fontSize: theme.typography.fontSize }}
                        color={canReset ? "success" : "disabled"}
                      ></LinearScale>
                    </Badge>
                  ) : (
                    <HorizontalRule
                      style={{ fontSize: theme.typography.fontSize }}
                      color={canReset ? "success" : "disabled"}
                    ></HorizontalRule>
                  )}{" "}
                </IconButton>
              )}
            </span>
          </RngeTooltip>

          <Grid size="grow">
            <RngeTooltip
              topRow={topRow}
              detailRow={dateSpan.string}
              infoRow={dateSpan.info}
              placement="bottom-start"
            >
              <DateField
                id="end"
                value={endText}
                min={startText > scopeMinDate ? startText : scopeMinDate}
                max={scopeMaxDate}
                error={!dateSpan.toValid}
                onBlur={handleBlur}
                doUpdate={doUpdate}
                onChange={handleInput}
                {...props}
              />
            </RngeTooltip>
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default React.memo(DateRange);
