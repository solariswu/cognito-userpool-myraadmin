// import * as React from 'react';
// import { useEffect, useState } from 'react';
// // import { useTimeout } from 'ra-core';
// import { MyAuthError } from './MyAuthError';
import authProvider from './authProvider';

export const MyAuthCallbackPage = async () => {
	// const { error } = useHandleAuthCallback();
	// const hasOneSecondPassed = useTimeout(1000);
	// const [isLoading, setLoading] = useState(true);

	// useEffect(() => {
	// 	const timer = setTimeout(() => {
	// 		setLoading(false);
	// 	}, 1000);
	// 	return () => clearTimeout(timer);
	//   }, []);

	await authProvider.handleCallback()
		// .then(result =>
		// 	console.log('handleCallback', result)
		// )
		// .catch(error =>

		// 	<MyAuthError
		// 		message={
		// 			(error) ? (error).message : undefined
		// 		}
		// 	/>
		// );

		return null;

	// return isLoading ? (<>Loading</>) : null;
};
