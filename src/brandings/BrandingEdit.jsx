import { Container, Grid, Box, Typography } from "@mui/material";
import {
  Edit,
  FunctionField,
  Form,
  TextInput,
  TopToolbar,
  SaveButton,
  ListButton,
  FormDataConsumer,
} from "react-admin";

import { ColorInput } from "react-admin-color-picker";
import { validateUrl } from "../utils/validation";

export const BrandingEdit = () => {
  const EditActions = () => (
    <TopToolbar>
      <ListButton />
    </TopToolbar>
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
              <Box>
                <Typography variant="h4">{record.name} Branding</Typography>
                <a href={record.url} rel="noreferrer" target="_blank" >{record.url}</a>
              </Box>
            )}
          />
        </Box>
        <div style={{ height: "2em" }} />
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

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={6} lg={5}>
            <Box sx={{ display: "flex" }}>
              <ColorInput
                source="login_page_center_color"
                fullWidth
                isRequired
                picker="Sketch"
              />
              <FormDataConsumer>
                {({ formData }) => (
                  <Box
                    sx={{
                      bgcolor: formData["login_page_center_color"],
                      mt: 5,
                      ml: 1,
                      width: "1rem",
                      height: "1rem",
                      border: 1,
                    }}
                  />
                )}
              </FormDataConsumer>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={5}>
            <Box sx={{ display: "flex" }}>
              <ColorInput
                source="login_page_outter_color"
                fullWidth
                isRequired
                picker="Sketch"
              />
              <FormDataConsumer>
                {({ formData }) => (
                  <Box
                    sx={{
                      bgcolor: formData["login_page_outter_color"],
                      mt: 5,
                      ml: 1,
                      width: "1rem",
                      height: "1rem",
                      border: 1,
                    }}
                  />
                )}
              </FormDataConsumer>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={5}>
            <Box sx={{ display: "flex" }}>
              <ColorInput
                source="app_bar_start_color"
                fullWidth
                isRequired
                picker="Sketch"
              />
              <FormDataConsumer>
                {({ formData }) => (
                  <Box
                    sx={{
                      bgcolor: formData["app_bar_start_color"],
                      mt: 5,
                      ml: 1,
                      width: "1rem",
                      height: "1rem",
                      border: 1,
                    }}
                  />
                )}
              </FormDataConsumer>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={5}>
            <Box sx={{ display: "flex" }}>
              <ColorInput
                source="app_bar_end_color"
                fullWidth
                isRequired
                picker="Sketch"
              />
              <FormDataConsumer>
                {({ formData }) => (
                  <Box
                    sx={{
                      bgcolor: formData["app_bar_end_color"],
                      mt: 5,
                      ml: 1,
                      width: "1rem",
                      height: "1rem",
                      border: 1,
                    }}
                  />
                )}
              </FormDataConsumer>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={5}>
            <Box sx={{ display: "flex" }}>
              <ColorInput
                source="app_title_icon_color"
                fullWidth
                isRequired
                picker="Sketch"
              />
              <FormDataConsumer>
                {({ formData }) => (
                  <Box
                    sx={{
                      bgcolor: formData["app_title_icon_color"],
                      mt: 5,
                      ml: 1,
                      width: "1rem",
                      height: "1rem",
                      border: 1,
                    }}
                  />
                )}
              </FormDataConsumer>
            </Box>
          </Grid>
        </Grid>

        <div style={{ height: "2em" }} />
        <TextInput
          source="app_login_logo_url"
          required
          validate={validateUrl}
          fullWidth
          helperText={"size 250x50"}
        />
        <div style={{ height: "2em" }} />
        <TextInput
          source="fav_icon_url"
          required
          validate={validateUrl}
          fullWidth
          helperText={"size 16x16"}
        />
        <div style={{ height: "2em" }} />
        <TextInput
          source="app_bar_logo_url"
          required
          validate={validateUrl}
          fullWidth
          helperText={"size 250x50"}
        />

        <div style={{ height: "2em" }} />
        <TextInput
          source="app_terms_url"
          required
          validate={validateUrl}
          fullWidth
          helperText={false}
        />
        <div style={{ height: "2em" }} />
        <TextInput
          source="app_privacy_url"
          required
          validate={validateUrl}
          fullWidth
          helperText={false}
        />

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
