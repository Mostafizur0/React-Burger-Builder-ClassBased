import React from 'react';

import classes from './DrawerToggle.module.css';

const drawerToggle = (props) => (
    <div className={classes.DrawerToggle} data-testid="drawer-toggle" onClick={props.clicked}>
        <div data-testid="drawer-bar"></div>
        <div data-testid="drawer-bar"></div>
        <div data-testid="drawer-bar"></div>
    </div>
);

export default drawerToggle;