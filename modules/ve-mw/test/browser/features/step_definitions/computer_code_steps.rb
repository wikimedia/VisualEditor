When(/^I click Computer Code$/) do
  on(VisualEditorPage) do |page|
    page.more_menu_element.when_present.click
    page.ve_computer_code_element.when_present.click
  end
end
