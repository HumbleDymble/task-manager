import React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputAdornment from "@mui/material/InputAdornment";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { Tag } from "@/entities/task";

interface FiltersState {
  search: string;
  status: string;
  priority: string;
  tagId: string;
  sortBy: string;
}

interface TaskFiltersProps {
  filters: FiltersState;
  tags: Tag[];
  onFilterChange: (newFilters: FiltersState) => void;
}

const statusOptions = [
  { value: "", label: "Все статусы" },
  { value: "todo", label: "Активно" },
  { value: "inProgress", label: "В процессе" },
  { value: "done", label: "Выполнено" },
];

const priorityOptions = [
  { value: "", label: "Все приоритеты" },
  { value: "low", label: "Низкий" },
  { value: "medium", label: "Средний" },
  { value: "high", label: "Высокий" },
];

const sortOptions = [
  { value: "createdAt_desc", label: "Сначала новые" },
  { value: "createdAt_asc", label: "Сначала старые" },
  { value: "deadline_asc", label: "Дедлайн ↑" },
  { value: "deadline_desc", label: "Дедлайн ↓" },
];

export const TaskFilters: React.FC<TaskFiltersProps> = ({ filters, tags, onFilterChange }) => {
  const handleChange = (field: keyof FiltersState, value: string) => {
    onFilterChange({ ...filters, [field]: value });
  };

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "1fr 1fr",
          md: "2fr 1fr 1fr 1fr 1fr",
        },
        gap: 1.5,
        mb: 3,
      }}
    >
      <TextField
        placeholder="Поиск…"
        variant="outlined"
        size="small"
        value={filters.search}
        onChange={(e) => handleChange("search", e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon sx={{ fontSize: 18, color: "text.disabled" }} />
              </InputAdornment>
            ),
          },
        }}
        sx={{ gridColumn: { xs: "1 / -1", md: "auto" } }}
      />
      <FormControl size="small">
        <InputLabel>Статус</InputLabel>
        <Select
          value={filters.status}
          label="Статус"
          onChange={(e: SelectChangeEvent) => handleChange("status", e.target.value)}
        >
          {statusOptions.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small">
        <InputLabel>Приоритет</InputLabel>
        <Select
          value={filters.priority}
          label="Приоритет"
          onChange={(e: SelectChangeEvent) => handleChange("priority", e.target.value)}
        >
          {priorityOptions.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small">
        <InputLabel>Тег</InputLabel>
        <Select
          value={filters.tagId}
          label="Тег"
          onChange={(e: SelectChangeEvent) => handleChange("tagId", e.target.value)}
        >
          <MenuItem value="">Все теги</MenuItem>
          {tags.map((tag) => (
            <MenuItem key={tag.id} value={tag.id}>
              {tag.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small">
        <InputLabel>Сортировка</InputLabel>
        <Select
          value={filters.sortBy}
          label="Сортировка"
          onChange={(e: SelectChangeEvent) => handleChange("sortBy", e.target.value)}
        >
          {sortOptions.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};
