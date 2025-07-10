/**
 * INTERFACE 
 * The functions below extend the Google Sheets interface with added menu options
 * https://developers.google.com/apps-script/reference/spreadsheet
 */

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  var menu = ui.createMenu('Jira')

  menu
    .addItem('Refresh Sprint List', 'writeSprintOverview')
    .addSeparator()
    .addItem('Get Sprint Report (Current)', 'writeSprintReportCurrent')
    .addItem('Get Sprint Report (Last Closed)', 'writeSprintReportLastClosed')
    .addItem('Get Sprint Report (Custom)', 'writeSprintReportCustom')
    .addSeparator()
    .addItem('Get Issues (Custom Query)', 'writeSprintReportCustom')
    .addSeparator()
    .addSubMenu(ui.createMenu('Configure')
      .addItem('Reset credentials', 'setCredentials')
      .addItem('Delete Credentials', 'deleteCredentials')
      )
    .addToUi()
}