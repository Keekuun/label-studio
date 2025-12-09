import React from "react";
import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { getAllComponentMetas } from "../../../data/componentMetas";
import { ComponentCard } from "./ComponentCard";
import styles from "./ComponentPalette.module.scss";

export const ComponentPalette: React.FC = () => {
  const [searchKeyword, setSearchKeyword] = React.useState("");

  const components = React.useMemo(() => {
    return getAllComponentMetas();
  }, []);

  const groups = [
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

  const groupMap = React.useMemo(() => {
    return groups.map((g) => ({
      ...g,
      items: filteredComponents
        .filter((c) => (c.group || c.category) === g.key)
        .sort((a, b) => (a.sortOrder ?? 1000) - (b.sortOrder ?? 1000)),
    }));
  }, [filteredComponents, groups]);

  return (
    <div className={styles.componentPalette}>
      <div className={styles.paletteHeader}>
        <h3>组件面板</h3>
        <p className={styles.paletteHint}>拖拽组件到画布</p>
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

      <div className={styles.paletteContent}>
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

