import React, { useMemo } from "react";
import { Box, Skeleton, Typography } from "@mui/material";

type FieldsetProps = {
  label: string;
} & (
  | {
      isLoading: true;
    }
  | {
      value: string;
    }
);

const uniqueId = "d5d7e528-7ad8-4e67-9ba4-497d4db2c19c";

export const DATA_TEST_ID = {
  CONTAINER: `field-set-container-${uniqueId}`,
  LABEL: `field-set-label-${uniqueId}`,
  VALUE: `field-set-value-${uniqueId}`,
  SKELETON: `field-set-skeleton-${uniqueId}`,
};

export const Fieldset: React.FC<FieldsetProps> = (props) => {
  const { isLoading, value } = useMemo(() => {
    if ("isLoading" in props) {
      return {
        isLoading: true,
        value: undefined,
      };
    }

    return {
      isLoading: false,
      value: props.value,
    };
  }, [props]);

  return (
    <Box data-testid={DATA_TEST_ID.CONTAINER} sx={{ paddingBottom: (theme) => theme.tabiyaSpacing.sm }}>
      <Typography
        variant="body2"
        color={"secondary.dark"}
        sx={{
          textTransform: "uppercase",
          fontWeight: 600,
        }}
        data-testid={DATA_TEST_ID.LABEL}
      >
        {props.label}
      </Typography>
      <Typography
        variant="subtitle1"
        data-testid={DATA_TEST_ID.VALUE}
        sx={{
          color: "text.primary",
        }}
      >
        {isLoading ? (
          <Skeleton
            variant="text"
            // The 300 is like the average field set of the details shown on the frontend
            sx={{ backgroundColor: "lightgray", maxWidth: 300 }}
            data-testid={DATA_TEST_ID.SKELETON}
          />
        ) : (
          value || "-"
        )}
      </Typography>
    </Box>
  );
};
