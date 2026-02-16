const {
  CognitoIdentityProviderClient,
  AdminAddUserToGroupCommand,
  GetGroupCommand,
  CreateGroupCommand,
} = require('@aws-sdk/client-cognito-identity-provider');

const cognitoIdentityServiceProvider = new CognitoIdentityProviderClient({});

/**
 * @type {import('@types/aws-lambda').PostConfirmationTriggerHandler}
 */
exports.handler = async (event, _context, callback) => {
  let isAdmin = false
  // Update this array to include any admin emails you would like to enable
  const adminEmails = ['jegyes@madisoncollege.edu']

  // If the user is one of the admins, set the isAdmin variable to true
  if (adminEmails.indexOf(event.request.userAttributes.email) !== -1) {
    isAdmin = true
  }

  if (isAdmin) {
    const groupParams = {
      UserPoolId: event.userPoolId,
      GroupName: 'Admin'
    }
    const userParams = {
      UserPoolId: event.userPoolId,
      Username: event.userName,
      GroupName: 'Admin'
    }

    // First check to see if the group exists, and if not create the group
    try {
      await cognitoIdentityServiceProvider.send(new GetGroupCommand(groupParams));
    } catch (e) {
      await cognitoIdentityServiceProvider.send(new CreateGroupCommand(groupParams));
    }
    // The user is an administrator, place them in the Admin group
    try {
      await cognitoIdentityServiceProvider.send(new AdminAddUserToGroupCommand(userParams));
      callback(null, event);
    } catch (e) { callback(e); }
  } else {
    // If the user is in neither group, proceed with no action
    callback(null, event)
  }
}