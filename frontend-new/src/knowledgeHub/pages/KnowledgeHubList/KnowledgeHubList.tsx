import React, { startTransition, useMemo } from "react";
import { Box, Container, Grid, Typography, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DocumentCard from "src/knowledgeHub/components/DocumentCard";
import { getAllDocuments } from "src/knowledgeHub/documentLoader";
import { routerPaths } from "src/app/routerPaths";

const uniqueId = "b3d4e5f6-7890-abcd-ef12-345678901234";

export const DATA_TEST_ID = {
  KNOWLEDGE_HUB_LIST_CONTAINER: `knowledge-hub-list-container-${uniqueId}`,
  KNOWLEDGE_HUB_LIST_CONTENT: `knowledge-hub-list-content-${uniqueId}`,
  KNOWLEDGE_HUB_LIST_GRID: `knowledge-hub-list-grid-${uniqueId}`,
  KNOWLEDGE_HUB_INTRODUCTION: `knowledge-hub-introduction-${uniqueId}`,
};

const KnowledgeHubList: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const documents = useMemo(() => getAllDocuments(), []);

  const handleDocumentClick = (id: string) => {
    startTransition(() => {
      navigate(`${routerPaths.KNOWLEDGE_HUB}/${id}`);
    });
  };

  return (
    <Box display="flex" flexDirection="column" height="100%" data-testid={DATA_TEST_ID.KNOWLEDGE_HUB_LIST_CONTAINER}>
      <Container
        maxWidth="md"
        sx={{
          flex: 1,
          padding: theme.spacing(theme.tabiyaSpacing.lg),
          paddingTop: theme.spacing(theme.tabiyaSpacing.md),
          overflowY: "auto",
        }}
        data-testid={DATA_TEST_ID.KNOWLEDGE_HUB_LIST_CONTENT}
      >
        {/* Introduction paragraph */}
        <Box mb={theme.spacing(theme.tabiyaSpacing.lg)} data-testid={DATA_TEST_ID.KNOWLEDGE_HUB_INTRODUCTION}>
          <Typography variant="body1" color="text.secondary">
            {t("knowledgeHub.introduction")}
          </Typography>
        </Box>

        {/* Document Grid */}
        <Grid
          container
          spacing={theme.tabiyaSpacing.lg}
          justifyContent="center"
          data-testid={DATA_TEST_ID.KNOWLEDGE_HUB_LIST_GRID}
        >
          {documents.map((doc) => (
            <Grid key={doc.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <DocumentCard document={doc} onClick={handleDocumentClick} />
            </Grid>
          ))}
        </Grid>

        {/* Empty state */}
        {documents.length === 0 && (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            py={theme.fixedSpacing(theme.tabiyaSpacing.xl * 2)}
          >
            <Typography variant="body1" color="text.secondary">
              {t("knowledgeHub.noDocumentsAvailable")}
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default KnowledgeHubList;
