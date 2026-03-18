import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

const uniqueId = "users-page-2b4d6f8a-0c1e-2d3f-4a5b-6c7d8e9f0a1b";

export const DATA_TEST_ID = {
  USERS_PAGE_CONTAINER: `${uniqueId}-container`,
  USERS_PAGE_TITLE: `${uniqueId}-title`,
  USERS_PAGE_ADD_BUTTON: `${uniqueId}-add-button`,
  USERS_PAGE_TABLE: `${uniqueId}-table`,
  USERS_PAGE_TABLE_ROW: `${uniqueId}-table-row`,
  USERS_PAGE_EDIT_BUTTON: `${uniqueId}-edit-button`,
  USERS_PAGE_DELETE_BUTTON: `${uniqueId}-delete-button`,
};

export interface UsersProps {}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Admin",
    status: "Active",
    lastLogin: "2024-01-15",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "Editor",
    status: "Active",
    lastLogin: "2024-01-14",
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob.johnson@example.com",
    role: "Viewer",
    status: "Inactive",
    lastLogin: "2024-01-10",
  },
];

const Users: React.FC<UsersProps> = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [users] = useState<User[]>(mockUsers);

  const handleAddUser = () => {
    // TODO: Implement add user functionality
    console.log("Add user clicked");
  };

  const handleEditUser = (userId: string) => {
    // TODO: Implement edit user functionality
    console.log("Edit user:", userId);
  };

  const handleDeleteUser = (userId: string) => {
    // TODO: Implement delete user functionality
    console.log("Delete user:", userId);
  };

  return (
    <Container maxWidth="lg" data-testid={DATA_TEST_ID.USERS_PAGE_CONTAINER}>
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h4" component="h1" data-testid={DATA_TEST_ID.USERS_PAGE_TITLE}>
            {t("users.title")}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddUser}
            data-testid={DATA_TEST_ID.USERS_PAGE_ADD_BUTTON}
          >
            {t("users.addUser")}
          </Button>
        </Box>

        <TableContainer component={Paper} sx={{ borderRadius: theme.tabiyaRounding.sm }}>
          <Table data-testid={DATA_TEST_ID.USERS_PAGE_TABLE}>
            <TableHead>
              <TableRow>
                <TableCell>{t("users.table.name")}</TableCell>
                <TableCell>{t("users.table.email")}</TableCell>
                <TableCell>{t("users.table.role")}</TableCell>
                <TableCell>{t("users.table.status")}</TableCell>
                <TableCell>{t("users.table.lastLogin")}</TableCell>
                <TableCell align="right">{t("users.table.actions")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} data-testid={DATA_TEST_ID.USERS_PAGE_TABLE_ROW}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Box
                      component="span"
                      sx={{
                        px: 1,
                        py: 0.5,
                        borderRadius: theme.tabiyaRounding.sm,
                        backgroundColor:
                          user.status === "Active" ? theme.palette.success.light : theme.palette.grey[300],
                        color:
                          user.status === "Active" ? theme.palette.success.contrastText : theme.palette.text.primary,
                      }}
                    >
                      {user.status}
                    </Box>
                  </TableCell>
                  <TableCell>{user.lastLogin}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleEditUser(user.id)}
                      data-testid={DATA_TEST_ID.USERS_PAGE_EDIT_BUTTON}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteUser(user.id)}
                      data-testid={DATA_TEST_ID.USERS_PAGE_DELETE_BUTTON}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default Users;
