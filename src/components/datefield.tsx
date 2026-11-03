import * as React from "react";
import TextField from "@mui/material/TextField";
import { useTheme } from "@mui/material/styles";
import { hexToCSSFilter } from "hex-to-css-filter";
import {
  textMeasurementService as tms,
  interfaces,
} from "powerbi-visuals-utils-formattingutils";
import { pixelConverter } from "powerbi-visuals-utils-typeutils";
import TextProperties = interfaces.TextProperties;

interface DateFieldProps {
  id: "start" | "end";
  value: string;
  max?: string;
  min?: string;
  error?: boolean;
  underline?: boolean;
  type?: string;
  width?: number;
  fontBold?: boolean;
  fontFamily?: string;
  fontColor?: string;
  fontItalic?: boolean;
  fontUnderline?: boolean;
  fontWeight?: string;
  InputFontSize?: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  doUpdate: (id: "start" | "end", value: string) => void;
}

export const DateField: React.FC<DateFieldProps> = (props) => {
  const {
    id,
    value,
    doUpdate,
    underline,
    max,
    min = "date",
    error,
    type,
    width,
    fontBold,
    fontFamily,
    fontColor,
    fontItalic,
    fontUnderline,
    fontWeight,
    InputFontSize,
    onChange,
    onBlur,
    onFocus,
  } = props;

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // console.log("Enter key pressed:", e);
    if (e.key === "Enter") {
      e.preventDefault();
      const inputElement = e.target as HTMLInputElement;
      if (inputElement && inputElement.value) {
        doUpdate(id, inputElement.value);
      }
    }
  };

  const theme = useTheme();

  const formatDateInputValue = (inputValue: string): string => {
    if (!inputValue) {
      return inputValue;
    }

    try {
      const numericDate = new Date(`${inputValue}T00:00:00`);
      if (Number.isNaN(numericDate.getTime())) {
        return inputValue;
      }

      return new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
        .formatToParts(numericDate)
        .map((part) => part.value)
        .join("");
    } catch {
      return inputValue;
    }
  };

  const formattedValue = formatDateInputValue(value);
  const browserDateFormatHasSpaces = React.useMemo(() => {
    try {
      const dateParts = new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).formatToParts(new Date(2024, 0, 1));

      return dateParts.some(
        (part) => part.type === "literal" && /\s/.test(part.value),
      );
    } catch {
      return false;
    }
  }, []);
  const textProperties: TextProperties = {
    text: formattedValue,
    fontFamily: theme.typography.fontFamily ?? "Segoe UI",
    fontSize: pixelConverter.toString(theme.typography.fontSize),
  };

  return (
    <TextField
      id={id}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      onFocus={onFocus}
      error={error}
      sx={{
        "& input[type='date']::-webkit-calendar-picker-indicator": {
          display: "initial !important",
          filter: theme.palette.primary.main
            ? hexToCSSFilter(theme.palette.primary.main).filter
            : "",
        },
        input: {
          color: fontColor,
          fontWeight: fontBold
            ? theme.typography.fontWeightBold
            : theme.typography.fontWeightRegular,
          fontStyle: fontItalic ? "italic" : "normal",
        },
        paddingTop: "2px",
        width:
          tms.measureSvgTextWidth(textProperties) +
          theme.typography.fontSize * 3.25 +
          (browserDateFormatHasSpaces ? theme.typography.fontSize : 0),
      }}
      type="date"
      variant="standard"
      size="small"
      placeholder={"yyyy-MM-dd"}
      onKeyDown={handleKeyPress}
      slotProps={{
        input: {
          disableUnderline: underline,
        },
        htmlInput: {
          max,
          min,
        },
      }}
    />
  );
};
