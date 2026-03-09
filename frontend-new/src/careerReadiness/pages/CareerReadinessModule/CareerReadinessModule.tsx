import React, { useCallback, useEffect, useState } from "react";
import { Box, useTheme } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageHeader from "src/home/components/PageHeader/PageHeader";
import { routerPaths } from "src/app/routerPaths";
import CareerReadinessChat from "src/careerReadiness/components/CareerReadinessChat/CareerReadinessChat";
import CareerReadinessService from "src/careerReadiness/services/CareerReadinessService";
import type { ModuleDetail } from "src/careerReadiness/types";
import { RestAPIError } from "src/error/restAPIError/RestAPIError";
import { StatusCodes } from "http-status-codes";
import { useSnackbar } from "src/theme/SnackbarProvider/SnackbarProvider";

const uniqueId = "e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b";

export const DATA_TEST_ID = {
  CAREER_READINESS_MODULE_CONTAINER: `career-readiness-module-container-${uniqueId}`,
};

const CareerReadinessModule: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { moduleId } = useParams<{ moduleId: string }>();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [moduleDetail, setModuleDetail] = useState<ModuleDetail | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const handleBackToModules = () => navigate(routerPaths.CAREER_READINESS);

  const handleModuleCompleted = useCallback(() => {
    enqueueSnackbar(t("careerReadiness.moduleComplete"), { variant: "success" });
  }, [t, enqueueSnackbar]);

  const loadModuleAndConversation = useCallback(async () => {
    if (!moduleId) {
      navigate(routerPaths.CAREER_READINESS);
      return;
    }
    setConversationId(null);
    const service = CareerReadinessService.getInstance();
    try {
      const fetchedModule = await service.getModule(moduleId);
      setModuleDetail(fetchedModule);
      try {
        const existingId = fetchedModule.active_conversation_id;
        if (existingId) {
          setConversationId(existingId);
        } else {
          const res = await service.createConversation(fetchedModule.id);
          setConversationId(res.conversation_id);
        }
      } catch (convError) {
        console.error("Failed to start conversation");
      }
    } catch (e) {
      if (e instanceof RestAPIError && e.statusCode === StatusCodes.NOT_FOUND) {
        enqueueSnackbar(t("careerReadiness.moduleNotFound"), { variant: "warning" });
      } else {
        enqueueSnackbar((e as Error)?.message ?? t("careerReadiness.listError"), { variant: "error" });
      }
      navigate(routerPaths.CAREER_READINESS);
    }
  }, [moduleId, t, enqueueSnackbar, navigate]);

  useEffect(() => {
    void loadModuleAndConversation();
  }, [loadModuleAndConversation]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: theme.palette.containerBackground.light,
      }}
      data-testid={DATA_TEST_ID.CAREER_READINESS_MODULE_CONTAINER}
    >
      <PageHeader
        title="careerReadiness.pageTitle"
        subtitle="careerReadiness.pageDescription"
        backLinkLabel="careerReadiness.backToModules"
        onBackClick={handleBackToModules}
      />

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {moduleId && (
          <CareerReadinessChat
            moduleId={moduleId}
            moduleTitle={moduleDetail?.title ?? ""}
            initialConversationId={conversationId}
            inputPlaceholder={moduleDetail?.input_placeholder ?? ""}
            onModuleCompleted={handleModuleCompleted}
          />
        )}
      </Box>
    </Box>
  );
};

export default CareerReadinessModule;
