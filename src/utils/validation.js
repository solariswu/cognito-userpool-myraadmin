export const required = (message = 'Required') =>
	value => value ? undefined : message;
const minLength = (min) =>
	value => value && value.length <= min ? `Password must be at least ${min} characters` : undefined;
const hasLowercase = () =>
	value => value && !/[a-z]/.test(value) ? 'Password must contain at least one lowercase letter' : undefined;
const hasUppercase = () =>
	value => value && !/[A-Z]/.test(value) ? 'Password must contain at least one uppercase letter' : undefined;
const hasNumber = () =>
	value => value && !/[0-9]/.test(value) ? 'Password must contain at least one number' : undefined;
const hasSpecial = () =>
	value => value && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value) ? 'Password must contain at least one special character' : undefined;
export const validatePassword = [required(), minLength(8), hasNumber(), hasUppercase(), hasLowercase(), hasSpecial()];

export const isHttpsOrHttpLocal = () =>
	value => value && !/^https:\/\/(?:w{1,3}\.)?[^\s.]+(?:\.[a-z]+)*(?::\d+)?(?![^<]*(?:<\/\w+>|\/?>))/.test(value) && !/^http:\/\/localhost(?::\d+)?(?![^<]*(?:<\/\w+>|\/?>))/.test(value) ? 'URL must start with http://localhost or https://' : undefined;
export const validateUrl = [isHttpsOrHttpLocal()];

export const isIDN = () =>
	value => value && !/^\+(?:[0-9] ?){6,14}[0-9]$/.test(value) ? 'phone number must start with a plus (+) sign, followed immediately by the country code, eg. +111111111' : undefined;
export const validatePhoneNumber = [isIDN()];

const isGroupName = () =>
	value => value && !/^[a-zA-Z0-9_-]+$/.test(value) ? 'group name must contain only alphanumeric characters, underscores, dashes' : undefined;
export const validateGroupName = [required(), isGroupName()];

export const isNum = () =>
	value => value && !/^[0-9]+$/.test(value) ? 'value must be a number' : undefined;
export const max = (max) =>
	value => value && value > max ? `Value must be less than or equal to ${max}` : undefined;
export const min = (min) =>
	value => value && value < min ? `Value must be greater than or equal to ${min}` : undefined;
