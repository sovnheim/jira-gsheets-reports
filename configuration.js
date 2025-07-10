/**
 * CONFIGURATION
 * The functions below allow storage of sensitive information in the user account
 */


/**
 * Requires input for user properties
 * @return {} 
 */
function setCredentials() {
  //prompt user information
  const email = Browser.inputBox('Please enter your account email', Browser.Buttons.OK_CANCEL);
  const token = Browser.inputBox('Please enter your access token', Browser.Buttons.OK_CANCEL);
  const baseUrl = Browser.inputBox('Please enter the URL of your instance', Browser.Buttons.OK_CANCEL);
  const boardId = Browser.inputBox('Please enter your board ID', Browser.Buttons.OK_CANCEL);

  // sets the credentials in the user config
  const userProperties = PropertiesService.getUserProperties();
  userProperties.setProperties({
    'boardId': boardId,
    'email': email,
    'token': token,
    'baseUrl': baseUrl,
  });
}

/**
 * Deletes all user properties. 
 * @return {} 
 */
function deleteCredentials() {
  try {
    // Get user properties in the current script.
    const userProperties = PropertiesService.getUserProperties();
    // Delete all user properties in the current script.
    userProperties.deleteAllProperties();
  } catch (err) {
    console.error('Failed with error %s', err.message);
  }
}

function testCredentials() {
  console.log(
    PropertiesService.getUserProperties().getProperties()
  )
}