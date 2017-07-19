import { Component } from 'react';
import { Card, CardMedia, CardTitle } from 'react-toolbox/lib/card';
import { Button } from 'react-toolbox/lib/button';
import Input from 'react-toolbox/lib/input';
import style from './palette.scss';
import EditDialog from './EditDialog';
import { find, findIndex, uniqBy, filter } from 'lodash';
import diff from 'color-diff';

const ENTER = 13;

const ColorsList = (props) => (
  <div className={style.list}>
    {props.colors.map(({ c, v }) => {
      let className = style.item;
      const color = c;
      const variable = v;

      if (props.match && props.match !== color) {
        className = style.itemNonMatch;
      }

      return (
        <Card key={color} raised={!!(props.match && props.match === color)} className={className}>
          <div className={style.cardMediaFix}>
            <CardMedia color={color} aspectRatio="wide">
                <Button
                  icon="delete"
                  floating mini
                  className={style.delete}
                  onClick={() => props.onRemove(color)}
                />
                <Button
                  icon="edit"
                  floating mini
                  className={style.edit}
                  onClick={() => props.onEdit(color)}
                />
            </CardMedia>
          </div>
          <CardTitle title={color} subtitle={variable} />
        </Card>
      );
    })}
  </div>
);

/**
 * @function convertHexToRGB
 * @param {Object} obj color / variable pair
 * @param {String} obj.c hex representation of the color
 * @returns {Object} { R, G, B }
 */
function convertHexToRGB({ c }) {
  const hex = c;
  const color = hex.replace(/^#/, '');

  /* eslint-disable no-magic-numbers */
  return {
    R: parseInt(color.substring(0, 2), 16),
    G: parseInt(color.substring(2, 4), 16),
    B: parseInt(color.substring(4, 6), 16)
  };
  /* eslint-enable no-magic-numbers */
}

/**
 * @function convertRGBToHex
 * @param {Object} rgb color object
 * @param {Number} rgb.R red
 * @param {Number} rgb.G green
 * @param {Number} rgb.B blue
 * @returns {String} hex representation of the color
 */
function convertRGBToHex(rgb) {
  const { R, G, B } = rgb;

  /* eslint-disable no-magic-numbers */
  return `#${('0' + R.toString(16)).slice(-2)}${('0' + G.toString(16)).slice(-2)}${('0' + B.toString(16)).slice(-2)}`;
  /* eslint-enable no-magic-numbers */
}

export default class Palette extends Component {
  constructor(props) {
    super(props);
    this.state = {
      addColor: '',
      findNearestColor: '',
      computedNearestColor: '',
      colors: this.readStateFromHash().map(({ c, v }) => ({ v, c: this.normalizeColor(c) }))
    };
  }

  readStateFromHash() {
    const hash = window.location.hash.replace(/^#/, '');
    let state = [];

    if (hash) {
      try {
        state = JSON.parse(decodeURIComponent(hash));
      } catch (e) {
        return state;
      }
    }

    return state.map((item) => {
      if (typeof item === 'string') {
        return {
          c: item,
          v: ''
        };
      }

      return item;
    });
  }

  writeStateToHash(state) {
    window.location.hash = '#' + JSON.stringify(state.colors);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.colors !== this.state.colors) {
      this.writeStateToHash(this.state);
    }

    if (
      (prevState.colors !== this.state.colors && this.state.nearestColor) ||
      (prevState.nearestColor !== this.state.nearestColor)
    ) {
      this.findNearestColor(this.state.nearestColor);
    }
  }

  // FIXME should live in utils or reducers
  isValidColor(color) {
    const re = /(^#?[0-9A-F]{6}$)|(^#?[0-9A-F]{3}$)/i;

    return !!color.match(re);
  }

  normalizeColor(color) {
    const MIN_LENGTH_WITH_HASH = 4;
    let normalizedColor = color;

    if (color.length <= MIN_LENGTH_WITH_HASH) {
      normalizedColor = color.replace(/([0-9A-F])/gi, '$1$1');
    }
    normalizedColor = normalizedColor.replace(/^#/g, '');

    return `#${normalizedColor.toUpperCase()}`;
  }

  addColor(color) {
    if (!this.isValidColor(color)) {
      return;
    }

    this.setState({
      colors: uniqBy([{ c: this.normalizeColor(color) }].concat(this.state.colors), 'c'),
      addColor: ''
    });
  }

  handleInputChange(name, value) {
    this.setState({
      [name]: value
    });
  }

  onRemove(color) {
    this.setState({
      colors: filter(this.state.colors, ({ c }) => c !== color)
    });
  }

  onEdit(color) {
    this.setState({
      editing: find(this.state.colors, ({ c }) => c === color)
    });
  }

  onEditFinish({ c, v }) {
    const color = c;
    const index = findIndex(this.state.colors, (colorObj) => colorObj.c === color);

    if (index === -1) { // eslint-disable-line no-magic-numbers
      return;
    }

    this.setState((state) => {
      state.editing = false;
      state.colors[index] = { c, v };
      state.colors = [].concat(state.colors);

      return state;
    });
  }

  findNearestColor(value) {
    if (!this.isValidColor(value)) {
      this.setState({
        computedNearestColor: ''
      });
      return;
    }
    const color = this.normalizeColor(value);

    const nearestColor = diff.closest(
      convertHexToRGB({ c: color }),
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
          <div className={style.previewWrap}>
            {this.state.nearestColor && this.state.computedNearestColor ? (
              <div className={style.preview} style={{
                backgroundColor: this.normalizeColor(this.state.nearestColor)
              }} />
            ) : null}
            <Input type="text" name="compare"
              label="Find color"
              value={this.state.nearestColor}
              onChange={(value) => this.handleInputChange('nearestColor', value)}
            />
          </div>
        </div>
        <ColorsList
          colors={this.state.colors}
          match={this.state.computedNearestColor}
          onRemove={(color) => this.onRemove(color)}
          onEdit={(color) => this.onEdit(color)}
        />
        <Input type="text" name="color"
          label="Add color"
          value={this.state.addColor}
          onChange={(value) => this.handleInputChange('addColor', value)}
          onKeyDown={(e) => e.keyCode === ENTER && this.addColor(e.currentTarget.value)} />
        <EditDialog
          active={this.state.editing}
          onSave={(v) => this.onEditFinish(v)}
          onClose={() => this.setState({ editing: false })}
        />
      </div>
    );
  }
}
