const EDITOR_SETTINGS = {
  enableHotkeys_newUI_title: 'Labeling hotkeys',
  enableHotkeys_newUI_description: 'Enables quick selection of labels using hotkeys',
  enableHotkeys_description: 'Enable labeling hotkeys',

  enableTooltips_newUI_title: 'Show hotkeys on tooltips',
  enableTooltips_newUI_description: 'Displays keybindings on tools and actions tooltips',
  enableTooltips_description: 'Show hotkey tooltips',

  enableLabelTooltips_newUI_title: 'Show hotkeys on labels',
  enableLabelTooltips_newUI_description: 'Displays keybindings on labels',
  enableLabelTooltips_description: 'Show labels hotkey tooltips',

  showLabels_newUI_title: 'Show region labels',
  showLabels_newUI_description: 'Display region label names',
  showLabels_description: 'Show labels inside the regions',

  continuousLabeling_newUI_title: 'Keep label selected after creating a region',
  continuousLabeling_newUI_description: 'Allows continuous region creation using the selected label',
  continuousLabeling_description: 'Keep label selected after creating a region',

  selectAfterCreate_newUI_title: 'Select region after creating it',
  selectAfterCreate_newUI_description: 'Automatically selects newly created regions',
  selectAfterCreate_description: 'Select regions after creating',

  showLineNumbers_newUI_tags: 'Text Tag',
  showLineNumbers_newUI_title: 'Show line numbers',
  showLineNumbers_newUI_description: 'Identify and reference specific lines of text in your document',
  showLineNumbers_description: 'Show line numbers for Text',

  preserveSelectedTool_newUI_tags: 'Image Tag',
  preserveSelectedTool_newUI_title: 'Keep selected tool',
  preserveSelectedTool_newUI_description: 'Persists the selected tool across tasks',
  preserveSelectedTool_description: 'Remember Selected Tool',
  enableSmoothing_newUI_tags: 'Image Tag',
  enableSmoothing_newUI_title: 'Pixel smoothing on zoom',
  enableSmoothing_newUI_description: 'Smooth image pixels when zoomed in',
  enableSmoothing_description: 'Enable image smoothing when zoom',
  invertedZoom_newUI_tags: 'Image Tag',
  invertedZoom_newUI_title: 'Invert zoom direction',
  invertedZoom_newUI_description: 'Invert the direction of scroll-to-zoom',
  invertedZoom_description: 'Enable inverted zoom direction',
}

const KEY_MAP = {
  "audio_back_description": "Back for one second",
  audio_playpause_description: "Play/pause",
  audio_step_backward: "Go one step back",
  audio_step_forward: "Go one step forward",

  "ts_grow-left_description": "Increase region to the left",
  "ts_grow-right_description": "Increase region to the right",
  "ts_shrink-left_description": "Decrease region on the left",
  "ts_shrink-right_description": "Decrease region on the right",
  "annotation_submit_description": "Submit annotation",
  "annotation_skip_description": "Skip Task",
  "annotation_undo_description": "Undo",
  "annotation_redo_description": "Redo",
  "polygon_undo_description": "Undo",
  "polygon_redo_description": "Redo",
  "region_delete-all_description": "Delete all regions",
  "region_focus_description": "Focus first focusable region",
  "region_relation_description": "Create relation between regions",
  "region_visibility_description": "Toggle selected region visibility",
  region_visibility_all_description: "Toggle all regions visibility",

  "region_lock_description": "Lock selected region",
  "region_meta_description": "Edit selected region meta",
  "region_unselect_description": "Unselect region",
  "region_exit_description": "Exit relation mode, unselect region",
  "region_delete_description": "Delete selected region",
  "region_cycle_description": "Cycle through regions",
  "region_duplicate_description": "Duplicate selected region",
  "segment_delete_description": "Delete selected region",
  "media_playpause_description": "Play/pause",
  "media_step-backward_description": "Go one step back",
  "media_step-forward_description": "Go one step forward",
  "video_keyframe-backward_description": "Go to previous keyframe",
  "video_keyframe-forward_description": "Go to next keyframe",
  "video_backward_description": "Go back",
  "video_rewind_description": "Go to first frame",
  "video_forward_description": "Go forward",
  "video_fastforward_description": "Go to last frame",
  "video_hop-backward_description": "Hop Backward",
  "video_hop-forward_description": "Hop Forward",
  "repeater_next-page_description": "Next Page",
  "repeater_previous-page_description": "Previous Page",
  "image_prev_description": "Previous Image",
  "image_next_description": "Next Image",
  "frame_slice_description": "Slice video or audio",

  tool_zoom_in_description: "Zoom in on the image",
  tool_pan_image_description: "Pan around the image",
  tool_zoom_to_fit_description: "Zoom to fit the full image in view",
  tool_zoom_to_actual: "Zoom to actual image size (100%)",
  tool_zoom_out_description: "Zoom out of the image",
  tool_ellipse_description: "Select the ellipse tool",
  tool_eraser_description: "Select the eraser tool",
  tool_auto_detect_description: "Use the auto-detect tool to automatically suggest regions",
  tool_rect_3point_description: "Draw a rotated rectangle using 3-point selection",
  tool_key_point_description: "Select the key point annotation tool",
  tool_magic_wand_description: "Select the magic wand tool for smart region selection",
  tool_polygon_description: "Select the polygon annotation tool",
  tool_rect_description: "Select the rectangle annotation tool",
  tool_text_description: "Select the text annotation tool",
  tool_rotate_left_description: "Rotate the image 90° to the left",
  tool_rotate_right_description: "Rotate the image 90° to the right",
  tool_move_description: "Select the move tool to reposition annotations",
  tool_brush_description: "Select the brush tool",
  tool_decrease_tool_description: "Decrease tool size",
  tool_increase_tool_description: "Increase tool size",
}

const ANNOTATION_HISTORY_REASON = {
  accepted: "Accepted",
  rejected: "Rejected",
  fixed_and_accepted: "Fixed",
  updated: "Updated",
  submitted: "Submitted",
  prediction: "Prediction",
  imported: "Imported",
  skipped: "Skipped",
  draft_created: "Draft",
  deleted_review: "Review deleted",
  propagated_annotation: "Propagated",
}

const EN_TRANSLATIONS = {
  // AnnotationHistoryComponent
  ...ANNOTATION_HISTORY_REASON,
  // keymap.json
  ...KEY_MAP,
  // editorsettings.js
  ...EDITOR_SETTINGS,
  // Annotations.jsx
  annotations: "Annotations",
  create_anno: "Create a new annotation",
  view_all_annotations: "View all annotations",
  switch_to_submitted: "switch to submitted result",
  switch_to_current: "switch to current draft",
  draft: "draft",
  submitted: "submitted",
  saved: "saved",
  not_submitted_draft: "not submitted draft",
  unset_truth_title: "Unset this result as a ground truth",
  set_truth_title: "Set this result as a ground truth",
  delete_s_annotation: "Delete selected annotation",
  pls_confirm_del: "Please confirm you want to delete this annotation",
  delete: "Delete",
  cancel: "Cancel",
  created: "Created",
  started: "Started",
  time_ago: "{time} ago",
  by_name: "by {name}",
  skip_anno: "Skipped annotation",
  no_anno_sub_yet: "No annotations submitted yet",

  // Settings.jsx
  settings: "Settings",
  shortcut:"Shortcut",
  description:"Description",
  labeling_interface_settings: "Labeling Interface Settings",
  move_sidepanel_to_btm: "Move sidepanel to the bottom",
  display_res_in_panel: "Display Labels by default in Results panel",
  show_anno_panel: "Show Annotations panel",
  show_img_size: "Show image in fullsize",
  general: "General",
  hotkeys: "Hotkeys",
  layout: "Layout",
  global_hotkeys: "Global Hotkeys",

  // AnnotationButton.tsx
  unresolved_comments: "Unresolved Comments",
  all_comments_resolved: "All Comments Resolved",
  del_anno_title: "Delete annotation?",
  del_anno_desc: "This will <strong>delete all existing regions</strong>. Are you sure you want to delete them?<br /> This action cannot be undone.",
  unset: "Unset",
  set: "Set",
  as_gt: "as Ground Truth",
  dp_anno: "Duplicate Annotation",
  del_anno: "Delete Annotation",
  skipped: "Skipped",
  ground_truth: "Ground-truth",

  // AnnotationTab.jsx
  no_region_selected: "No Region selected",
  comments: "Comments",

  // App.jsx
  done_all_task: "You have completed all tasks in the queue!",
  go_prev_task: "Go to Previous Task",
  task: "Task",
  label_inst: "Labeling Instructions",

  // BottomBar.jsx
  show_inst:"Show instructions",
  // GroundTruth.jsx
  unset_as_truth:"Unset this result as a ground truth",
  set_as_truth:"Set this result as a ground truth",

  // DynamicPreannotationsToggle.jsx
  auto_annotation:'Auto-Annotation',

  // HistoryActions.jsx
  undo: "Undo",
  redo: "Redo",
  reset: "Reset",

  // Comments.tsx
  unsaved_tips: "You have unpersisted comments which will be lost if continuing.",
  updated: "updated",
  are_sure: "Are you sure?",
  yes: "Yes",
  no: "No",
  unresolve: "Unresolve",
  resolve: "Resolve",
  cancel_edit: "Cancel edit",
  edit: "Edit",

  // CommentForm.tsx
  add_comment: "Add a comment",
  link_to: "Link to...",

  // Controls.jsx
  update_task_title: "Update this task: [ Alt+Enter ]",
  save_res_title: "Save results: [ Ctrl+Enter ]",
  cancel_task_title: "Cancel (skip) task: [ Ctrl+Space ]",
  skip: "Skip",
  submit: "Submit",
  update: "Update",

  // AnnotatioHistory.tsx
  show_more: "Show more",
  show_less: "Show less",
  // CurrentEntity.jsx
  anno_history: "Annotation History",

  // Dialog.jsx
  selected_msg: "Selected Message",

  // DraftPanel.jsx
  switch_to_ori: "switch to original result",
  switch_to_cur: "switch to current draft",
  original: "original",

  // Entities
  regions: "Regions",
  labels: "Labels",
  del_all_regions: "Delete All Regions",
  remove_all_regions: "Removing all regions",
  want_to_del_all_regions: "Do you want to delete all annotated regions?",
  sorted_by: "Sorted by",
  not_labeled: "Not labeled",
  data: 'Date',
  score: 'Score',

  // Entity
  add_meta_info: "Add Meta Information",
  meta_info: "Meta Information",
  mate: "Meta",
  add: "Add",
  incomplete: "Incomplete",
  region_selected: "{num} Regions are selected",

  // Panel
  reset_prelabel:"Reset Prelabeling",
  frozen:"frozen",
  hide_instructions:"Hide Instructions",
  instructions:"Instructions",

  // Regions
  multiple: "multiple",
  LABELS: "LABELS",
  pls_select: "Please select",
  relations: "Relations",
  no_relations_yet: "No Relations added yet",

  arr_marker: "Arrow Marker",
  no_label: "No Label",

  // ViewControls
  group_manul: 'Group Manually',
  manul: 'Manual',
  manual_grouping: 'Manual Grouping',
  manual_grouped: 'Manually Grouped',
  group_by_label: 'Group by Label',
  by_label: 'By Label',
  label: 'Label',
  grouped_by_label: 'Grouped by Label',
  group_by_tool: 'Group by Tool',
  by_tool: 'By Tool',
  tool: 'Tool',
  grouped_by_tool: 'Grouped by Tool',
  order_by_time: 'Order by Time',
  by_time: 'By Time',
  order_by_score: 'Order by Score',
  by_score: 'By Score',
  show_all_regs: 'Show all regions',
  hide_all_regs: 'Hide all regions',

  // OutlinerPanel
  all_regions_hidden: 'All regions hidden',
  adjust_to_view: 'Adjust or remove the filters to view',
  there_regions_hidden: 'There are {num} hidden regions',
  regions_not_added: 'Regions not added',
  outliner: "Outliner",
  region: "region",
  Regions: "Regions",
  Relations: "Relations",
  Info: "Info",
  History: "History",
  select_details: "Selection Details",

  // Relations
  select_labels: 'Select labels',
  choices: 'Choices',
  show_all: 'Show all',
  hide_all: 'Hide all',
  order_by_old: 'Order by oldest',
  order_by_new: 'Order by newest',

  // PanelTabsBase
  collapse: 'Collapse',
  expand: 'Expand',
  group: 'Group',

  // Taxonoy
  only_leaf_allowed: 'Only leaf nodes allowed',
  max_items_selected: 'Maximum {num} items already selected',
  add_inside: 'Add Inside',
  click_add: 'Click to add...',

  // TimeDurationControl
  start: 'Start',
  end: 'End',
  duration: 'Duration',

  // AudioControl
  volume: 'Volume',
  volume_info: 'Increase or decrease the volume of the audio',
  unmute: 'Unmute',
  mute: 'Mute',
  hide: 'Hide',
  show: 'Show',
  timeline: 'timeline',
  audio_wave: 'audio wave',
  play_speed: "Playback speed",
  play_speed_info: "Increase or decrease the playback speed",
  audio_zoom: "Audio zoom y-axis",
  audio_zoom_info: "Increase or decrease the appearance of amplitude",

  // Actions
  view_all_anno: 'View all annotations',
  del_anno_body: 'This action cannot be undone',
  proceed: 'Proceed',
  creat_copy_type: 'Create copy of current {type}',

  // VirtualVideo
  video_render_error: 'There has been an error rendering your video, please check the format is supported',

  // Waveform
  error_process_audio: "Error while processing audio. Check media format and availability.",
  hor_zoom_out: "Horizontal zoom out",
  hor_zoom_in: "Horizontal zoom in",
  ver_zoom_out: "Vertical zoom out",
  ver_zoom_in: "Vertical zoom in",
  speed: "Speed",

  // LanguageSwitcher
  switch_lng_title: 'Confirm to switch languages?',
  switch_lng_info: 'This action will reload the page, please make sure the current work is saved.',
  confirm: 'OK',

  // patches
  anno_copied: "Annotation link copied to clipboard",
  anno_copy_link: "Copy Annotation Link",
  auto_accept_suggestions: "Auto-Accept Suggestions",
  review_instr: "Review Instructions",
  view_anno_history: "View Annotation History",
  view_anno_history_desc: "See a log of user actions for this annotation",
  save: "Save",
  modal_error: "Error",
  modal_warning: "Warning",
  modal_info: "Info",
  modal_success: "Success",
  search: "Search",
  learn_more: "Learn more",
  create_bwt_regs: "Create relations between regions",
  create_bwt_regs_desc: "Link regions to define relationships between them",
  view_reg_details: "View Region Details",
  view_reg_details_desc: "Select a region to view its properties, metadata and available actions",
  taxonomy:"Taxonomy",
  text:"Text",
  rating:"Rating",
  start_frame:"Start frame",
  end_frame:"End frame",
  labeled_reg_appear: "Labeled regions will appear here",
  start_track_res: "Start labeling and track your results<br />using this panel",

  spectrogram: "spectrogram",
  loop_region: "Loop Regions",
  auto_play_region: "Auto-play New Regions",
  compare_all_anno: "Compare all annotations",
  anno_id: "Annotation ID",
  overall_agree: "Overall agreement over all submitted annotations",
  agreement: "Agreement",
  predictions: "Predictions",
  task_data: "Task Data",
  predictions_msg: "Number of predictions. They are not included in the agreement calculation.",
  anno_submit_msg: "Number of submitted annotations. Table shows only submitted results, not current drafts.",

}

export default EN_TRANSLATIONS
