When(/^I click the Edit source tab$/) do
  on(VisualEditorPage).edit_wikitext_element.when_present.click
end

When(/^I click the Switch to source editing menu option$/) do
  on(VisualEditorPage) do |page|
    page.alert do
      page.switch_to_source_editing_element
    end
  end
end

When(/^I click Edit for VisualEditor from this page$/) do
  on(VisualEditorPage) do |page|
    page.alert do
      page.edit_ve_element
    end
  end
end

Then(/^I should be in wikitext editing mode$/) do
  on(VisualEditorPage) do |page|
    page.wait_until(15) do
      page.text.include? "Editing User:"
    end
  end
  @browser.url.should eql(ENV['MEDIAWIKI_URL'] + "User:" + ENV['MEDIAWIKI_USER'] + "?action=submit")
end

Then(/^I should be in Visual Editor editing mode$/) do
  on(VisualEditorPage) do |page|
    page.wait_until(15) do
      page.text.include? "User:"
    end
  end
  expected_url = /index\.php\?title=User:Selenium_user&veaction=edit/
  @browser.url.should match Regexp.new(expected_url)
end

Then(/^I should be in Visual Editor editing alternate mode$/) do
  on(VisualEditorPage) do |page|
    page.wait_until(15) do
      page.text.include? "User:"
    end
  end
  @browser.url.should eql(ENV['MEDIAWIKI_URL'] + "User:" + ENV['MEDIAWIKI_USER'] + "?veaction=edit")
end
