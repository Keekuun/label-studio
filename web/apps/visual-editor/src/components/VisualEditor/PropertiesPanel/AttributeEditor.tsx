import React, { useEffect, useMemo, useState } from "react";
import { Form, Input, InputNumber, Switch, Select, Input as AntdInput, Collapse, AutoComplete } from "antd";
const { TextArea } = AntdInput;
const { Panel } = Collapse;
import { DownOutlined } from "@ant-design/icons";
import { AttributeMeta, ComponentNode } from "../../../types";
import { useComponentTree } from "../../../hooks/useComponentTree";
import { getBindableObjects, validateToName } from "../../../utils/constraintValidator";
import { getComponentMeta } from "../../../data/componentMetas";
import { validateAttribute, ValidationRule } from "../../../utils/attributeValidator";

interface AttributeEditorProps {
  node: ComponentNode;
  attributes: AttributeMeta[];
}

export const AttributeEditor: React.FC<AttributeEditorProps> = ({
  node,
  attributes,
}) => {
  const { updateComponent, rootNode } = useComponentTree();
  const [form] = Form.useForm();
  const [advancedExpanded, setAdvancedExpanded] = useState(false);

  // 将属性分为常用属性和高级属性，并调整顺序
  const { commonAttributes, advancedAttributes } = useMemo(() => {
    const common: AttributeMeta[] = [];
    const advanced: AttributeMeta[] = [];

    // 开发属性列表（应该放在最后）
    const devAttributes = ['style', 'className', 'idAttr'];

    // 属性优先级顺序（常用属性中，必填属性优先，然后是常用非必填属性）
    // 第一优先级：必填的关键属性
    // 第二优先级：常用的非必填属性（颜色、透明度、位置、宽高等）
    const priorityOrder = [
      'name',           // 组件名称（必填）
      'value',          // 数据源（必填）
      'toName',         // 关联对象（必填）
      'fromName',       // 来源对象
      'color',          // 颜色
      'fillColor',      // 填充颜色
      'strokeColor',    // 描边颜色
      'opacity',        // 透明度
      'fillOpacity',    // 填充透明度
      'strokeOpacity',  // 描边透明度
      'width',          // 宽度
      'height',         // 高度
      'x',              // X 坐标
      'y',              // Y 坐标
      'left',           // 左边距
      'top',            // 上边距
      'right',          // 右边距
      'bottom',         // 下边距
      'url',            // URL
    ];

    attributes.forEach((attr) => {
      // 开发属性（style, className, idAttr）默认归类为高级属性
      const isDevAttribute = devAttributes.includes(attr.name);

      // 如果明确标记了 isCommon，则按标记分类
      if (attr.isCommon !== undefined) {
        if (attr.isCommon) {
          common.push(attr);
        } else {
          advanced.push(attr);
        }
      } else if (isDevAttribute) {
        // 开发属性默认归类为高级属性
        advanced.push(attr);
      } else if (attr.required) {
        // 必填属性默认归类为常用属性
        common.push(attr);
      } else if (priorityOrder.includes(attr.name)) {
        // 关键常用属性（即使非必填且有默认值）归类为常用属性
        common.push(attr);
      } else {
        // 其他属性（包括有默认值的非关键属性）归类为高级属性
        advanced.push(attr);
      }
    });

    // 对常用属性按优先级排序
    common.sort((a, b) => {
      const aIndex = priorityOrder.indexOf(a.name);
      const bIndex = priorityOrder.indexOf(b.name);
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return 0;
    });

    // 对高级属性排序，开发属性放在最后
    advanced.sort((a, b) => {
      const aIsDev = devAttributes.includes(a.name);
      const bIsDev = devAttributes.includes(b.name);
      if (aIsDev && !bIsDev) return 1;
      if (!aIsDev && bIsDev) return -1;
      return 0;
    });

    return { commonAttributes: common, advancedAttributes: advanced };
  }, [attributes]);

  // 初始化表单值
  useEffect(() => {
    const initialValues: Record<string, any> = {};
    attributes.forEach((attr) => {
      if (node.attributes[attr.name] !== undefined) {
        initialValues[attr.name] = node.attributes[attr.name];
      } else if (attr.defaultValue !== undefined) {
        initialValues[attr.name] = attr.defaultValue;
      }
    });
    form.setFieldsValue(initialValues);
  }, [node.id, form, attributes]);

  // 处理表单值变化
  const handleValuesChange = (changedValues: Record<string, any>) => {
    updateComponent(node.id, {
      attributes: {
        ...node.attributes,
        ...changedValues,
      },
    });
  };

  // 构建验证规则
  const buildValidationRules = (attr: AttributeMeta) => {
    const rules: any[] = [];

    // 必填验证
    if (attr.required) {
      rules.push({ required: true, message: `请输入${attr.label}` });
    }

    // 自定义验证规则
    if (attr.validation) {
      const validationRules: ValidationRule[] = [];

      // 邮箱验证
      if (attr.validation.email) {
        validationRules.push({
          type: "email",
          message: `请输入有效的邮箱地址`,
        });
      }

      // URL 验证
      if (attr.validation.url) {
        validationRules.push({
          type: "url",
          message: `请输入有效的 URL`,
        });
      }

      // 数字验证
      if (attr.type === "number") {
        validationRules.push({
          type: "number",
          message: `请输入有效的数字`,
        });

        // 范围验证
        if (
          attr.validation.min !== undefined ||
          attr.validation.max !== undefined ||
          attr.validation.step !== undefined
        ) {
          validationRules.push({
            type: "range",
            min: attr.validation.min,
            max: attr.validation.max,
            step: attr.validation.step,
            message: `请输入有效的数字范围`,
          });
        }
      }

      // 字符串长度验证
      if (attr.type === "string" && (attr.validation.min !== undefined || attr.validation.max !== undefined)) {
        validationRules.push({
          type: "custom",
          validator: (value: any) => {
            if (!value) return true;
            const length = String(value).length;
            if (attr.validation!.min !== undefined && length < attr.validation!.min) {
              return `长度不能少于 ${attr.validation!.min} 个字符`;
            }
            if (attr.validation!.max !== undefined && length > attr.validation!.max) {
              return `长度不能超过 ${attr.validation!.max} 个字符`;
            }
            return true;
          },
        });
      }

      // 正则表达式验证
      if (attr.validation.pattern) {
        try {
          const regex = new RegExp(attr.validation.pattern);
          validationRules.push({
            type: "pattern",
            pattern: regex,
            message: `格式不正确`,
          });
        } catch (e) {
          console.warn(`Invalid regex pattern: ${attr.validation.pattern}`);
        }
      }

      // 自定义验证函数
      if (attr.validation.custom) {
        validationRules.push({
          type: "custom",
          validator: attr.validation.custom,
        });
      }

      // 添加验证规则到 Form.Item rules
      if (validationRules.length > 0) {
        rules.push({
          validator: (_: any, value: any) => {
            const result = validateAttribute(value, validationRules);
            if (!result.valid) {
              return Promise.reject(new Error(result.message || "验证失败"));
            }
            return Promise.resolve();
          },
        });
      }
    }

    return rules;
  };

  // 渲染属性输入组件
  const renderAttributeInput = (attr: AttributeMeta) => {
    const rules = buildValidationRules(attr);

    // 处理特殊属性（如 toName 需要引用已存在的 Object）
    if (attr.name === "toName" && attr.type === "select") {
      // 根据组件的 toNameConstraints 获取可绑定的对象
      const bindableObjects = getBindableObjects(node.type, rootNode);
      const options = bindableObjects.map((obj) => ({
        label: `${obj.type} (name="${obj.attributes.name || obj.id}")`,
        value: obj.attributes.name || obj.id,
      }));

      // 添加自定义验证规则
      const toNameRules = [
        ...rules,
        {
          validator: (_: any, value: string) => {
            if (!value) {
              if (attr.required) {
                return Promise.reject(new Error(`请选择${attr.label}`));
              }
              return Promise.resolve();
            }
            const validation = validateToName(node.type, value, rootNode);
            if (!validation.valid) {
              return Promise.reject(new Error(validation.message || "无效的对象引用"));
            }
            return Promise.resolve();
          },
        },
      ];

      return (
        <Form.Item
          key={attr.name}
          name={attr.name}
          label={
            <span>
              {attr.label} <span style={{ color: "#9aa7b8", fontWeight: "normal", fontSize: "12px" }}>({attr.name})</span>
            </span>
          }
          rules={toNameRules}
          tooltip={attr.description}
        >
          <Select
            placeholder={
              bindableObjects.length === 0
                ? "画布中没有可绑定的对象"
                : `选择${attr.label}`
            }
            options={options}
            showSearch
            disabled={bindableObjects.length === 0}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>
      );
    }

    // 根据属性类型渲染不同的输入组件
    switch (attr.type) {
      case "string":
        // 如果有常用选项，使用 AutoComplete 组件
        if (attr.commonOptions && attr.commonOptions.length > 0) {
          return (
            <Form.Item
              key={attr.name}
              name={attr.name}
              label={
                <span>
                  {attr.label} <span style={{ color: "#9aa7b8", fontWeight: "normal", fontSize: "12px" }}>({attr.name})</span>
                </span>
              }
              rules={rules}
              tooltip={attr.description}
            >
              <AutoComplete
                placeholder={attr.description || `选择或输入${attr.label}`}
                options={attr.commonOptions.map(opt => ({ value: opt.value, label: opt.label }))}
                filterOption={(inputValue, option) =>
                  (option?.label ?? "").toLowerCase().includes(inputValue.toLowerCase()) ||
                  (option?.value ?? "").toLowerCase().includes(inputValue.toLowerCase())
                }
                allowClear
                onSelect={(value) => {
                  form.setFieldsValue({ [attr.name]: value });
                  handleValuesChange({ [attr.name]: value });
                }}
                onChange={(value) => {
                  form.setFieldsValue({ [attr.name]: value });
                  handleValuesChange({ [attr.name]: value });
                }}
              />
            </Form.Item>
          );
        }

        return (
          <Form.Item
            key={attr.name}
            name={attr.name}
            label={
              <span>
                {attr.label} <span style={{ color: "#9aa7b8", fontWeight: "normal", fontSize: "12px" }}>({attr.name})</span>
              </span>
            }
            rules={rules}
            tooltip={attr.description}
          >
            <TextArea
              placeholder={attr.description || `请输入${attr.label}`}
              rows={attr.name === "value" || attr.name === "style" ? 3 : 2}
              autoSize={{ minRows: 2, maxRows: 6}}
            />
          </Form.Item>
        );

      case "number":
        return (
          <Form.Item
            key={attr.name}
            name={attr.name}
            label={
              <span>
                {attr.label} <span style={{ color: "#9aa7b8", fontWeight: "normal", fontSize: "12px" }}>({attr.name})</span>
              </span>
            }
            rules={rules}
            tooltip={attr.description}
          >
            <InputNumber
              placeholder={`请输入${attr.label}`}
              style={{ width: "100%" }}
              min={attr.validation?.min}
              max={attr.validation?.max}
              step={attr.validation?.step}
            />
          </Form.Item>
        );

      case "boolean":
        return (
          <Form.Item
            key={attr.name}
            name={attr.name}
            label={
              <span>
                {attr.label} <span style={{ color: "#9aa7b8", fontWeight: "normal", fontSize: "12px" }}>({attr.name})</span>
              </span>
            }
            valuePropName="checked"
            rules={rules}
            tooltip={attr.description}
          >
            <Switch />
          </Form.Item>
        );

      case "select":
        return (
          <Form.Item
            key={attr.name}
            name={attr.name}
            label={
              <span>
                {attr.label} <span style={{ color: "#9aa7b8", fontWeight: "normal", fontSize: "12px" }}>({attr.name})</span>
              </span>
            }
            rules={rules}
            tooltip={attr.description}
          >
            <Select
              placeholder={`选择${attr.label}`}
              options={attr.options}
            />
          </Form.Item>
        );

      case "color":
        return (
          <Form.Item
            key={attr.name}
            name={attr.name}
            label={
              <span>
                {attr.label} <span style={{ color: "#9aa7b8", fontWeight: "normal", fontSize: "12px" }}>({attr.name})</span>
              </span>
            }
            rules={rules}
            tooltip={attr.description}
          >
            <Input
              type="color"
              placeholder={`选择${attr.label}`}
              style={{ width: "100%", height: "32px" }}
            />
          </Form.Item>
        );

      default:
        return (
          <Form.Item
            key={attr.name}
            name={attr.name}
            label={
              <span>
                {attr.label} <span style={{ color: "#9aa7b8", fontWeight: "normal", fontSize: "12px" }}>({attr.name})</span>
              </span>
            }
            rules={rules}
            tooltip={attr.description}
          >
            <TextArea
              placeholder={attr.description || `请输入${attr.label}`}
              rows={2}
              autoSize={{ minRows: 2, maxRows: 6 }}
            />
          </Form.Item>
        );
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onValuesChange={handleValuesChange}
      initialValues={node.attributes}
    >
      {/* 常用属性 */}
      {commonAttributes.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          {commonAttributes.map((attr) => renderAttributeInput(attr))}
        </div>
      )}

      {/* 高级属性 */}
      {advancedAttributes.length > 0 && (
        <Collapse
          activeKey={advancedExpanded ? ['advanced'] : []}
          onChange={(keys) => setAdvancedExpanded(keys.includes('advanced'))}
          ghost
          style={{ background: 'transparent' }}
        >
          <Panel
            header={
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#6b7a90' }}>
                更多属性 ({advancedAttributes.length})
              </span>
            }
            key="advanced"
            style={{
              background: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #e9ecef',
              marginBottom: 0,
            }}
          >
            <div style={{ padding: 8 }}>
              {advancedAttributes.map((attr) => renderAttributeInput(attr))}
            </div>
          </Panel>
        </Collapse>
      )}
    </Form>
  );
};

