/* src/checkUser.js */
    import { fetchAuthSession } from 'aws-amplify/auth'

    async function checkUser(updateUser) {

    try {
        const userData = await fetchAuthSession();

        if (!userData.tokens) {
            console.log('userData: ', userData)
            updateUser({})
            return
        }

        const { idToken: { payload }} = userData.tokens
        const isAuthorized =
            payload['cognito:groups'] &&
            payload['cognito:groups'].includes('Admin')
            
        updateUser({
            username: payload['cognito:username'],
            isAuthorized
        })

    } catch (error) {
        console.error('checkUser failed', error);
    }
    }

    export default checkUser