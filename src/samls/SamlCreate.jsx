import * as React from 'react';

import { Typography } from '@mui/material';
import { BooleanInput, Button, Confirm, Create, FileField, FileInput, RadioButtonGroupInput, SaveButton, SimpleForm, TextInput, Toolbar, useCreate, useRedirect } from 'react-admin';

import { validateUrl } from '../utils/validation';
// import { useWatch } from "react-hook-form";

import CircularProgress from '@mui/material/CircularProgress';

const SamlCreateToolbar = () => {
    const redirect = useRedirect();
    return (
        <Toolbar>
            <SaveButton
                label="create"
            />
            <Button
                label="Cancel"
                onClick={() =>
                    redirect('/appclients?t=1')
                }
                type="button"
                variant="text"
            />
        </Toolbar>
    );
};

export const SamlCreate = () => {

    const [create, { isLoading }] = useCreate(undefined, undefined, {
        onSettled: (data, error) => {
            console.log('create data', data)
            if (!data.entityId && data.metadataType === 'isFile') {
                create('samls', { data })
                redirect('/appclients?t=1')
            }
        }
    });
    const redirect = useRedirect();

    // const MetadataInput = () => {
    //     const metadataType = useWatch({ name: 'metadataType' });
    //     if (metadataType === 'isUrl') {
    //         return (
    //             <>
    //                 <TextInput label="SP Metadata URL" source="metadataUrl" fullWidth helperText={false} validate={validateUrl} />
    //                 <div style={{ height: '2em' }} />
    //             </>)
    //     }
    //     if (metadataType === 'isFile') {
    //         return (
    //             <FileInput source="metadataFile" label="Upload SP metadata file (.xml)" accept=".xml" >
    //                 <FileField source="src" title="title" />
    //             </FileInput>
    //         )
    //     }
    // }

    const handleSamlSPCreate = async (data) => {

        console.log('spmetadatas create', data);

        if (data.metadataType === 'isUrl' && data.metadataUrl && data.metadataUrl.trim().length) {
            data.metadataUrl = data.metadataUrl.trim()
            await create('samls', { data })
            redirect('/appclients#=1')
        }
        else if (data.metadataType === 'isFile' && data.metadataFile) {
            var fr = new FileReader();

            fr.onload = async () => {
                create('metadataslist', {
                    data: {
                        ...data,
                        metadata: fr.result,
                        fileName: 'spmetadata' + Date.now().toString(),
                    }
                })
            }

            fr.readAsText(data.metadataFile.rawFile);
        }
    }

    return (
        <Create title="SAML SP" >
            <Typography component="h1" variant="h4" align="center">
                Create - SAML Service Provider
            </Typography>
            {
                isLoading &&
                <Confirm
                    isOpen={isLoading}
                    loading={isLoading}
                    title={'Creating SAML Service Provider'}
                    content={
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                        }}> <CircularProgress /> </div>
                    }
                    onConfirm={() => { }}
                    onClose={() => { }}
                />
            }
            <SimpleForm onSubmit={handleSamlSPCreate} toolbar={<SamlCreateToolbar />}>
                <TextInput label="SAML SP Name" source="name" required fullWidth helperText={false} />
                <TextInput source='metadataType' defaultValue='isUrl' style={{ display: 'none' }} />
                {/* <RadioButtonGroupInput required label="Metadata document source" source="metadataType" choices={[
                    { id: 'isUrl', name: 'Metadata URL' },
                    { id: 'isFile', name: 'Upload Metadata File' },
                ]} /> */}
                {/* <MetadataInput /> */}
                <div style={{ height: '2em' }} />
                <TextInput label="SP Metadata URL" source="metadataUrl" required fullWidth helperText={false} validate={validateUrl} />
                <div style={{ height: '2em' }} />
                <TextInput source="serviceUrl" label="SP Login URL" required validate={validateUrl} fullWidth helperText={false} />
                <div style={{ height: '2em' }} />
                <TextInput source="logoUrl" label="Logo URL (Image Size: 25x25)" validate={validateUrl} fullWidth helperText={false} />
                <BooleanInput source='released' label="Show to end user" />
            </SimpleForm >
        </Create >
    )
}
