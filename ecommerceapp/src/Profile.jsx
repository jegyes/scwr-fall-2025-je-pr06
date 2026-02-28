import { useEffect, useState } from "react";
import './App.css';
import { withAuthenticator } from '@aws-amplify/ui-react';
import Container from './Container.jsx';
import checkUser from './checkUser';

function Profile({signOut, user}) {
  const [userInfo, setUserInfo] = useState({});

  useEffect(() => {
    checkUser(setUserInfo);
  }, []);

  return (
    <Container>
      <div style={containerStyle}>
        <button onClick={signOut}>Sign Out</button>
        <div className="userData">
          <p>
            <strong>Greetings, {" "} 
            {user?.username || user?.signInDetails?.loginId || user?.attributes?.email || "unknown"}!</strong>
          </p>
          <p>
            <strong>Our records indicate your User Role is: {userInfo.isAuthorized ? "Admin" : "Guest"}</strong>            
          </p>
        </div>
      </div>
    </Container>
  );
}

const containerStyle = {
  width: '100%',
  maxWidth: '1024px',
  margin: '20px auto',
  padding: '0 16px'
}

export default withAuthenticator(Profile)


