import * as React from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';


export default function AttributesMapping() {
	return (
		<React.Fragment>
			<Typography> Valid Claim Names </Typography>
			<Grid container sx={{ marginTop: '20px' }}>
				<Grid item xs={12} sm={6} md={6} lg={5}>
					<Typography variant="body2">User ID</Typography>
					<Typography variant="body2"> Display Name</Typography>
					<Typography variant="body2"> Given Name</Typography>
					<Typography variant="body2"> Surname</Typography>
					<Typography variant="body2"> Email</Typography>
				</Grid>
				<Grid item xs={12} sm={6} md={6} lg={5}>
					<Typography variant="body2" color="text.secondary"> email </Typography>
					<Typography variant="body2" color="text.secondary"> nickname </Typography>
					<Typography variant="body2" color="text.secondary"> given_name </Typography>
					<Typography variant="body2" color="text.secondary"> family_name </Typography>
					<Typography variant="body2" color="text.secondary"> email </Typography>
				</Grid>
			</Grid>
		</React.Fragment>
	);
}