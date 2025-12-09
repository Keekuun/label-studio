import { createRoot } from "react-dom/client";
import "../../playground/src/utils/embedFeatureFlags";
import { VisualEditorApp } from "./components/VisualEditor";
import { ErrorBoundary } from "./components/ErrorBoundary";

// 导入全局样式
import "@humansignal/ui/src/styles.scss";
import "@humansignal/ui/src/tailwind.css";
import "antd/dist/antd.css"; // Ant Design 样式（v4 使用 antd.css）
import "./styles/global.scss"; // 全局样式重置

const root = createRoot(document.getElementById("root")!);
root.render(
  <ErrorBoundary>
    <VisualEditorApp />
  </ErrorBoundary>
);

