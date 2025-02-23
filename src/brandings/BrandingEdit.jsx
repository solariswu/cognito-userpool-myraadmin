import {
  Container,
  Divider,
  Grid,
  Box,
  Card,
  CardContent,
  IconButton,
  FormControlLabel,
  Switch,
  Typography,
} from "@mui/material";
import {
  Edit,
  TextField,
  FunctionField,
  UrlField,
  Form,
  TextInput,
  TopToolbar,
  SaveButton,
  ListButton,
} from "react-admin";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { ColorInput } from "react-admin-color-picker";
import { validateUrl } from "../utils/validation";

export const BrandingEdit = () => {
  const handleClick = (text) => {
    notify(`Copied to clipboard`, { type: "success" });
    navigator.clipboard.writeText(text);
  };

  const DispCardItem = ({ title, source, showCopy }) => {
    const Content = ({ source }) => {
      switch (source) {
        case "clientSecret":
          return (
            <Box sx={{ paddingLeft: "10" }}>
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={showSecret}
                    onChange={(e) => setShowSecret(e.target.checked)}
                  />
                }
                label={<Typography fontSize={12}>show secret</Typography>}
              />
              <Box sx={{ display: "flex" }}>
                {showSecret ? (
                  <TextField
                    source={source}
                    color="text.secondary"
                    emptyText="---"
                    sx={{ paddingTop: "10px" }}
                  />
                ) : (
                  <Typography color="text.secondary">******</Typography>
                )}
                {showSecret && showCopy && (
                  <IconButton
                    onClick={() => handleClick(showCopy)}
                    size="small"
                  >
                    <ContentCopyIcon />
                  </IconButton>
                )}
              </Box>
            </Box>
          );
        case "Mobile_Token_Key":
          return (
            <Box sx={{ paddingLeft: "10" }}>
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={showTotpSecret}
                    onChange={(e) => setShowTotpSecret(e.target.checked)}
                  />
                }
                label={<Typography fontSize={12}>show secret</Typography>}
              />
              <Box sx={{ display: "flex" }}>
                {showTotpSecret ? (
                  <TextField
                    source={source}
                    color="text.secondary"
                    emptyText="---"
                    sx={{ paddingTop: "10px" }}
                  />
                ) : (
                  <Typography color="text.secondary">******</Typography>
                )}
                {showTotpSecret && showCopy && (
                  <IconButton
                    onClick={() => handleClick(showCopy)}
                    size="small"
                  >
                    <ContentCopyIcon />
                  </IconButton>
                )}
              </Box>
            </Box>
          );
        case "endUserSpUrl":
          return (
            <Box sx={{ display: "flex" }}>
              <UrlField
                source={source}
                rel="noreferrer"
                target="_blank"
                emptyText=""
                sx={{ paddingTop: "10px" }}
              />
              {showCopy && (
                <IconButton onClick={() => handleClick(showCopy)} size="small">
                  <ContentCopyIcon />
                </IconButton>
              )}
            </Box>
          );
        case "samlIdPMetadataUrl":
          return (
            <Box sx={{ display: "flex" }}>
              <UrlField
                source={source}
                rel="noreferrer"
                target="_blank"
                emptyText=""
                sx={{ paddingTop: "10px" }}
              />
              {showCopy && (
                <IconButton onClick={() => handleClick(showCopy)} size="small">
                  <ContentCopyIcon />
                </IconButton>
              )}
            </Box>
          );
        default:
          return (
            <Box sx={{ display: "flex" }}>
              <TextField
                source={source}
                color="text.secondary"
                emptyText="---"
                sx={{ paddingTop: "10px" }}
              />
              {showCopy && (
                <IconButton onClick={() => handleClick(showCopy)} size="small">
                  <ContentCopyIcon />
                </IconButton>
              )}
            </Box>
          );
      }
    };

    return (
      <>
        <Box sx={{ paddingTop: "10px" }}>{title}</Box>
        <Content source={source} />
        <Divider />
      </>
    );
  };

  const EditActions = () => (
    <TopToolbar>
      <ListButton />
    </TopToolbar>
  );

  const MobileTokenCard = () => (
    <Card sx={{ minWidth: "800px" }}>
      <Card>
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            Mobile Token API Settings for aPersona ASM
          </Typography>
          <FunctionField
            render={(record) => (
              <DispCardItem
                title={"Mobile Token Client Id"}
                source={"clientId"}
                showCopy={record.clientId}
              />
            )}
          />
          <Divider />
          <FunctionField
            render={(record) => (
              <DispCardItem
                title={"Mobile Token Client Secret"}
                source={"clientSecret"}
                showCopy={record.clientSecret}
              />
            )}
          />
          <Divider />
          <FunctionField
            render={(record) => (
              <DispCardItem
                title={"Mobile Token Auth Endpoint"}
                source={"domain"}
                showCopy={record.domain}
              />
            )}
          />
          <Divider />
          <FunctionField
            render={(record) => (
              <>
                <Box sx={{ paddingTop: "10px" }}>Mobile Token API endpoint</Box>
                <Box sx={{ display: "flex" }}>
                  <Typography variant="body" color="text.secondary">
                    {record.url.replace("https://", "https://api.") +
                      "/totptoken"}
                  </Typography>
                  <IconButton
                    onClick={() =>
                      handleClick(
                        record.url.replace("https://", "https://api.") +
                          "/totptoken",
                      )
                    }
                    size="small"
                  >
                    <ContentCopyIcon />
                  </IconButton>
                </Box>
              </>
            )}
          />
          <Divider />
        </CardContent>
      </Card>
    </Card>
  );

  const TenantInfoCard = () => (
    <Card>
      <CardContent>
        <FunctionField
          render={(record) => (
            <DispCardItem
              title={"Tenant ID"}
              source={"id"}
              showCopy={record.id}
            />
          )}
        />
        <Divider />
        <FunctionField
          render={(record) => (
            <DispCardItem
              title={"Tenant Name"}
              source={"name"}
              showCopy={record.name}
            />
          )}
        />
        <Divider />
      </CardContent>
    </Card>
  );

  const SPEndUserInfoCard = () => (
    <Card>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          SAML End User Service Portal Info
        </Typography>
        <FunctionField
          render={(record) => (
            <DispCardItem
              title={"End User Service Portal API URL"}
              source={"adminApiUrl"}
              showCopy={record.adminApiUrl}
            />
          )}
        />
        <FunctionField
          render={(record) => (
            <DispCardItem
              title={"End User Service Region"}
              source={"endUserSpRegion"}
              showCopy={record.endUserSpRegion}
            />
          )}
        />
        <Divider />
        <FunctionField
          render={(record) => (
            <DispCardItem
              title={"End User Service Userpools Web Client Id"}
              source={"endUserSpWebClientId"}
              showCopy={record.endUserSpWebClientId}
            />
          )}
        />
        <Divider />
        <FunctionField
          render={(record) => (
            <DispCardItem
              title={"End User Service Userpools Id"}
              source={"endUserSpUserpoolId"}
              showCopy={record.endUserSpUserpoolId}
            />
          )}
        />
        <Divider />
        <FunctionField
          render={(record) => (
            <DispCardItem
              title={"End User Service OAuth Domain"}
              source={"endUserSpOauthDomain"}
              showCopy={record.endUserSpOauthDomain}
            />
          )}
        />
        <Divider />
      </CardContent>
    </Card>
  );

  const MyForm = () => {
    return (
      <Container sx={{ mb: 2 }}>
        <Box
          sx={{
            mt: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <FunctionField
            render={(record) => (
              <Typography variant="h4">{record.name}</Typography>
            )}
          />
        </Box>
        <TextInput
          label="Title Message"
          source="app_title_msg"
          required
          fullWidth
          helperText={false}
        />
        <div style={{ height: "2em" }} />
        <TextInput
          label="Portal Title Message"
          source="portal_title_msg"
          fullWidth
          helperText={false}
        />
        <div style={{ height: "2em" }} />
        <TextInput
          label="Portal Description Message"
          source="portal_description_msg"
          fullWidth
          helperText={false}
        />

        <div style={{ height: "2em" }} />
        <ColorInput source="login_page_center_color" fullWidth isRequired />
        <div style={{ height: "2em" }} />
        <ColorInput source="login_page_outter_color" fullWidth isRequired />
        <div style={{ height: "2em" }} />
        <ColorInput source="app_bar_start_color" fullWidth isRequired/>
        <div style={{ height: "2em" }} />
        <ColorInput source="app_bar_end_color" fullWidth isRequired />
        <div style={{ height: "2em" }} />
        <ColorInput source="app_title_icon_color" fullWidth isRequired />

        <div style={{ height: "2em" }} />
        <TextInput source="app_login_logo_url" required validate={validateUrl} fullWidth helperText={false} />
        <div style={{ height: "2em" }} />
        <TextInput source="fav_icon_url" required validate={validateUrl} fullWidth helperText={false} />
        <div style={{ height: "2em" }} />
        <TextInput source="app_bar_logo_url" required validate={validateUrl} fullWidth helperText={false} />

        <div style={{ height: "2em" }} />
        <TextInput source="app_terms_url" required validate={validateUrl} fullWidth helperText={false} />
        <div style={{ height: "2em" }} />
        <TextInput source="app_privacy_url" required validate={validateUrl} fullWidth helperText={false} />

        <div style={{ height: "0.5em" }} />
        <Box sx={{ margin: "2em 0 5em 0" }}>
          <SaveButton label="Update" />
        </Box>
      </Container>
    );
  };
  // if (isPending) return <CircularProgress sx={{ marginRight: 1 }} size={18} thickness={2} />

  return (
    <Edit
      mutationMode="pessimistic"
      redirect="list"
      actions={<EditActions />}
      emptyWhileLoading
    >
      <Form mode="onBlur" reValidateMode="onBlur">
        <MyForm />
      </Form>
    </Edit>
  );
};
