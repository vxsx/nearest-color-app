import { Component } from 'react';
import { Layout, Panel } from 'react-toolbox/lib/layout';
import Header from './Header';
import Palette from './Palette';

export default class App extends Component {
  render() {
    return (
      <Layout>
        <Panel>
          <Header />
          <div style={{ flex: 1, overflowY: 'auto', padding: '8.8rem 2.4rem 2.4rem' }}>
            <Palette />
          </div>
        </Panel>
      </Layout>
    );
  }
}
