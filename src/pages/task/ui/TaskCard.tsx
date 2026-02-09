import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { isPast } from "date-fns";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import CardActions from "@mui/material/CardActions";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import LinearProgress from "@mui/material/LinearProgress";
import { alpha, styled, useTheme } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import FlagIcon from "@mui/icons-material/Flag";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { Tag, Task, TaskStatus } from "@/entities/task";
import { formatDeadline, getDeadlineEnd, getDeadlineProgress } from "@/shared/lib";

interface TaskCardProps {
  task: Task;
  tagsMap: Record<string, Tag>;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
  statusDisabled?: boolean;
  onTagClick?: (tagId: string) => void;
}

type CardTone = "default" | "overdue" | "done";

const MAX_VISIBLE_TAGS = 2;

const priorityMeta: Record<string, { label: string; color: string; bg: string; progress: number }> =
  {
    low: { label: "Низкий", color: "#43a047", bg: "#e8f5e9", progress: 33 },
    medium: { label: "Средний", color: "#fb8c00", bg: "#fff3e0", progress: 66 },
    high: { label: "Высокий", color: "#e53935", bg: "#ffebee", progress: 100 },
  };

const statusMeta: Record<
  TaskStatus,
  { label: string; color: "default" | "primary" | "success"; emoji: string }
> = {
  todo: { label: "Активно", color: "default", emoji: "📋" },
  inProgress: { label: "В процессе", color: "primary", emoji: "🔧" },
  done: { label: "Выполнено", color: "success", emoji: "✅" },
};

const StyledCard = styled(Card, {
  shouldForwardProp: (p) => p !== "tone",
})<{ tone: CardTone }>(({ theme, tone }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
  borderRadius: `0 0 ${theme.spacing(2)} ${theme.spacing(2)}`,
  border: "1px solid",
  borderColor:
    tone === "overdue"
      ? theme.palette.error.light
      : tone === "done"
        ? theme.palette.success.light
        : theme.palette.divider,
  background:
    tone === "done"
      ? `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.04)} 0%, ${alpha(theme.palette.success.main, 0.1)} 100%)`
      : tone === "overdue"
        ? `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.03)} 0%, ${alpha(theme.palette.error.main, 0.08)} 100%)`
        : theme.palette.background.paper,
  transition: "all 0.25s cubic-bezier(.4,0,.2,1)",
  overflow: "hidden",
  wordBreak: "break-word",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: `0 12px 28px ${alpha(theme.palette.common.black, 0.12)}`,
    borderColor:
      tone === "overdue"
        ? theme.palette.error.main
        : tone === "done"
          ? theme.palette.success.main
          : theme.palette.primary.light,
  },
}));

const TitleLink = styled(RouterLink)(({ theme }) => ({
  textDecoration: "none",
  color: theme.palette.text.primary,
  fontWeight: 700,
  fontSize: "1.05rem",
  lineHeight: 1.4,
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  textOverflow: "ellipsis",
  transition: "color 0.2s",
  "&:hover": {
    color: theme.palette.primary.main,
  },
}));

const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
  const meta = priorityMeta[priority] ?? priorityMeta.medium;

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.5}
      sx={{
        px: 1,
        py: 0.25,
        borderRadius: 1,
        bgcolor: meta.bg,
        color: meta.color,
        fontSize: "0.75rem",
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      <FlagIcon sx={{ fontSize: 14 }} />
      <span>{meta.label}</span>
    </Stack>
  );
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  tagsMap,
  onStatusChange,
  onDelete,
  statusDisabled,
  onTagClick,
}) => {
  const theme = useTheme();

  const deadlineEnd = getDeadlineEnd(task.deadline);
  const isExpired = !!deadlineEnd && isPast(deadlineEnd);
  const isOverdue = isExpired && task.status !== "done";

  const tone: CardTone = isOverdue ? "overdue" : task.status === "done" ? "done" : "default";
  const sMeta = statusMeta[task.status];

  const timeProgress = getDeadlineProgress(task.deadline);

  const progressValue = task.status === "done" ? 100 : timeProgress;
  const progressColor = isOverdue
    ? "#e53935"
    : task.status === "done"
      ? "#43a047"
      : timeProgress >= 90
        ? "#e53935"
        : timeProgress >= 60
          ? "#fb8c00"
          : "#43a047";

  const handleStatusChange = (e: SelectChangeEvent) => {
    onStatusChange(task.id, e.target.value as TaskStatus);
  };

  const resolvedTags = task.tags.map((id) => ({ id, tag: tagsMap[id] })).filter((t) => !!t.tag);
  const visibleTags = resolvedTags.slice(0, MAX_VISIBLE_TAGS);
  const hiddenTags = resolvedTags.slice(MAX_VISIBLE_TAGS);

  return (
    <StyledCard variant="outlined" tone={tone}>
      <LinearProgress
        variant="determinate"
        value={progressValue}
        sx={{
          height: 4,
          flexShrink: 0,
          bgcolor: alpha(progressColor, 0.12),
          "& .MuiLinearProgress-bar": {
            bgcolor: progressColor,
            borderRadius: 0,
          },
        }}
      />
      <CardContent
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          p: 2.5,
          "&:last-child": { pb: 2.5 },
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 1,
            flexShrink: 0,
          }}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <TitleLink to={`/task/${task.id}`}>{task.title}</TitleLink>
          </Box>
          <Stack direction="row" spacing={0.5} flexShrink={0} alignItems="flex-start">
            <Chip
              label={sMeta.label}
              color={sMeta.color}
              size="small"
              sx={{ fontWeight: 600, fontSize: "0.7rem", height: 24 }}
            />
            {isOverdue && (
              <Chip
                icon={<WarningAmberRoundedIcon sx={{ fontSize: 14 }} />}
                label="Просрочено"
                color="error"
                size="small"
                sx={{ fontWeight: 600, fontSize: "0.7rem", height: 24 }}
              />
            )}
          </Stack>
        </Box>
        <Box
          sx={{
            flexGrow: 1,
            flexShrink: 1,
            minHeight: 0,
            mt: 1.5,
            mb: 2,
            overflow: "hidden",
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              lineHeight: 1.6,
            }}
          >
            {task.description || "Нет описания."}
          </Typography>
        </Box>
        <Box
          sx={{
            flexShrink: 0,
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          <Stack
            direction="row"
            gap={0.75}
            alignItems="center"
            sx={{
              flexWrap: "nowrap",
              overflow: "hidden",
              minWidth: 0,
            }}
          >
            <PriorityBadge priority={task.priority} />
            {visibleTags.map(({ id, tag }) => (
              <Chip
                key={id}
                icon={<LocalOfferOutlinedIcon sx={{ fontSize: 14 }} />}
                label={tag!.name}
                size="small"
                clickable
                onClick={() => onTagClick?.(id)}
                sx={{
                  height: 24,
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  flexShrink: 1,
                  minWidth: 0,
                  maxWidth: 110,
                  "& .MuiChip-label": {
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    display: "block",
                  },
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  color: theme.palette.primary.dark,
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.18),
                  },
                }}
              />
            ))}
            {hiddenTags.length > 0 && (
              <Tooltip title={hiddenTags.map((t) => t.tag!.name).join(", ")} arrow>
                <Chip
                  label={`+${hiddenTags.length}`}
                  size="small"
                  sx={{
                    height: 24,
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    flexShrink: 0,
                    bgcolor: alpha(theme.palette.text.primary, 0.08),
                    color: theme.palette.text.secondary,
                    cursor: "default",
                  }}
                />
              </Tooltip>
            )}
          </Stack>
        </Box>
        <Box sx={{ flexShrink: 0, mt: 2 }}>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <CalendarTodayIcon
              sx={{
                fontSize: 14,
                color: isOverdue ? "error.main" : "text.disabled",
              }}
            />
            <Typography
              variant="caption"
              noWrap
              sx={{
                color: isOverdue ? "error.main" : "text.secondary",
                fontWeight: isOverdue ? 600 : 400,
              }}
            >
              {formatDeadline(task.deadline)}
            </Typography>
          </Stack>
        </Box>
      </CardContent>
      <Divider />
      <CardActions
        sx={{
          justifyContent: "space-between",
          px: 2,
          py: 1.5,
          flexShrink: 0,
          bgcolor: alpha(theme.palette.action.hover, 0.03),
        }}
      >
        <FormControl size="small" variant="outlined" sx={{ minWidth: 130 }}>
          <Select
            value={task.status}
            onChange={handleStatusChange}
            disabled={statusDisabled}
            sx={{
              fontSize: "0.8rem",
              height: 32,
              borderRadius: 1.5,
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: alpha(theme.palette.divider, 0.6),
              },
            }}
          >
            {(Object.keys(statusMeta) as TaskStatus[]).map((key) => (
              <MenuItem key={key} value={key} sx={{ fontSize: "0.85rem" }}>
                {statusMeta[key].emoji}&nbsp;&nbsp;{statusMeta[key].label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Редактировать" arrow>
            <IconButton
              component={RouterLink}
              to={`/edit/${task.id}`}
              size="small"
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.18) },
              }}
            >
              <EditIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Удалить" arrow>
            <IconButton
              onClick={() => onDelete(task.id)}
              size="small"
              sx={{
                bgcolor: alpha(theme.palette.error.main, 0.08),
                color: "error.main",
                "&:hover": { bgcolor: alpha(theme.palette.error.main, 0.18) },
              }}
            >
              <DeleteIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </CardActions>
    </StyledCard>
  );
};
