import * as React from "react";
import { Route } from 'react-router-dom';

import { Admin, Resource, CustomRoutes } from 'react-admin';
import dataProvider from './Component/dataProvider'
import polyglotI18nProvider from "ra-i18n-polyglot";
import englishMessages from "ra-language-english";

import users from './users';
import groups from "./applications";
import appclients from "./appclients";
import samls from "./samls";
import UserImport from './users/UserImport';

import tenants from "./tenants";

import authProvider from "./Component/authProvider/authProvider";
import LoginPage from "./Component/authProvider/LoginPage";

import { MyAuthCallbackPage } from "./Component/authProvider/MyAuthCallbackPage";

import { AmfaLayout } from "./AmfaLayout";

import { defaultTheme } from 'react-admin';

const theme = {
  ...defaultTheme,
  components: {
    ...defaultTheme.components,
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },
    MuiFormControl: {
      defaultProps: {
        variant: 'outlined',
      },
    },
    RaDatagrid: {
      styleOverrides: {
        root: {
          "& .RaDatagrid-headerCell": {
            fontWeight: "bold",
          },
        }
      }
    },
  }
};

const messages = {
  en: englishMessages
};

const i18nProvider = polyglotI18nProvider(locale => messages[locale], "en", {
  allowMissing: true
});
export const App = () => (
  <>
    <Admin
      theme={theme}
      disableTelemetry
      authProvider={authProvider}
      dataProvider={dataProvider}
      loginPage={LoginPage}
      layout={AmfaLayout}
      locale="en"  // Add this...
      i18nProvider={i18nProvider} >
      requireAuth={true}
      authCallbackPage={MyAuthCallbackPage}
      <Resource name="users" {...users} />"
      <Resource options={{ label: 'User Groups' }} name="groups" {...groups} />"
      <Resource options={{ label: 'Service Providers' }} name="appclients" {...appclients} />"
      <Resource options={{ label: 'Service Providers' }} name="samls" {...samls} />"
      <Resource options={{ label: 'Settings' }} name="tenants" {...tenants} />"
      <CustomRoutes>
        <Route path="/user/import" element={<UserImport />} />
      </CustomRoutes>
    </Admin>
    <div style={{
      position: 'fixed', right: 0, bottom: 0, left: 0, zIndex: 100,
      padding: 6,
      backgroundColor: 'white',
      textAlign: 'center',
      color: "grey",
      fontSize: "11px",
    }}>Copyright &copy; 2023-2024 aPersona Inc. v1.0</div>
  </>
);