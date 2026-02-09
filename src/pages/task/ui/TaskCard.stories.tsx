import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "storybook/test";
import { TaskCard } from "./TaskCard";
import { Task } from "@/entities/task";
import { addDays, format, subDays } from "date-fns";
import { ru } from "date-fns/locale";

const meta = {
  title: "Components/TaskCard",
  component: TaskCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof TaskCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockTags = {
  "1": { id: "1", name: "Рабочий" },
  "2": { id: "2", name: "Личный" },
};

const now = new Date();

const mockTask: Task = {
  id: "1",
  title: "Задача",
  description: "Описание",
  status: "todo",
  priority: "medium",
  deadline: format(addDays(now, 1), "yyyy-MM-dd"),
  tags: ["1", "2"],
  createdAt: format(now, "yyyy-MM-dd"),
  updatedAt: format(now, "yyyy-MM-dd"),
};

export const Default: Story = {
  args: {
    task: mockTask,
    tagsMap: mockTags,
    onStatusChange: fn(),
    onDelete: fn(),
    onTagClick: fn(),
  },
};

Default.play = async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);

  const statusSelect = await canvas.findByRole("combobox");
  await userEvent.click(statusSelect);

  const body = within(document.body);
  const listbox = await body.findByRole("listbox");
  const doneOption = await within(listbox).findByRole("option", { name: /выполнено/i });
  await userEvent.click(doneOption);

  await expect(args.onStatusChange).toHaveBeenCalledWith("1", "done");
};

export const Overdue: Story = {
  args: {
    task: {
      ...mockTask,
      deadline: format(subDays(now, 1), "yyyy-MM-dd", { locale: ru }),
    },
    tagsMap: mockTags,
    onStatusChange: fn(),
    onDelete: fn(),
    onTagClick: fn(),
  },
};

export const Completed: Story = {
  args: {
    task: {
      ...mockTask,
      status: "done",
    },
    tagsMap: mockTags,
    onStatusChange: fn(),
    onDelete: fn(),
    onTagClick: fn(),
  },
};
