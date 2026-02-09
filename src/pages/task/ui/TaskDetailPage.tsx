import React, { useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { format, isPast, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import DialogContentText from "@mui/material/DialogContentText";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Skeleton from "@mui/material/Skeleton";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import FlagRoundedIcon from "@mui/icons-material/FlagRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { alpha, useTheme } from "@mui/material/styles";
import { useDeleteTaskMutation, useGetTagsQuery, useGetTaskQuery } from "@/entities/task";

const statusMeta: Record<
  string,
  { label: string; color: "default" | "primary" | "success"; emoji: string }
> = {
  todo: { label: "Активно", color: "default", emoji: "📋" },
  inProgress: { label: "В процессе", color: "primary", emoji: "🔧" },
  done: { label: "Выполнено", color: "success", emoji: "✅" },
};

const priorityMeta: Record<string, { label: string; color: string; bg: string }> = {
  low: { label: "Низкий", color: "#43a047", bg: "#e8f5e9" },
  medium: { label: "Средний", color: "#fb8c00", bg: "#fff3e0" },
  high: { label: "Высокий", color: "#e53935", bg: "#ffebee" },
};

export const TaskDetailPage: React.FC = () => {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: task, isLoading: isTaskLoading } = useGetTaskQuery(id as string, { skip: !id });
  const { data: tags = [] } = useGetTagsQuery();
  const [deleteTask] = useDeleteTaskMutation();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const getTagName = (tagId: string) => tags.find((t) => t.id === tagId)?.name || tagId;

  const handleDelete = async () => {
    if (id) {
      await deleteTask(id);
      navigate("/");
    }
  };

  if (isTaskLoading) {
    return (
      <Box sx={{ maxWidth: 800, mx: "auto", px: { xs: 2, md: 4 }, py: { xs: 2, md: 3 } }}>
        <Skeleton variant="rounded" width={180} height={36} sx={{ mb: 3, borderRadius: 2 }} />
        <Paper
          elevation={0}
          sx={{ borderRadius: 4, border: `1px solid ${theme.palette.divider}`, overflow: "hidden" }}
        >
          <Box sx={{ p: { xs: 3, md: 4 } }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
              spacing={2}
            >
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="70%" height={40} />
                <Skeleton variant="text" width="40%" height={24} sx={{ mt: 1 }} />
              </Box>
              <Stack direction="row" spacing={1}>
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton variant="circular" width={40} height={40} />
              </Stack>
            </Stack>
            <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
              <Skeleton variant="rounded" width={100} height={32} sx={{ borderRadius: 2 }} />
              <Skeleton variant="rounded" width={100} height={32} sx={{ borderRadius: 2 }} />
              <Skeleton variant="rounded" width={140} height={32} sx={{ borderRadius: 2 }} />
            </Stack>
            <Skeleton variant="rounded" height={120} sx={{ mt: 4, borderRadius: 2 }} />
          </Box>
        </Paper>
      </Box>
    );
  }

  if (!task) {
    return (
      <Box sx={{ maxWidth: 800, mx: "auto", px: { xs: 2, md: 4 }, py: { xs: 2, md: 3 } }}>
        <Button
          startIcon={<ArrowBackRoundedIcon />}
          component={RouterLink}
          to="/"
          sx={{ textTransform: "none", borderRadius: 2, mb: 3 }}
        >
          Назад к списку
        </Button>
        <Paper
          elevation={0}
          sx={{
            py: 8,
            textAlign: "center",
            borderRadius: 4,
            border: `2px dashed ${theme.palette.divider}`,
          }}
        >
          <Typography variant="h6" color="text.secondary">
            Задача не найдена
          </Typography>
        </Paper>
      </Box>
    );
  }

  const isOverdue = isPast(parseISO(task.deadline)) && task.status !== "done";
  const sMeta = statusMeta[task.status] || statusMeta.todo;
  const pMeta = priorityMeta[task.priority] || priorityMeta.medium;

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", px: { xs: 2, md: 4 }, py: { xs: 2, md: 3 } }}>
      <Button
        startIcon={<ArrowBackRoundedIcon />}
        component={RouterLink}
        to="/"
        sx={{
          textTransform: "none",
          borderRadius: 2,
          fontWeight: 600,
          mb: 3,
          color: "text.secondary",
          "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.08) },
        }}
      >
        Назад к списку
      </Button>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
          overflow: "hidden",
          background: `linear-gradient(180deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.action.hover, 0.04)} 100%)`,
        }}
      >
        <Box
          sx={{
            height: 6,
            background: `linear-gradient(90deg, ${pMeta.color}, ${alpha(pMeta.color, 0.3)})`,
          }}
        />
        <Box sx={{ p: { xs: 3, md: 4 } }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "flex-start" }}
            spacing={2}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  lineHeight: 1.3,
                  wordBreak: "break-word",
                  fontSize: { xs: "1.5rem", md: "2rem" },
                }}
              >
                {task.title}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
                <Chip
                  label={sMeta.label}
                  color={sMeta.color}
                  size="small"
                  sx={{ fontWeight: 600, borderRadius: 2 }}
                />
                {isOverdue && (
                  <Chip
                    icon={<WarningAmberRoundedIcon sx={{ fontSize: 14 }} />}
                    label="Просрочено"
                    color="error"
                    size="small"
                    sx={{ fontWeight: 600, borderRadius: 2 }}
                  />
                )}
              </Stack>
            </Box>
            <Stack direction="row" spacing={1} flexShrink={0}>
              <Tooltip title="Редактировать" arrow>
                <IconButton
                  component={RouterLink}
                  to={`/edit/${task.id}`}
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    borderRadius: 2,
                    "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.16) },
                  }}
                >
                  <EditRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Удалить" arrow>
                <IconButton
                  onClick={() => setDeleteOpen(true)}
                  sx={{
                    bgcolor: alpha(theme.palette.error.main, 0.08),
                    borderRadius: 2,
                    color: "error.main",
                    "&:hover": { bgcolor: alpha(theme.palette.error.main, 0.16) },
                  }}
                >
                  <DeleteRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ mt: 3 }}
            flexWrap="wrap"
            useFlexGap
            divider={
              <Divider
                orientation="vertical"
                flexItem
                sx={{ display: { xs: "none", sm: "block" } }}
              />
            }
          >
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <FlagRoundedIcon sx={{ fontSize: 16, color: pMeta.color }} />
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: pMeta.color,
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  bgcolor: pMeta.bg,
                  fontSize: "0.8rem",
                }}
              >
                {pMeta.label}
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <CalendarTodayRoundedIcon
                sx={{ fontSize: 16, color: isOverdue ? "error.main" : "text.disabled" }}
              />
              <Typography
                variant="body2"
                sx={{
                  fontWeight: isOverdue ? 600 : 400,
                  color: isOverdue ? "error.main" : "text.secondary",
                  fontSize: "0.85rem",
                }}
              >
                {format(parseISO(task.deadline), "d MMMM yyyy", { locale: ru })}
              </Typography>
            </Stack>
          </Stack>
          {task.tags.length > 0 && (
            <Stack direction="row" spacing={0.75} sx={{ mt: 2.5 }} flexWrap="wrap" useFlexGap>
              {task.tags.map((tagId) => (
                <Chip
                  key={tagId}
                  icon={<LocalOfferOutlinedIcon sx={{ fontSize: 14 }} />}
                  label={getTagName(tagId)}
                  size="small"
                  sx={{
                    borderRadius: 2,
                    fontWeight: 500,
                    fontSize: "0.8rem",
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    color: theme.palette.primary.dark,
                  }}
                />
              ))}
            </Stack>
          )}
        </Box>
        <Divider />
        <Box sx={{ p: { xs: 3, md: 4 } }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <DescriptionOutlinedIcon sx={{ fontSize: 20, color: "text.secondary" }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Описание
            </Typography>
          </Stack>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 3 },
              borderRadius: 3,
              bgcolor: alpha(theme.palette.action.hover, 0.04),
              border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
              minHeight: 80,
            }}
          >
            <Typography
              variant="body1"
              sx={{
                whiteSpace: "pre-wrap",
                lineHeight: 1.8,
                color: task.description ? "text.primary" : "text.disabled",
              }}
            >
              {task.description || "Нет описания."}
            </Typography>
          </Paper>
        </Box>
        <Divider />
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: 0.5, sm: 3 }}
          sx={{
            px: { xs: 3, md: 4 },
            py: 2,
            bgcolor: alpha(theme.palette.action.hover, 0.03),
          }}
        >
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <AccessTimeRoundedIcon sx={{ fontSize: 14, color: "text.disabled" }} />
            <Typography variant="caption" color="text.secondary">
              Создано: {format(parseISO(task.createdAt), "d MMM yyyy, HH:mm", { locale: ru })}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <AccessTimeRoundedIcon sx={{ fontSize: 14, color: "text.disabled" }} />
            <Typography variant="caption" color="text.secondary">
              Обновлено: {format(parseISO(task.updatedAt), "d MMM yyyy, HH:mm", { locale: ru })}
            </Typography>
          </Stack>
        </Stack>
      </Paper>
      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        slotProps={{ paper: { sx: { borderRadius: 3, maxWidth: 420 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 0.5 }}>Удалить задачу?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: "0.875rem" }}>
            Это действие нельзя отменить. Задача «{task.title}» будет удалена навсегда.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setDeleteOpen(false)}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Отмена
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            disableElevation
            sx={{
              textTransform: "none",
              borderRadius: 2,
              px: 3,
              boxShadow: `0 4px 14px ${alpha(theme.palette.error.main, 0.35)}`,
            }}
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
