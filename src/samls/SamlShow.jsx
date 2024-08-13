import { Typography } from '@mui/material';
import { BooleanField, EditButton, FunctionField, ListButton, Show, SimpleShowLayout, TextField, TopToolbar, useRedirect, } from 'react-admin';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import VerifiedIcon from '@mui/icons-material/Verified';

export const SamlShow = () => {
    const OIDCListButton = () => {
        const redirect = useRedirect();
        const handleClick = () => {
            redirect('/appclients?t=1');
        }
        return <div onClick={handleClick}><ListButton /></div>;
    };

    const ShowActions = () => (
        <TopToolbar>
            <EditButton />
            <OIDCListButton />
        </TopToolbar>
    );
    return (
        < Show title="SAML SP" actions={<ShowActions />} >
            <Typography component="h1" variant="h4" align="center">
                SAML Service Provider
            </Typography>
            <SimpleShowLayout>
                <TextField source='name' />
                <TextField source="entityId" />
                <FunctionField label="Service Url" render={record => record.serviceUrl ?
                    <a href={record.serviceUrl} rel="noreferrer" target="_blank">
                        {record.serviceUrl.length > 150 ?
                            record.serviceUrl.substring(0, 40) + '...' + record.serviceUrl.substring(record.serviceUrl.length - 20, record.serviceUrl.length) :
                            record.serviceUrl}
                    </a> : ''
                } />
                <FunctionField label="Metadata" render={record => record.metadataUrl ?
                    <a href={record.metadataUrl} rel="noreferrer" target="_blank">View Metadata</a> : ''
                } />
                <FunctionField label="Logo" render={record => record.logoUrl ?
                    <img src={record.logoUrl} alt="logo" width="48" height="48" /> : ''
                } />
                <BooleanField source="released" label="Show to end user"
                    TrueIcon={VerifiedIcon} FalseIcon={NotInterestedIcon} />
            </SimpleShowLayout>
        </Show >
    );
}