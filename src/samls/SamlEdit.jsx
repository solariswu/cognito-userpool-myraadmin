import * as React from 'react';

import { Box, Container, Typography } from '@mui/material';
import { BooleanInput, Edit, FunctionField, SimpleForm, DeleteButton, ListButton, TextInput, TopToolbar, useNotify, useRedirect, useRefresh, SaveButton, Form } from 'react-admin';

import { validateUrl } from '../utils/validation';

export const SamlEdit = () => {
    const notify = useNotify();
    const redirect = useRedirect();
    const refresh = useRefresh();

    const toSAMLList = (e) => {
        e = e || window.event;
        e.preventDefault();
        redirect('/appclients#=1');

    }

    const onDelete = () => {
        notify(`SAML SP deleted`);
        redirect('/appclients#=1');
        refresh();
    }

    const EditActions = () => (
        <TopToolbar>
          <DeleteButton
            confirmTitle="Are you sure you want to delete this sp?"
            confirmContent=""
            mutationOptions={{ onSuccess: onDelete}}
          />
          <ListButton onClick={toSAMLList} />
        </TopToolbar>
      );

    const onSuccess = () => {
        notify(`Changes saved`);
        redirect('/appclients#=1');
        refresh();
    };

    return (
        // <Edit
        //     mutationMode="pessimistic"
        //     mutationOptions={{ onSuccess }}
        //     actions={<EditActions />}
        // >
        <Edit mutationMode="pessimistic" mutationOptions={{ onSuccess }} actions={<EditActions />} >
            <Form mode='onBlur' reValidateMode='onBlur' >
                <Container sx={{ mb: 2 }}>
                    <Box
                    sx={{
                        mt: 2,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                    >
                    <FunctionField render={record => <Typography variant="h4">
                        {record.name}</Typography>
                    } />
                </Box>
                <Box sx={{ margin: '10px 0' }}>
                    EntityId: <FunctionField render={record => record.entityId} />
                </Box>
                <Box sx={{ margin: '10px 0' }}>
                    <FunctionField label="Metadata" render={record => record.metadataUrl ?
                        <a href={record.metadataUrl} rel="noreferrer" target="_blank">Download SP Metadata</a> : ''
                    } />
                </Box>
                    <TextInput label="SP Login URL" source="serviceUrl" required validate={validateUrl} fullWidth helperText={false} />
                    <div style={{ height: '2em' }} />
                    <TextInput label="Logo URL (Image Size: 25x25)" source="logoUrl" validate={validateUrl} fullWidth helperText={false} />
                    <div style={{ height: '0.5em' }} />
                    <BooleanInput source='released' fullWidth label="Show to end user" />
                    <div style={{ height: '0.5em' }} />
                <Box sx={{ margin: '10px 0' }}>
                    <SaveButton
                        label="Update"
                        // onClick={() => redirect('/appclients#=1')}
                    />
                </Box>
            </Container>
            </Form>
        </Edit >
    )
}
