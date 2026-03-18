import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  FormControlLabel,
  Switch,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import SaveIcon from "@mui/icons-material/Save";

const uniqueId = "settings-page-9e8d7c6b-5a4f-3e2d-1c0b-a9f8e7d6c5b4";

export const DATA_TEST_ID = {
  SETTINGS_PAGE_CONTAINER: `${uniqueId}-container`,
  SETTINGS_PAGE_TITLE: `${uniqueId}-title`,
  SETTINGS_PAGE_SAVE_BUTTON: `${uniqueId}-save-button`,
  SETTINGS_GENERAL_SECTION: `${uniqueId}-general-section`,
  SETTINGS_NOTIFICATIONS_SECTION: `${uniqueId}-notifications-section`,
  SETTINGS_APP_NAME_INPUT: `${uniqueId}-app-name-input`,
  SETTINGS_SUPPORT_EMAIL_INPUT: `${uniqueId}-support-email-input`,
};

export interface SettingsProps {}

const Settings: React.FC<SettingsProps> = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  const [settings, setSettings] = useState({
    appName: "Compass Admin",
    supportEmail: "support@compass.com",
    enableEmailNotifications: true,
    enablePushNotifications: false,
    maintenanceMode: false,
    debugMode: false,
  });

  const handleSave = () => {
    // TODO: Implement save settings functionality
    console.log("Saving settings:", settings);
  };

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({
      ...settings,
      [field]: event.target.type === "checkbox" ? event.target.checked : event.target.value,
    });
  };

  return (
    <Container maxWidth="md" data-testid={DATA_TEST_ID.SETTINGS_PAGE_CONTAINER}>
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h4" component="h1" data-testid={DATA_TEST_ID.SETTINGS_PAGE_TITLE}>
            {t("settings.title")}
          </Typography>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            data-testid={DATA_TEST_ID.SETTINGS_PAGE_SAVE_BUTTON}
          >
            {t("settings.save")}
          </Button>
        </Box>

        <Card sx={{ mb: 3, borderRadius: theme.tabiyaRounding.sm }} data-testid={DATA_TEST_ID.SETTINGS_GENERAL_SECTION}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t("settings.general.title")}
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                fullWidth
                label={t("settings.general.appName")}
                value={settings.appName}
                onChange={handleChange("appName")}
                data-testid={DATA_TEST_ID.SETTINGS_APP_NAME_INPUT}
              />
              <TextField
                fullWidth
                label={t("settings.general.supportEmail")}
                type="email"
                value={settings.supportEmail}
                onChange={handleChange("supportEmail")}
                data-testid={DATA_TEST_ID.SETTINGS_SUPPORT_EMAIL_INPUT}
              />
            </Box>
          </CardContent>
        </Card>

        <Card
          sx={{ mb: 3, borderRadius: theme.tabiyaRounding.sm }}
          data-testid={DATA_TEST_ID.SETTINGS_NOTIFICATIONS_SECTION}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t("settings.notifications.title")}
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enableEmailNotifications}
                    onChange={handleChange("enableEmailNotifications")}
                  />
                }
                label={t("settings.notifications.email")}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enablePushNotifications}
                    onChange={handleChange("enablePushNotifications")}
                  />
                }
                label={t("settings.notifications.push")}
              />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: theme.tabiyaRounding.sm }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t("settings.advanced.title")}
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <FormControlLabel
                control={<Switch checked={settings.maintenanceMode} onChange={handleChange("maintenanceMode")} />}
                label={t("settings.advanced.maintenanceMode")}
              />
              <FormControlLabel
                control={<Switch checked={settings.debugMode} onChange={handleChange("debugMode")} />}
                label={t("settings.advanced.debugMode")}
              />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Settings;
