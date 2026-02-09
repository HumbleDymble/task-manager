import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import CircularProgress from "@mui/material/CircularProgress";
import Pagination from "@mui/material/Pagination";
import DialogActions from "@mui/material/DialogActions";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Fab from "@mui/material/Fab";
import Fade from "@mui/material/Fade";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import AddIcon from "@mui/icons-material/Add";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import { alpha, useTheme } from "@mui/material/styles";
import { TaskCard } from "./TaskCard";
import { TaskFilters } from "./TaskFilters";
import {
  Tag,
  TaskStatus,
  useCreateTagMutation,
  useDeleteTaskMutation,
  useGetTagsQuery,
  useGetTasksQuery,
  usePatchTaskStatusMutation,
} from "@/entities/task";
import { useDebounce } from "@/shared/lib";

const ITEMS_PER_PAGE = 6;

export const TaskListPage: React.FC = () => {
  const theme = useTheme();
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    priority: "",
    tagId: "",
    sortBy: "createdAt_desc",
  });

  const debouncedSearch = useDebounce(filters.search, 500);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters.status, filters.priority, filters.tagId, filters.sortBy]);

  const {
    data,
    isLoading: isTasksLoading,
    isFetching,
  } = useGetTasksQuery({
    page,
    limit: ITEMS_PER_PAGE,
    search: debouncedSearch,
    status: filters.status || undefined,
    priority: filters.priority || undefined,
    tagId: filters.tagId || undefined,
    sortBy: filters.sortBy || undefined,
  });

  const tasks = data?.tasks || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const { data: tags = [], isLoading: isTagsLoading } = useGetTagsQuery();
  const [deleteTask] = useDeleteTaskMutation();
  const [createTag] = useCreateTagMutation();
  const [patchTaskStatus] = usePatchTaskStatusMutation();

  const [statusPendingId, setStatusPendingId] = useState<string | null>(null);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [tagCreateError, setTagCreateError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const tagsMap = useMemo(() => {
    return tags.reduce<Record<string, Tag>>((acc, tag) => {
      acc[tag.id] = tag;
      return acc;
    }, {});
  }, [tags]);

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleStatusChange = useCallback(
    (id: string, status: TaskStatus) => {
      setStatusPendingId(id);
      patchTaskStatus({ id, status })
        .unwrap()
        .finally(() => setStatusPendingId(null));
    },
    [patchTaskStatus],
  );

  const handleDeleteClick = useCallback((id: string) => {
    setDeleteConfirmId(id);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (deleteConfirmId) {
      await deleteTask(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  }, [deleteConfirmId, deleteTask]);

  const handleCreateTag = useCallback(async () => {
    const name = newTagName.trim();
    if (!name) return;

    try {
      const created = await createTag({ name }).unwrap();
      setTagDialogOpen(false);
      setNewTagName("");
      setTagCreateError(null);
      setFilters((prev) => ({ ...prev, tagId: created.id }));
    } catch {
      setTagCreateError("Не удалось создать тег");
    }
  }, [newTagName, createTag]);

  const handleFilterChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
  }, []);

  const handleTagClick = useCallback((tagId: string) => {
    setFilters((prev) => ({ ...prev, tagId }));
  }, []);

  if (isTasksLoading || isTagsLoading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        sx={{ minHeight: "60vh", gap: 2 }}
      >
        <CircularProgress size={48} thickness={4} />
        <Typography variant="body2" color="text.secondary">
          Загрузка задач…
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1280,
        mx: "auto",
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 2, md: 3 },
        minHeight: "100vh",
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 500,
              background: "#000",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Мои задачи
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Создать тег" arrow>
            <IconButton
              onClick={() => setTagDialogOpen(true)}
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.16) },
              }}
            >
              <LocalOfferOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button
            component={RouterLink}
            to="/create"
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
              "&:hover": {
                boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.5)}`,
              },
            }}
          >
            Новая задача
          </Button>
        </Stack>
      </Stack>
      <Dialog
        open={tagDialogOpen}
        onClose={() => setTagDialogOpen(false)}
        fullWidth
        maxWidth="xs"
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Создать тег</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Введите название нового тега. Он сразу станет доступен для фильтрации.
          </DialogContentText>
          <TextField
            autoFocus
            value={newTagName}
            onChange={(e) => {
              setNewTagName(e.target.value);
              setTagCreateError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCreateTag();
              }
            }}
            fullWidth
            placeholder="Например: срочное"
            error={!!tagCreateError}
            helperText={tagCreateError}
            sx={{
              "& .MuiOutlinedInput-root": { borderRadius: 2 },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setTagDialogOpen(false)}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Отмена
          </Button>
          <Button
            onClick={handleCreateTag}
            variant="contained"
            disabled={!newTagName.trim()}
            sx={{ textTransform: "none", borderRadius: 2, px: 3 }}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
      <TaskFilters filters={filters} tags={tags} onFilterChange={handleFilterChange} />
      {(filters.status || filters.priority || filters.tagId) && (
        <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
          {filters.status && (
            <Chip
              label={`Статус: ${filters.status}`}
              size="small"
              onDelete={() => setFilters((p) => ({ ...p, status: "" }))}
              sx={{ borderRadius: 1.5 }}
            />
          )}
          {filters.priority && (
            <Chip
              label={`Приоритет: ${filters.priority}`}
              size="small"
              onDelete={() => setFilters((p) => ({ ...p, priority: "" }))}
              sx={{ borderRadius: 1.5 }}
            />
          )}
          {filters.tagId && tagsMap[filters.tagId] && (
            <Chip
              label={`Тег: ${tagsMap[filters.tagId].name}`}
              size="small"
              onDelete={() => setFilters((p) => ({ ...p, tagId: "" }))}
              sx={{ borderRadius: 1.5 }}
            />
          )}
        </Stack>
      )}
      <Fade in={!isFetching} timeout={300}>
        <Box sx={{ opacity: isFetching ? 0.45 : 1, transition: "opacity 0.3s" }}>
          {tasks.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                py: 8,
                px: 4,
                textAlign: "center",
                borderRadius: 4,
                border: `2px dashed ${theme.palette.divider}`,
                bgcolor: alpha(theme.palette.background.default, 0.5),
              }}
            >
              <InboxOutlinedIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Задач не найдено
              </Typography>
              <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
                Попробуйте изменить фильтры или создайте новую задачу
              </Typography>
              <Button
                component={RouterLink}
                to="/create"
                variant="outlined"
                startIcon={<AddIcon />}
                sx={{ textTransform: "none", borderRadius: 2 }}
              >
                Создать задачу
              </Button>
            </Paper>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  lg: "repeat(3, 1fr)",
                },
                gap: { xs: 2, sm: 2.5, md: 3 },
                width: "100%",
              }}
            >
              {tasks.map((task, index) => (
                <Fade
                  key={task.id}
                  in
                  timeout={300 + index * 80}
                  style={{ transitionDelay: `${index * 40}ms` }}
                >
                  <Box
                    sx={{
                      minWidth: 0,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <TaskCard
                      task={task}
                      tagsMap={tagsMap}
                      onStatusChange={handleStatusChange}
                      onDelete={handleDeleteClick}
                      onTagClick={handleTagClick}
                      statusDisabled={statusPendingId === task.id}
                    />
                  </Box>
                </Fade>
              ))}
            </Box>
          )}
        </Box>
      </Fade>
      {totalPages > 1 && (
        <Box
          display="flex"
          justifyContent="center"
          sx={{
            mt: 4,
            mb: 2,
            "& .MuiPagination-ul": { gap: 0.5 },
            "& .MuiPaginationItem-root": {
              borderRadius: 2,
              fontWeight: 600,
              "&.Mui-selected": {
                boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
              },
            },
          }}
        >
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, p) => setPage(p)}
            color="primary"
            disabled={isFetching}
            shape="rounded"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
      <Fab
        component={RouterLink}
        to="/create"
        color="primary"
        aria-label="Создать задачу"
        sx={{
          position: "fixed",
          bottom: { xs: 24, md: 32 },
          right: { xs: 24, md: 32 },
          display: { xs: "flex", sm: "none" },
          boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.45)}`,
        }}
      >
        <AddIcon />
      </Fab>
      <Dialog
        open={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        slotProps={{ paper: { sx: { borderRadius: 3, maxWidth: 400 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Удалить задачу?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Это действие нельзя отменить. Задача будет удалена навсегда.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteConfirmId(null)}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Отмена
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            sx={{
              textTransform: "none",
              borderRadius: 2,
              px: 3,
              boxShadow: `0 4px 14px ${alpha(theme.palette.error.main, 0.4)}`,
            }}
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
