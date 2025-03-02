import * as React from "react";
import { SimpleShowLayout, TextField, Edit, SimpleForm, TextInput, DateField, TopToolbar, ListButton } from "react-admin";

export const ApplicationEdit = () => {
	const EditActions = () => (
		<TopToolbar>
			<ListButton />
		</TopToolbar>
	);

	return (
		<Edit mutationMode="pessimistic" redirect="show" actions={<EditActions />}>
			<SimpleForm>
				<SimpleShowLayout>
					<TextField source="group" />
					<DateField source="creationDate" />
					<DateField source="lastModifiedDate" />
				</SimpleShowLayout>
				<TextInput source="description" fullWidth />
			</SimpleForm>
		</Edit >
	)
}