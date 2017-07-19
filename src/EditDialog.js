import { Component } from 'react';
import { Dialog, Input } from 'react-toolbox';

const ENTER = 13;
const emptyState = {
  c: '',
  v: ''
};

export default class EditDialog extends Component {
  constructor(props) {
    super(props);
    this.actions = [
      { label: 'Cancel', onClick: this.props.onClose },
      { label: 'Save', onClick: () => this.props.onSave(this.state) }
    ];
    this.state = emptyState;
  }

  handleInputChange(name, value) {
    this.setState({
      [name]: value
    });
  }

  componentDidUpdate(oldProps) {
    if (!oldProps.active && this.props.active) {
      this.setState(this.props.active);
    } else if (!this.props.active && this.state.c) {
      this.setState(emptyState);
    }
  }

  render() {
    const { active = {}, onClose, onSave } = this.props;

    return (
      <div>
        <Dialog
          actions={this.actions}
          active={!!active.c}
          onEscKeyDown={onClose}
          onOverlayClick={onClose}
          title='Edit'
        >
          <Input type="text"
            name="variable"
            label="Variable Name"
            value={this.state.v}
            onChange={(value) => this.handleInputChange('v', value)}
            onKeyDown={(e) => e.keyCode === ENTER && onSave(this.state)} />
        </Dialog>
      </div>
    );
  }
}
