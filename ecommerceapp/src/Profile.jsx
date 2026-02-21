import React from 'react'
import './App.css'
import { withAuthenticator } from '@aws-amplify/ui-react'
import Container from './Container.jsx'

function Profile({signOut, user}) {
  return (
    <Container>
      <div style={containerStyle}>
          <button onClick={signOut}>Sign Out</button>
          <pre>{JSON.stringify(user, null, '  ')}</pre>
      </div>
    </Container>
  );
}

const containerStyle = {
  width: 400,
  margin: '20px auto'
}

export default withAuthenticator(Profile)


