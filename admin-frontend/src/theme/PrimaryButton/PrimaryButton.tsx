import { Button, ButtonProps } from "@mui/material";
import React from "react";

interface PrimaryButtonProps extends ButtonProps {
  target?: string;
  rel?: string;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  style,
  disabled,
  children,
  sx,
  ...props
}: Readonly<PrimaryButtonProps>) => {
  return (
    <Button
      variant="contained"
      color="primary"
      style={style}
      sx={{
        borderRadius: (theme) => theme.tabiyaRounding.xl,
        paddingY: (theme) => theme.fixedSpacing(theme.tabiyaSpacing.xs),
        paddingX: (theme) => theme.fixedSpacing(theme.tabiyaSpacing.md),
        ...sx,
      }}
      disableElevation
      disabled={Boolean(disabled)}
      {...props}
    >
      {children ?? "Click here"}
    </Button>
  );
};

export default PrimaryButton;
