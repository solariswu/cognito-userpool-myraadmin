import * as React from "react";

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
  useNotify,
  Form,
  TextInput,
  TopToolbar,
  DeleteButton,
  SaveButton,
  ListButton,
  BooleanInput,
} from "react-admin";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";

export const TenantEdit = () => {
  const notify = useNotify();
  const [showSecret, setShowSecret] = React.useState(false);
  const [showTotpSecret, setShowTotpSecret] = React.useState(false);

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
        case "url":
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
      <DeleteButton
        confirmTitle="Are you sure you want to delete this Tenant?"
        confirmContent=""
      />
      <ListButton />
    </TopToolbar>
  );

  return (
    <Edit mutationMode="pessimistic" redirect="list" actions={<EditActions />}>
      <Form mode="onBlur" reValidateMode="onBlur">
        <Container sx={{ padding: "15px" }}>
          <Box
            sx={{
              margin: 8,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <TextField source="name" variant="h4" />
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={6} lg={5}>
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
              <Box sx={{ marginTop: "20px" }} />

              <FunctionField
                render={(record) => (
                  <DispCardItem
                    title={"AWS URL"}
                    source={"url"}
                    showCopy={record.url}
                  />
                )}
              />
              <Box sx={{ marginTop: "40px" }} />
              <Card>
                <CardContent>
                  <BooleanInput label="Enable SAML" source="samlproxy" />
                  <FunctionField
                    render={(record) => (
                      <DispCardItem
                        title={"SAML IdP Metadata URL"}
                        source={"samlIdPMetadataUrl"}
                        showCopy={record.samlIdPMetadataUrl}
                      />
                    )}
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={6} lg={5}>
              {/* <Card sx={{ minWidth: "800px" }}>
                <CardContent>
                  <FunctionField
                    render={(record) => (
                      <DispCardItem
                        title={"Mobile Token Salt"}
                        source={"Mobile_Token_Salt"}
                        showCopy={record.Mobile_Token_Salt}
                      />
                    )}
                  />
                  <Divider />
                  <FunctionField
                    render={(record) => (
                      <DispCardItem
                        title={"Mobile Token Key"}
                        source={"Mobile_Token_Key"}
                        showCopy={record.Mobile_Token_Key}
                      />
                    )}
                  />
                  <Divider />
                </CardContent>
              </Card>
              <Box sx={{ marginTop: "20px" }} /> */}
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
                          <Box sx={{ paddingTop: "10px" }}>
                            Mobile Token API endpoint
                          </Box>
                          <Box sx={{ display: "flex" }}>
                            <Typography variant="body" color="text.secondary">
                              {record.url.replace("https://", "https://api.") +
                                "/totptoken"}
                            </Typography>
                            <IconButton
                              onClick={() =>
                                handleClick(
                                  record.url.replace(
                                    "https://",
                                    "https://api."
                                  ) + "/totptoken"
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
              <Box sx={{ marginTop: "20px" }} />
            </Grid>
            <Grid container justify="flex-end">
              <Grid item xs={9} sm={9} md={9} lg={9} />
              <Grid item xs={2} sm={2} md={2} lg={2}>
                <SaveButton label="Update" />
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Form>
    </Edit>
  );
};
