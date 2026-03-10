import React from "react";
import { styled } from "@mui/material/styles";
import Container from "@mui/material/Container";

import { bushbabySvgContent } from "./bushbabySvgContent";

export type BushbabyProps = {
  children?: React.ReactNode;
  width?: string;
  strokeColor?: string;
  bodyColor?: string;
  faceColor?: string;
};

const uniqueId = "7a2e9c1b-3d4f-4e5a-9b6c-8f1d2e3a4b5c";
export const DATA_TEST_ID = {
  BUSHBABY: `bushbaby-${uniqueId}`,
};

type BushbabySvgStyle = {
  strokeColor: string;
  bodyColor: string;
  faceColor: string;
  eyeColor: string;
  irisColor: string;
};

const BODY_PART_COLORS: Record<string, (s: BushbabySvgStyle) => string> = {
  "#tail": (s) => s.bodyColor,
  "#body": (s) => s.bodyColor,
  "#face": () => "url(#bushbaby-face-gradient)",
  "#left-inner-ear": (s) => s.bodyColor,
  "#right-inner-ear": (s) => s.bodyColor,
  "#right-socket": (s) => s.eyeColor,
  "#left-socket": (s) => s.eyeColor,
  "#eye-white-right": () => "#ffffff",
  "#eye-white-left": () => "#ffffff",
  "#left-iris": (s) => s.irisColor,
  "#right-iris": (s) => s.irisColor,
  "#nose": (s) => s.strokeColor,
};

const bushbabySVGSrc = (style: BushbabySvgStyle) => {
  const strokeCss = `stroke:${style.strokeColor};stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-opacity:1`;
  const faceGradient = `<defs><radialGradient id="bushbaby-face-gradient" cx="50%" cy="40%" r="70%"><stop offset="0%" stop-color="#ffffff"/><stop offset="8%" stop-color="${style.faceColor}"/><stop offset="100%" stop-color="${style.faceColor}"/></radialGradient></defs>`;
  let svg = faceGradient + bushbabySvgContent;

  for (const [label, getColor] of Object.entries(BODY_PART_COLORS)) {
    const fillColor = getColor(style);
    svg = svg.replace(new RegExp(`fill="${label}"`, "g"), `style="fill:${fillColor};fill-opacity:1;${strokeCss}"`);
  }

  return svg;
};

export const Bushbaby = (props: BushbabyProps) => {
  const bushbabyStyle = {
    width: props.width ?? "48px",
    strokeColor: props.strokeColor ?? "#2d1810",
    bodyColor: props.bodyColor ?? "#6b5344",
    faceColor: props.faceColor ?? "#d4b896",
    eyeColor: "#5c4033",
    irisColor: "#000000",
  };

  const VIEWBOX_HEIGHT = 190;
  const VIEWBOX_WIDTH = 209;
  const svgHeight = `calc(${bushbabyStyle.width} * ${VIEWBOX_HEIGHT} / ${VIEWBOX_WIDTH})`;

  const animationStyle = () => ({
    margin: "0",
    padding: "0",
    overflow: "visible",
    "#bushbaby-tail": {
      transformOrigin: "178px 99px",
      animation: "tailSway 3.5s infinite ease-in-out",
      "@keyframes tailSway": {
        "0%, 100%": { transform: "rotate(0deg)" },
        "50%": { transform: "rotate(15deg)" },
      },
    },
    "#bushbaby-head": {
      transformOrigin: "50px 45px",
      animation: "headTilt 20s 2s infinite linear",
      "@keyframes headTilt": {
        "0%": { transform: "rotate(0deg)" },
        "25%": { transform: "rotate(15deg)" },
        "75%": { transform: "rotate(-15deg)" },
        "100%": { transform: "rotate(0deg)" },
      },
    },
  });

  const AnimatedContainer = styled(Container)(() => animationStyle());

  return (
    <div
      data-testid={DATA_TEST_ID.BUSHBABY}
      style={{
        display: "flex",
        flexDirection: "column",
        margin: "0",
        padding: "0",
      }}
    >
      <AnimatedContainer
        style={{
          flexShrink: 0,
          height: svgHeight,
          position: "relative",
          overflow: "visible",
        }}
      >
        <svg
          overflow="visible"
          width={bushbabyStyle.width}
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          xmlns="http://www.w3.org/2000/svg"
          style={{
            position: "absolute",
            top: "20px",
            right: "-20px",
          }}
          dangerouslySetInnerHTML={{ __html: bushbabySVGSrc(bushbabyStyle) }}
        />
      </AnimatedContainer>
      <div style={{ flexShrink: 0 }}>{props.children}</div>
    </div>
  );
};
