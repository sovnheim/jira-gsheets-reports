/**
 * Get the list of JIRA sprints associated to a given board ID
 * @param {number} boardId The Associated JIRA board ID
 * @return {Object} data two-dimensional array containing sprint x id, name, start, end, goal
 */
function getJiraSprints(boardId) {
  const url = `https://d-edge-hospitality-solutions.atlassian.net/rest/agile/1.0/board/${boardId}/sprint`;
  const options = {
    "method": "GET",
    "headers": { "Authorization": getJiraAuth(JIRA_EMAIL, JIRA_TOKEN) }
  };

  const data = JSON.parse(UrlFetchApp.fetch(url, options)
    .getContentText())

  const output = data.values.map((sprint) => {
    const startDate = sprint.startDate ? sprint.startDate.substring(0, 10) : ''
    const endDate = sprint.endDate ? sprint.endDate.substring(0, 10) : ''
    return [sprint.name, sprint.id, startDate, endDate, sprint.goal]
  })

  output.unshift(["Name", "ID", "Start", "End", "Goal"])

  return output
}

/**
 * Get the list of JIRA issues contained in a given sprint ID
 * @param {number} sprintId the id of the sprint containing issues
 * @return {Array<string>} issueTable 2-dimensional array containing TO BE DESCRIBED
 * @customfunction
 */
function getIssuesFromSprint(sprintId) {
  const url = `https://d-edge-hospitality-solutions.atlassian.net/rest/agile/1.0/sprint/${sprintId}/issue`;
  const options = {
    "method": "GET",
    "headers": { "Authorization": getJiraAuth(JIRA_EMAIL, JIRA_TOKEN) }
  };

  const data = JSON.parse(UrlFetchApp.fetch(url, options)
    .getContentText())

  const output = [["Type", "Issue Key", "Epic", "Story Points", "Summary", "Assignee", "Status", "Build vs. Run", "URL"]];
  data.issues.forEach((issue) => {
    if (issue.fields.issuetype.name != "Sub-task") {
      let row = [issue.fields.issuetype.name, issue.key, null, issue.fields.customfield_10004, issue.fields.summary, null, issue.fields.status.statusCategory.name, null, `https://d-edge-hospitality-solutions.atlassian.net/browse/${issue.key}`]
      if (issue.fields.epic) row[2] = issue.fields.epic.name
      if (issue.fields.customfield_12318) row[7] = issue.fields.customfield_12318.value
      if (issue.fields.assignee) row[5] = issue.fields.assignee.displayName

      output.push(row)
    }
  })

  return output
}

/**
 * Get the list of JIRA sprints returned by a given JQL
 * @param {number} boardId The Associated JIRA board ID
 * @return {Array<string>} sprintTable two-dimensional array containing sprint x id, name, start, end, goal
 * @customfunction
 */
function getJiraIssuesFromJQL(query) {
  const url = `https://d-edge-hospitality-solutions.atlassian.net/rest/api/2/search?jql=` + query;
  const options = {
    "method": "GET",
    "headers": { "Authorization": getJiraAuth(JIRA_EMAIL, JIRA_TOKEN) }
  };

  // get first page 
  let data = JSON.parse(UrlFetchApp.fetch(url, options)
    .getContentText());

  let issues = data.issues

  // calculate the total number of pages
  const maxResults = data.maxResults
  const pages = Math.floor(data.total / data.maxResults);

  [...Array(pages).keys()].map((page) => {
    let startAt = (page + 1) * maxResults;
    let currentUrl = url + `&startAt=${startAt}`;
    data = JSON.parse(UrlFetchApp.fetch(currentUrl, options).getContentText());
    issues.push(...data.issues);
  })
  return parseJiraIssues(issues);
}

/**
 * Parses issues from a Jira API response
 * @param {array} Array of issues
 * @return {array} An array containing entries to be displayed in Google Sheets 
 */
function parseJiraIssues(issues) {

  const output = [["Type", "Issue Key", "Epic", "Story Points", "Summary", "Assignee", "Status", "Build vs. Run", "Number of Sprints", "URL"]];
  issues.forEach((issue) => {
    if (issue.fields.issuetype.name != "Sub-task") {

      let row = [
        issue.fields.issuetype.name,
        issue.key,
        issue.fields.parent ? issue.fields.parent.fields.summary : null,
        issue.fields.customfield_10004,
        issue.fields.summary,
        issue.fields.assignee ? issue.fields.assignee.displayName : null,
        issue.fields.status.statusCategory.name,
        issue.fields.customfield_12318 ? issue.fields.customfield_12318.value : null,
        issue.fields.customfield_10200 ? issue.fields.customfield_10200.length : null,
        `https://d-edge-hospitality-solutions.atlassian.net/browse/${issue.key}`
      ]

      output.push(row)
    }
  })
  return output
}