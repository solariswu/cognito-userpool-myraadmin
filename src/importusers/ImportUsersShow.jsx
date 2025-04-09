import * as React from "react";
import {
  Box,
  Container,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";
import {
  TopToolbar,
  ListButton,
  TextField,
  Show,
  DateField,
  useRecordContext,
  SimpleShowLayout,
  DeleteWithConfirmButton,
} from "react-admin";


export const ImportUsersShow = () => {
  const ShowActions = () => (
    <TopToolbar>
      <DeleteWithConfirmButton
      // confirmTitle="Are you sure you want to delete this import info?"
      />
      <ListButton />
    </TopToolbar>
  );

  const FailedImportUsersList = () => {
    const record = useRecordContext();
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);

    const amount = record.FailureDetails? record.FailureDetails.length : 0;
    // split FailureDetails into 2 parts
    const firstHalf = record.FailureDetails ? record.FailureDetails.slice(0, (amount + 1) / 2) : [];
    const secondHalf = record.FailureDetails ? record.FailureDetails.slice((amount + 1) / 2) : [];
    const listData = firstHalf && firstHalf.length >0 ? firstHalf.map((item, index) => ({
      ...item,
      username2: index < secondHalf.length ? secondHalf[index].username : null,
      reason2: index < secondHalf.length ? secondHalf[index].reason : null,
      id: index,
    })) : []

    const visibleRows = React.useMemo(
      () =>
        [...listData]
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
      [page, rowsPerPage],
    );

    const handleChangePage = (event, newPage) => {
      setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    };

    if (!record) return <p>Loading...</p>;
    if (!(record.FailureDetails) || record.FailureDetails.length === 0) return <p>{' '}</p>;

    return (
      <Box sx={{ textAlign: 'left' }}>
        <h3>Failed Users:</h3>
        < TableContainer component={Paper} >
          <Table sx={{ minWidth: 400 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Reason</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              { visibleRows && visibleRows.length > 0 && visibleRows.map((row, index) => (
                <TableRow
                  key={row.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {row.username}
                  </TableCell>
                  <TableCell>{row.reason}</TableCell>
                  <TableCell>{row.username2}</TableCell>
                  <TableCell>{row.reason2}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer >
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={listData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>
    )
  }

  return (
    <Show
      mutationMode="pessimistic"
      redirect="list"
      actions={<ShowActions />}
    >
      <Container style={{ padding: "15px" }}>
        <Box sx={{ textAlign: 'left' }}>
          <h3>Import Job Info:</h3>
        </Box>
        <SimpleShowLayout >
          <Grid container spacing={2} >
            <Grid item xs={12} sm={6} md={6} lg={3}>
              Job Id:
            </Grid>
            <Grid item xs={12} sm={6} md={6} lg={9}>
              <TextField source="JobId" emptyText="---" />
            </Grid>
          </Grid>
          <Grid container spacing={2} >
            <Grid item xs={12} sm={6} md={6} lg={3}>
              Import Job status:
            </Grid>
            <Grid item xs={12} sm={6} md={6} lg={3}>
              <TextField source="Status" />
            </Grid>
            <Grid item xs={12} sm={6} md={6} lg={3}>
              Created By:
            </Grid>
            <Grid item xs={12} sm={6} md={6} lg={3}>
              <TextField source="CreatedBy" />
            </Grid>
            <Grid item xs={12} sm={6} md={6} lg={3}>
              Creation Date: </Grid>
            <Grid item xs={12} sm={6} md={6} lg={3}>
              <DateField showTime source="CreationDate" />
            </Grid>
            <Grid item xs={12} sm={6} md={6} lg={3}>
              Completion Date: </Grid>
            <Grid item xs={12} sm={6} md={6} lg={3}>
              <DateField showTime source="CompletionDate" />
            </Grid>
            <Grid item xs={12} sm={6} md={6} lg={3}>
              Total Import Users: </Grid>
            <Grid item xs={12} sm={6} md={6} lg={3}>
              <TextField source="TotalUsers" />
            </Grid>
            <Grid item xs={12} sm={6} md={6} lg={3}>
              Failed Import Users: </Grid>
            <Grid item xs={12} sm={6} md={6} lg={3}>
              <TextField source="FailedUsers" />
            </Grid>
          </Grid>
          <FailedImportUsersList />
        </SimpleShowLayout>
      </Container>

    </Show >
  );
};
