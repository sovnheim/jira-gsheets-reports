/**
 * SPRINT REPORTS
 * Generates reports for a unique sprint in the Sprint Report tab
 * 
 * Uses the Jira Rest APIs V1 & V2
 * https://developer.atlassian.com/cloud/jira/software/rest/intro/
 * https://developer.atlassian.com/cloud/jira/platform/rest/v2/intro/
 */

/**
 * Retrieves and builds a report aggregating data on a given sprint
 * @return {array}  An array of objects corresponding to the issues in the sprint
 * @customfunction
*/
function getReport(sprintId) {
  const jira = new JiraClient();

  // Retrieving Data
  let sprintReport = jira.getResource('GET', `/rest/greenhopper/latest/rapid/charts/sprintreport?rapidViewId=${jira.boardId}&sprintId=${sprintId}`);

  // Table Header
  const table = [["Type", "Issue Key", "Epic", "Story Points", "Summary", "Status", "Commit Category", "Complete Category", "Assignee", "URL"]];

  const allIssues = [
    ...sprintReport.contents.completedIssues,
    ...sprintReport.contents.issuesNotCompletedInCurrentSprint,
    ...sprintReport.contents.puntedIssues,
    ...sprintReport.contents.issuesCompletedInAnotherSprint
  ];

  allIssues.forEach((issue) => {

    let completionStatus = "";

    if (sprintReport.contents.completedIssues.some( i => i.key === issue.key )) {
      completionStatus = "Completed during Sprint";
    } else if (sprintReport.contents.issuesNotCompletedInCurrentSprint.some( i => i.key === issue.key )) {
      completionStatus = "Not Completed in Current Sprint";
    } else if (sprintReport.contents.puntedIssues.some( i => i.key === issue.key )) {
      completionStatus = "Removed From Sprint";
    } else if (sprintReport.contents.issuesCompletedInAnotherSprint.some( i => i.key === issue.key )) {
      completionStatus = "Completed in another Sprint";
    };

    let issueRow = [
      issue.typeName,
      issue.key,
      issue.epicField ? issue.epicField.summary : '',
      issue.currentEstimateStatistic.statFieldValue.value,
      issue.summary,
      issue.statusName,
      sprintReport.contents.issueKeysAddedDuringSprint[issue.key] ? "Commited in Sprint" : "Committed in Planning",
      completionStatus,
      issue.assigneeName,
      jira.credentials.baseUrl + '/browse/' + issue.key
    ];

    table.push(issueRow);
  });

  return table
}

/**
 * Clears & overwrites the "Sprint Report" tab with current sprint report
*/
function writeSprintReportCurrent() {
    const jira = new JiraClient();

  //retrieve active sprint 
  const sprints = jira.getAll(`/rest/agile/1.0/board/${jira.boardId}/sprint`);

  const currentSprint = sprints
    .filter((sprint) => sprint.state == "active")

  if (currentSprint.length > 1) {
    throw new Error("There is more than one active sprint in your board.")
  } 

  const sprintId = currentSprint[0].id
  
  // retrieving data
  const reportData = getReport(sprintId);

  // format and write
  var sprintSheet = SpreadsheetApp
    .getActiveSpreadsheet().getSheetByName("Sprint Report")
  
  // clearing old data
  sprintSheet.clearContents();

  // set new data
  sprintSheet
    .getRange(...getTableDim(reportData))
    .setValues(reportData)

}

/**
 * Clears & overwrites the "Sprint Report" tab with last closed sprint report
*/
function writeSprintReportLastClosed() {
  const jira = new JiraClient();

  //retrieve active sprint 
  const sprints = jira.getAll(`/rest/agile/1.0/board/${jira.boardId}/sprint`);

  const lastClosedId = sprints
    .filter((sprint) => sprint.state == "closed")
    .reduce((previousSprint, currentSprint) => {
      return new Date(previousSprint.endDate) >= new Date(currentSprint.endDate) ? previousSprint : currentSprint
    })
    .id
    
  // retrieving data
  const reportData = getReport(lastClosedId);

  // format and write
  var sprintSheet = SpreadsheetApp
    .getActiveSpreadsheet().getSheetByName("Sprint Report")
  
  // clearing old data
  sprintSheet.clearContents();

  // set new data
  sprintSheet
    .getRange(...getTableDim(reportData))
    .setValues(reportData)

}

/**
 * Prompts sprint ID then clears and rewrites the "Sprint Report" tab with requested sprint report
*/
function writeSprintReportCustom() {
  const jira = new JiraClient();

  //prompt sprintId
  const sprintId = Browser.inputBox('Please enter a Sprint ID:', Browser.Buttons.OK_CANCEL);
    
  // retrieving data
  const reportData = getReport(sprintId);

  // format and write
  var sprintSheet = SpreadsheetApp
    .getActiveSpreadsheet().getSheetByName("Sprint Report")
  
  // clearing old data
  sprintSheet.clearContents();

  // set new data
  sprintSheet
    .getRange(...getTableDim(reportData))
    .setValues(reportData)

}


/**
 * test report
*/
function test_getReport() {
  getReport(4511)
}


