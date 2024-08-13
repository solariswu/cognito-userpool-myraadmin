import * as React from 'react';

import {
  Container, Divider, Grid, Box, Card, CardContent, Typography, IconButton, Switch, FormControlLabel,
} from '@mui/material';
import {
  Edit, DateField, TextField, FunctionField,
  useNotify, Form, TopToolbar, DeleteButton, SaveButton, ListButton, UrlField, TextInput,
} from 'react-admin';

import ServiceProviderForm from './elements/ServiceProviders';
import Tokens from './elements/Tokens';
import AttributesMapping from './elements/AttributesMapping';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OidcInfo from './elements/OidcInfo';
import { validateUrl } from '../utils/validation';

export const AppClientEdit = () => {
  const notify = useNotify();
  const [showSecret, setShowSecret] = React.useState(false);

  const handleClick = (text) => {
    notify(`Copied to clipboard`, { type: 'success' });
    navigator.clipboard.writeText(text);
  }

  const DispCardItem = ({ title, source, showCopy }) =>
    <>
      <Box sx={{ paddingTop: '10px' }}>{title}</Box>
      {
        (source === 'OIDCMetadataUrl') &&
        <Box sx={{ display: 'flex' }}>
          <UrlField source={source}
            rel="noreferrer"
            target="_blank"
            emptyText='' sx={{ paddingTop: '10px' }} />
          {showCopy &&
            <IconButton onClick={() => handleClick(showCopy)}
              size='small'>
              <ContentCopyIcon />
            </IconButton>}
        </Box>
      }
      {source === 'clientSecret' && showCopy &&
        <Box sx={{ paddingLeft: '10' }}>
          <FormControlLabel
            control={<Switch size='small' checked={showSecret} onChange={e => setShowSecret(e.target.checked)} />}
            label={<Typography fontSize={12}>Show client secret</Typography>} />
        </Box>
      }
      {
        ((source === 'clientSecret' && (showSecret || !showCopy)) || (source !== 'clientSecret' && source !== 'OIDCMetadataUrl')) &&
        <Box sx={{ display: 'flex' }}>
          <TextField source={source} color="text.secondary" emptyText='---' sx={{ paddingTop: '10px' }} />
          {showCopy &&
            <IconButton onClick={() => handleClick(showCopy)}
              size='small'>
              <ContentCopyIcon />
            </IconButton>}
        </Box>
      }
      <Divider />
    </>


  const EditActions = () => (
    <TopToolbar>
      <DeleteButton confirmTitle="Are you sure you want to delete this Serice Provider?" confirmContent="" />
      <ListButton />
    </TopToolbar>
  );

  const formValidation = (values) => {
    const errors = {};

    if (!values.refreshTokenValidityDays && !values.refreshTokenValidityMins) {
      console.log('validation errors', errors)
      return errors;
    }

    let refreshExpiration = 0;
    let accessExpiration = 0;
    let idExperation = 0;

    if (values.refreshTokenValidityDays) {
      refreshExpiration += values.refreshTokenValidityDays * 24 * 60
    }

    if (values.refreshTokenValidityMins) {
      refreshExpiration += values.refreshTokenValidityMins * 1
    }

    if (values.accessTokenValidityDays) {
      accessExpiration += values.accessTokenValidityDays * 24 * 60
    }

    if (values.accessTokenValidityMins) {
      accessExpiration += values.accessTokenValidityMins * 1
    }

    if (accessExpiration < 5 || accessExpiration > 24 * 60) {
      errors.accessTokenValidityMins = 'Access Token Validity shall be between 5 minutes and 1 day';
    }

    if (values.idTokenValidityDays) {
      idExperation += values.idTokenValidityDays * 24 * 60
    }

    if (values.idTokenValidityMins) {
      idExperation += values.idTokenValidityMins * 1
    }

    if (idExperation < 5 || idExperation > 24 * 60) {
      errors.idTokenValidityMins = 'Id Token Validity value shall be between 5 minutes and 1 day';
    }

    if (refreshExpiration < idExperation) {
      errors.refreshTokenValidityMins = 'Refresh Token Validity shall not be less than Id Token\'s';
    }

    if (refreshExpiration < accessExpiration) {
      errors.refreshTokenValidityMins = 'Refresh Token Validity shall not be less than Access Token\'s';
    }

    if (refreshExpiration < 60) {
      errors.refreshTokenValidityMins = 'Refresh Token Validity shall be greater than 60 minutes';
    }

    if (refreshExpiration && refreshExpiration > 24 * 365 * 60 * 10) {
      errors.refreshTokenValidityMins = 'Refresh Token Validity can not be greater than 10 years';
    }


    return errors;
  }

  return (
    <Box
      sx={{
        mb: 5
      }}
    >
      <Edit mutationMode="pessimistic" redirect="list" actions={<EditActions />} >
        <Form mode='onBlur' reValidateMode='onBlur' validate={formValidation} >
          <Container sx={{ mb: 2 }}>
            <Box
              sx={{
                mt: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <TextField source="clientName" variant="h4" sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={6} lg={5} />
                <Grid item xs={12} sm={6} md={6} lg={6}>
                  <TextInput fullWidth source='serviceLogoUrl' validate={validateUrl} sx={{ minWidth: '800px' }} />
                </Grid>
              </Grid>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={6} lg={5}>
                <ServiceProviderForm />
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={5}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >Created On : <DateField source="creationDate" variant='body2' emptyText='---' /> &nbsp;
                  Last Modified On : <DateField source="lastModifiedBy" variant='body2' emptyText='---' />
                </Typography>
                <Card sx={{ minWidth: '800px' }}>
                  <CardContent >
                    <FunctionField render={(record => <DispCardItem
                      title={'Client ID'} source={'id'} showCopy={record.id} />)} />
                    <Divider />
                    <FunctionField render={(record => <DispCardItem
                      title={'Client Secret'} source={'clientSecret'} showCopy={record.clientSecret} />)} />
                    <Divider />
                  </CardContent>
                </Card>
                <Box sx={{ marginTop: '20px' }} />
                <Card sx={{ minWidth: '800px' }}>
                  <CardContent >
                    <Tokens />
                  </CardContent>
                </Card>
                <Box sx={{ marginTop: '20px' }} />
                <Card sx={{ minWidth: '800px' }}>
                  <CardContent >
                    <AttributesMapping />
                  </CardContent>
                </Card>
                <Box sx={{ marginTop: '20px' }} />
                <OidcInfo />
              </Grid>
              <Grid container justify="flex-end">
                <Grid item xs={5} sm={5} md={5} lg={5}>
                  <SaveButton
                    label="Update"
                  />
                </Grid>
              </Grid>
            </Grid>
          </Container >
        </Form >
      </Edit >
    </Box>
  )
}
