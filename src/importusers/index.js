import { ImportUsersCreate } from "./ImportUsersCreate";
import { ImportUsersList } from "./ImportUsersList";
import { ImportUsersShow } from "./ImportUsersShow";
import GroupAddIcon from '@mui/icons-material/GroupAdd';

const importusers ={
  list: ImportUsersList,
  edit: ImportUsersShow,
  show: ImportUsersShow,
  create: ImportUsersCreate,
  hasCreate: true,
  icon: GroupAddIcon,
  recordRepresentation: "model",
};

export default importusers;