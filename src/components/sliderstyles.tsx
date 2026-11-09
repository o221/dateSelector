/**
 * @fileoverview
 * This file contains two functions that return the style objects for the DualSlider component.
 * This refactoring makes the styles more modular and reusable.
 */
import theme, { Theme } from "@mui/material/styles";
import { TextAlignment } from "powerbi-models";
/**
 * Returns the style object for the top slider.
 * This function encapsulates the styles that position the marks and labels
 * above the slider rail.
 * @returns {object} The style object for the top slider.
 */
export const getTopSliderStyles = (theme: Theme) => {
  return {
    width: "98%",
    zIndex: 999,
    marginTop: "-3px",
    "& .MuiSlider-thumb": {
      top: "1.15rem",
      width: 8,
      height: 8,
      backgroundColor: theme.palette.primary.main,
      transition: "0.3s cubic-bezier(.47,1.64,.41,.8)",
      "&:focus, &:hover, &.Mui-active": {
        boxShadow: theme.shadows[2],
        "@media (hover: none)": {
          boxShadow: theme.shadows[0],
        },
      },
      "&:before": {
        boxShadow: theme.shadows[2],
      },
    },
    "& .MuiSlider-markLabel": {
      paddingTop: 0.5,
      fontSize: "0.5rem",
      fontWeight: 400,
      top: "0.05rem",
      transform: "translateX(0%)",
      left: "calc(-50% + 5px)",
      textAlign: "left",
    },
    "& .MuiSlider-mark": {
      top: "1.15rem",
      height: 5,
      width: "0.1rem",
      borderRadius: "0%",
      opacity: 0.3,
    },
    "& .MuiSlider-markActive": {
      height: 18,
      width: 1.1,
      opacity: 0.2,
    },
    "& .MuiSlider-track": {
      height: 10,
      opacity: 0.2,
      borderRadius: "0%",
      "&:hover": {
        boxShadow: theme.shadows[4],
      },
      color: theme.palette.primary.main,
    },
    "& .MuiSlider-rail": {
      opacity: 0.28,
      height: 1.1,
    },
    "& .MuiSlider-railActive": {
      opacity: 0,
    },
  } as const;
};

/**
 * Returns the style object for the bottom slider.
 * This function encapsulates the styles that position the marks and labels
 * below the slider rail.
 * @returns {object} The style object for the bottom slider.
 */
export const getBottomSliderStyles = (theme: Theme) => {
  return {
    width: "98%",
    marginTop: -10,
    "& .MuiSlider-thumb": {
      // marginTop: 0.8,
      top: "1rem",
      width: 2,
      height: 12,
      borderRadius: "0%",
      "&:hover": {
        boxShadow: theme.shadows[6],
      },
    },
    "& .MuiSlider-markLabel": {
      fontSize: "0.5rem",
      top: 12,
      transform: "translateX(0%)",
      left: "calc(-50% + 5px)",
      TextAlignment: "left",
    },
    "& .MuiSlider-rail": {
      opacity: 0,
      height: 1.1,
    },
    "& .MuiSlider-mark": {
      top: 16,
      height: 10,
      width: 1.1,
      borderRadius: "0%",
      opacity: 0.3,
    },
    "& .MuiSlider-markActive": {
      top: 27,
      height: 10,
      width: 1.1,
      borderRadius: "0%",
      opacity: 0.2,
    },
    "& .MuiSlider-track": {
      top: 20,
      height: 5,
      opacity: 0.05,
      borderRadius: "0%",
      "&:hover": {
        boxShadow: theme.shadows[4],
      },
      color: theme.palette.primary.main,
    },
  } as const;
};
