import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import { Box, Chip, Dialog, DialogContent, Grid, Typography, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import PrimaryButton from "src/theme/PrimaryButton/PrimaryButton";
import PrimaryIconButton from "src/theme/PrimaryIconButton/PrimaryIconButton";
import type { JobPostingRow } from "src/types";

interface JobPostingDetailsDialogProps {
  job: JobPostingRow | null;
  isOpen: boolean;
  onClose: () => void;
}

const JobPostingDetailsDialog: React.FC<JobPostingDetailsDialogProps> = ({ job, isOpen, onClose }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  if (!job) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-label={t("dashboard.jobPostings.aria.detailsDialog")}
    >
      <DialogContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {job.jobTitle}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {job.sector} - {job.location} - {job.zqfLevel}
            </Typography>
          </Box>
          <PrimaryIconButton
            onClick={onClose}
            aria-label={t("dashboard.jobPostings.aria.closeDetailsDialog")}
            sx={{
              color: theme.palette.text.secondary,
            }}
          >
            <CloseIcon />
          </PrimaryIconButton>
        </Box>

        <Grid container spacing={1.5} mb={2.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                backgroundColor: theme.palette.grey[100],
              }}
            >
              <Typography variant="overline" color="text.secondary">
                {t("dashboard.jobPostings.modal.platform")}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {job.platform}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                backgroundColor: theme.palette.grey[100],
              }}
            >
              <Typography variant="overline" color="text.secondary">
                {t("dashboard.jobPostings.modal.candidatePool")}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {t("dashboard.jobPostings.modal.candidatePoolValue", { count: job.candidatePool })}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Typography variant="overline" color="text.secondary">
          {t("dashboard.jobPostings.modal.skillsExtracted", { count: job.skills.length })}
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={1} mb={3} mt={0.5}>
          {job.skills.map((skill) => (
            <Chip
              key={skill}
              label={skill}
              sx={{
                backgroundColor: theme.palette.grey[100],
                border: `1px solid ${theme.palette.divider}`,
                "& .MuiChip-label": {
                  color: theme.palette.text.secondary,
                },
              }}
            />
          ))}
        </Box>

        <PrimaryButton
          component="a"
          href={job.jobUrl}
          target="_blank"
          rel="noopener noreferrer"
          size="small"
          startIcon={<OpenInNewOutlinedIcon fontSize="small" />}
          aria-label={t("dashboard.jobPostings.aria.openJob", { title: job.jobTitle })}
        >
          {t("dashboard.jobPostings.modal.viewOriginalPosting")}
        </PrimaryButton>
      </DialogContent>
    </Dialog>
  );
};

export default JobPostingDetailsDialog;
