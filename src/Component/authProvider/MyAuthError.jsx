import * as React from 'react';
import { styled } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import PropTypes from 'prop-types';
import { useTranslate } from 'ra-core';
import { Button } from "@mui/material";


export const MyAuthError = (props) => {
    const {
        className,
        title = 'ra.page.error',
        message = 'ra.message.auth_error',
        ...rest
    } = props;

    const translate = useTranslate();
    return (
        <Root className={className} {...rest}>
            <div className={AuthErrorClasses.message}>
                <h1>{translate(title, { _: title })}</h1>
                <div>{translate(message, { _: message })}</div>
                <Button to="/login" label="ra.auth.sign_in">
                    <LockIcon />
                </Button>
            </div>
        </Root>
    );
};

MyAuthError.propTypes = {
    className: PropTypes.string,
    title: PropTypes.string,
    message: PropTypes.string,
};

const PREFIX = 'RaAuthError';

export const AuthErrorClasses = {
    root: `${PREFIX}-root`,
    message: `${PREFIX}-message`,
};

const Root = styled('div', {
    name: PREFIX,
    overridesResolver: (props, styles) => styles.root,
})(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    [theme.breakpoints.up('md')]: {
        height: '100%',
    },
    [theme.breakpoints.down('xl')]: {
        height: '100vh',
        marginTop: '-3em',
    },

    [`& .${AuthErrorClasses.message}`]: {
        textAlign: 'center',
        fontFamily: 'Roboto, sans-serif',
        opacity: 0.5,
        margin: '0 1em',
    },
}));
