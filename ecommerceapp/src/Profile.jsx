import './App.css'

import { withAuthenticator } from '@aws-amplify/ui-react'

function Profile({signOut, user}) {
  return (
    <div style={containerStyle}>
        <button onClick={signOut}>Sign Out</button>
        <pre>{JSON.stringify(user, null, '  ')}</pre>
    </div>
  );
}

const containerStyle = {
  width: 400,
  margin: '20px auto'
}

export default withAuthenticator(Profile)