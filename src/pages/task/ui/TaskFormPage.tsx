import React, { useEffect } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import FormLabel from "@mui/material/FormLabel";
import FormHelperText from "@mui/material/FormHelperText";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import Chip from "@mui/material/Chip";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import AddTaskRoundedIcon from "@mui/icons-material/AddTaskRounded";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import FlagRoundedIcon from "@mui/icons-material/FlagRounded";
import { alpha, useTheme } from "@mui/material/styles";
import {
  Tag,
  useCreateTagMutation,
  useCreateTaskMutation,
  useGetTagsQuery,
  useGetTaskQuery,
  useUpdateTaskMutation,
} from "@/entities/task";

const taskSchema = z.object({
  title: z.string().min(5, "Название должно содержать как минимум 5 символов"),
  description: z.string().max(500, "Описание максимум 500 символов").optional(),
  status: z.enum(["todo", "inProgress", "done"]),
  priority: z.enum(["low", "medium", "high"]),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Обязательное поле"),
  tags: z.array(z.string()).min(1, "Как минимум один тег обязателен"),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TagOption extends Tag {
  inputValue?: string;
}

const filter = createFilterOptions<TagOption>();

const priorityOptions = [
  { value: "low", label: "Низкий", color: "#43a047", emoji: "🟢" },
  { value: "medium", label: "Средний", color: "#fb8c00", emoji: "🟠" },
  { value: "high", label: "Высокий", color: "#e53935", emoji: "🔴" },
] as const;

const statusOptions = [
  { value: "todo", label: "📋 Активно" },
  { value: "inProgress", label: "🔧 В процессе" },
  { value: "done", label: "✅ Выполнено" },
] as const;

export const TaskFormPage: React.FC = () => {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const { data: task, isLoading: isTaskLoading } = useGetTaskQuery(id || "", { skip: !isEditMode });
  const { data: tags = [] } = useGetTagsQuery();
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const [createTag] = useCreateTagMutation();

  const isSaving = isCreating || isUpdating;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      deadline: format(new Date(), "yyyy-MM-dd"),
      tags: [],
    },
  });

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || "",
        status: task.status,
        priority: task.priority,
        deadline: task.deadline.split("T")[0],
        tags: task.tags,
      });
    }
  }, [task, reset]);

  const onSubmit = async (data: TaskFormValues) => {
    try {
      const payload = {
        ...data,
        status: data.status,
        priority: data.priority,
        deadline: data.deadline,
      };
      if (isEditMode && id) {
        await updateTask({ id, ...payload }).unwrap();
      } else {
        await createTask(payload).unwrap();
      }
      navigate("/");
    } catch (error) {
      console.error("Не удалось сохранить задачу", error);
    }
  };

  const handleCreateTag = async (tagName: string): Promise<Tag | undefined> => {
    try {
      return await createTag({ name: tagName }).unwrap();
    } catch (e) {
      console.error("Не удалось создать тег", e);
      return undefined;
    }
  };

  const tagOptions: TagOption[] = tags;

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2.5,
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.palette.primary.light,
      },
    },
  } as const;

  if (isEditMode && isTaskLoading) {
    return (
      <Box sx={{ maxWidth: 720, mx: "auto", px: { xs: 2, md: 4 }, py: { xs: 2, md: 3 } }}>
        <Skeleton variant="rounded" width={180} height={36} sx={{ mb: 3, borderRadius: 2 }} />
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            border: `1px solid ${theme.palette.divider}`,
            overflow: "hidden",
          }}
        >
          <Box sx={{ p: { xs: 3, md: 4 } }}>
            <Skeleton variant="text" width="50%" height={36} sx={{ mb: 3 }} />
            <Skeleton variant="rounded" height={56} sx={{ borderRadius: 2.5, mb: 2 }} />
            <Skeleton variant="rounded" height={120} sx={{ borderRadius: 2.5, mb: 2 }} />
            <Stack direction="row" spacing={2}>
              <Skeleton variant="rounded" height={56} sx={{ flex: 1, borderRadius: 2.5 }} />
              <Skeleton variant="rounded" height={56} sx={{ flex: 1, borderRadius: 2.5 }} />
            </Stack>
            <Skeleton variant="rounded" height={40} width="60%" sx={{ mt: 3, borderRadius: 2 }} />
            <Skeleton variant="rounded" height={56} sx={{ mt: 2, borderRadius: 2.5 }} />
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 720, mx: "auto", px: { xs: 2, md: 4 }, py: { xs: 2, md: 3 } }}>
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
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          }}
        />
        <Box sx={{ p: { xs: 3, md: 4 } }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              }}
            >
              {isEditMode ? (
                <EditNoteRoundedIcon sx={{ color: "#fff", fontSize: 22 }} />
              ) : (
                <AddTaskRoundedIcon sx={{ color: "#fff", fontSize: 22 }} />
              )}
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              {isEditMode ? "Редактировать задачу" : "Новая задача"}
            </Typography>
          </Stack>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Название"
                    fullWidth
                    error={!!errors.title}
                    helperText={errors.title?.message}
                    placeholder="Введите название задачи"
                    sx={inputSx}
                  />
                )}
              />
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Описание"
                    fullWidth
                    multiline
                    rows={4}
                    error={!!errors.description}
                    helperText={
                      errors.description?.message || `${(field.value || "").length}/500 символов`
                    }
                    placeholder="Опишите задачу подробнее…"
                    sx={inputSx}
                  />
                )}
              />
              <Divider sx={{ borderStyle: "dashed" }} />
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 2.5,
                }}
              >
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Статус"
                      fullWidth
                      error={!!errors.status}
                      helperText={errors.status?.message}
                      sx={inputSx}
                    >
                      {statusOptions.map((o) => (
                        <MenuItem key={o.value} value={o.value}>
                          {o.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
                <Controller
                  name="deadline"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="date"
                      label="Дедлайн"
                      fullWidth
                      slotProps={{ inputLabel: { shrink: true } }}
                      error={!!errors.deadline}
                      helperText={errors.deadline?.message}
                      sx={inputSx}
                    />
                  )}
                />
              </Box>
              <FormControl component="fieldset" error={!!errors.priority}>
                <FormLabel
                  component="legend"
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    mb: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <FlagRoundedIcon sx={{ fontSize: 18 }} />
                  Приоритет
                </FormLabel>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                      {priorityOptions.map((option) => {
                        const isSelected = field.value === option.value;
                        return (
                          <Chip
                            key={option.value}
                            label={`${option.emoji} ${option.label}`}
                            clickable
                            onClick={() => field.onChange(option.value)}
                            sx={{
                              px: 1,
                              fontWeight: 600,
                              fontSize: "0.85rem",
                              height: 36,
                              borderRadius: 2,
                              border: `2px solid ${isSelected ? option.color : "transparent"}`,
                              bgcolor: isSelected
                                ? alpha(option.color, 0.1)
                                : alpha(theme.palette.action.hover, 0.06),
                              color: isSelected ? option.color : "text.secondary",
                              transition: "all 0.2s ease",
                              "&:hover": {
                                bgcolor: alpha(option.color, 0.15),
                                color: option.color,
                              },
                            }}
                          />
                        );
                      })}
                    </Stack>
                  )}
                />
                <FormHelperText>{errors.priority?.message}</FormHelperText>
              </FormControl>
              <Divider sx={{ borderStyle: "dashed" }} />
              <Controller
                name="tags"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Autocomplete<TagOption, true, false, false>
                    multiple
                    options={tagOptions}
                    getOptionLabel={(option) => {
                      if (option.inputValue) return `Добавить "${option.inputValue}"`;
                      return option.name;
                    }}
                    value={value
                      .map((tagId) => tagOptions.find((t) => t.id === tagId))
                      .filter((t): t is TagOption => t !== undefined)}
                    isOptionEqualToValue={(option, val) => option.id === val.id}
                    filterOptions={(options, params) => {
                      const filtered = filter(options, params);
                      if (
                        params.inputValue !== "" &&
                        !options.some(
                          (o) => o.name.toLowerCase() === params.inputValue.toLowerCase(),
                        )
                      ) {
                        filtered.push({
                          id: "__new__",
                          name: `Добавить "${params.inputValue}"`,
                          inputValue: params.inputValue,
                        });
                      }
                      return filtered;
                    }}
                    onChange={async (_, newValue) => {
                      const last = newValue[newValue.length - 1];
                      if (last && last.inputValue) {
                        const newTag = await handleCreateTag(last.inputValue);
                        if (newTag) onChange([...value, newTag.id]);
                      } else {
                        onChange(newValue.map((v) => v.id));
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Теги"
                        placeholder="Выберите или создайте теги"
                        error={!!errors.tags}
                        helperText={errors.tags?.message}
                        sx={inputSx}
                      />
                    )}
                    renderTags={(tagValue, getTagProps) =>
                      tagValue.map((option, index) => {
                        const { key, ...rest } = getTagProps({ index });
                        return (
                          <Chip
                            key={key}
                            label={option.name}
                            size="small"
                            {...rest}
                            sx={{
                              borderRadius: 1.5,
                              fontWeight: 500,
                              bgcolor: alpha(theme.palette.primary.main, 0.08),
                              color: theme.palette.primary.dark,
                              "& .MuiChip-deleteIcon": {
                                color: alpha(theme.palette.primary.main, 0.4),
                                "&:hover": { color: theme.palette.primary.main },
                              },
                            }}
                          />
                        );
                      })
                    }
                  />
                )}
              />
            </Stack>
            <Divider sx={{ my: 3 }} />
            <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
              <Button
                onClick={() => navigate("/")}
                disabled={isSaving}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  px: 3,
                  fontWeight: 600,
                  color: "text.secondary",
                }}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSaving}
                disableElevation
                startIcon={<SaveRoundedIcon />}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  px: 4,
                  fontWeight: 600,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.35)}`,
                  "&:hover": {
                    boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.45)}`,
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                  },
                }}
              >
                {isSaving ? "Сохранение..." : isEditMode ? "Обновить задачу" : "Создать задачу"}
              </Button>
            </Stack>
          </form>
        </Box>
      </Paper>
    </Box>
  );
};
