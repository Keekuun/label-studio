import React, { useRef } from "react";
import { Input, message, Button, Dropdown, MenuProps } from "antd";
import { SearchOutlined, AppstoreOutlined } from "@ant-design/icons";
import { getAllComponentMetas } from "../../../data/componentMetas";
import { ComponentCard } from "./ComponentCard";
import { LayoutTemplateCard } from "./LayoutTemplateCard";
import { templates, getAllCategories } from "../../../data/templates";
import { parseXMLToNode } from "../../../utils/xmlConverter";
import { createComponentNode } from "../../../utils/componentTree";
import { useComponentTree } from "../../../hooks/useComponentTree";
import {
  getAllTemplates,
  getCustomTemplates,
  isCustomTemplate,
  deleteCustomTemplate,
} from "../../../utils/templateManager";
import styles from "./ComponentPalette.module.scss";

export const ComponentPalette: React.FC = () => {
  const [searchKeyword, setSearchKeyword] = React.useState("");
  const { updateRootNode } = useComponentTree();
  const { rootNode } = useComponentTree();
  const layoutSectionRef = useRef<HTMLDivElement | null>(null);
  const paletteContentRef = useRef<HTMLDivElement | null>(null);

  const components = React.useMemo(() => {
    return getAllComponentMetas();
  }, []);

  const groups = [
    { key: "layout-templates", title: "布局模板" }, // 先展示布局模板
    { key: "container", title: "容器 / 结构" },
    { key: "object", title: "对象 / 数据源" },
    { key: "control", title: "控制 / 标注" },
    { key: "label-item", title: "标签项" },
    { key: "visual", title: "视觉 / 辅助" },
  ];

  // 过滤组件
  const filteredComponents = React.useMemo(() => {
    if (!searchKeyword.trim()) {
      return components;
    }
    const keyword = searchKeyword.toLowerCase();
    return components.filter(
      (c) =>
        c.type.toLowerCase().includes(keyword) ||
        c.displayName.toLowerCase().includes(keyword) ||
        c.description?.toLowerCase().includes(keyword)
    );
  }, [components, searchKeyword]);

  const layoutTemplates = React.useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    return templates
      .filter((t) => t.category === "布局")
      .filter((t) => {
        if (!keyword) return true;
        return (
          t.name.toLowerCase().includes(keyword) ||
          t.description.toLowerCase().includes(keyword)
        );
      });
  }, [searchKeyword]);

  const groupMap = React.useMemo(() => {
    return groups.map((g) => {
      if (g.key === "layout-templates") {
        return {
          ...g,
          items: [], // 布局模板单独渲染，不走组件列表
        };
      }
      return {
        ...g,
        items: filteredComponents
          .filter((c) => (c.group || c.category) === g.key)
          .sort((a, b) => (a.sortOrder ?? 1000) - (b.sortOrder ?? 1000)),
      };
    });
  }, [filteredComponents, groups]);

  const handleApplyTemplate = React.useCallback(async (xml: string, name: string) => {
    try {
      const parsed = await parseXMLToNode(xml);
      if (!parsed) {
        message.error("模板解析失败");
        return;
      }
      let root = parsed;
      if (parsed.type !== "View") {
        root = createComponentNode("View", "visual", {}, undefined);
        root.children = [parsed];
        parsed.parentId = root.id;
        parsed.order = 0;
      }
      updateRootNode(root);
      message.success(`已应用模板：${name}`);
    } catch (err) {
      console.error(err);
      message.error("应用模板失败");
    }
  }, [updateRootNode]);

  const allTemplates = React.useMemo(() => getAllTemplates(), []);
  const allCategories = React.useMemo(() => {
    const presetCategories = getAllCategories();
    const customCategories = Array.from(new Set(getCustomTemplates().map((t) => t.category)));
    return Array.from(new Set([...presetCategories, ...customCategories]));
  }, []);

  const handleLoadTemplate = React.useCallback(async (templateId: string) => {
    const tpl = allTemplates.find((t) => t.id === templateId);
    if (!tpl) {
      message.error("模板不存在");
      return;
    }
    if (rootNode) {
      const confirmed = window.confirm(`确定要加载模板 "${tpl.name}" 吗？这将覆盖当前配置。`);
      if (!confirmed) return;
    }
    await handleApplyTemplate(tpl.xml, tpl.name);
  }, [allTemplates, rootNode, handleApplyTemplate]);

  const handleTemplateMenuClick: MenuProps["onClick"] = ({ key }) => {
    handleLoadTemplate(key as string);
  };

  const handleDeleteTemplate = React.useCallback((id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!isCustomTemplate(id)) return;
    if (confirm("确定要删除这个模板吗？")) {
      deleteCustomTemplate(id);
      message.success("模板已删除");
    }
  }, []);

  const templateMenuItems: MenuProps["items"] = React.useMemo(() => {
    return allCategories.map((category) => {
      const categoryTemplates = allTemplates.filter((t) => t.category === category);
      return {
        key: category,
        label: category,
        type: "group",
        children: categoryTemplates.map((template) => ({
          key: template.id,
          label: (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                {template.icon && <span>{template.icon}</span>}
                <div>
                  <div style={{ fontWeight: 500 }}>
                    {template.name}
                    {isCustomTemplate(template.id) && (
                      <span style={{ fontSize: 12, color: "#999", marginLeft: 4 }}>(自定义)</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: "#999" }}>{template.description}</div>
                </div>
              </div>
              {isCustomTemplate(template.id) && (
                <Button
                  type="text"
                  size="small"
                  danger
                  onClick={(e) => handleDeleteTemplate(template.id, e)}
                  style={{ padding: 0, height: "auto" }}
                >
                  删除
                </Button>
              )}
            </div>
          ),
        })),
      };
    });
  }, [allCategories, allTemplates, handleDeleteTemplate]);

  const handleScrollToLayouts = React.useCallback(() => {
    // 仅用于未来可能的定位，当前不显示单独按钮
  }, []);

  return (
    <div className={styles.componentPalette}>
      <div className={styles.paletteHeader}>
        <div className={styles.headerTop}>
          <div>
            <h3>组件面板</h3>
            <p className={styles.paletteHint}>拖拽组件到画布</p>
          </div>
          <div className={styles.headerActions}>
            <Dropdown
              menu={{
                items: templateMenuItems,
                onClick: handleTemplateMenuClick,
              }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Button
                size="small"
                icon={<AppstoreOutlined />}
              >
                模板
              </Button>
            </Dropdown>
          </div>
        </div>
        <div className={styles.searchBox}>
          <Input
            placeholder="搜索组件..."
            prefix={<SearchOutlined />}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            allowClear
          />
        </div>
      </div>

      <div className={styles.paletteContent} ref={paletteContentRef}>
        {layoutTemplates.length > 0 && (
          <div className={styles.paletteSection} key="layout-templates" ref={layoutSectionRef}>
            <h4>
              布局模板
              <span className={styles.itemCount}>({layoutTemplates.length})</span>
            </h4>
            <div className={styles.cardGrid}>
              {layoutTemplates.map((tpl) => (
                <LayoutTemplateCard key={tpl.id} template={tpl} />
              ))}
            </div>
          </div>
        )}

        {groupMap.map(
          (group) =>
            group.items.length > 0 && (
              <div className={styles.paletteSection} key={group.key}>
                <h4>
                  {group.title}
                  <span className={styles.itemCount}>({group.items.length})</span>
                </h4>
                <div className={styles.cardGrid}>
                  {group.items.map((meta) => (
                    <ComponentCard key={meta.type} meta={meta} />
                  ))}
                </div>
              </div>
            ),
        )}
      </div>

      {filteredComponents.length === 0 && (
        <div className={styles.paletteEmpty}>
          <p>未找到匹配的组件</p>
          <p className={styles.emptyHint}>尝试使用其他关键词搜索</p>
        </div>
      )}
    </div>
  );
};

