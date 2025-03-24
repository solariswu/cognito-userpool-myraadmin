import { ImportUsersCreate } from "./ImportUsersCreate";
import { ImportUsersList } from "./ImportUsersList";
import GroupAddIcon from '@mui/icons-material/GroupAdd';

const importusers ={
  list: ImportUsersList,
  // edit: UserEdit,
  create: ImportUsersCreate,
  hasCreate: true,
  icon: GroupAddIcon,
  recordRepresentation: "model",
};

export default importusers;