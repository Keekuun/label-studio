import { memo, useEffect, useRef } from "react";
import type { FC } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  configAtom,
  errorAtom,
  loadingAtom,
  showPreviewAtom,
  interfacesAtom,
  annotationAtom,
  sampleTaskAtom,
  taskDataAtom,
  displayModeAtom,
  previewConfigAtom,
  previewTaskDataAtom,
} from "../../atoms/configAtoms";
import { onSnapshot } from "mobx-state-tree";
import { generateSampleTaskFromConfig } from "../../utils/generateSampleTask";

type PreviewPanelProps = {
  onAnnotationUpdate?: (annotation: any) => void;
};

export const PreviewPanel: FC<PreviewPanelProps> = memo(
  ({ onAnnotationUpdate }) => {
    const config = useAtomValue(configAtom);
    const loading = useAtomValue(loadingAtom);
    const error = useAtomValue(errorAtom);
    const interfaces = useAtomValue(interfacesAtom);
    const setAnnotation = useSetAtom(annotationAtom);
    const setSampleTask = useSetAtom(sampleTaskAtom);
    const [taskData, setTaskData] = useAtom(taskDataAtom);
    const previewConfig = useAtomValue(previewConfigAtom);
    const previewTaskData = useAtomValue(previewTaskDataAtom);
    const setPreviewTaskData = useSetAtom(previewTaskDataAtom);
    const displayMode = useAtomValue(displayModeAtom);
    const [showPreview, setShowPreview] = useAtom(showPreviewAtom);
    const rootRef = useRef<HTMLDivElement>(null);
    const lsfInstance = useRef<any>(null);
    const rafId = useRef<number | null>(null);

    useEffect(() => {
      let LabelStudio: any;
      let dependencies: any;
      let snapshotDisposer: any;
      let cancelled = false;

      const ensureRootReady = () =>
        new Promise<HTMLDivElement>((resolve, reject) => {
          const start = Date.now();
          const tryResolve = () => {
            if (cancelled) return reject(new Error("cancelled"));
            if (rootRef.current) return resolve(rootRef.current);
            if (Date.now() - start > 2000) return reject(new Error("root element not ready"));
            requestAnimationFrame(tryResolve);
          };
          tryResolve();
        });

      function cleanup() {
        if (typeof window !== "undefined" && (window as any).LabelStudio) {
          delete (window as any).LabelStudio;
        }
        setShowPreview(false);
        if (lsfInstance.current) {
          try {
            lsfInstance.current.destroy();
          } catch {
            // ignore
          }
          lsfInstance.current = null;
        }
        if (rafId.current !== null) {
          cancelAnimationFrame(rafId.current);
          rafId.current = null;
        }
        if (snapshotDisposer) {
          snapshotDisposer();
          snapshotDisposer = null;
        }
      }

      async function loadLSF() {
        dependencies = await import("@humansignal/editor");
        LabelStudio = dependencies.LabelStudio;
        if (!LabelStudio) return;
        cleanup();
        setShowPreview(true);
        const effectiveConfig = previewConfig ?? config;
        const autoSampleTask = await generateSampleTaskFromConfig(effectiveConfig);

        const sourceTaskData = previewTaskData ?? taskData;

        let finalSampleTask = autoSampleTask;

        if (sourceTaskData) {
          try {
            const parsed = JSON.parse(sourceTaskData);
            if (parsed && typeof parsed === "object") {
              finalSampleTask = {
                ...autoSampleTask,
                data: parsed,
              };
            }
          } catch (e) {
            console.error("解析自定义任务数据失败，将使用自动生成的数据：", e);
          }
        }

        setSampleTask(finalSampleTask);

        if (!taskData) {
          const pretty = JSON.stringify(finalSampleTask?.data ?? {}, null, 2);
          setTaskData(pretty);
          if (!previewTaskData) {
            setPreviewTaskData(pretty);
          }
        }

        try {
          const rootEl = await ensureRootReady();
          await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
          if (!rootEl || cancelled) return;

          lsfInstance.current = new LabelStudio(rootEl, {
            config: effectiveConfig,
            task: finalSampleTask,
            interfaces,
            instanceOptions: {
              reactVersion: "v18",
            },
            settings: {
              forceBottomPanel: true,
              collapsibleBottomPanel: true,
              // Default collapsed in all,preview-inline, but not in preview
              defaultCollapsedBottomPanel: displayMode !== "preview",
              fullscreen: false,
            },
            onStorageInitialized: (LS: any) => {
              const initAnnotation = () => {
                const as = LS.annotationStore;
                const c = as.createAnnotation();
                as.selectAnnotation(c.id);

                const annotation = as.selected;
                if (annotation) {
                  snapshotDisposer = onSnapshot(annotation, () => {
                    setAnnotation(annotation.serializeAnnotation());
                  });
                }
              };
              setTimeout(initAnnotation);
            },
          });
        } catch (e) {
          console.error("初始化预览失败：", e);
        }
      }

      if (!loading && !error && (previewConfig || config)) {
        rafId.current = requestAnimationFrame(() => {
          loadLSF();
        });
      }

      return () => {
        cancelled = true;
        cleanup();
      };
      // eslint-disable-next-line
    }, [loading, error, interfaces, displayMode, previewConfig, previewTaskData, onAnnotationUpdate]);

    return (
      <div className="h-full flex flex-col min-h-0">
        {error ? (
          <div className="text-danger-foreground text-body-medium flex-1 flex items-center justify-center">{error}</div>
        ) : loading ? (
          <div className="text-secondary-foreground text-body-medium flex-1 flex items-center justify-center">
            Loading config...
          </div>
        ) : showPreview ? (
          <div ref={rootRef} className="w-full h-full flex-1 min-h-0 flex flex-col" />
        ) : null}
      </div>
    );
  },
  () => true,
);

