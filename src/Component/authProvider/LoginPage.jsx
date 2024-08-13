import React from "react";

import LoginForm from "./LoginForm";
import { Card } from "@mui/material";

const LoginPage = () => (
  // <Login>
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    height: '1px',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundImage:
        'radial-gradient(circle at 50% 14em, #7576a9 0%, #00023b 60%, #00023b 100%)',
  }}>
  <Card className={'RaLogin-card'} style={{
    minWidth: 350,
    marginTop: '6em',
    borderRadius: '20px',
  }}>
    <LoginForm />
  </Card>
  </div>
);

export default LoginPage;