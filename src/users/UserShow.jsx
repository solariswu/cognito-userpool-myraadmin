import { useRecordContext, Show, TextField, FunctionField, } from 'react-admin';
import { Avatar, Chip, Container, Divider, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import { BeachAccess, Email, GppBad, AccountCircle, PhoneEnabled, Place } from '@mui/icons-material';
import VerifiedIcon from '@mui/icons-material/Verified';

const TagsField = () => {
    const record = useRecordContext();

    if (record && record.groups && record.groups.length > 0) {
        return (
            <>
                {record.groups.map(item => (
                    <Chip label={item} />
                ))}
            </>
        )
    }
    return <Chip label={''} />
};

export const UserShow = () => (
    <Show><Container style={{ padding: '20px' }}>
        <div style={{
            margin: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
        }}>
            <FunctionField render={record =>
                <h1>{`User ${(record.given_name ? `- ${record.given_name.toUpperCase()}` : 'Profile')}`}</h1>} />
        </div>
        <List >
            <ListItem>
                <ListItemAvatar>
                    <Avatar>
                        <AccountCircle />
                    </Avatar>
                </ListItemAvatar>
                <ListItemText primary="FULL NAME : " secondary={<FunctionField render={record =>
                    (`${record.given_name ? record.given_name : '---'} ${record.family_name ? record.family_name : '---'}`)} />
                } />
            </ListItem>
            <Divider variant="inset" component="li" />
            <ListItem>
                <ListItemAvatar>
                    <Avatar>
                        <Email />
                    </Avatar>
                </ListItemAvatar>
                <ListItemText primary="EMAIL : " secondary={<><TextField label={null} source="email" /></>} />
            </ListItem>
            <Divider variant="inset" component="li" />
            <ListItem>
                <ListItemAvatar>
                    <Avatar>
                        <PhoneEnabled />
                    </Avatar>
                </ListItemAvatar>
                <ListItemText primary="PHONE NUMBER : " secondary={<TextField label={null} source="phone_number" />} />
                <ListItemText primary="MFA : " secondary={<FunctionField render={record =>
                    record.sms_mfa_enabled ? <VerifiedIcon sx={{ backgroundColor: 'green', color: 'white', width: '20px', height: '20px', borderRadius: '50%' }} /> : <GppBad />} />} />
            </ListItem>
            <Divider variant="inset" component="li" />
            <ListItem>
                <ListItemAvatar>
                    <Avatar>
                        <Place />
                    </Avatar>
                </ListItemAvatar>
                <ListItemText primary="CITY : " secondary={<><TextField label={'null'} source="locale" emptyText='---' /></>} />
            </ListItem>
            <Divider variant="inset" component="li" />
            <ListItem>
                <ListItemAvatar>
                    <Avatar>
                        <BeachAccess />
                    </Avatar>
                </ListItemAvatar>
                <ListItemText primary="User Groups : " secondary={<TagsField source="groups" />} />
            </ListItem>
        </List></Container>
    </Show>
);
