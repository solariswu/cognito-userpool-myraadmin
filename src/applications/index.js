import { ApplicationCreate } from "./ApplicationCreate";
import { ApplicationEdit } from "./ApplicationEdit";
import { ApplicationList } from "./ApplicationList";
// import { ApplicationShow } from "./ApplicationShow";
import ApplicationIcon from '@mui/icons-material/Apps';

const applications ={
  // show: ApplicationShow,
  list: ApplicationList,
  edit: ApplicationEdit,
  create: ApplicationCreate,
  hasCreate: true,
  icon: ApplicationIcon,
  recordRepresentation: "model",
};

export default applications;