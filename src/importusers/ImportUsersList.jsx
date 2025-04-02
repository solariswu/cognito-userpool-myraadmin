import {
  Toolbar,
  Button,
  List,
  Datagrid,
  TextField,
  useListContext,
  CreateButton,
  TopToolbar,
  DateField,
} from "react-admin";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { Box } from "@mui/material";

const resource = "Importusers";

const ListActions = () => {
  return (
      <TopToolbar>
          <CreateButton />
      </TopToolbar>
  );
}

const Pagination = () => {
  const { page, perPage, total, setPage } = useListContext();
  const nbPages = Math.ceil(total / perPage) || 1;
  const pages = Object.keys(
    localStorage.getItem(`${resource}tokenObj`)
      ? JSON.parse(localStorage.getItem(`${resource}tokenObj`))
      : [],
  );
  return (
    nbPages > 1 && (
      <Toolbar>
        {page > 1 && (
          <Button color="primary" key="prev" onClick={() => setPage(page - 1)}>
            <ChevronLeft />
            Prev
          </Button>
        )}
        {page &&
          pages.map((key, page) => {
            return (
              <Button
                color="primary"
                key={key}
                onClick={() => setPage(page + 1)}
              >
                {page + 1}
              </Button>
            );
          })}
        {page !== nbPages && (
          <Button color="primary" key="next" onClick={() => setPage(page + 1)}>
            Next
            <ChevronRight />
          </Button>
        )}
      </Toolbar>
    )
  );
};

export const ImportUsersList = (props) => {
  return (
    <Box sx={{ paddingTop: 5 }}>
      <List
        {...props}
        perPage={10}
        pagination={<Pagination />}
        actions={<ListActions />}
        exporter={false}
      >
        <Datagrid rowClick="show" bulkActionButtons={false} optimized>
          <TextField label="Import Job Id" source="JobId" sortable={true} />
          <DateField showTime source="CreationDate" sortable={true} />
          <DateField showTime source="CompletionDate" sortable={false} />
          <TextField source="Status" sortable={false} />
          <TextField source="FailedUsers" sortable={false} />
          <TextField source="TotalUsers" sortable={false} />
          <TextField source="CreatedBy" sortable={false} />
        </Datagrid>
      </List>
    </Box >
  );
};
