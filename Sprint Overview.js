/**
 * SPRINTS 
 * Generates an overview of all of the board's sprints in the sprintOverview tab
 * 
 * Uses the Jira Rest APIs V1 & V2
 * https://developer.atlassian.com/cloud/jira/software/rest/intro/
 * https://developer.atlassian.com/cloud/jira/platform/rest/v2/intro/
 */


/**
 * Retrieves and builds a report aggregating data on all sprints for a given project. Defaults to the past 25 sprints.
 * @return {array}  An array of objects corresponding to the sprints
 * @customfunction
*/
function getSprints(maxSprints=25) {
  const jira = new JiraClient();

  // retrieving sprint list 
  const sprints = jira.getAll(`/rest/agile/1.0/board/${jira.boardId}/sprint`).slice(-maxSprints);

  // header
  const table = [["id", "link", "state", "name", "startDate", "endDate", "completeDate", "goal", "completedStoryPoints", "incompletedStoryPoints", "removedStoryPoints"]]

  // TODO measure injections

  // table contents 
  sprints.forEach((sprint) => {

    // Additional metrics are accessed via the Reports API
    let sprintReport = jira.getResource('GET',`/rest/greenhopper/latest/rapid/charts/sprintreport?rapidViewId=${jira.boardId}&sprintId=${sprint.id}`);

    //push results to the table of results
    table.push([
      sprint.id,
      sprint.self,
      sprint.state,
      sprint.name,
      sprint.startDate ? sprint.startDate.substring(0, 10) : "",
      sprint.endDate ? sprint.endDate.substring(0, 10) : "",
      sprint.completeDate ? sprint.completeDate.substring(0, 10) : "",
      sprint.goal ? sprint.goal : "",
      sprintReport.contents.completedIssuesEstimateSum.text != "null" ? sprintReport.contents.completedIssuesEstimateSum.value : "",
      sprintReport.contents.issuesNotCompletedEstimateSum.text != "null" ? sprintReport.contents.issuesNotCompletedEstimateSum.value : "",
      sprintReport.contents.puntedIssuesEstimateSum.text != "null" ? sprintReport.contents.puntedIssuesEstimateSum.text : ""
    ])
  })
  return table;
}

/**
 * Clears & overwrites the "Sprints" tab with sprint data
*/
function writeSprintOverview() {
  var sprintSheet = SpreadsheetApp
    .getActiveSpreadsheet().getSheetByName("Sprints Overview")

  // retrieving data
  const sprintData = getSprints();

  // clearing old data
  sprintSheet.clearContents();

  // set new data
  sprintSheet
    .getRange(...getTableDim(sprintData))
    .setValues(sprintData)
}

function test_getSprints() {
  const data = getSprints()
  console.log(data)
}