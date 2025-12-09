import React from "react";
import { Button, Space, message, Dropdown, MenuProps } from "antd";
import {
  ClearOutlined,
  CopyOutlined,
  DownloadOutlined,
  UploadOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { useAtom, useSetAtom } from "jotai";
import { editorStateAtom } from "../../../atoms/visualEditorAtoms";
import { generateXMLFromNode, parseXMLToNode } from "../../../utils/xmlConverter";
import { useComponentTree } from "../../../hooks/useComponentTree";
import { handleXMLParseError } from "../../../utils/errorHandler";
import { templates, getAllCategories, getTemplatesByCategory } from "../../../data/templates";
import styles from "./Toolbar.module.scss";

type ToolbarProps = {
  onOpenPreview?: () => void;
};

export const Toolbar: React.FC<ToolbarProps> = ({ onOpenPreview }) => {
  const [editorState, setEditorState] = useAtom(editorStateAtom);
  const { rootNode, removeComponent } = useComponentTree();

  const clearIcon = React.useMemo(() => React.createElement(ClearOutlined), []);
  const copyIcon = React.useMemo(() => React.createElement(CopyOutlined), []);
  const downloadIcon = React.useMemo(() => React.createElement(DownloadOutlined), []);
  const uploadIcon = React.useMemo(() => React.createElement(UploadOutlined), []);
  const templateIcon = React.useMemo(() => React.createElement(AppstoreOutlined), []);

  const handleClear = () => {
    if (confirm("确定要清空所有组件吗？")) {
      if (rootNode) {
        removeComponent(rootNode.id);
      }
    }
  };

  const handleCopyXML = () => {
    if (!rootNode) {
      message.warning("没有可复制的内容");
      return;
    }

    const xml = generateXMLFromNode(rootNode);
    navigator.clipboard.writeText(xml).then(
      () => {
        message.success("XML 已复制到剪贴板");
      },
      () => {
        message.error("复制失败，请手动复制");
      }
    );
  };

  const handleDownloadXML = () => {
    if (!rootNode) {
      message.warning("没有可下载的内容");
      return;
    }

    const xml = generateXMLFromNode(rootNode);
    const blob = new Blob([xml], { type: "text/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "label-studio-config.xml";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    message.success("XML 文件已下载");
  };

  const handleImportXML = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xml";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const xml = event.target?.result as string;

          if (!xml || xml.trim().length === 0) {
            message.error("XML 文件为空");
            return;
          }

          // 解析 XML 为组件树
          const parsedNode = parseXMLToNode(xml);

          if (!parsedNode) {
            message.error("XML 解析失败：无法创建组件树");
            return;
          }

          // 更新编辑器状态
          setEditorState({
            ...editorState,
            rootNode: parsedNode,
            selectedNodeId: undefined,
          });

          message.success("XML 导入成功");
        } catch (error: unknown) {
          console.error("XML 导入错误:", error);
          const errorMessage = handleXMLParseError(error);
          message.error(`XML 导入失败: ${errorMessage}`);
        }
      };
      reader.onerror = () => {
        message.error("文件读取失败");
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleLoadTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) {
      message.error("模板不存在");
      return;
    }

    try {
      // 如果有现有内容，询问是否覆盖
      if (rootNode) {
        const confirmed = confirm(`确定要加载模板 "${template.name}" 吗？这将覆盖当前配置。`);
        if (!confirmed) return;
      }

      // 解析模板 XML 为组件树
      const parsedNode = parseXMLToNode(template.xml);

      if (!parsedNode) {
        message.error("模板解析失败：无法创建组件树");
        return;
      }

      // 更新编辑器状态
      setEditorState({
        ...editorState,
        rootNode: parsedNode,
        selectedNodeId: undefined,
      });

      message.success(`已加载模板: ${template.name}`);
    } catch (error: unknown) {
      console.error("模板加载错误:", error);
      const errorMessage = handleXMLParseError(error);
      message.error(`模板加载失败: ${errorMessage}`);
    }
  };

  // 构建模板菜单
  const templateMenuItems: MenuProps["items"] = getAllCategories().map((category) => {
    const categoryTemplates = getTemplatesByCategory(category);
    return {
      key: category,
      label: category,
      type: "group",
      children: categoryTemplates.map((template) => ({
        key: template.id,
        label: (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {template.icon && <span>{template.icon}</span>}
            <div>
              <div style={{ fontWeight: 500 }}>{template.name}</div>
              <div style={{ fontSize: 12, color: "#999" }}>{template.description}</div>
            </div>
          </div>
        ),
      })),
    };
  });

  const handleTemplateMenuClick: MenuProps["onClick"] = ({ key }) => {
    handleLoadTemplate(key as string);
  };

  return (
    <div className={styles.toolbar}>
      <div className={styles.title}>
        <span>Visual Editor</span>
        <span className={styles.badge}>beta</span>
      </div>
      <div className={styles.actions}>
        <Space>
          <Dropdown
            menu={{
              items: templateMenuItems,
              onClick: handleTemplateMenuClick,
            }}
            trigger={["click"]}
            placement="bottomLeft"
          >
            <Button icon={templateIcon}>
              模板
            </Button>
          </Dropdown>
          <Button onClick={onOpenPreview} type="primary">
            预览/XML
          </Button>
          <Button
            icon={clearIcon}
            onClick={handleClear}
            disabled={!rootNode}
            title="清空所有组件"
          >
            清空
          </Button>
          <Button
            icon={copyIcon}
            onClick={handleCopyXML}
            disabled={!rootNode}
            title="复制 XML 到剪贴板"
          >
            复制 XML
          </Button>
          <Button
            icon={downloadIcon}
            onClick={handleDownloadXML}
            disabled={!rootNode}
            title="下载 XML 文件"
          >
            下载 XML
          </Button>
          <Button
            icon={uploadIcon}
            onClick={handleImportXML}
            title="从 XML 文件导入"
          >
            导入 XML
          </Button>
        </Space>
      </div>
    </div>
  );
};

