import React from "react";
import { Box, Container, useTheme } from "@mui/material";
import LanguageContextMenu from "src/i18n/languageContextMenu/LanguageContextMenu";

export const shapesBackgroundUrl = `${process.env.PUBLIC_URL}/Shapes.svg`;

export type AuthPageShellProps = {
  logoUrl: string;
  children: React.ReactNode;
  whiteBandContent?: React.ReactNode;
  whiteContainerTestId?: string;
};

const whiteContainerSx = { maxWidth: "lg", px: { xs: 2, md: 3 } } as const;

const AuthPageShell: React.FC<AuthPageShellProps> = ({ logoUrl, whiteBandContent, children, whiteContainerTestId }) => {
  const theme = useTheme();
  const cream = theme.palette.common.cream;

  const pt = { xs: 4, md: 6 };
  const pb = { xs: 5, md: 7 };

  return (
    <Box
      sx={{
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        position: "relative",
      }}
    >
      <Box
        sx={{
          width: "100%",
          flexShrink: 0,
          position: "relative",
          zIndex: 2,
          backgroundColor: theme.palette.common.white,
          overflow: "visible",
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            backgroundImage: `url(${shapesBackgroundUrl})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center center",
            backgroundSize: "cover",
            opacity: 0.35,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <Container
          data-testid={whiteContainerTestId}
          maxWidth="lg"
          sx={{ ...whiteContainerSx, position: "relative", zIndex: 1 }}
        >
          <Box sx={{ position: "relative", pt, pb }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: whiteBandContent ? { xs: 2, md: 3 } : 0,
              }}
            >
              <Box
                component="img"
                src={logoUrl}
                alt=""
                sx={{ maxHeight: { xs: 36, md: 44 }, width: "auto", maxWidth: "min(200px, 45vw)" }}
              />
              <LanguageContextMenu removeMargin />
            </Box>
            {whiteBandContent}
          </Box>
        </Container>
      </Box>

      <Box
        sx={{
          width: "100%",
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          backgroundColor: cream,
          zIndex: 1,
          overflow: "visible",
          position: "relative",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AuthPageShell;
