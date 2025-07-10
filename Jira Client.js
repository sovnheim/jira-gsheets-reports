/** 
 * JIRA CLIENT
 * Wrapper class that connects to the Jira API, encodes credentials
 * in base64 and iterates through results in order to simplify usage of Jira API
 * 
 * The current project uses Jira Cloud Platform REST API V1 and V2
 * https://developer.atlassian.com/cloud/jira/platform/rest/v2/intro/
 * 
 * This project uses Jira Basic Auth and stores the credentials in the user properties
 * https://developer.atlassian.com/cloud/jira/platform/basic-auth-for-rest-apis/
 * 
 */

class JiraClient {

  /**
   * Initializes Jira Client class by retrieving credentials in user properties
   */
  constructor() {
    this.getUserData()
  }

  /**
   * Refreshes credentials stored in the class instance from user property data 
   */
  getUserData() {
    // Request user properties if not defined
    if (Object.keys(PropertiesService.getUserProperties().getProperties()).length === 0) {
      setCredentials()
    }

    // update credentials
    this.credentials = PropertiesService.getUserProperties().getProperties();

    // update boardId
    this.boardId = PropertiesService.getUserProperties().getProperties().boardId

    // encode the credentials in base64
    this.auth = 'Basic ' + Utilities.base64Encode(`${this.credentials.email}:${this.credentials.token}`)
  }

  /**
   * Makes an API request to the corresponding resource
   * @param {string} method RESTful method 
   * @param {string} resource the corresponding URI 
   * @return {string} JSON object corresponding to the API response 
   */
  getResource(method, resource) {
    const options = {
      "muteHttpExceptions": true,
      "method": method,
      "headers": { "Authorization": this.auth }
    };

    const data = JSON.parse(UrlFetchApp.fetch(this.credentials.baseUrl + resource, options)
      .getContentText())

    return data
  } // end of function request

  /**
    * Iterates API calls over all pages for a given resource until all results have been returned
    * @param {string} resource The corresponding URI 
    * @param {string} valueType The value to iterate over (values, issues, projects, etc)  
    * @return {array} An array corresponded to all the paginated values
    */
  getAll(resource, valueType) {

    if (!valueType) {
      valueType = "values"
    }

    // get first page 
    let data = this.getResource("GET", resource)
    let values = data[valueType]

    if (data.total && data.isLast == false) {
      // Compute the total number of pages
      const maxResults = data.maxResults
      const pages = Math.floor(data.total / data.maxResults);

      [...Array(pages).keys()].map((page) => {
        let startAt = (page + 1) * maxResults;
        let currentResource = resource;

        if (resource.includes('?')) {
          currentResource += `&startAt=${startAt}`;
        } else {
          currentResource += `?startAt=${startAt}`;
        }

        data = this.getResource("GET", currentResource);
        values.push(...data[valueType]);
      })
    }
    return values;
  }
}

function testJiraClient() {
  jira = new JiraClient()
}
