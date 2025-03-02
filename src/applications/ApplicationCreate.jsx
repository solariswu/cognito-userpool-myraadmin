import * as React from "react";
import { Create, SimpleForm, TextInput} from "react-admin";

import { validateGroupName } from "../utils/validation";

export const ApplicationCreate = () => (
	<Create>
		<SimpleForm>
			<TextInput label="Group Name" source="group" fullWidth required 
			            validate={validateGroupName}/>
			<TextInput source="description" fullWidth />
		</SimpleForm>
	</Create>
);
