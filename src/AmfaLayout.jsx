import { Layout } from 'react-admin';

import { AmfaAppBar } from './AmfaAppBar';

export const AmfaLayout = props => <Layout {...props} appBar={AmfaAppBar} />;