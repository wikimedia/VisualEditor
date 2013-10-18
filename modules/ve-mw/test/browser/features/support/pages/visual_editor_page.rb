class VisualEditorPage
  include PageObject

  include URL
  page_url URL.url('User:Selenium_user')

  div(:container_disabled, class: 've-ui-widget ve-ui-widget-disabled ve-ui-flaggableElement-constructive ve-ui-pushButtonWidget')
  div(:content, class: 've-ce-documentNode ve-ce-branchNode')
  a(:decrease_indentation, class: 've-ui-widget ve-ui-tool ve-ui-tool-outdent ve-ui-widget-disabled')
  a(:decrease_indentation_on, title: 'Decrease indentation [SHIFT+TAB]')
  span(:downarrow, class: 've-ui-iconedElement-icon ve-ui-icon-down')
  a(:edit_ve, title: /Edit this page with VisualEditor/)
  span(:heading, text: 'Heading')
  a(:increase_indentation, class: 've-ui-widget ve-ui-tool ve-ui-tool-indent ve-ui-widget-disabled')
  a(:increase_indentation_on, title: 'Increase indentation [TAB]')
  div(:insert_references, class: 've-ui-window-title')
  span(:internal_linksuggestion, text: 'Main Page')
  div(:ip_warning, class: 've-init-mw-viewPageTarget-editNotices-notice')
  span(:linksuggestion, text: 'http://www.example.com')
  span(:looks_good, class: 've-ui-labeledElement-label', text: 'Looks good to me')
  span(:more_menu, text: 'More')
  span(:newpage_linksuggestion, text: 'DoesNotExist')
  div(:page_text, id: 'mw-content-text')
  span(:page_title, text: 'Page title')
  span(:paragraph, text: 'Paragraph')
  span(:preformatted, text: 'Preformatted')
  span(:refs_link, text: 'Reference')
  div(:save_disabled, class: 've-ui-widget ve-ui-widget-disabled ve-ui-flaggableElement-constructive ve-ui-pushButtonWidget')
  span(:save_page, class: 've-ui-labeledElement-label', text: 'Save page')
  span(:subheading1, text: 'Sub-heading 1')
  span(:subheading2, text: 'Sub-heading 2')
  span(:subheading3, text: 'Sub-heading 3')
  span(:subheading4, text: 'Sub-heading 4')
  span(:ve_bullets, class: 've-ui-iconedElement-icon ve-ui-icon-bullet-list')
  div(:ve_heading_menu, class: 've-ui-dropdownTool-icon ve-ui-icon-down')
  span(:ve_link_icon, class: 've-ui-iconedElement-icon ve-ui-icon-link')
  span(:ve_references, text: 'Reference')
  span(:ve_numbering, class: 've-ui-iconedElement-icon ve-ui-icon-number-list')
  div(:visual_editor_toolbar, class: 've-ui-toolbar-tools')
  span(:transclusion, text: 'Transclusion')

  in_frame(:index => 0) do |frame|
    text_area(:describe_change, index: 0, frame: frame)
    div(:diff_view, class: 've-ui-mwSaveDialog-viewer', frame: frame)
    a(:ex, title: 'Close', frame: frame)
    a(:leftarrowclose, title: 'Close', frame: frame)
    text_field(:link_textfield, index: 0, frame: frame)
    checkbox(:minor_edit, id: 'wpMinoredit', frame: frame)
    span(:return_to_save, class: 've-ui-labeledElement-label', text: 'Return to save form', frame: frame)
    span(:review_changes, class: 've-ui-labeledElement-label', text: 'Review your changes', frame: frame)
    span(:second_save_page, class: 've-ui-labeledElement-label', text: 'Save page', frame: frame)
    list_item(:template_list_item, text: 'S', frame: frame)
    div(:ve_link_ui, class: 've-ui-window-head', frame: frame)
  end

  in_frame(:index => 1) do |frame|
    a(:beta_warning, title: 'Close', frame: frame)
    div(:content_box, class: 've-ce-documentNode ve-ce-branchNode', frame: frame)
    div(:links_diff_view, class: 've-ui-mwSaveDialog-viewer', frame: frame)
    span(:links_review_changes, class: 've-ui-labeledElement-label', text: 'Review your changes', frame: frame)
  end

  in_frame(:index => 2) do |frame|
    span(:add_parameter, class: 've-ui-mwParameterResultWidget-name', frame: frame)
    span(:add_template, text: 'Add template', frame: frame)
    span(:apply_changes, text: 'Apply changes', frame: frame)
    div(:content_box, class: 've-ce-documentNode ve-ce-branchNode', frame: frame)
    span(:insert_reference, text: 'Insert reference', frame: frame)
    text_field(:parameter_box, index: 0, frame: frame)
    span(:remove_parameter, text: 'Remove parameter', frame: frame)
    span(:remove_template, text: 'Remove template', frame: frame)
    unordered_list(:suggestion_list, class: 've-ui-widget ve-ui-selectWidget ve-ui-clippableElement-clippable ve-ui-menuWidget ve-ui-textInputMenuWidget ve-ui-lookupWidget-menu ve-ui-mwTitleInputWidget-menu', frame: frame)
    div(:title, class: 've-ui-window-title', frame: frame)
    text_area(:transclusion_textarea, index: 0, frame: frame)
    text_field(:transclusion_textfield, index: 0, frame: frame)
  end
end
