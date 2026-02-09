import React from "react";
import { Link as RouterLink, Outlet, useLocation } from "react-router-dom";
import { alpha, styled } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ListRoundedIcon from "@mui/icons-material/ListRounded";

const MainContainer = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
  backgroundColor: theme.palette.mode === "dark" ? theme.palette.background.default : "#f5f7fa",
}));

const ContentContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
  flexGrow: 1,
}));

const Footer = styled("footer")(({ theme }) => ({
  padding: theme.spacing(3, 0),
  textAlign: "center",
  borderTop: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
  backgroundColor: theme.palette.background.paper,
}));

export const Layout: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <MainContainer>
      <CssBaseline />
      <AppBar
        position="sticky"
        elevation={0}
        sx={(theme) => ({
          backdropFilter: "blur(12px)",
          backgroundColor: alpha(theme.palette.background.paper, 0.85),
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
          color: theme.palette.text.primary,
        })}
      >
        <Toolbar
          sx={{
            maxWidth: "lg",
            width: "100%",
            mx: "auto",
            px: { xs: 2, sm: 3 },
          }}
        >
          <Stack
            component={RouterLink}
            to="/"
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{
              textDecoration: "none",
              color: "inherit",
              flexGrow: 1,
              "&:hover .logo-icon": {
                transform: "rotate(-8deg) scale(1.05)",
              },
            }}
          >
            <Box
              className="logo-icon"
              sx={(theme) => ({
                width: 36,
                height: 36,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                boxShadow: `0 3px 10px ${alpha(theme.palette.primary.main, 0.3)}`,
                transition: "transform 0.25s ease",
              })}
            >
              <TaskAltRoundedIcon sx={{ color: "#fff", fontSize: 20 }} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                fontSize: { xs: "1rem", sm: "1.15rem" },
                letterSpacing: "-0.01em",
              }}
            >
              Task Manager
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.5}>
            <Button
              component={RouterLink}
              to="/"
              startIcon={<ListRoundedIcon sx={{ fontSize: 18 }} />}
              sx={(theme) => ({
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.875rem",
                borderRadius: 2,
                px: 2,
                color: isActive("/") ? theme.palette.primary.main : "text.secondary",
                bgcolor: isActive("/") ? alpha(theme.palette.primary.main, 0.08) : "transparent",
                "&:hover": {
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                },
              })}
            >
              <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                Задачи
              </Box>
            </Button>
            <Button
              component={RouterLink}
              to="/create"
              startIcon={<AddRoundedIcon sx={{ fontSize: 18 }} />}
              variant={isActive("/create") ? "contained" : "text"}
              disableElevation
              sx={(theme) => ({
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.875rem",
                borderRadius: 2,
                px: 2,
                ...(isActive("/create")
                  ? {
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                      boxShadow: `0 3px 10px ${alpha(theme.palette.primary.main, 0.3)}`,
                      color: "#fff",
                      "&:hover": {
                        boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                      },
                    }
                  : {
                      color: "text.secondary",
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.12),
                      },
                    }),
              })}
            >
              <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                Создать
              </Box>
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>
      <ContentContainer maxWidth="lg">
        <Outlet />
      </ContentContainer>
      <Footer>
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.75rem" }}>
          Task Manager © {new Date().getFullYear()} — Управление задачами
        </Typography>
      </Footer>
    </MainContainer>
  );
};
