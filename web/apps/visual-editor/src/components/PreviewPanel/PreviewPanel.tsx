import React, { useEffect, useRef, useState } from "react";
import { useSetAtom } from "jotai";
import { PreviewPanel as PlaygroundPreviewPanel } from "../../../../playground/src/components/PreviewPanel";
import { configAtom } from "../../../../playground/src/atoms/configAtoms";

interface PreviewPanelProps {
  config: string;
  onAnnotationUpdate?: (annotation: any) => void;
}

/**
 * 包装 playground 的 PreviewPanel，使其可以接收 config prop
 */
export const PreviewPanel: React.FC<PreviewPanelProps> = ({ config, onAnnotationUpdate }) => {
  const setConfig = useSetAtom(configAtom);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const configRef = useRef<string>("");

  // 当配置变化时，延迟设置以确保 DOM 准备好
  useEffect(() => {
    if (!config) {
      setIsReady(false);
      return;
    }

    // 检查容器是否已准备好
    const checkAndInit = () => {
      if (containerRef.current && containerRef.current.offsetHeight > 0) {
        if (config !== configRef.current) {
          configRef.current = config;
          setConfig(config);
          setIsReady(true);
          // 触发 resize 事件，帮助 Label Studio 重新计算布局
          setTimeout(() => {
            window.dispatchEvent(new Event("resize"));
          }, 50);
        } else if (!isReady) {
          setIsReady(true);
        }
      } else {
        // 如果容器还没准备好，重试
        requestAnimationFrame(checkAndInit);
      }
    };

    if (config !== configRef.current) {
      setIsReady(false);
      // 使用 requestAnimationFrame 确保 DOM 已渲染
      requestAnimationFrame(() => {
        // 再延迟一点，确保容器完全准备好
        setTimeout(checkAndInit, 200);
      });
    }
  }, [config, setConfig, isReady]);

  // 确保容器有高度，这样 Label Studio 才能正确初始化
  return (
    <div 
      ref={containerRef} 
      style={{ width: "100%", height: "100%", minHeight: 400 }}
      key={config} // 使用 key 强制重新渲染
    >
      {isReady && (
        <PlaygroundPreviewPanel onAnnotationUpdate={onAnnotationUpdate} />
      )}
    </div>
  );
};

