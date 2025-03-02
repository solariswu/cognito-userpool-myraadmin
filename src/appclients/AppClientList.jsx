import { useState } from 'react';
import { Toolbar, Button, List, Datagrid, TextField, useListContext, DateField } from 'react-admin';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { SAMLList } from '../samls/SamlList';


const resource = 'AppClient';
const Pagination = () => {
    const { page, perPage, total, setPage } = useListContext();
    const nbPages = Math.ceil(total / perPage) || 1;
    const pages = Object.keys(localStorage.getItem(`${resource}tokenObj`) ? JSON.parse(localStorage.getItem(`${resource}tokenObj`)) : [])
    return (
        nbPages > 1 &&
        <Toolbar>
            {page > 1 &&
                <Button color="primary" key="prev" onClick={() => setPage(page - 1)} >
                    <ChevronLeft />
                    Prev
                </Button>
            }
            {
                page && pages.map((key, page) =>
                    <Button color="primary" key={key} onClick={() => setPage(page + 1)}>
                        {page + 1}
                    </Button>)
            }
            {page !== nbPages &&
                <Button color="primary" key="next" onClick={() => setPage(page + 1)}>
                    Next
                    <ChevronRight />
                </Button>
            }
        </Toolbar>
    );
}

export const AppClientList = props => {
    const hash = window.location?.hash ? window.location.hash : '';
    const arr = hash.slice(1).split(/&|=/);

    const [value, setValue] = useState(arr && arr[1] && parseInt(arr[1]) === 1 ? 1 : 0);

    const handleChange = (event, newValue) => setValue(newValue);

    function a11yProps(index) {
        return {
            id: `simple-tab-${index}`,
            'aria-controls': `simple-tabpanel-${index}`,
        };
    }

    function CustomTabPanel(props) {
        const { children, value, index, ...other } = props;

        return (
            <div
                role="tabpanel"
                hidden={value !== index}
                id={`simple-tabpanel-${index}`}
                aria-labelledby={`simple-tab-${index}`}
                {...other}
            >
                {value === index && (<>
                    {children}</>
                )}
            </div>
        );
    }

    return (
        <Box sx={{ marginTop: 1, marginBottom: 0 }}>
            <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                <Tab label="OIDC" {...a11yProps(0)} />
                <Tab label="SAML" {...a11yProps(1)} />
            </Tabs>

            <CustomTabPanel value={value} index={0}>

                <List  {...props}
                    title={"Service Providers"} perPage={10} pagination={<Pagination />}
                    exporter={false} >
                    <Datagrid rowClick="show" bulkActionButtons={false} optimized>
                        <TextField label="Service Provider" source="clientName" sortable={false} />
                        <TextField label="Client ID" source="clientId" sortable={false} />
                        <DateField source="creationDate" />
                        <DateField source="lastModifiedDate" />
                        <Button label="Edit" color="primary" icon="Edit" />
                    </Datagrid>
                </List>
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
                <SAMLList />
            </CustomTabPanel>
        </Box>

    )
};