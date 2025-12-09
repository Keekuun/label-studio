import { useEffect } from "react";

interface KeyboardShortcutsOptions {
  onDelete?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
}

export function useKeyboardShortcuts(options: KeyboardShortcutsOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 如果正在输入框中，不处理快捷键
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // Delete 键删除组件
      if (e.key === "Delete" || e.key === "Backspace") {
        if (options.onDelete) {
          e.preventDefault();
          options.onDelete();
        }
      }

      // Ctrl/Cmd + C 复制
      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        if (options.onCopy) {
          e.preventDefault();
          options.onCopy();
        }
      }

      // Ctrl/Cmd + V 粘贴
      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        if (options.onPaste) {
          e.preventDefault();
          options.onPaste();
        }
      }

      // Ctrl/Cmd + Z 撤销
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        if (options.onUndo) {
          e.preventDefault();
          options.onUndo();
        }
      }

      // Ctrl/Cmd + Shift + Z 或 Ctrl/Cmd + Y 重做
      if (
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "z") ||
        ((e.ctrlKey || e.metaKey) && e.key === "y")
      ) {
        if (options.onRedo) {
          e.preventDefault();
          options.onRedo();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [options]);
}

