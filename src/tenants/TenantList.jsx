import { Toolbar, Button, List, Datagrid, TextField, useListContext } from 'react-admin';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { Box } from '@mui/material';

const resource = 'Tenant';
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
				page && pages.map((key, page) => {
					return (<Button color="primary" key={key} onClick={() => setPage(page + 1)}>
						{page + 1}
					</Button>)
				})
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

export const TenantList = props => {
	return (
		<Box sx={{ paddingTop: 5 }}>
			<List  {...props}
				title={"Configures"} perPage={10} pagination={<Pagination />}
				actions={<></>}
				exporter={false} >
				<Datagrid rowClick="show" bulkActionButtons={false} optimized>
					<TextField label="Tenant Name" source="name" sortable={true} />
					<TextField label="Tenant Id" source="id" sortable={true} />
					<TextField label="Contact Email" source="contact" sortable={false} />
					<TextField label="End User Service Provider URL" source="endUserSpUrl" sortable={false} />
					<Button label="Edit" color="primary" icon="Edit" />
				</Datagrid>
			</List>
		</Box>
	)
};