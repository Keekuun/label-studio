const EDITOR_SETTINGS = {
  enableHotkeys_newUI_title: '标注快捷键',
  enableHotkeys_newUI_description: '允许使用快捷键快速选择标签',
  enableHotkeys_description: '启用标注快捷键',

  enableTooltips_newUI_title: '在工具提示上显示快捷键',
  enableTooltips_newUI_description: '在工具和操作的提示框上显示按键绑定',
  enableTooltips_description: '显示快捷键提示',

  enableLabelTooltips_newUI_title: '在标签上显示快捷键',
  enableLabelTooltips_newUI_description: '在标签上显示按键绑定',
  enableLabelTooltips_description: '显示标签快捷键提示',

  showLabels_newUI_title: '显示区域标签',
  showLabels_newUI_description: '展示区域的标签名称',
  showLabels_description: '在区域内显示标签',

  continuousLabeling_newUI_title: '创建区域后保持标签选中状态',
  continuousLabeling_newUI_description: '允许使用选中的标签连续创建区域',
  continuousLabeling_description: '创建区域后保持标签选中',

  selectAfterCreate_newUI_title: '创建后自动选中区域',
  selectAfterCreate_newUI_description: '自动选中新创建的区域',
  selectAfterCreate_description: '创建后选中区域',

  showLineNumbers_newUI_tags: '文本标签',
  showLineNumbers_newUI_title: '显示行号',
  showLineNumbers_newUI_description: '识别并引用文档中特定的文本行',
  showLineNumbers_description: '为文本显示行号',

  preserveSelectedTool_newUI_tags: '图像标签',
  preserveSelectedTool_newUI_title: '保持选中的工具',
  preserveSelectedTool_newUI_description: '在任务间保留选中的工具',
  preserveSelectedTool_description: '记住选中的工具',

  enableSmoothing_newUI_tags: '图像标签',
  enableSmoothing_newUI_title: '缩放时像素平滑',
  enableSmoothing_newUI_description: '放大时平滑图像像素',
  enableSmoothing_description: '缩放时启用图像平滑',
  invertedZoom_newUI_tags: '图像标签',
  invertedZoom_newUI_title: '缩放方向反转',
  invertedZoom_newUI_description: '反转缩放方向',
  invertedZoom_description: '开启反转缩放方向',
};

const KEY_MAP = {
  "audio_back_description": "后退一秒",
  audio_playpause_description: "播放/暂停",
  audio_step_backward: "回退一步",
  audio_step_forward: "前进一步",

  "ts_grow-left_description": "向左扩大区域",
  "ts_grow-right_description": "向右扩大区域",
  "ts_shrink-left_description": "向左缩小区域",
  "ts_shrink-right_description": "向右缩小区域",
  "annotation_submit_description": "提交标注",
  "annotation_skip_description": "跳过任务",
  "annotation_undo_description": "撤销",
  "annotation_redo_description": "重做",
  "polygon_undo_description": "撤销",
  "polygon_redo_description": "重做",
  "region_delete-all_description": "删除所有区域",
  "region_focus_description": "聚焦第一个可聚焦区域",
  "region_relation_description": "创建区域间的关联",
  "region_visibility_description": "切换所选区域的可见性",
  region_visibility_all_description: "切换所有区域的可见性",

  "region_lock_description": "锁定所选区域",
  "region_meta_description": "编辑所选区域的元数据",
  "region_unselect_description": "取消选择区域",
  "region_exit_description": "退出关联模式，取消选择区域",
  "region_delete_description": "删除所选区域",
  "region_cycle_description": "循环切换区域",
  "region_duplicate_description": "复制所选区域",
  "segment_delete_description": "删除所选区域",
  "media_playpause_description": "播放/暂停",
  "media_step-backward_description": "后退一步",
  "media_step-forward_description": "前进一步",
  "video_keyframe-backward_description": "前往上一个关键帧",
  "video_keyframe-forward_description": "前往下一个关键帧",
  "video_backward_description": "向后移动",
  "video_rewind_description": "前往第一帧",
  "video_forward_description": "向前移动",
  "video_fastforward_description": "前往最后一帧",
  "video_hop-backward_description": "向后跳跃",
  "video_hop-forward_description": "向前跳跃",
  "repeater_next-page_description": "下一页",
  "repeater_previous-page_description": "上一页",
  "image_prev_description": "上一张图片",
  "image_next_description": "下一张图片",
  "frame_slice_description": "切割视频或音频",

  tool_zoom_in_description: "放大图像",
  tool_pan_image_description: "平移图像",
  tool_zoom_to_fit_description: "缩放以在视图中显示完整图像",
  tool_zoom_to_actual: "缩放到实际图像大小（100%）",
  tool_zoom_out_description: "缩小图像",
  tool_ellipse_description: "选择椭圆工具",
  tool_eraser_description: "选择橡皮擦工具",
  tool_auto_detect_description: "使用自动检测工具自动推荐区域",
  tool_rect_3point_description: "使用三点选择绘制旋转矩形",
  tool_key_point_description: "选择关键点标注工具",
  tool_magic_wand_description: "选择魔棒工具进行智能区域选择",
  tool_polygon_description: "选择多边形标注工具",
  tool_rect_description: "选择矩形标注工具",
  tool_text_description: "选择文本标注工具",
  tool_rotate_left_description: "将图像向左旋转 90°",
  tool_rotate_right_description: "将图像向右旋转 90°",
  tool_move_description: "选择移动工具重新定位标注",
  tool_brush_description: "选择画笔工具",
  tool_decrease_tool_description: "减小工具大小",
  tool_increase_tool_description: "增大工具大小",
  videoDrawOutside_description: '允许在视频边界外绘制',
  videoHopSize_description: '视频跳跃步长',
}

const ANNOTATION_HISTORY_REASON = {
  accepted: "接受",
  rejected: "拒绝",
  fixed_and_accepted: "已修复",
  updated: "已更新",
  submitted: "已提交",
  prediction: "预测",
  imported: "已导入",
  skipped: "已忽略",
  draft_created: "草稿",
  deleted_review: "核验已删除",
  propagated_annotation: "已传播",
}

const ZH_TRANSLATIONS = {
  // AnnotationHistoryComponent
  ...ANNOTATION_HISTORY_REASON,
  // keymap
  ...KEY_MAP,
  // editorsettings.js
  ...EDITOR_SETTINGS,

  // Annotations.jsx
  annotations: "标注",
  create_anno: "创建新标注",
  view_all_annotations: "查看所有标注",
  switch_to_submitted: "切换到已提交结果",
  switch_to_current: "切换到当前草稿",
  draft: "草稿",
  submitted: "已提交",
  saved: "已保存",
  not_submitted_draft: "未提交的草稿",
  unset_truth_title: "取消将此结果设为基准真值",
  set_truth_title: "将此结果设为基准真值",
  delete_s_annotation: "删除选中的标注",
  pls_confirm_del: "请确认是否要删除此标注",
  delete: "删除",
  cancel: "取消",
  created: "创建时间",
  started: "开始时间",
  time_ago: "{time}前",
  by_name: "由{name}创建",
  skip_anno: "跳过的标注",
  no_anno_sub_yet: "尚未提交任何标注",

  // Settings.jsx
  settings: "设置",
  shortcut: "快捷键",
  description: "说明",
  labeling_interface_settings: "标注界面设置",
  move_sidepanel_to_btm: "将侧边栏移至底部",
  display_res_in_panel: "在结果面板中默认显示标签",
  show_anno_panel: "显示标注面板",
  show_img_size: "以原始尺寸显示图片",
  general: "通用",
  hotkeys: "快捷键",
  layout: "布局",
  global_hotkeys: "全局快捷键",

// AnnotationButton.tsx
  unresolved_comments: "未解决的评论",
  all_comments_resolved: "所有评论已解决",
  del_anno_title: "删除标注？",
  del_anno_desc: "这将<strong>删除所有现有区域</strong>。确定要删除吗？<br />此操作无法撤销。",
  unset: "取消",
  set: "设置",
  as_gt: "为标准",
  dp_anno: "复制标注",
  del_anno: "删除标注",
  skipped: "已跳过",
  ground_truth: "标准",

  // AnnotationTab.jsx
  no_region_selected: "没有选中的区域",
  comments: "评论",

  // App.jsx
  done_all_task: "你已经完成队列中所有的任务！",
  go_prev_task: "去上一个任务",
  task: "任务",
  label_inst: "标注说明",

  // BottomBar.jsx
  show_inst: "显示说明",
  // GroundTruth.jsx
  unset_as_truth: "取消标准",
  set_as_truth: "设置为标准",

  // DynamicPreannotationsToggle.jsx
  auto_annotation: '自动标注',

  // HistoryActions.jsx
  undo: "撤消",
  redo: "重做",
  reset: "重置",

  // Comments.tsx
  unsaved_tips: "您有未保存的评论，继续操作将导致这些评论丢失。",
  updated: "已更新",
  are_sure: "确定吗？",
  yes: "是",
  no: "否",
  unresolve: "标记为未解决",
  resolve: "标记为已解决",
  cancel_edit: "取消编辑",
  edit: "编辑",

  // CommentForm.tsx
  add_comment: "添加评论",
  link_to: "链接到...",
  unlink: "取消链接",

  // Controls.jsx
  update_task_title: "更新此任务：[ Alt+Enter ]",
  save_res_title: "保存结果：[ Ctrl+Enter ]",
  cancel_task_title: "取消（跳过）任务：[ Ctrl+空格 ]",
  skip: "跳过",
  submit: "提交",
  update: "更新",

  // AnnotatioHistory.tsx
  show_more: "显示更多",
  show_less: "显示更少",

  // CurrentEntity.jsx
  anno_history: "标注历史",

  // Dialog.jsx
  selected_msg: "已选消息",

  // DraftPanel.jsx
  switch_to_ori: "切换至原始结果",
  switch_to_cur: "切换至当前草稿",
  original: "原始内容",

  // Entities
  regions: "区域",
  labels: "标签",
  del_all_regions: "删除所有区域",
  remove_all_regions: "正在删除所有区域",
  want_to_del_all_regions: "是否要删除所有已标注的区域？",
  sorted_by: "排序方式",
  not_labeled: "未标注",
  data: "日期",
  score: "分数",

  // Entity
  add_meta_info: "添加元信息",
  meta_info: "元信息",
  mate: "元数据",
  add: "添加",
  incomplete: "不完整",
  region_selected: "已选择 {num} 个区域",

  // Panel
  reset_prelabel: "重置预标注",
  frozen: "冻结",
  hide_instructions: "隐藏说明",
  instructions: "说明",

  // Regions
  multiple: "多个",
  LABELS: "标签",
  pls_select: "请选择",
  relations: "关系",
  no_relations_yet: "尚未添加关系",
  arr_marker: "箭头标记",
  no_label: "无标签",

  // ViewControls
  group_manul: '手动分组',
  manul: '手动',
  manual_grouping: '手动分组',
  manual_grouped: '按手动分组',
  group_by_label: '按标签分组',
  by_label: '按标签',
  label: '标签',
  grouped_by_label: '按标签分组',
  group_by_tool: '按工具分组',
  by_tool: '按工具',
  tool: '工具',
  grouped_by_tool: '按工具分组',
  order_by_time: '按时间排序',
  by_time: '按时间',
  order_by_score: '按分数排序',
  by_score: '按分数',
  show_all_regs: '显示所有区域',
  hide_all_regs: '隐藏所有区域',

  // OutlinerPanel
  all_regions_hidden: '所有隐藏的区域',
  adjust_to_view: '调整或删除过滤条件查看',
  there_regions_hidden: '有{num}个隐藏区域',
  regions_not_added: '暂未添加区域',
  outliner: "框选区",
  region: "区域",
  Regions: "区域",
  Relations: "关系",
  Info: "信息",
  History: "历史",
  select_details: "选中详情",

  // Relations
  select_labels: '选择标签',
  choices: '选项',
  show_all: '显示全部',
  hide_all: '隐藏全部',
  order_by_old: '按最早排序',
  order_by_new: '按最新排序',

  // PanelTabsBase
  collapse: '折叠',
  expand: '展开',
  group: '组',

  // Taxonoy
  only_leaf_allowed: '只允许选择叶子节点',
  max_items_selected: '已选择最大数量({num})的项目',
  add_inside: '添加到内部',
  click_add: '点击添加...',

  // TimeDurationControl
  start: '开始',
  end: '结束',
  duration: '时长',

  // AudioControl
  volume: '音量',
  volume_info: '调节音量',
  unmute: '取消静音',
  mute: '静音',
  hide: '隐藏',
  show: '显示',
  timeline: '时间线',
  audio_wave: '音频波形',
  play_speed: '播放速度',
  play_speed_info: '调节播放速度',
  audio_zoom: '音频纵轴缩放',
  audio_zoom_info: '调节振幅显示',

  // Actions
  view_all_anno: '查看所有标注',
  del_anno_body: '此操作不可撤销',
  proceed: '继续',
  creat_copy_type: '创建当前{type}的副本',

  // VirtualVideo
  video_render_error: '渲染视频时发生错误，请检查格式是否支持',

  // Waveform
  error_process_audio: "处理音频时出错。检查媒体格式和可用性。",
  hor_zoom_out: "水平缩小",
  hor_zoom_in: "水平放大",
  ver_zoom_out: "垂直缩小",
  ver_zoom_in: "垂直放大",
  speed: "速度",

  // LanguageSwitcher
  switch_lng_title: '确认切换语言吗？',
  switch_lng_info: '此操作会重载页面，请确保当前工作已保存。',
  confirm: '确定',

  // patches
  anno_copied: "标注链接已复制到剪贴板",
  anno_copy_link: "复制标注链接",
  auto_accept_suggestions: "自动接受建议",
  review_instr: "审核说明",
  view_anno_history: "查看标注历史",
  view_anno_history_desc: "查看当前任务的标注历史记录",
  save: "保存",
  modal_error: "错误",
  modal_warning: "警告",
  modal_info: "提示",
  modal_success: "成功",
  search: "搜索",
  learn_more: "了解更多",
  create_bwt_regs: "创建区域关系",
  create_bwt_regs_desc: "链接区域来定义它们之间的关系",
  view_reg_details: "查看区域详情",
  view_reg_details_desc: "选择一个区域以查看其属性、元数据和可用操作",
  taxonomy:"分类",
  text:"文本",
  rating:"Rating",
  start_frame:"开始帧",
  end_frame:"结束帧",
  labeled_reg_appear: "标记的区域将在这里显示",
  start_track_res: "使用此面板开始标记<br />并跟踪您的结果",

  spectrogram: "频谱图",
  loop_region: "循环区域",
  auto_play_region: "自动播放新区域",
  compare_all_anno: "比较所有注释",
  anno_id: "注释ID",
  overall_agree: "所有提交注释的总体一致性",
  agreement: "一致性",
  predictions: "预测",
  task_data: "任务数据",
  predictions_msg: "预测数量。这些不包含在一致性计算中。",
  anno_submit_msg: "已提交注释的数量。表格仅显示已提交的结果，不显示当前草稿。",

  toggle_visibility: "切换可见性",
  del_relation: "删除关系",
  show_selected_reg: "显示选中区域",
  hide_selected_reg: "隐藏选中区域",
  unlock_region: "解锁区域",
  lock_region: "锁定区域",

  cancel_task_key: "取消（跳过）[ Ctrl+Space ]",
  cancel_skip_key: "取消跳过: [ Ctrl+Space ]",
}

export default ZH_TRANSLATIONS
