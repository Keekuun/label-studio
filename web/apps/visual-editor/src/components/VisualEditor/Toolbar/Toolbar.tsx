import React, { useState, useMemo } from "react";
import { Button, Space, message, Modal, Input, Select } from "antd";
import {
  ClearOutlined,
  CopyOutlined,
  DownloadOutlined,
  UploadOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useAtom, useSetAtom } from "jotai";
import { editorStateAtom } from "../../../atoms/visualEditorAtoms";
import { generateXMLFromNode, parseXMLToNode } from "../../../utils/xmlConverter";
import { useComponentTree } from "../../../hooks/useComponentTree";
import { handleXMLParseError } from "../../../utils/errorHandler";
import { templates, getAllCategories, getTemplatesByCategory } from "../../../data/templates";
import {
  getAllTemplates,
  getCustomTemplates,
  saveCustomTemplate,
  deleteCustomTemplate,
  isCustomTemplate,
} from "../../../utils/templateManager";
import styles from "./Toolbar.module.scss";

type ToolbarProps = {
  onOpenPreview?: () => void;
};

export const Toolbar: React.FC<ToolbarProps> = ({ onOpenPreview }) => {
  const [editorState, setEditorState] = useAtom(editorStateAtom);
  const { rootNode, removeComponent } = useComponentTree();
  const [saveTemplateVisible, setSaveTemplateVisible] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [templateCategory, setTemplateCategory] = useState("自定义");

  const clearIcon = React.useMemo(() => React.createElement(ClearOutlined), []);
  const copyIcon = React.useMemo(() => React.createElement(CopyOutlined), []);
  const downloadIcon = React.useMemo(() => React.createElement(DownloadOutlined), []);
  const uploadIcon = React.useMemo(() => React.createElement(UploadOutlined), []);
  const saveIcon = React.useMemo(() => React.createElement(SaveOutlined), []);

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

  // 获取所有模板（预设 + 自定义）
  const allTemplates = useMemo(() => getAllTemplates(), []);
  const allCategories = useMemo(() => {
    const presetCategories = getAllCategories();
    const customCategories = Array.from(
      new Set(getCustomTemplates().map((t) => t.category))
    );
    return Array.from(new Set([...presetCategories, ...customCategories]));
  }, []);

  const handleLoadTemplate = (templateId: string) => {
    const template = allTemplates.find((t) => t.id === templateId);
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

  const handleSaveTemplate = () => {
    if (!rootNode) {
      message.warning("没有可保存的内容");
      return;
    }

    if (!templateName.trim()) {
      message.warning("请输入模板名称");
      return;
    }

    try {
      const xml = generateXMLFromNode(rootNode);
      const savedTemplate = saveCustomTemplate({
        name: templateName.trim(),
        description: templateDescription.trim() || "自定义模板",
        category: templateCategory,
        xml,
      });

      message.success(`模板 "${savedTemplate.name}" 已保存`);
      setSaveTemplateVisible(false);
      setTemplateName("");
      setTemplateDescription("");
      setTemplateCategory("自定义");
    } catch (error) {
      message.error("保存模板失败");
      console.error("保存模板错误:", error);
    }
  };

  const handleDeleteTemplate = (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("确定要删除这个模板吗？")) {
      try {
        deleteCustomTemplate(templateId);
        message.success("模板已删除");
      } catch (error) {
        message.error("删除模板失败");
        console.error("删除模板错误:", error);
      }
    }
  };

  return (
    <>
      <div className={styles.toolbar}>
        <div className={styles.title}>
          <span>Visual Editor</span>
          <span className={styles.badge}>beta</span>
        </div>
        <div className={styles.actions}>
          <Space>
            <Button
              icon={saveIcon}
              onClick={() => setSaveTemplateVisible(true)}
              disabled={!rootNode}
              title="保存当前配置为模板"
            >
              保存模板
            </Button>
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

      <Modal
        title="保存模板"
        open={saveTemplateVisible}
        onOk={handleSaveTemplate}
        onCancel={() => {
          setSaveTemplateVisible(false);
          setTemplateName("");
          setTemplateDescription("");
          setTemplateCategory("自定义");
        }}
        okText="保存"
        cancelText="取消"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", marginBottom: 4 }}>模板名称 *</label>
            <Input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="请输入模板名称"
              maxLength={50}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 4 }}>模板描述</label>
            <Input.TextArea
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              placeholder="请输入模板描述（可选）"
              rows={3}
              maxLength={200}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 4 }}>分类</label>
            <Select
              value={templateCategory}
              onChange={setTemplateCategory}
              style={{ width: "100%" }}
              placeholder="选择或输入分类"
              showSearch
              allowClear
            >
              {allCategories.map((cat) => (
                <Select.Option key={cat} value={cat}>
                  {cat}
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>
      </Modal>
    </>
  );
};

