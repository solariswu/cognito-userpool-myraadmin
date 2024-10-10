import * as React from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { BooleanInput, TextInput, required } from 'react-admin';
import { validateUrl } from '../utils/validation';

export default function AppNameForm() {
  return (
    <React.Fragment>
      <Typography variant="h6" gutterBottom>
        Service Provider / Application Info
      </Typography>
      <Box sx={{ mb: 2 }} />
      <Grid container >
        <Grid item xs={12} sm={12} md={6} lg={6}>
          <TextInput
            fullWidth
            label="Service Provider Name"
            source="clientName"
            validate={[required()]}
          />
        </Grid>
        <TextInput fullWidth source='serviceLogoUrl' validate={validateUrl} />
        <Grid item xs={12}>
          <BooleanInput label="Generate a client secret *" color="secondary" source="hasClientSecret" value="yes" />

          <Typography variant='caption' sx={{ color: 'text.secondary' }} gutterBottom>
            * For Web Applcation, normally it does not need a client secret
            <br />
            * For OAuth2.0 Service Provider, it needs a client secret
          </Typography>

        </Grid>
      </Grid>
    </React.Fragment >
  );
}