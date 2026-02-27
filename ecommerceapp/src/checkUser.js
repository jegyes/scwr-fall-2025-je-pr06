/* src/checkUser.js */
    import { fetchAuthSession } from 'aws-amplify/auth'
    import Home from './Home.jsx'

    async function checkUser(updateUser) {

    try {
        const userData = await fetchAuthSession();

        if (!userData.tokens) {
            console.log('userData: ', userData)
            updateUser({})
            return
        }

        const { accessToken: { payload }} = userData.tokens
        const isAuthorized =
            payload['cognito:groups'] &&
            payload['cognito:groups'].includes('Admin')
            
        updateUser({
            username: payload['cognito:username'],
            isAuthorized
        })

        const isAdmin =
            payload["cognito:groups"]?.includes("Admin") ?? false

        updateUser({
            username: payload["cognito:username"],
            isAuthorized: isAdmin,           // keep your existing field if you want
            isAdmin,
            canUpvote: !isAdmin              // signed-in non-admin
        })

    } catch (error) {
        console.error('checkUser failed', error);
    }
}

export default checkUser