import { AppClientList } from "./AppClientList";
import { AppClientEdit } from "./AppClientEdit";
import { AppClientCreate } from "./AppClientCreate";
import CableIcon from '@mui/icons-material/Cable';

const serviceproviders ={
  list: AppClientList,
  show: AppClientEdit,
  edit: AppClientEdit,
  create: AppClientCreate,
  icon: CableIcon,
  recordRepresentation: "model",
};

export default serviceproviders;