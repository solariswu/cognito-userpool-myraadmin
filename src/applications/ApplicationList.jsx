import { Toolbar, Button, List, Datagrid, TextField, useListContext, DateField } from 'react-admin';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

const resource = 'Group';
const ApplicationPagination = () => {
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
            page && pages.map((key,page) => {
                return (<Button color="primary" key={key} onClick={() => setPage(page+1)}>
                    {page+1}
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

export const ApplicationList = props => {
    return (
        <List  {...props} title={"User Groups"} perPage={10} pagination={<ApplicationPagination />} 
            exporter={false} >
            <Datagrid rowClick="edit" bulkActionButtons={false} optimized>
                <TextField source="group" sortable={false} />
				<TextField source="description" sortable={false} />
                <DateField source="creationDate" sortable={false} showTime={true}/>
                <DateField source="lastModifiedDate" sortable={false} showTime={true}/>
                <Button label="Edit" color="primary" icon="Edit" />
            </Datagrid>
        </List>
    )
};