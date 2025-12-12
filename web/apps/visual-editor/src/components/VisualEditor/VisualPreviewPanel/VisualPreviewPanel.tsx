import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import type { MouseEvent } from "react";
import { useAtom } from "jotai";
import { cnm } from "@humansignal/ui/utils/utils";
import { editorStateAtom } from "../../../atoms/visualEditorAtoms";
import { generateXMLFromNode, parseXMLToNode } from "../../../utils/xmlConverter";
import { createComponentNode } from "../../../utils/componentTree";
import { PreviewPanel } from "../../PreviewPanel";
import { CodeEditor } from "@humansignal/ui";
import { useComponentTree } from "../../../hooks/useComponentTree";
import { BottomPanel } from "./BottomPanel";
import { editorExtensions, editorOptions } from "../../../utils/codeEditor";
import styles from "./VisualPreviewPanel.module.scss";

interface VisualPreviewPanelProps {
  fullscreenDisabled?: boolean;
}

const DEFAULT_EDITOR_WIDTH_PERCENT = 50;
const MIN_EDITOR_WIDTH_PERCENT = 20;
const MAX_EDITOR_WIDTH_PERCENT = 80;
const COLLAPSED_PANEL_HEIGHT = 33;
const DEFAULT_PANEL_HEIGHT = 300;
const MIN_PANEL_HEIGHT = 100;
const MAX_PANEL_HEIGHT = 800;

export const VisualPreviewPanel: React.FC<VisualPreviewPanelProps> = ({ fullscreenDisabled = false }) => {
  const [editorState, setEditorState] = useAtom(editorStateAtom);
  const [editedXML, setEditedXML] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [editorWidth, setEditorWidth] = useState(DEFAULT_EDITOR_WIDTH_PERCENT);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(DEFAULT_PANEL_HEIGHT);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { updateRootNode } = useComponentTree();
  const dragging = useRef(false);
  const draggingVertical = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(0);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const xmlConfig = useMemo(() => {
    if (!editorState.rootNode) {
      return "<View>\n  <!-- 拖拽组件到画布开始构建配置 -->\n</View>";
    }
    try {
      return generateXMLFromNode(editorState.rootNode);
    } catch (error) {
      console.error("XML 生成错误:", error);
      return "<View>\n  <!-- XML 生成错误 -->\n</View>";
    }
  }, [editorState.rootNode]);

  // 当 XML 配置变化时，更新编辑状态
  useEffect(() => {
    if (!isEditing) {
      setEditedXML(xmlConfig);
    }
  }, [xmlConfig, isEditing]);

  // 当 XML 变化时，触发预览重新渲染
  useEffect(() => {
    const timer = setTimeout(() => {
      setPreviewKey((prev) => prev + 1);
      window.dispatchEvent(new Event("resize"));
    }, 200);
    return () => clearTimeout(timer);
  }, [xmlConfig, editedXML]);

  const handleXMLChange = useCallback((_editor: any, _data: any, value: string) => {
    if (value !== editedXML) {
      setEditedXML(value);
      setIsEditing(true);
    }
  }, [editedXML]);

  const handleSyncToCanvas = useCallback(() => {
    try {
      const parsedNode = parseXMLToNode(editedXML);
      if (!parsedNode) {
        return;
      }

      let newRootNode = parsedNode;
      if (parsedNode.type !== "View") {
        newRootNode = createComponentNode("View", "visual", {}, undefined);
        newRootNode.children = [parsedNode];
        parsedNode.parentId = newRootNode.id;
        parsedNode.order = 0;
      }

      updateRootNode(newRootNode);
      setIsEditing(false);
    } catch (error: any) {
      console.error("XML 同步错误:", error);
    }
  }, [editedXML, updateRootNode]);

  // 水平拖拽逻辑（调整编辑器宽度）
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

  // 垂直拖拽逻辑（调整底部面板高度）
  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      if (e.button !== 0) return;
      draggingVertical.current = true;
      startY.current = e.clientY;
      startHeight.current = bottomPanelHeight;
    },
    [bottomPanelHeight],
  );

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggingVertical.current) return;
    e.preventDefault();
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
    const delta = startY.current - e.clientY;
    const newHeight = Math.max(MIN_PANEL_HEIGHT, Math.min(MAX_PANEL_HEIGHT, startHeight.current + delta));
    setBottomPanelHeight(newHeight);
  }, []);

  const handleMouseUp = useCallback(() => {
    draggingVertical.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  const handleDividerDoubleClick = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      setEditorWidth(DEFAULT_EDITOR_WIDTH_PERCENT);
    },
    [],
  );

  const handleVerticalDividerDoubleClick = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      draggingVertical.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      setBottomPanelHeight(DEFAULT_PANEL_HEIGHT);
    },
    [],
  );

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove as unknown as EventListener);
    window.addEventListener("mouseup", handleMouseUp as unknown as EventListener);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove as unknown as EventListener);
      window.removeEventListener("mouseup", handleMouseUp as unknown as EventListener);
    };
  }, [handleMouseMove, handleMouseUp]);

  const previewPanelStyle = useMemo(() => ({ width: `${100 - editorWidth}%` }), [editorWidth]);
  const bottomPanelStyle = useMemo(() => {
    if (isCollapsed) return { height: COLLAPSED_PANEL_HEIGHT };
    return { height: bottomPanelHeight };
  }, [bottomPanelHeight, isCollapsed]);

  // 如果正在编辑，使用编辑后的 XML；否则使用生成的 XML
  const previewConfig = isEditing ? editedXML : xmlConfig;

  return (
    <div className={cnm("flex flex-col h-full w-full", styles.visualPreviewPanel)}>
      {/* Main content area: Editor and Preview side by side */}
      <div className="flex flex-1 min-h-0 min-w-0 relative">
        {/* Editor Panel (left) */}
        <div className="flex flex-col min-w-0 h-full" style={{ width: `${editorWidth}%` }}>
          {/* CodeEditor (top) */}
          <div className="flex-1 min-h-0">
            <CodeEditor
              ref={editorRef}
              value={isEditing ? editedXML : xmlConfig}
              onBeforeChange={handleXMLChange}
              border={false}
              controlled
              // @ts-ignore
              autoCloseTags
              smartIndent
              detach
              extensions={editorExtensions}
              options={editorOptions}
            />
          </div>
          {/* Divider for resizing (only when not collapsed) */}
          {!isCollapsed && (
            <div
              className="h-2 cursor-row-resize bg-neutral-emphasis hover:bg-primary-border active:bg-primary-border transition-colors duration-100 z-10"
              onMouseDown={handleMouseDown}
              onDoubleClick={handleVerticalDividerDoubleClick}
              role="separator"
              aria-orientation="horizontal"
              tabIndex={-1}
            />
          )}
          {/* BottomPanel (Input/Output) */}
          <div style={bottomPanelStyle}>
            <BottomPanel isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
          </div>
        </div>

        {/* Resizable Divider */}
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

        {/* Preview Panel (right) */}
        <div
          className={cnm("flex flex-col min-w-0 h-full")}
          style={previewPanelStyle}
        >
          <div className="flex-1 min-h-0 min-w-0">
            <PreviewPanel key={`${previewKey}-${previewConfig}`} config={previewConfig} />
          </div>
        </div>
      </div>
    </div>
  );
};
