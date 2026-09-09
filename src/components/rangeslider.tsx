/*
This component renders a dual-thumb slider for selecting a date range.
It handles state for the slider values and translates them to and from
date objects based on the provided props.
*/
import * as React from "react";
import { dateCardProps } from "../interface";
import DualSlider from "./dualslider";
import {
  mainMarks,
  superMarks,
  sliderMarkNumber,
  sliderMarkDate,
  sliderMarkText,
} from "../dateutils";
import { useDateFnsLocale } from "../localeutils";
import {
  endOfMonth,
  endOfQuarter,
  endOfYear,
  subMonths,
  subQuarters,
  subYears,
} from "date-fns";

type Props = dateCardProps & {
  onPreview: (range: [Date, Date]) => void;
  onCommit: (range: [Date, Date]) => void;
};

/**
 * A component that renders a dual-thumb slider for selecting a date range.
 */
export default function RangeSlider(props: Props) {
  const {
    rangeScope,
    dates,
    show2ndSlider,
    singleDay,
    stepValue,
    onPreview,
    onCommit,
    localization,
  } = props;

  // Use a stable fallback date (today) instead of epoch (1970)
  const fallbackDate = React.useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Strict property verification to identify genuinely missing data vs empty configurations
  const hasValidDates = !!(
    dates &&
    dates.start &&
    dates.end &&
    !isNaN(new Date(dates.start).getTime()) &&
    new Date(dates.start).getFullYear() > 1970
  );
  const hasValidRange = !!(
    rangeScope &&
    rangeScope.start &&
    rangeScope.end &&
    !isNaN(new Date(rangeScope.start).getTime()) &&
    new Date(rangeScope.start).getFullYear() > 1970
  );

  const safeDates = hasValidDates
    ? dates!
    : { start: fallbackDate, end: fallbackDate };
  const safeRangeScope = hasValidRange ? rangeScope! : safeDates;

  // Get locale at the component level
  const locale = useDateFnsLocale();

  // Create a guarded version of props to safely pass down to the mark utilities
  const guardedProps = React.useMemo(() => {
    return {
      ...props,
      dates: safeDates,
      rangeScope: safeRangeScope,
    };
  }, [props, safeDates, safeRangeScope]);

  // softBail tells us whether we should skip resource-heavy mark generation
  const softBail = !props.landingOff || !hasValidRange || !hasValidDates;

  // Memoize the marks array using guarded props to prevent crashes inside mainMarks
  const marks = React.useMemo(() => {
    if (softBail) {
      return [0];
    }
    try {
      const generatedMarks = mainMarks(guardedProps, locale);
      if (!generatedMarks || !Array.isArray(generatedMarks)) return [0];
      return generatedMarks.map((v: { value: number }) => v?.value ?? 0);
    } catch (e) {
      console.warn("Failed to generate main marks safely:", e);
      return [0];
    }
  }, [guardedProps, locale, softBail]);

  // State for the slider's numerical values, synchronized with props.dates.
  const [sliderStart, setSliderStart] = React.useState<number>(() =>
    sliderMarkNumber(safeDates.start, safeRangeScope.start),
  );
  const [sliderEnd, setSliderEnd] = React.useState<number>(() =>
    sliderMarkNumber(safeDates.end, safeRangeScope.start),
  );
  const sliderMax = React.useMemo(
    () => sliderMarkNumber(safeRangeScope.end, safeRangeScope.start) || 1,
    [safeRangeScope.end, safeRangeScope.start],
  );

  // Ref to store the initial values and range length at the start of a Ctrl+drag
  const dragStartRef = React.useRef<{
    start: number;
    end: number;
    length: number;
  } | null>(null);

  // Effect to keep the slider values in sync with changes to the dates prop.
  React.useEffect(() => {
    // If we shouldn't process or if parameters are blank, clear to zero state safely
    if (softBail) {
      setSliderStart(0);
      setSliderEnd(1);
      return;
    }

    const startNum = sliderMarkNumber(safeDates.start, safeRangeScope.start);
    const endNum = sliderMarkNumber(safeDates.end, safeRangeScope.start);
    const maxNum = sliderMarkNumber(safeRangeScope.end, safeRangeScope.start);

    setSliderStart(startNum);
    setSliderEnd(Math.min(endNum, maxNum));
  }, [safeDates, safeRangeScope, softBail]);

  /**
   * Finds the closest valid mark value to the given slider value(s).
   */
  const closestMark = React.useCallback(
    (val: number[]) => {
      if (!marks || marks.length === 0) return val;
      return val.map((x) => {
        let closestValue = marks[0];
        let minDiff = Math.abs(x - closestValue);

        for (let i = 1; i < marks.length; i++) {
          const currentDiff = Math.abs(x - marks[i]);
          if (currentDiff < minDiff) {
            minDiff = currentDiff;
            closestValue = marks[i];
          }
        }
        return closestValue;
      });
    },
    [marks],
  );

  const adjustEndValue = React.useCallback(
    (value: number) => {
      const shouldEndAtPeriodBoundary =
        stepValue === "month" ||
        stepValue === "quarter" ||
        stepValue === "year";

      if (!shouldEndAtPeriodBoundary) return value;
      if (!marks || marks.length === 0) return value;
      if (!marks.includes(value)) return value;

      return Math.max(0, value - 1);
    },
    [marks, stepValue],
  );

  const toRangeDates = React.useCallback(
    (values: [number, number]) => {
      const [startValue, endValue] = [...values].sort((a, b) => a - b);
      return [
        sliderMarkDate(startValue, safeRangeScope.start),
        sliderMarkDate(adjustEndValue(endValue), safeRangeScope.start),
      ] as [Date, Date];
    },
    [adjustEndValue, safeRangeScope.start],
  );

  /**
   * Handles the live drag/change event of the slider.
   */
  const moveWindowWithinBounds = React.useCallback(
    (start: number, end: number, max: number): [number, number] => {
      const length = end - start;
      if (start < 0) {
        return [0, Math.min(max, length)];
      }
      if (end > max) {
        return [Math.max(0, max - length), max];
      }
      return [start, end];
    },
    [],
  );

  const handleOnChange = (
    event: Event | React.SyntheticEvent,
    val: number | number[],
    thumb = 0,
  ) => {
    if (softBail) return;
    const values = Array.isArray(val) ? val : [val, val];
    let newValues = [...values];
    const isStepped = stepValue === "day";

    const isKeyboard = event.type === "keydown";
    const isCtrlPressed =
      (event as KeyboardEvent).ctrlKey ??
      (event as { ctrlKey?: boolean }).ctrlKey;

    if (!isKeyboard && isCtrlPressed) {
      if (!dragStartRef.current) {
        dragStartRef.current = {
          start: sliderStart,
          end: sliderEnd,
          length: sliderEnd - sliderStart,
        };
      }

      const dragStart = dragStartRef.current;
      const anchorAtStartThumb = thumb === 0;
      const anchorValue = anchorAtStartThumb ? dragStart.start : dragStart.end;
      let targetThumbValue = values[thumb];

      if (!isStepped) {
        targetThumbValue = closestMark([targetThumbValue])[0];
      }

      const delta = targetThumbValue - anchorValue;
      const shiftedStart = dragStart.start + delta;
      const shiftedEnd = dragStart.end + delta;
      const [boundedStart, boundedEnd] = moveWindowWithinBounds(
        shiftedStart,
        shiftedEnd,
        sliderMax,
      );
      newValues[0] = boundedStart;
      newValues[1] = boundedEnd;
    } else {
      if (singleDay) {
        newValues =
          thumb === 1 ? [values[1], values[1]] : [values[0], values[0]];
      } else {
        newValues =
          thumb === 0 ? [values[0], sliderEnd] : [sliderStart, values[1]];
      }
    }

    if (!isStepped) {
      if (!(isCtrlPressed && !isKeyboard) && thumb === 0) {
        newValues[0] = closestMark([newValues[0]])[0];
      } else if (!(isCtrlPressed && !isKeyboard)) {
        newValues[1] = closestMark([newValues[1]])[0];
      }
    }

    setSliderStart(newValues[0]);
    setSliderEnd(newValues[1]);

    onPreview(toRangeDates([newValues[0], newValues[1]]));
  };

  /**
   * Handles the commit event when the user releases a slider thumb or clicks the track.
   */
  const handleOnCommit = (
    _: Event | React.SyntheticEvent,
    val: number | number[],
  ) => {
    if (softBail) return;
    dragStartRef.current = null;

    onCommit(toRangeDates([sliderStart, sliderEnd]));
  };

  // Safely resolve the mark definitions for the child layout
  const derivedMainMarks = React.useMemo(() => {
    if (softBail) return [];
    try {
      return mainMarks(guardedProps, locale) ?? [];
    } catch {
      return [];
    }
  }, [guardedProps, locale, softBail]);

  const derivedSuperMarks = React.useMemo(() => {
    if (softBail) return [];
    try {
      return superMarks(guardedProps, locale) ?? [];
    } catch {
      return [];
    }
  }, [guardedProps, locale, softBail]);

  return (
    <DualSlider
      value={[sliderStart, sliderEnd]}
      step={stepValue === "day" ? 1 : null}
      stepValue={stepValue}
      showBottomSlider={show2ndSlider ?? false}
      handleTopCommit={handleOnCommit}
      handleBottomCommit={handleOnCommit}
      mainMarks={derivedMainMarks}
      superMarks={derivedSuperMarks}
      valueLabelFormat={(val) =>
        sliderMarkText(val, safeRangeScope.start, locale)
      }
      max={sliderMax}
      onChange={handleOnChange}
      localization={localization}
      {...props}
    />
  );
}
