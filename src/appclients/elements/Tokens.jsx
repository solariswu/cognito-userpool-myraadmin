import * as React from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { NumberInput, TextInput } from 'react-admin';

import { isNum, max, min } from '../../utils/validation';


export default function Tokens() {

	return (
		<React.Fragment>

			<Typography variant="h6" gutterBottom>
				Token expirations </Typography>
			<Grid container sx={{ marginTop: '20px' }}>
				<Grid item xs={12} sm={5} md={5} lg={4}>
					<TextInput defaultValue={30} required source="refreshTokenValidityDays" label='Refresh token Days' validate={[isNum(), max(10 * 365), min(0)]} /> days +
				</Grid>
				<Grid item xs={12} sm={5} md={5} lg={7}>
					<TextInput defaultValue={0} required source="refreshTokenValidityMins" label='Refresh token Minutes' validate={[isNum(), max(24 * 60 - 1), min(0)]} /> minutes
				</Grid>
				<Grid item xs={12} sm={5} md={5} lg={4}>
					<TextInput defaultValue={0} required source="idTokenValidityDays" label='Id token Days' validate={[isNum(), max(1), min(0)]} /> days +
				</Grid>
				<Grid item xs={12} sm={5} md={5} lg={7}>
					<TextInput defaultValue={60} required source="idTokenValidityMins" label='Id token Minutes' validate={[isNum(), max(24 * 60 - 1), min(0)]} /> minutes
				</Grid>
				<Grid item xs={12} sm={5} md={5} lg={4}>
					{/* <TextInput required source="accessTokenValidity" label='Access Token' validate={[isNum(), max(86400), min(5)]} /> */}
					<NumberInput defaultValue={0} required source="accessTokenValidityDays" label='Access Token Days' validate={[isNum(), max(1), min(0)]} /> days +
				</Grid>
				<Grid item xs={12} sm={5} md={5} lg={7}>
					<NumberInput defaultValue={60} required source="accessTokenValidityMins" label='Access Token Minutes' validate={[isNum(), max(24 * 60 - 1), min(0)]} /> minutes
				</Grid>
			</Grid>

		</React.Fragment>
	);
}