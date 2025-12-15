import React from "react";
import { useAtom } from "jotai";
import { selectedNodeAtom } from "../../../atoms/visualEditorAtoms";
import { getComponentMeta } from "../../../data/componentMetas";
import { AttributeEditor } from "./AttributeEditor";
import styles from "./PropertiesPanel.module.scss";

export const PropertiesPanel: React.FC = () => {
  const [selectedNode] = useAtom(selectedNodeAtom);

  if (!selectedNode) {
    return (
      <div className={styles.propertiesPanel}>
        <div className={styles.panelHeader}>
          <h3>属性面板</h3>
        </div>
        <div className={styles.panelEmpty}>
          <p>请选择一个组件来编辑属性</p>
        </div>
      </div>
    );
  }

  const componentMeta = getComponentMeta(selectedNode.type);

  if (!componentMeta || componentMeta.attributes.length === 0) {
    return (
      <div className={styles.propertiesPanel}>
        <div className={styles.panelHeader}>
          <h3>属性面板</h3>
          <div className={styles.selectedComponent}>
            <span className={styles.componentDisplayName}>
              {componentMeta?.displayName || selectedNode.type}
            </span>
            <span className={styles.componentTag}>{selectedNode.type}</span>
          </div>
        </div>
        <div className={styles.panelContent}>
          <p style={{ color: "#999", fontSize: "14px" }}>
            该组件没有可编辑的属性
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.propertiesPanel}>
      <div className={styles.panelHeader}>
        <h3>属性面板</h3>
        <div className={styles.selectedComponent}>
          <span className={styles.componentDisplayName}>
            {componentMeta.displayName || selectedNode.type}
          </span>
          <span className={styles.componentTag}>{selectedNode.type}</span>
        </div>
      </div>
      <div className={styles.panelContent}>
        <AttributeEditor
          key={selectedNode.id}
          node={selectedNode}
          attributes={componentMeta.attributes}
        />
      </div>
    </div>
  );
};

