const express = require('express')
const bodyParser = require('body-parser')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const AWS = require('aws-sdk')
const { randomUUID } = require('crypto')

const cognito = new
AWS.CognitoIdentityServiceProvider({
  apiVersion: '2016-04-18'
})

const userpoolId =
  process.env.AUTH_ECOMMERCEAPP0C6985A9_USERPOOLID;

if (!userpoolId) {
  throw new Error("Missing env var AUTH_ECOMMERCEAPP0C6985A9_USERPOOLID");
}

// DynamoDB configuration
const region = process.env.REGION
const ddb_table_name = process.env.STORAGE_PRODUCTTABLE_NAME
const docClient = new AWS.DynamoDB.DocumentClient({region})

// amplify/backend/function/ecommercefunction/src/app.js
async function getGroupsForUser(event) {
  let userSub =
    event
      .requestContext
      .identity
      .cognitoAuthenticationProvider
      .split(':CognitoSignIn:')[1]
  let userParams = {
    UserPoolId: userpoolId,
    Filter: `sub = "${userSub}"`,
  }
  let userData = await cognito.listUsers(userParams).promise()
  const user = userData.Users[0]
  var groupParams = {
    UserPoolId: userpoolId,
    Username: user.Username
  }
  const groupData = await cognito.adminListGroupsForUser(groupParams).promise()
  return groupData
}

async function canPerformAction(event, group) {
  return new Promise(async (resolve, reject) => {
    if (!event.requestContext.identity.cognitoAuthenticationProvider) {
      return reject()
    }
    const groupData = await getGroupsForUser(event)
    const groupsForUser = groupData.Groups.map(group => group.GroupName)
    if (groupsForUser.includes(group)) {
      resolve()
    } else {
      reject('user not in group, cannot perform action..')
    }
  })
}
  async function denyGroup(event, group) {
    if (!event.requestContext.identity.cognitoAuthenticationProvider) {
      throw new Error("not authenticated")
    }
    const groupData = await getGroupsForUser(event)
    const groupsForUser = groupData.Groups.map(g => g.GroupName)
    if (groupsForUser.includes(group)) {
      throw new Error(`users in ${group} cannot perform this action`)
    }
  }

// declare a new express app
const app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  next()
});


/**********************
 * Example get method *
 **********************/

// amplify/backend/function/ecommercefunction/src/app.js
app.get('/products', async function(req, res) {
  try {
    const data = await getItems()
    res.json({ data: data })
  } catch (err) {
    res.json({ error: err })
  }
})

async function getItems(){
  var params = { TableName: ddb_table_name }
  try {
    const data = await docClient.scan(params).promise()
    return data
  } catch (err) {
    return err
  }
}

app.get('/products/*', function(req, res) {
  // Add your code here
  res.json({success: 'get call succeed!', url: req.url});
});

/****************************
* Example post method *
****************************/

// amplify/backend/function/ecommercefunction/src/app.js
app.post('/products', async function(req, res) {
  const { body } = req
  const { event } = req.apiGateway
  try {
    await canPerformAction(event, 'Admin')
    const input = { ...body, id: randomUUID(), likes: 0 }
    var params = {
      TableName: ddb_table_name,
      Item: input
    }
    await docClient.put(params).promise()
    res.json({ success: 'item saved to database..' })
  } catch (err) {
    res.json({ error: err })
  }
});

app.post('/products/:id/upvote', async function (req, res) {
  const { event } = req.apiGateway

  try {
    // guest-only: signed-in but NOT Admin
    await denyGroup(event, 'Admin')

    const params = {
      TableName: ddb_table_name,
      Key: { id: req.params.id },
      UpdateExpression: "ADD likes :inc",
      ExpressionAttributeValues: { ":inc": 1 },
      ReturnValues: "UPDATED_NEW",
    }

    const result = await docClient.update(params).promise()
    res.json({ success: true, likes: result.Attributes?.likes })
  } catch (err) {
    res.status(403).json({ error: String(err) })
  }
})

app.post('/products/*', function(req, res) {
  // Add your code here
  res.json({success: 'post call succeed!', url: req.url, body: req.body})
});



/****************************
* Example put method *
****************************/

app.put('/products', function(req, res) {
  // Add your code here
  res.json({success: 'put call succeed!', url: req.url, body: req.body})
});

app.put('/products/*', function(req, res) {
  // Add your code here
  res.json({success: 'put call succeed!', url: req.url, body: req.body})
});

/****************************
* Example delete method *
****************************/

// amplify/backend/function/ecommercefunction/src/app.js
app.delete('/products/:id', async function(req, res) {
  const { event } = req.apiGateway
  try {
    await canPerformAction(event, 'Admin')
    var params = {
      TableName : ddb_table_name,
      Key: { id: req.params.id }
    }
    await docClient.delete(params).promise()
    res.json({ success: 'successfully deleted item' })
  } catch (err) {
    res.json({ error: err })
  }
});

app.delete('/products/*', function(req, res) {
  // Add your code here
  res.json({success: 'delete call succeed!', url: req.url});
});

app.listen(3000, function() {
    console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
