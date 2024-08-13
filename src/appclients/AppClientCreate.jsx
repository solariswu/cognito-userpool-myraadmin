import * as React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import AppNameForm from './AppNameForm';
import ServiceProviderForm from './elements/ServiceProviders';

import { Button, Create, Form, SaveButton, useRedirect } from "react-admin";
import { Divider } from '@mui/material';
import Tokens from './elements/Tokens';
import { isHttpsOrHttpLocal } from '../utils/validation';


export const AppClientCreate = () => {
  const redirect = useRedirect();
  // const isHttpsOrHttpLocal = (value) =>
  //   /^https:\/\/(?:w{1,3}\.)?[^\s.]+(?:\.[a-z]+)*(?::\d+)?(?![^<]*(?:<\/\w+>|\/?>))/.test(value) || /^http:\/\/localhost(?::\d+)?(?![^<]*(?:<\/\w+>|\/?>))/.test(value)

  const formValidation = (values) => {
    const errors = {};

    if (!values.clientName) {
      errors.clientName = 'Client Name is required';
    }

    if (!values.serviceProviders || values.serviceProviders.length < 1) {
      errors.serviceProviders = 'At least one service provider config is required';
    }
    else {
      console.log('ygwu service providers', values.serviceProviders);
      if (errors.serviceProviders === undefined) {
        errors.serviceProviders = [];
      }
      values.serviceProviders.forEach((sp, idx) => {
        console.log('service provider', sp, ' idx', idx);
        errors.serviceProviders[idx] = {};
        if (!sp?.spname) {
          errors.serviceProviders[idx].spname = 'Service Provider Name is required';
        }
        if (!sp?.spcallback) {
          errors.serviceProviders[idx].spcallback = 'Service Provider Callback Url is required';
        }
        else if (!isHttpsOrHttpLocal()(sp.spcallback)) {
            errors.serviceProviders[idx].spcallback = 'URL must start with http://localhost or https://';
        }
        if (!sp?.sploginurl) {
          errors.serviceProviders[idx].sploginurl = 'Service Provider Login Url is required';
        }
        if (sp.splogoutcallback !== undefined && !sp.splogoutcallback && sp.splogoutcallback?.length > 0 && !(isHttpsOrHttpLocal()(sp.splogoutcallback))) {
          errors.serviceProviders[idx].splogoutcallback = 'URL must start with http://localhost or https://';
        }
      })
    }

    return validateTokenExpirations(values, errors);

  }

  const validateTokenExpirations = (values, errors) => {

    let refreshExpiration = 0;
    let accessExpiration = 0;
    let idExperation = 0;

    if (!values.refreshTokenValidityDays && !values.refreshTokenValidityMins) {
      errors.refreshTokenValidityMins = 'Refresh Token Validity is required';
      console.log('validation errors', errors)
      return errors;
    }

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
    <Create title="Service Provider" redirect="show">
      <Container component="main" maxWidth="md" sx={{ mb: 4 }}>
        <Typography component="h1" variant="h4" align="center">
          Create - Service Provider
        </Typography>
        <Form mode='onBlur' reValidateMode='onBlur' validate={formValidation} >
          <AppNameForm />
          <Divider />
          <Box sx={{ mb: 2 }} />
          <ServiceProviderForm />
          <Divider />
          <Box sx={{ mb: 2 }} />
          <Tokens />
          <Divider />
          <Box sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <SaveButton label='Create' sx={{ mt: 3, ml: 1 }} />
            <Button
                label="Cancel"
                onClick={() =>
                    redirect('/appclients')
                }
                type="button"
                sx={{ mt: 3, ml: 1 }} 
                // variant="text"
            />
          </Box>
        </Form>
      </Container>
    </Create>
  );
}