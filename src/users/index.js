import { UserList } from "./UserList";
import { UserEdit } from "./UserEdit";
import { UserCreate } from "./UserCreate";
import UserIcon from '@mui/icons-material/People';

const users ={
  list: UserList,
  edit: UserEdit,
  create: UserCreate,
  hasCreate: true,
  icon: UserIcon,
  recordRepresentation: "model",
};

export default users;