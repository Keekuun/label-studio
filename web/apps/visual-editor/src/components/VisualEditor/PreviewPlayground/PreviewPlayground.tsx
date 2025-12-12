import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import type { MouseEvent } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { ToastProvider, ToastViewport } from "@humansignal/ui/lib/toast/toast";
import { cnm } from "@humansignal/shad/utils";
import { PreviewPanel } from "../../PreviewPanel";
import { EditorPanel } from "./EditorPanel";
import { configAtom, displayModeAtom } from "../../../../../playground/src/atoms/configAtoms";
import styles from "./PreviewPlayground.module.scss";

const DEFAULT_EDITOR_WIDTH_PERCENT = 50;
const MIN_EDITOR_WIDTH_PERCENT = 20;
const MAX_EDITOR_WIDTH_PERCENT = 80;

interface PreviewPlaygroundProps {
  initialConfig: string;
  onConfigChange?: (config: string) => void;
}

export const PreviewPlayground: React.FC<PreviewPlaygroundProps> = ({
  initialConfig,
  onConfigChange,
}) => {
  const setConfig = useSetAtom(configAtom);
  const config = useAtomValue(configAtom);
  const displayMode = useAtomValue(displayModeAtom);
  const [editorWidth, setEditorWidth] = useState(DEFAULT_EDITOR_WIDTH_PERCENT);
  const dragging = useRef(false);
  const prevConfigRef = useRef<string>("");
  const isInitializedRef = useRef(false);

  // 初始化配置（当 initialConfig 变化时总是更新）
  useEffect(() => {
    // 如果配置确实变化了，更新配置
    if (initialConfig !== prevConfigRef.current) {
      setConfig(initialConfig);
      prevConfigRef.current = initialConfig;
      isInitializedRef.current = true;
    } else if (!isInitializedRef.current) {
      // 首次初始化
      setConfig(initialConfig);
      prevConfigRef.current = initialConfig;
      isInitializedRef.current = true;
    }
  }, [initialConfig, setConfig]);

  // 监听配置变化并通知父组件（排除初始化时的变化）
  useEffect(() => {
    if (isInitializedRef.current && onConfigChange && config !== prevConfigRef.current && config !== initialConfig) {
      onConfigChange(config);
      prevConfigRef.current = config;
    }
  }, [config, onConfigChange, initialConfig]);

  // Draggable divider logic
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      e.preventDefault();
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      const percent = (e.clientX / window.innerWidth) * 100;
      setEditorWidth(Math.max(MIN_EDITOR_WIDTH_PERCENT, Math.min(MAX_EDITOR_WIDTH_PERCENT, percent)));
    };
    const onMouseUp = () => {
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMouseMove as unknown as EventListener);
    window.addEventListener("mouseup", onMouseUp as unknown as EventListener);
    return () => {
      window.removeEventListener("mousemove", onMouseMove as unknown as EventListener);
      window.removeEventListener("mouseup", onMouseUp as unknown as EventListener);
    };
  }, []);

  const handleDividerDoubleClick = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      setEditorWidth(DEFAULT_EDITOR_WIDTH_PERCENT);
    },
    [],
  );

  const previewPanelStyle = useMemo(() => ({ width: `${100 - editorWidth}%` }), [editorWidth]);

  return (
    <div
      className={cnm("flex flex-col h-full w-full", {
        [styles.root]: true,
      })}
    >
      <ToastProvider>
        {/* Editor/Preview split */}
        <div className="flex flex-1 min-h-0 min-w-0 relative">
          {/* Editor Panel */}
          {!displayMode.startsWith("preview") && <EditorPanel editorWidth={editorWidth} />}
          {/* Resizable Divider */}
          {!displayMode.startsWith("preview") && (
            <div
              className="w-2 cursor-col-resize bg-neutral-emphasis hover:bg-primary-border active:bg-primary-border transition-colors duration-100 z-10"
              onMouseDown={(e: MouseEvent) => {
                if (e.button !== 0) return;
                e.preventDefault();
                dragging.current = true;
              }}
              onDoubleClick={handleDividerDoubleClick}
              role="separator"
              aria-orientation="vertical"
              tabIndex={-1}
            />
          )}

          {/* Preview Panel */}
          <div
            className={cnm("flex flex-col min-w-0 h-full", {
              "flex-row flex-1 w-full": displayMode !== "all",
            })}
            style={previewPanelStyle}
          >
            <div className="flex-1 min-h-0 min-w-0">
              <PreviewPanel />
            </div>
          </div>
        </div>
        <ToastViewport />
      </ToastProvider>
    </div>
  );
};

