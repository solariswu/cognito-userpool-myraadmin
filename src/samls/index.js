import { SamlCreate } from "./SamlCreate";
// import { SamlShow } from "./SamlShow";
import { SamlEdit } from "./SamlEdit";

import CableIcon from '@mui/icons-material/Cable';

const samls ={
  show: SamlEdit,
  edit: SamlEdit,
  create: SamlCreate,
  hasCreate: true,
  icon: CableIcon,
  recordRepresentation: "model",
};

export default samls;