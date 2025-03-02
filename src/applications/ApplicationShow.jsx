import { Show, SimpleShowLayout, DateField, TextField, } from 'react-admin';

export const ApplicationShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField label="Name" source="group" />
            <TextField source="description" />
            <DateField source="creationDate" />
            <DateField source="lastModifiedDate" />
        </SimpleShowLayout>
    </Show>
);