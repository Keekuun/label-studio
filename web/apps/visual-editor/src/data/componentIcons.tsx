import React from "react";
import {
  // Visual 组件图标
  AppstoreOutlined,      // View
  FileTextOutlined,      // Header
  FileOutlined,          // PagedView
  MenuUnfoldOutlined,   // Collapse
  EditOutlined,          // Markdown (替代 MarkdownOutlined)
  BorderOutlined,        // Dialog
  FilterOutlined,        // Filter
  BgColorsOutlined,      // Style
  LayoutOutlined,        // Panel (替代 PanelOutlined)
  CopyOutlined,          // Repeater
  
  // Object 组件图标
  PictureOutlined,       // Image
  FileTextOutlined as TextIcon, // Text
  AudioOutlined,         // Audio
  VideoCameraOutlined,   // Video
  GlobalOutlined,        // HyperText
  CodeOutlined,          // RichText
  LineChartOutlined,     // TimeSeries
  TableOutlined,         // Table
  UnorderedListOutlined, // List
  FileTextOutlined as ParagraphsIcon, // Paragraphs
  FilePdfOutlined,       // Pdf
  
  // Control 组件图标
  BorderOutlined as RectangleLabelsIcon, // RectangleLabels
  BorderOutlined as RectangleIcon,      // Rectangle
  ApartmentOutlined,     // PolygonLabels
  ApartmentOutlined as PolygonIcon,     // Polygon
  BgColorsOutlined as EllipseLabelsIcon, // EllipseLabels
  BgColorsOutlined as EllipseIcon,      // Ellipse
  AimOutlined,           // KeyPointLabels
  AimOutlined as KeyPointIcon,           // KeyPoint
  HighlightOutlined,     // BrushLabels
  HighlightOutlined as BrushIcon,        // Brush
  AppstoreOutlined as BitmaskLabelsIcon, // BitmaskLabels
  AppstoreOutlined as BitmaskIcon,       // Bitmask
  ThunderboltOutlined,   // MagicWand
  ApartmentOutlined as VectorLabelsIcon, // VectorLabels
  TagsOutlined,          // Labels
  CheckSquareOutlined,   // Choices
  MessageOutlined,        // TextArea
  ColumnWidthOutlined,   // Ruler
  NumberOutlined,        // Number
  StarOutlined,          // Rating
  CalendarOutlined,      // DateTime
  BranchesOutlined,      // Taxonomy
  SortAscendingOutlined, // Ranker
  SwapOutlined,          // Pairwise
  ShareAltOutlined,      // Relations
  ClockCircleOutlined,   // TimelineLabels
  BorderOutlined as VideoRectangleIcon, // VideoRectangle
  GlobalOutlined as HyperTextLabelsIcon, // HyperTextLabels
  FileTextOutlined as ParagraphLabelsIcon, // ParagraphLabels
  LineChartOutlined as TimeSeriesLabelsIcon, // TimeSeriesLabels
  
  // Label Item 组件图标
  TagOutlined,           // Label
  CheckCircleOutlined,   // Choice
  ThunderboltOutlined as ShortcutIcon, // Shortcut
  InboxOutlined,         // Bucket
  ShareAltOutlined as RelationIcon, // Relation
} from "@ant-design/icons";

/**
 * 组件图标映射
 * 为每个组件类型提供合适的 Ant Design 图标
 */
export const componentIcons: Record<string, React.ComponentType<any>> = {
  // Visual 组件
  View: AppstoreOutlined,
  Header: FileTextOutlined,
  PagedView: FileOutlined,
  Collapse: MenuUnfoldOutlined,
  Markdown: EditOutlined,        // 使用 EditOutlined 替代 MarkdownOutlined
  Dialog: BorderOutlined,
  Filter: FilterOutlined,
  Style: BgColorsOutlined,
  Panel: LayoutOutlined,         // 使用 LayoutOutlined 替代 PanelOutlined
  Repeater: CopyOutlined,
  
  // Object 组件
  Image: PictureOutlined,
  Text: TextIcon,
  Audio: AudioOutlined,
  Video: VideoCameraOutlined,
  HyperText: GlobalOutlined,
  RichText: CodeOutlined,
  TimeSeries: LineChartOutlined,
  Table: TableOutlined,
  List: UnorderedListOutlined,
  Paragraphs: ParagraphsIcon,
  Pdf: FilePdfOutlined,
  
  // Control 组件
  RectangleLabels: RectangleLabelsIcon,
  Rectangle: RectangleIcon,
  PolygonLabels: ApartmentOutlined,
  Polygon: PolygonIcon,
  EllipseLabels: EllipseLabelsIcon,
  Ellipse: EllipseIcon,
  KeyPointLabels: AimOutlined,
  KeyPoint: KeyPointIcon,
  BrushLabels: HighlightOutlined,
  Brush: BrushIcon,
  BitmaskLabels: BitmaskLabelsIcon,
  Bitmask: BitmaskIcon,
  MagicWand: ThunderboltOutlined,
  VectorLabels: VectorLabelsIcon,
  Labels: TagsOutlined,
  Choices: CheckSquareOutlined,
  TextArea: MessageOutlined,
  Ruler: ColumnWidthOutlined,
  Number: NumberOutlined,
  Rating: StarOutlined,
  DateTime: CalendarOutlined,
  Taxonomy: BranchesOutlined,
  Ranker: SortAscendingOutlined,
  Pairwise: SwapOutlined,
  Relations: ShareAltOutlined,
  TimelineLabels: ClockCircleOutlined,
  VideoRectangle: VideoRectangleIcon,
  HyperTextLabels: HyperTextLabelsIcon,
  ParagraphLabels: ParagraphLabelsIcon,
  TimeSeriesLabels: TimeSeriesLabelsIcon,
  
  // Label Item 组件
  Label: TagOutlined,
  Choice: CheckCircleOutlined,
  Shortcut: ShortcutIcon,
  Bucket: InboxOutlined,
  Relation: RelationIcon,
};

/**
 * 获取组件图标
 */
export function getComponentIcon(type: string): React.ComponentType<any> | undefined {
  return componentIcons[type];
}

