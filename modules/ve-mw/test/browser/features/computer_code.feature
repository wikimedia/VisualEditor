@ie6-bug  @ie7-bug  @ie8-bug @ie9-bug @ie10-bug @en.wikipedia.beta.wmflabs.org @test2.wikipedia.org @login
Feature: VisualEditor Computer Code

  Scenario: VisualEditor Computer Code
    Given I am logged in
      And I am at my user page
    When I click Edit for VisualEditor
      And I type in an input string
      And select the string
      And I click Computer Code
      And I click Save page
      And I click Review your changes
    Then <code>This is a new line</code> should appear in the diff view
      And I can click the X on the save box
