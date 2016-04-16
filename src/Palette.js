import { Component } from 'react';
import { Card, CardMedia, CardTitle } from 'react-toolbox/lib/card';
import Input from 'react-toolbox/lib/input';
import style from './palette.scss';
import { uniq } from 'lodash';
import diff from 'color-diff';

const ColorsList = (props) => (
  <div className={style.list}>
    {props.colors.map((color) => {
      let className = style.item;

      if (props.match && props.match !== color) {
        className = `${className} ${style.itemNonMatch}`;
      }

      return (
        <Card key={color} className={className}>
          <CardMedia color={color} aspectRatio="wide" />
          <CardTitle title={color} />
        </Card>
      );
    })}
  </div>
);

function convertHexToRGB(hex) {
  hex = hex.replace(/^#/, '');
  return {
    R: parseInt(hex.substring(0, 2), 16),
    G: parseInt(hex.substring(2, 4), 16),
    B: parseInt(hex.substring(4, 6), 16)
  };
}

function convertRGBToHex(rgb) {
  const { R, G, B } = rgb;

  return `#${('0' + R.toString(16)).slice(-2)}${('0' + G.toString(16)).slice(-2)}${('0' + B.toString(16)).slice(-2)}`
};

export default class Palette extends Component {
  constructor(props) {
    super(props);
    this.state = {
      addColor: '',
      findNearestColor: '',
      computedNearestColor: '',
      colors: this.readStateFromHash()
    }
  }

  readStateFromHash() {
    const hash = window.location.hash.replace(/^#/, '');

    if (hash) {
      return JSON.parse(hash);
    }
    return [];
  }

  writeStateFromHash(state) {
    window.location.hash = '#' + JSON.stringify(state.colors);
  }

  componentDidUpdate() {
    this.writeStateFromHash(this.state);
  }

  // FIXME should live in utils or reducers
  isValidColor(color) {
    const re = /(^#?[0-9A-F]{6}$)|(^#?[0-9A-F]{3}$)/i;

    return !!color.match(re);
  }

  normalizeColor(color) {
    if (color.length <= 4) {
      color = color.replace(/([0-9A-F])/gi, '$1$1');
    }
    color = color.replace(/^#/g, '');

    return `#${color.toUpperCase()}`;
  }

  addColor(color) {
    if (!this.isValidColor(color)) {
      return;
    }

    this.setState({
      colors: uniq([this.normalizeColor(color)].concat(this.state.colors)),
      addColor: ''
    })
  }

  handleInputChange(name, value) {
    this.setState({
      [name]: value
    });
  }

  findNearestColor(value) {
    this.handleInputChange('nearestColor', value);
    if (!this.isValidColor(value)) {
      this.setState({
        computedNearestColor: ''
      })
      return;
    }
    const color = this.normalizeColor(value);

    const nearestColor = diff.closest(
      convertHexToRGB(color),
      this.state.colors.map(convertHexToRGB)
    );

    this.setState({
      computedNearestColor: this.normalizeColor(convertRGBToHex(nearestColor))
    });
  }

  render() {
    return (
      <div>
        <div className={style.title}>
          <h2>Palette</h2>
          <Input type="text" name="compare"
            label="Find nearest color"
            value={this.state.nearestColor}
            onChange={(value) => this.findNearestColor(value)}
          />
        </div>
        <ColorsList colors={this.state.colors} match={this.state.computedNearestColor} />
        <Input type="text" name="color"
          label="Add color"
          value={this.state.addColor}
          onChange={(value) => this.handleInputChange('addColor', value)}
          onKeyDown={(e) => e.keyCode === 13 && this.addColor(e.currentTarget.value)} />
      </div>
    )
  }
}
