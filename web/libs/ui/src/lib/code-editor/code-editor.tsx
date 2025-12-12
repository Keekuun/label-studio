import {
  UnControlled as CodeMirrorUnControlled,
  Controlled as CodeMirrorControlled,
  type IUnControlledCodeMirror,
  type IControlledCodeMirror,
} from "react-codemirror2";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/xml/xml";
import "codemirror/addon/hint/show-hint";
import "./config-hint";

import "codemirror/lib/codemirror.css";
import "codemirror/addon/hint/show-hint.css";
import styles from "./code-editor.module.scss";
import { cn } from "@humansignal/shad/utils";
import { forwardRef, useEffect, useRef } from "react";

/* eslint-disable-next-line */
type CodeMirrorType = typeof CodeMirrorUnControlled | typeof CodeMirrorControlled;
export interface CodeEditorProps {
  border?: boolean; // Add border to the editor
  ref?: React.Ref<CodeMirrorType>;
  controlled?: boolean;
}

export const CodeEditor = forwardRef(
  (props: CodeEditorProps & (IControlledCodeMirror | IUnControlledCodeMirror), ref) => {
    const { border = false, controlled = false, ...restProps } = props;
    const containerRef = useRef<HTMLDivElement>(null);

    // 确保当启用行号时，sizer 有正确的左边距
    useEffect(() => {
      const checkAndFixMargin = () => {
        if (!containerRef.current) return;

        const codeMirror = containerRef.current.querySelector<HTMLElement>(".CodeMirror");
        if (!codeMirror) return;

        const gutters = codeMirror.querySelector<HTMLElement>(".CodeMirror-gutters");
        const sizer = codeMirror.querySelector<HTMLElement>(".CodeMirror-sizer");

        if (gutters && sizer && gutters.children.length > 0) {
          const gutterWidth = gutters.offsetWidth;
          const currentMarginLeft = parseInt(sizer.style.marginLeft || "0", 10);
          
          // 如果 marginLeft 没有设置或设置不正确，强制设置
          if (currentMarginLeft < gutterWidth) {
            sizer.style.marginLeft = `${gutterWidth}px`;
          }
        }
      };

      // 初始检查
      const timeoutId = setTimeout(checkAndFixMargin, 100);

      // 监听 DOM 变化
      const observer = new MutationObserver(checkAndFixMargin);
      if (containerRef.current) {
        observer.observe(containerRef.current, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ["style", "class"],
        });
      }

      return () => {
        clearTimeout(timeoutId);
        observer.disconnect();
      };
    }, []);

    return (
      <div
        ref={containerRef}
        className={cn(styles.codeEditor, {
          [styles.border]: border,
        })}
      >
        {controlled ? (
          <CodeMirrorControlled
            ref={ref as React.RefObject<CodeMirrorControlled>}
            {...(restProps as IControlledCodeMirror)}
          />
        ) : (
          <CodeMirrorUnControlled
            ref={ref as React.RefObject<CodeMirrorUnControlled>}
            {...(restProps as IUnControlledCodeMirror)}
          />
        )}
      </div>
    );
  },
);

export default CodeEditor;
