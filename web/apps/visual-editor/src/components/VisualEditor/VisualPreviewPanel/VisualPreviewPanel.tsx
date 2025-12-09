import React, { useMemo, useState, useEffect } from "react";
import { useAtom } from "jotai";
import { Tabs, Button, message } from "antd";
import { CodeOutlined, EyeOutlined, CopyOutlined, SyncOutlined } from "@ant-design/icons";
import { editorStateAtom } from "../../../atoms/visualEditorAtoms";
import { generateXMLFromNode, parseXMLToNode } from "../../../utils/xmlConverter";
import { createComponentNode } from "../../../utils/componentTree";
import { PreviewPanel } from "../../PreviewPanel";
import { CodeEditor } from "@humansignal/ui";
import { useComponentTree } from "../../../hooks/useComponentTree";
import styles from "./VisualPreviewPanel.module.scss";

interface VisualPreviewPanelProps {
  fullscreenDisabled?: boolean;
}

export const VisualPreviewPanel: React.FC<VisualPreviewPanelProps> = ({ fullscreenDisabled = false }) => {
  const [editorState, setEditorState] = useAtom(editorStateAtom);
  const [activeTab, setActiveTab] = useState("preview");
  const [editedXML, setEditedXML] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [previewKey, setPreviewKey] = useState(0); // 用于强制重新渲染预览
  const { updateRootNode } = useComponentTree();

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

  // 当切换到预览标签时，确保预览面板重新初始化
  useEffect(() => {
    if (activeTab === "preview") {
      // 延迟一下，确保标签切换动画完成，DOM 完全渲染
      const timer = setTimeout(() => {
        setPreviewKey((prev) => prev + 1);
        // 触发 resize 事件
        window.dispatchEvent(new Event("resize"));
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  const handleCopyXML = () => {
    const textToCopy = isEditing ? editedXML : xmlConfig;
    navigator.clipboard.writeText(textToCopy).then(
      () => {
        message.success("XML 已复制到剪贴板");
      },
      () => {
        message.error("复制失败");
      }
    );
  };

  const handleXMLChange = (editor: any, data: any, value: string) => {
    if (value !== editedXML) {
      setEditedXML(value);
      setIsEditing(true);
    }
  };

  const handleSyncToCanvas = () => {
    try {
      // 解析 XML 为组件树
      const parsedNode = parseXMLToNode(editedXML);

      if (!parsedNode) {
        message.error("XML 解析失败：无法生成组件树");
        return;
      }

      // 如果根节点不是 View，自动包装为 View
      let newRootNode = parsedNode;
      if (parsedNode.type !== "View") {
        newRootNode = createComponentNode("View", "visual", {}, undefined);
        newRootNode.children = [parsedNode];
        parsedNode.parentId = newRootNode.id;
        parsedNode.order = 0;
        message.info("根节点已自动包装为 View");
      }

      // 更新组件树
      updateRootNode(newRootNode);

      setIsEditing(false);
      message.success("XML 已同步到画布");
    } catch (error: any) {
      console.error("XML 同步错误:", error);
      message.error(`XML 同步失败: ${error.message || "未知错误"}`);
    }
  };

  const handleCancelEdit = () => {
    setEditedXML(xmlConfig);
    setIsEditing(false);
    message.info("已取消编辑");
  };

  const renderContent = (tabKey?: string) => {
    const key = tabKey ?? activeTab;
    if (key === "preview") {
      // 如果正在编辑，使用编辑后的 XML；否则使用生成的 XML
      const previewConfig = isEditing ? editedXML : xmlConfig;
      return (
        <div style={{ width: "100%", height: "100%", minHeight: 400 }}>
          {/* 使用 key 确保配置变化和标签切换时重新渲染 */}
          <PreviewPanel key={`${previewKey}-${previewConfig}`} config={previewConfig} />
        </div>
      );
    }
    return (
      <CodeEditor
        value={isEditing ? editedXML : xmlConfig}
        onBeforeChange={handleXMLChange}
        controlled={true}
        border={false}
        options={{
          readOnly: false,
          lineNumbers: true,
          mode: "xml",
          theme: "default",
        }}
      />
    );
  };

  return (
    <div className={styles.visualPreviewPanel}>
      <div className={styles.previewHeader}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          size="small"
          items={[
            {
              key: "preview",
              label: (
                <span>
                  {React.createElement(EyeOutlined)} 预览
                </span>
              ),
            },
            {
              key: "xml",
              label: (
                <span>
                  {React.createElement(CodeOutlined)} XML
                </span>
              ),
            },
          ]}
        />
      </div>
      <div className={styles.previewContent}>
        {renderContent()}
        <div className={styles.actions}>
          {activeTab === "xml" && (
            <>
              <Button
                size="small"
                icon={React.createElement(CopyOutlined)}
                onClick={handleCopyXML}
                title="复制 XML"
              />
              {isEditing && (
                <>
                  <Button
                    size="small"
                    type="primary"
                    icon={React.createElement(SyncOutlined)}
                    onClick={handleSyncToCanvas}
                    title="同步到画布"
                  >
                    同步到画布
                  </Button>
                  <Button
                    size="small"
                    onClick={handleCancelEdit}
                    title="取消编辑"
                  >
                    取消
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

