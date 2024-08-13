import * as React from 'react';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { FunctionField, useNotify, UrlField, TextField } from 'react-admin';


export default function OidcInfo() {
    const [expanded, setExpanded] = React.useState(true);
    const notify = useNotify();

    const handleChange = () => {
        setExpanded(expanded => !expanded);
    };

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
            {
                ((source !== 'OIDCMetadataUrl')) &&
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


    const DispFixCardItem = ({ title, content }) =>
        <>
            <Box sx={{ paddingTop: '10px' }}>{title}</Box>
            <Box sx={{ display: 'flex', paddingTop: '10px', fontSize: '14px' }} color="text.secondary"> {content}
            </Box>
            <Divider />
        </>



    return (
        <React.Fragment>
            <Accordion expanded={expanded} onChange={handleChange} sx={{ minWidth: '800px' }}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <Typography>OIDC Discoverable Info</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <FunctionField render={(record => <DispCardItem
                        title={'issuer'} source={'issuer'} showCopy={record.issuer} />)} />
                    <FunctionField render={(record => <DispCardItem
                        title={'OpenID Connect metaData'} source={'OIDCMetadataUrl'} showCopy={record.OIDCMetadataUrl} />)} />
                </AccordionDetails>
            </Accordion>
            <Accordion sx={{ minWidth: '800px' }}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <Typography>OIDC Manual Config Info</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <FunctionField render={(record => <DispCardItem
                        title={'OAuth2 JSON Web Key Set'} source={'jwksUri'} showCopy={record.jwksUri} />)} />
                    <FunctionField render={(record => <DispCardItem
                        title={'OAuth2 Authorization Endpoint'} source={'authorizationEndpoint'} showCopy={record.authorizationEndpoint} />)} />
                    <FunctionField render={(record => <DispCardItem
                        title={'OAuth2 Token Endpoint'} source={'tokenEndpoint'} showCopy={record.tokenEndpoint} />)} />
                    <FunctionField render={(record => <DispCardItem
                        title={'OAuth2 UserInfo Endpoint'} source={'userInfoEndpoint'} showCopy={record.userInfoEndpoint} />)} />
                    <FunctionField render={(record => <DispCardItem
                        title={'OAuth2 revoke Endpoint'} source={'revokeEndpoint'} showCopy={record.revokeEndpoint} />)} />
                    <FunctionField render={(record => <DispCardItem
                        title={'OAuth2 EndSession Endpoint'} source={'endSessionEndpoint'} showCopy={record.endSessionEndpoint} />)} />
                    <FunctionField render={(record => <DispCardItem
                        title={'OAuth2 Supported Scopes'} source={'supportedScopes'} showCopy={record.supportedScopes} />)} />
                    <DispFixCardItem title={'Response mode'} content={'query'} />
                    <DispFixCardItem title={'OAuth grant types'} content={'Authorization code grant'} />
                </AccordionDetails>
            </Accordion>
        </React.Fragment>
    );
}