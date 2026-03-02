import React, { startTransition, useMemo } from "react";
import { Box, Container, useTheme } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import MarkdownReader from "src/knowledgeHub/components/MarkdownReader";
import { getDocumentById } from "src/knowledgeHub/documentLoader";
import { routerPaths } from "src/app/routerPaths";
import ErrorPage from "src/error/errorPage/ErrorPage";
import KnowledgeHubPageHeader from "src/knowledgeHub/components/KnowledgeHubPageHeader";
import BackButton from "src/knowledgeHub/components/BackButton";

const uniqueId = "d5e6f7a8-90bc-def1-2345-678901234567";

export const DATA_TEST_ID = {
  KNOWLEDGE_HUB_DOCUMENT_CONTAINER: `knowledge-hub-document-container-${uniqueId}`,
  KNOWLEDGE_HUB_DOCUMENT_BACK_BUTTON: `knowledge-hub-document-back-button-${uniqueId}`,
  KNOWLEDGE_HUB_DOCUMENT_CONTENT: `knowledge-hub-document-content-${uniqueId}`,
  KNOWLEDGE_HUB_DOCUMENT_ICON: `knowledge-hub-document-icon-${uniqueId}`,
};

const KnowledgeHubDocument: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { documentId } = useParams<{ documentId: string }>();
  const { t } = useTranslation();

  const document = useMemo(() => {
    if (!documentId) return null;
    return getDocumentById(documentId);
  }, [documentId]);

  const handleBackClick = () => {
    startTransition(() => {
      navigate(routerPaths.KNOWLEDGE_HUB);
    });
  };

  if (!document) {
    return <ErrorPage errorMessage={t("knowledgeHub.documentNotFound")} />;
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100%"
      data-testid={DATA_TEST_ID.KNOWLEDGE_HUB_DOCUMENT_CONTAINER}
    >
      <KnowledgeHubPageHeader />

      <Container
        maxWidth="md"
        sx={{
          flex: 1,
          padding: theme.spacing(theme.tabiyaSpacing.lg),
          paddingTop: theme.spacing(theme.tabiyaSpacing.md),
          overflowY: "auto",
        }}
      >
        <Box display="flex" flexDirection="column" gap={theme.fixedSpacing(theme.tabiyaSpacing.sm)}>
          {/* Back link */}
          <Box>
            <BackButton
              onClick={handleBackClick}
              labelKey="knowledgeHub.backToKnowledgeHub"
              dataTestId={DATA_TEST_ID.KNOWLEDGE_HUB_DOCUMENT_BACK_BUTTON}
            />
          </Box>

          {/* Document Content */}
          <Box
            data-testid={DATA_TEST_ID.KNOWLEDGE_HUB_DOCUMENT_CONTENT}
            sx={{
              backgroundColor: theme.palette.background.paper,
              borderRadius: theme.fixedSpacing(theme.tabiyaRounding.md),
            }}
          >
            <MarkdownReader content={document.content} />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default KnowledgeHubDocument;
