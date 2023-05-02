import * as React from "react";
import { useEffect, useState } from "react";
import Grid from "@mui/material/Unstable_Grid2";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import { format, parse, isValid } from "date-fns";
import { DateRangeProps } from "./interface";
import { inputParms } from "./dateutils";
import { DateField } from "./datefield";
import { useHelpContext } from "./helpprovider";
import RngeTooltip from "./rngetooltip";

const TextFieldDash: React.FC = () => {
  return (
    <Box sx={{ width: 15 }}>
      <TextField
        id="dash"
        variant="standard"
        disabled
        value={"-"}
        InputProps={{ disableUnderline: true }}
      />
    </Box>
  );
};

export default function DateRange(props: DateRangeProps) {
  const { dates, rangeScope, handleVal } = props;

  const [underline, setUndeline] = useState<boolean>(() => true);
  const [startText, setStartText] = useState<string>(() =>
    format(dates.start, "yyyy-MM-dd")
  );
  const [endText, setEndText] = useState<string>(() =>
    format(dates.end, "yyyy-MM-dd")
  );

  useEffect(() => {
    setStartText(format(dates.start, "yyyy-MM-dd"));
    setEndText(format(dates.end, "yyyy-MM-dd"));
  }, [dates]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue: string = e.target.value;
    if (e.target.id === "start") {
      setStartText(dateValue);
    } else setEndText(dateValue);
  };

  const dateSpan = inputParms(dates, rangeScope);
  const topRow = useHelpContext().showHelp ? "Enter Range" : dateSpan.string;

  const doUpdate = (id: "start" | "end", value: string) => {
    const dte: Date = parse(value, "yyyy-MM-dd", new Date());
    if (isValid(dte)) {
      if (id === "start") {
        handleVal([dte, dates.end]);
      } else handleVal([dates.start, dte]);
    } else {
      setStartText(format(dates.start, "yyyy-MM-dd"));
      setEndText(format(dates.end, "yyyy-MM-dd"));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.id === "start") {
      doUpdate("start", e.target.value);
    } else {
      doUpdate("end", e.target.value);
    }
  };

  const showUndeline = () => {
    setUndeline(false);
  };

  const hideUndeline = () => {
    setUndeline(true);
  };

  return (
    <div onMouseEnter={showUndeline} onMouseLeave={hideUndeline}>
      <RngeTooltip
        title={undefined}
        topRow={topRow}
        detailRow={dateSpan.string}
        placement="bottom"
      >
        <Grid container spacing={0.5} paddingLeft={0.3}>
          <Grid xs="auto">
            <DateField
              id="start"
              value={startText}
              underline={underline}
              error={!dateSpan.toValid}
              onBlur={handleBlur}
              doUpdate={doUpdate}
              onChange={handleInput}
              onFocus={showUndeline}
            />
          </Grid>
          {/* {showSingleDay && ( */}
          <>
            <TextFieldDash />
            <Grid xs="auto">
              <DateField
                id="end"
                value={endText}
                error={!dateSpan.toValid}
                underline={underline}
                onBlur={handleBlur}
                onChange={handleInput}
                onFocus={showUndeline}
                doUpdate={doUpdate}
              />
            </Grid>
          </>
          {/* )} */}
        </Grid>
      </RngeTooltip>
    </div>
  );
}
