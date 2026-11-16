import React from 'react';

import classes from './Backdrop.module.css';

const backdrop = (props) => (
    props.show ? <div className={classes.Backdrop} data-testid="backdrop" onClick={props.clicked}></div> : null
);

export default backdrop;