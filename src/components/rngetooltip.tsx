import * as React from "react";
import Tooltip, { TooltipProps } from "@mui/material/Tooltip";
import { useHelpContext } from "./helpprovider";

interface RngeTooltipProps extends Omit<TooltipProps, "title"> {
  topRow?: string;
  detailRow?: string;
  title?: string;
  disableTooltip?: boolean;
  shortCut?: string;
  infoRow?: string;
  detailFlag?: boolean;
  children: React.ReactElement;
}

const RngeTooltip: React.FC<RngeTooltipProps> = ({
  topRow,
  shortCut,
  detailRow,
  title,
  disableTooltip = false,
  children,
  infoRow,
  detailFlag,
  ...tooltipProps
}) => {
  const { showTooltip, showExtendedTooltip } = useHelpContext();

  const effectiveDetailFlag = detailFlag ?? showExtendedTooltip;
  const shouldShow = showTooltip && !disableTooltip;

  const content = React.useMemo(() => {
    if (!effectiveDetailFlag) {
      // If not in extended mode, return the top row or title.
      return topRow || title || null;
    }

    // In extended mode, build the detailed tooltip content.
    const header = topRow || title;
    return (
      <div style={{ padding: "4px", boxSizing: "border-box" }}>
        {header && <div style={{ fontWeight: "bold" }}>{header}</div>}
        {detailRow && <div>{detailRow}</div>}
        {infoRow && <div style={{ fontStyle: "italic" }}>{infoRow}</div>}
      </div>
    );
  }, [effectiveDetailFlag, topRow, title, detailRow, infoRow]);

  if (!shouldShow || !content) {
    return children;
  }

  const tooltipChild = React.isValidElement<{ [key: string]: unknown }>(children)
    ? React.cloneElement(children, children.props)
    : children;

  return (
    <Tooltip
      enterDelay={1000}
      title={content}
      arrow
      slotProps={{
        popper: {
          modifiers: [{ name: "offset", options: { offset: [0, -5] } }],
        },
        tooltip: {
          sx: (theme) => ({
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            fontFamily: theme.typography.fontFamily,
            padding: "4px",
            boxShadow: theme.shadows[4],
            borderRadius: 0,
            maxWidth: 350,
          }),
        },
        arrow: {
          sx: (theme) => ({
            "&::before": {
              backgroundColor: theme.palette.background.paper,
            },
          }),
        },
      }}
      {...tooltipProps}
    >
      {tooltipChild}
    </Tooltip>
  );
};

export default RngeTooltip;
