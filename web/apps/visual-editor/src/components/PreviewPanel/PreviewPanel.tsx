import React, { useEffect, useRef } from "react";
import { useAtomValue } from "jotai";
import { PreviewPanel as PlaygroundPreviewPanel } from "../../../../playground/src/components/PreviewPanel";
import { configAtom, loadingAtom, errorAtom } from "../../../../playground/src/atoms/configAtoms";

interface PreviewPanelProps {
  onAnnotationUpdate?: (annotation: any) => void;
}

/**
 * 包装 playground 的 PreviewPanel
 * 由于 playground 的 PreviewPanel 已经从 configAtom 读取配置，这里直接使用即可
 */
export const PreviewPanel: React.FC<PreviewPanelProps> = ({ onAnnotationUpdate }) => {
  const config = useAtomValue(configAtom);
  const loading = useAtomValue(loadingAtom);
  const error = useAtomValue(errorAtom);
  const containerRef = useRef<HTMLDivElement>(null);

  // 确保容器有高度，这样 Label Studio 才能正确初始化
  useEffect(() => {
    if (containerRef.current) {
      // 触发 resize 事件，帮助 Label Studio 重新计算布局
      const timer = setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [config]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full flex flex-col"
      style={{ 
        minHeight: 400,
        minWidth: 0,
      }}
    >
      <div className="flex-1 min-h-0 min-w-0">
        <PlaygroundPreviewPanel onAnnotationUpdate={onAnnotationUpdate} />
      </div>
    </div>
  );
};

