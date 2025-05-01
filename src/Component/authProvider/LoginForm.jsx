import React, { useState } from "react";
import { useLogin } from "react-admin";
import { Button, CardActions, CircularProgress, Typography } from "@mui/material";

const LoginForm = () => {
  const [loading, setLoading] = useState(false);
  const login = useLogin();

  const handleLogin = () => {
    setLoading(true);
    login({}); // Do not provide code, just trigger the redirection
  };

  return (
    <div style={{ textAlign: "center", padding: '1em' }}>
      <div>
        <img
          src='https://downloads.apersona.com/downloads/aPersona_Logos_Package/aPLogo-370x67.png'
          alt="logo"
          width="250"
        />
      </div>
      <div>
        <Typography variant="subtitle1" align="center">
          Identity Management
        </Typography>
        <CardActions >
          <Button
            type="submit"
            color="primary"
            onClick={handleLogin}
            disabled={loading}
            fullWidth
          >
            {loading && (
              <CircularProgress sx={{ marginRight: 1 }} size={18} thickness={2} />
            )}
            Login
          </Button>
        </CardActions>
      </div>
    </div >
  );
};

export default LoginForm;