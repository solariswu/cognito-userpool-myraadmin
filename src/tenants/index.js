import { TenantList } from "./TenantList";
import { TenantEdit } from "./TenantEdit";
import { TenantCreate } from "./TenantCreate";
import SettingsIcon from '@mui/icons-material/Settings';

const tenants ={
  list: TenantList,
  show: TenantEdit,
  edit: TenantEdit,
  create: TenantCreate,
  icon: SettingsIcon,
  recordRepresentation: "model",
};

export default tenants;