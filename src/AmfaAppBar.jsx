import { AppBar } from "react-admin";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";

export const AmfaAppBar = (props) => {
  return (
    <AppBar color="secondary">
      <Typography
        variant="h6"
        color="inherit"
        id="react-admin-title"
        sx={{
          flex: 1,
          textoverflow: "ellipsis",
          whitespace: "nowrap",
          overflow: "hidden",
          marginleft: -10,
        }}
      />
      <div style={{ flex: 3, textAlign: "center", verticalAlign: "center" }}>
        <img
          src="/apersona-logo2.png"
          alt="logo"
          height="36"
          style={{ marginTop: "6px" }}
        />
      </div>
      <div style={{ flex: 1, textAlign: "end", verticalAlign: "center" }}>
        <Link href="https://www.apersona.com/contact-us" underline="none" color={"white"} target="_blank" rel="noreffer" >
          Support
        </Link>
      </div>
    </AppBar>
  );
};
