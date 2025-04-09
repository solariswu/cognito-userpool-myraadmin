import {
  List,
  Datagrid,
  TextField,
  CreateButton,
  TopToolbar,
  DateField,
  useListContext,
} from "react-admin";
import { Box } from "@mui/material";


const ListActions = () => {
  const { data, isPending } = useListContext();

  console.log("listcontext data", data, "isPending:", isPending)

  if (isPending || !data || data.length === 0|| data[0].Status === "IN-PROGRESS" || data[0].Status === "PENDING") {
    return null;
  }
  return (
      <TopToolbar>
          <CreateButton />
      </TopToolbar>
  );
}

export const ImportUsersList = (props) => {
  return (
    <Box sx={{ paddingTop: 5 }}>
      <List
        {...props}
        perPage={10}
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
