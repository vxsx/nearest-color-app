import { Component } from 'react';
import style from './header.scss';
import AppBar from 'react-toolbox/lib/app_bar';

export default () => (
  <AppBar fixed flat>
    <a href="/">
      Nearest color <br />
      <span className={style.subtitle}>Because you need to stick to the palette</span>
    </a>
  </AppBar>
);
