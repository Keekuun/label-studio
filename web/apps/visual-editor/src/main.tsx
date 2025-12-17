import { createRoot } from "react-dom/client";
import "./utils/embedFeatureFlags";
import { VisualEditorApp } from "./components/VisualEditor";
import { ErrorBoundary } from "./components/ErrorBoundary";

import "@humansignal/ui/src/styles.scss";
import "@humansignal/ui/src/tailwind.css";
import "antd/dist/antd.css";
import "./styles/global.scss";

const root = createRoot(document.getElementById("root")!);
root.render(
  <ErrorBoundary>
    <VisualEditorApp />
  </ErrorBoundary>
);

