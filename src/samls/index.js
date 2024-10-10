import { SamlCreate } from "./SamlCreate";
import { SamlShow } from "./SamlShow";
import { SamlEdit } from "./SamlEdit";

import CableIcon from '@mui/icons-material/Cable';

const samls ={
  show: SamlShow,
  edit: SamlEdit,
  create: SamlCreate,
  hasCreate: true,
  icon: CableIcon,
  recordRepresentation: "model",
};

export default samls;