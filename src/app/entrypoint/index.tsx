import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { store } from "../store/store";
import { Layout } from "../store/Layout";
import { TaskDetailPage, TaskFormPage, TaskListPage } from "@/pages/task";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<TaskListPage />} />
          <Route path="task/:id" element={<TaskDetailPage />} />
          <Route path="create" element={<TaskFormPage />} />
          <Route path="edit/:id" element={<TaskFormPage />} />
          <Route path="*" element={<TaskListPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </Provider>,
);
