import * as React from 'react';

import { Box, Container, Typography } from '@mui/material';
import { BooleanInput, Edit, FunctionField, SimpleForm, TextInput } from 'react-admin';

import { validateUrl } from '../utils/validation';

export const SamlEdit = () => {

    const EditActions = () => (
        <TopToolbar>
          <DeleteButton
            confirmTitle="Are you sure you want to delete this sp?"
            confirmContent=""
          />
          <ListButton />
        </TopToolbar>
      );

    return (
        <Edit mutationMode="pessimistic"
            redirect="show"
            actions={<EditActions />}
        >
            <Container sx={{ padding: '15px' }}>
                <Box
                    sx={{
                        margin: 8,
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
                        <a href={record.metadataUrl} rel="noreferrer" target="_blank">View Metadata</a> : ''
                    } />
                </Box>
                <SimpleForm >
                    <TextInput source="serviceUrl" required validate={validateUrl} fullWidth helperText={false} />
                    <div style={{ height: '2em' }} />
                    <TextInput source="logoUrl" validate={validateUrl} fullWidth helperText={false} />
                    <div style={{ height: '0.5em' }} />
                    <BooleanInput source='released' fullWidth label="Show to end user" />
                    <div style={{ height: '0.5em' }} />
                </SimpleForm >
            </Container>
        </Edit >
    )
}
