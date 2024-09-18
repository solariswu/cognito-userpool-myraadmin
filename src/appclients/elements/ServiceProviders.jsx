import * as React from 'react';
import Typography from '@mui/material/Typography';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';

import { ArrayInput, BooleanInput, FormDataConsumer, SimpleFormIterator, TextInput, required } from 'react-admin';
import { Box, IconButton } from '@mui/material';
import { isHttpsOrHttpLocal } from '../../utils/validation';
import { SPPortalUrl } from '../../amfaext';

export default function ServiceProviderForm(props) {
    const [selected, setSelected] = React.useState(null)

    const handleClick = (spname) => {
        if (selected === spname) {
            setSelected(null)
        } else {
            setSelected(spname)
        }
    }

    return (
        <React.Fragment>
            <Typography variant="h6" gutterBottom>
                Service Provider List</Typography>
            <ArrayInput fullWidth
                source="serviceProviders"
                required>
                <SimpleFormIterator fullWidth disableClear disableReordering >
                    <FormDataConsumer>
                        {({
                            formData, // The whole form data
                            scopedFormData, // The data for this item of the ArrayInput
                            getSource, // A function to get the valid source inside an ArrayInput
                            ...rest
                        }) => {
                            // console.log('spformdata', scopedFormData, ' selected', selected, 'getSource', getSource('spname'))
                            return (
                                <>
                                    <Box sx={{ display: 'flex', mb: 2 }} onClick={() => handleClick(getSource('spname'))} >
                                        <IconButton><DriveFileRenameOutlineIcon color='primary' /></IconButton>
                                        <Typography variant='h6' >{scopedFormData.spname}</Typography>
                                    </Box>

                                    {
                                        (
                                            (scopedFormData && getSource && getSource('spname') === selected) ||
                                            (!scopedFormData.spname && getSource)
                                        ) && (<>
                                            <TextInput
                                                fullWidth
                                                label="Service Provider Name"
                                                source={getSource("spname")}
                                                validate={[required()]}
                                                onChange={() => setSelected(getSource('spname'))}
                                            />
                                            <TextInput
                                                fullWidth
                                                label="Service Provider SignIn Callback"
                                                source={getSource("spcallback")}
                                                validate={[required(), isHttpsOrHttpLocal]}
                                                defaultValue={'http://localhost'}
                                            />
                                            <TextInput
                                                fullWidth
                                                label="Service Provider Logout Callback"
                                                source={getSource("splogoutcallback")}
                                                validate={[isHttpsOrHttpLocal]}
                                            />
                                            <TextInput
                                                fullWidth
                                                label="Service Provider Login Url"
                                                source={getSource("sploginurl")}
                                                validate={[required()]}
                                                defaultValue={SPPortalUrl}
                                            />
                                            <TextInput
                                                fullWidth
                                                label="Service Provider Logo Url"
                                                source={getSource("splogourl")}
                                            />
                                            <BooleanInput
                                                fullWidth
                                                label="Show to end users"
                                                source={getSource("released")}
                                            />
                                        </>)
                                    }
                                </>
                            )
                        }}
                    </FormDataConsumer >
                </SimpleFormIterator>
            </ArrayInput>

        </React.Fragment>
    );
}