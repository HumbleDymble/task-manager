import { v4 } from "uuid";
import { CreateTaskDto, Tag, Task, TaskStatus, UpdateTaskDto } from "@/entities/task";
import { baseApi } from "@/shared/api";

interface GetTasksArgs {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  priority?: string;
  tagId?: string;
  sortBy?: string;
}

interface TasksResponse {
  tasks: Task[];
  totalCount: number;
}

function parseSortBy(sortBy?: string): { _sort?: string; _order?: string } {
  if (!sortBy) return {};

  const lastUnderscore = sortBy.lastIndexOf("_");
  if (lastUnderscore === -1) return { _sort: sortBy };

  const field = sortBy.slice(0, lastUnderscore);
  const order = sortBy.slice(lastUnderscore + 1);

  return {
    _sort: field,
    _order: order,
  };
}

export const taskEndpoints = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTasks: build.query<TasksResponse, GetTasksArgs>({
      query: ({ page, limit, search, status, priority, tagId, sortBy }) => {
        const params: Record<string, string | number> = {};

        if (!tagId) {
          params._page = page;
          params._limit = limit;
        }

        if (search?.trim()) {
          params.q = search.trim();
        }

        if (status) {
          params.status = status;
        }

        if (priority) {
          params.priority = priority;
        }

        const { _sort, _order } = parseSortBy(sortBy);
        if (_sort) params._sort = _sort;
        if (_order) params._order = _order;

        return {
          url: "/tasks",
          params,
        };
      },

      transformResponse(apiResponse: Task[], meta, arg) {
        let tasks = apiResponse;

        if (arg.tagId) {
          tasks = tasks.filter(
            (task) => Array.isArray(task.tags) && task.tags.includes(arg.tagId!),
          );
        }

        if (arg.tagId) {
          const totalCount = tasks.length;
          const start = (arg.page - 1) * arg.limit;
          const end = start + arg.limit;
          return {
            tasks: tasks.slice(start, end),
            totalCount,
          };
        }

        const totalCountHeader = meta?.response?.headers.get("X-Total-Count");
        return {
          tasks,
          totalCount: Number(totalCountHeader || 0),
        };
      },

      providesTags: (result) => {
        if (!result?.tasks) {
          return [{ type: "Task", id: "LIST" }];
        }
        return [
          ...result.tasks.map(({ id }) => ({ type: "Task" as const, id })),
          { type: "Task", id: "LIST" },
        ];
      },
    }),

    getTask: build.query<Task, string>({
      query: (id) => `/tasks/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Task", id }],
    }),

    createTask: build.mutation<Task, CreateTaskDto>({
      query: (body) => ({
        url: "/tasks",
        method: "POST",
        body: {
          ...body,
          id: v4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }),
      invalidatesTags: [{ type: "Task", id: "LIST" }],
    }),

    updateTask: build.mutation<Task, UpdateTaskDto>({
      query: ({ id, ...body }) => ({
        url: `/tasks/${id}`,
        method: "PATCH",
        body: { ...body, updatedAt: new Date().toISOString() },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Task", id },
        { type: "Task", id: "LIST" },
      ],
    }),

    deleteTask: build.mutation<void, string>({
      query: (id) => ({ url: `/tasks/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Task", id: "LIST" }],
    }),

    getTags: build.query<Tag[], void>({
      query: () => "/tags",
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Tag" as const, id })), { type: "Tag", id: "LIST" }]
          : [{ type: "Tag", id: "LIST" }],
    }),

    createTag: build.mutation<Tag, { name: string }>({
      query: (body) => ({
        url: "/tags",
        method: "POST",
        body: { id: v4(), name: body.name },
      }),
      invalidatesTags: [{ type: "Tag", id: "LIST" }],
    }),

    patchTaskStatus: build.mutation<Task, { id: string; status: TaskStatus }>({
      query: ({ id, status }) => ({
        url: `/tasks/${id}`,
        method: "PATCH",
        body: { status, updatedAt: new Date().toISOString() },
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Task", id },
        { type: "Task", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useGetTaskQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useGetTagsQuery,
  useCreateTagMutation,
  usePatchTaskStatusMutation,
} = taskEndpoints;
