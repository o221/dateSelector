import * as React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Unstable_Grid2";
import Zoom from "@mui/material/Zoom";
import DateInput from "./dateinput";
import UseCurrent from "./usecurrent";
import ToggleSliderButton from "./togglesliderbutton";
import { topRowProps } from "../interface";

const TopRow: React.FC<topRowProps> = ({
  openSlider,
  toggleSlider,
  dates,
  rangeScope,
  payProps,
  handleVal,
  stepViz,
  stepOpen,
  stepValue,
  handleClick,
  setStepValue,
  setStepOpen,
  showMore,
  showCurrent,
  showIconText,
  current,
  singleDay,
  showMove,showExpand,
  enableSlider,
}) => {
  return (
    <Grid container rowSpacing={0.3} paddingLeft={0.3} xs={12}>
      {enableSlider && (
        <Grid
          xs="auto"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <ToggleSliderButton
            openSlider={openSlider}
            toggleSlider={toggleSlider}
          />
        </Grid>
      )}
      <Grid
        xs="auto"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <DateInput
          dates={dates}
          rangeScope={rangeScope}
          payProps={payProps}
          handleVal={handleVal}
          stepViz={stepViz}
          openSlider={openSlider}
          stepOpen={stepOpen}
          stepValue={stepValue}
          handleClick={handleClick}
          handleStep={setStepValue}
          handleViz={setStepOpen}
          singleDay={singleDay}
          showMove={showMove}
          showExpand={showExpand}
        />
      </Grid>
      <Grid xs="auto">
      {!stepOpen && (
        <Zoom in={!stepOpen}>
          <Box>
            <UseCurrent
              rangeScope={rangeScope}
              showMore={showMore}
              showCurrent={showCurrent}
              showIconText={showIconText}
              handleStep={setStepValue}
              handleVal={handleVal}
              current={current}
              stepValue={stepValue}
              singleDay={singleDay}
            />
          </Box>
        </Zoom>)}
      </Grid>
      <Grid xs>
        <Box></Box>
      </Grid>
    </Grid>
  );
};

export default TopRow;
