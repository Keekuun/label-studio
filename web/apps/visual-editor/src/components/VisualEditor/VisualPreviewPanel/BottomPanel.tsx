import React, { forwardRef } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { IconCollapseSmall, IconExpandSmall } from "@humansignal/icons";
import { cnm } from "@humansignal/ui/utils/utils";
import { CodeEditor } from "@humansignal/ui";
import { Button } from "antd";
import {
  annotationAtom,
  sampleTaskAtom,
  taskDataAtom,
  previewTaskDataAtom,
} from "../../../atoms/configAtoms";

export type BottomPanelRef = {
  handleAnnotationUpdate: (annotation: any) => void;
};

interface BottomPanelProps {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

const HEADER_HEIGHT = 33;

const jsonEditorOptions = {
  mode: "application/json",
  lineNumbers: true,
};

export const BottomPanel = forwardRef<BottomPanelRef, BottomPanelProps>(({ isCollapsed, setIsCollapsed }, ref) => {
  const currentAnnotation = useAtomValue(annotationAtom);
  const sampleTask = useAtomValue(sampleTaskAtom);
  const [taskData, setTaskData] = useAtom(taskDataAtom);
  const setPreviewTaskData = useSetAtom(previewTaskDataAtom);

  return (
    <div
      className={cnm("flex flex-col transition-all duration-200 min-h-0 min-w-0 h-full", {
        "border-t border-neutral-border": isCollapsed,
      })}
    >
      {/* Header (always visible, 33px) */}
      <div
        className="relative h-[33px] flex flex-row items-center bg-neutral-surface select-none"
        style={{ minHeight: HEADER_HEIGHT, maxHeight: HEADER_HEIGHT }}
      >
        <div className="flex flex-row w-full relative">
          <div className="flex-1 flex items-center font-semibold text-body-small pl-4">Data Input
          </div>
          <div className="w-[1px] h-[33px] bg-neutral-border" />
          <div className="flex-1 flex items-center font-semibold text-body-small pl-4">Data Output</div>
        </div>
        {/* Floating collapse/expand button */}
        <button
          type="button"
          aria-label={isCollapsed ? "Expand" : "Collapse"}
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="lsf-button lsf-button_look_ lsf-collapsible-bottom-panel-toggle absolute right-[5px] top-1/2 -translate-y-1/2 !h-6 !w-6 !p-0 flex items-center justify-center !bg-transparent !border-none"
          style={{ zIndex: 10 }}
        >
          {isCollapsed ? <IconExpandSmall /> : <IconCollapseSmall />}
        </button>
      </div>
      {/* Panel content (only when not collapsed) */}
      {!isCollapsed && (
        <div className="flex flex-1 min-h-0">
          {/* Sample Data Panel */}
          <div className="flex-1 border-r border-neutral-border overflow-auto flex flex-col gap-tight px-4 relative">
            <CodeEditor
              value={taskData || JSON.stringify(sampleTask?.data || {}, null, 2)}
              onBeforeChange={(_editor: any, _data: any, value: string) => setTaskData(value)}
              border={false}
              controlled
              options={jsonEditorOptions}
            />
             <Button
              type="dashed"
              size="small"
              className="lsf-button lsf-button_size_small !absolute right-0 top-0 w-fit"
              onClick={() => {
                const value =
                  taskData || JSON.stringify(sampleTask?.data || {}, null, 2);
                setPreviewTaskData(value);
              }}
            >
              Reload
            </Button>
          </div>
          {/* Annotation Output Panel */}
          <div className="flex-1 p-4 overflow-auto">
            <pre className="text-body-small whitespace-pre-wrap">
              {JSON.stringify(currentAnnotation || {}, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
});

