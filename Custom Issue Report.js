/**
 * CUSTOM ISSUE REPORT
 * Generates reports for a given sprint query in the Custom Report tab
 * 
 * Uses the Jira Rest APIs V1 & V2
 * https://developer.atlassian.com/cloud/jira/software/rest/intro/
 * https://developer.atlassian.com/cloud/jira/platform/rest/v2/intro/
 */

/**
 * Prompts the query, then clears and rewrites the "Custom Issue Report" tab with requested issues
*/
function writeSprintReportCustom() {
  const jira = new JiraClient();

  //prompt sprintId
  const query = Browser.inputBox('Please enter a query:', Browser.Buttons.OK_CANCEL);

  // retrieving data
  const reportData = getCustomIssueReport(query);

  try {
    // format and write
    var sprintSheet = SpreadsheetApp
      .getActiveSpreadsheet().getSheetByName("Custom Report")
    // clearing old data
    sprintSheet.clearContents();
  }
  catch (error) {
    // creating a new sheet if the old one does not exist any more
    var newSheet = activeSpreadsheet.insertSheet();
    newSheet.setName("Custom Report");
  }

  // set new data
  sprintSheet
    .getRange(...getTableDim(reportData))
    .setValues(reportData)
}


/**
 * Retrieves and builds a report aggregating data on a given sprint
 * @return {array}  An array of objects corresponding to the issues in the sprint
 * @customfunction
*/
function getCustomIssueReport(query) {

  const jira = new JiraClient();

  // Retrieving Data
  let issues = jira.getResource('GET', `/rest/api/2/search?jql=` + query).issues;

  const table = [["Type", "Issue Key", "Epic", "Story Points", "Summary", "Build vs. Run", "Status", "Assignee", "URL"]];

  issues.forEach((issue) => {
    console.log(issue.fields.parent.fields.summary)
    if (issue.fields.issuetype.name != "Sub-task") {

      let row = [
        issue.fields.issuetype.name,
        issue.key,
        issue.fields.parent ? issue.fields.parent.fields.summary : null,
        issue.fields.customfield_10004,
        issue.fields.summary,
        issue.fields.customfield_12318 ? issue.fields.customfield_12318.value : null,
        issue.fields.status.statusCategory.name,
        issue.fields.assignee ? issue.fields.assignee.displayName : null,
        `${jira.credentials.baseUrl}/${issue.key}`
      ];
      table.push(row)
    }
  })
  return table;

}

function testGetCustomIssueReport() {
    getCustomIssueReport("parent = CRSB-1652 ORDER BY created DESC")
}