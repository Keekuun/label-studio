import { ComponentNode } from "../types";
import { nanoid } from "../utils/nanoid";

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  icon?: string;
  xml: string;
}

export const templates: Template[] = [
  {
    id: "image-bbox",
    name: "图像框选",
    description: "在图像上标注矩形区域",
    category: "图像标注",
    icon: "📦",
    xml: `<View>
  <Image name="img" value="$image"></Image>
  <RectangleLabels name="tag" toName="img" fillOpacity="0.5" strokeWidth="5">
    <Label value="Cat" background="#ffbdbd"></Label>
    <Label value="Dog" background="#bde5ff"></Label>
    <Label value="Other" background="#d5ffd5"></Label>
  </RectangleLabels>
</View>`,
  },
  {
    id: "layout-two-columns",
    name: "两列布局",
    description: "左右分栏的布局示例",
    category: "布局",
    icon: "🧱",
    xml: `<View>
  <View style="display: flex; gap: 16px;">
    <View style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
      <Header value="左侧" size="4" />
      <!-- 这里放置左侧组件 -->
    </View>
    <View style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
      <Header value="右侧" size="4" />
      <!-- 这里放置右侧组件 -->
    </View>
  </View>
</View>`,
  },
  {
    id: "layout-three-columns",
    name: "三列布局",
    description: "三栏自适应布局示例",
    category: "布局",
    icon: "🏗️",
    xml: `<View>
  <View style="display: flex; gap: 16px;">
    <View style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
      <Header value="列 1" size="4" />
      <!-- 这里放置第一列组件 -->
    </View>
    <View style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
      <Header value="列 2" size="4" />
      <!-- 这里放置第二列组件 -->
    </View>
    <View style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
      <Header value="列 3" size="4" />
      <!-- 这里放置第三列组件 -->
    </View>
  </View>
</View>`,
  },
  {
    id: "image-classification",
    name: "图像分类",
    description: "对图像进行分类选择",
    category: "图像标注",
    icon: "🏷️",
    xml: `<View>
  <Image name="img" value="$image"></Image>
  <Choices name="choice" toName="img" choice="single">
    <Choice value="Cat"></Choice>
    <Choice value="Dog"></Choice>
    <Choice value="Bird"></Choice>
  </Choices>
</View>`,
  },
  {
    id: "image-polygon",
    name: "图像多边形",
    description: "在图像上标注多边形区域",
    category: "图像标注",
    icon: "🔷",
    xml: `<View>
  <Image name="img" value="$image" zoom="true"></Image>
  <PolygonLabels name="tag" toName="img" strokewidth="3" fillcolor="red">
    <Label value="Region1" background="red"></Label>
    <Label value="Region2" background="blue"></Label>
  </PolygonLabels>
</View>`,
  },
  {
    id: "text-ner",
    name: "文本命名实体",
    description: "在文本上标注命名实体",
    category: "文本标注",
    icon: "📝",
    xml: `<View>
  <Text name="text" value="$text"></Text>
  <Labels name="ner" toName="text" choice="multiple">
    <Label value="Person"></Label>
    <Label value="Organization"></Label>
    <Label value="Location"></Label>
    <Label value="Date"></Label>
  </Labels>
</View>`,
  },
  {
    id: "text-classification",
    name: "文本分类",
    description: "对文本进行分类标注",
    category: "文本标注",
    icon: "📄",
    xml: `<View>
  <Text name="text" value="$text"></Text>
  <Choices name="sentiment" toName="text" choice="single">
    <Choice value="Positive"></Choice>
    <Choice value="Negative"></Choice>
    <Choice value="Neutral"></Choice>
  </Choices>
</View>`,
  },
  {
    id: "text-labels",
    name: "文本标签",
    description: "在文本上标注标签",
    category: "文本标注",
    icon: "🏷️",
    xml: `<View>
  <Text name="text" value="$text"></Text>
  <Labels name="labels" toName="text" choice="multiple">
    <Label value="Important"></Label>
    <Label value="Question"></Label>
    <Label value="Answer"></Label>
  </Labels>
</View>`,
  },
  {
    id: "empty",
    name: "空白模板",
    description: "从空白开始构建",
    category: "基础",
    icon: "📋",
    xml: `<View>
</View>`,
  },
];

export function getTemplateById(id: string): Template | undefined {
  return templates.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: string): Template[] {
  return templates.filter((t) => t.category === category);
}

export function getAllCategories(): string[] {
  return Array.from(new Set(templates.map((t) => t.category)));
}

