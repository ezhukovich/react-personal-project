import React, { Component } from 'react';
import cx from 'classnames';

import Checkbox from 'theme/assets/Checkbox';
import Star from 'theme/assets/Star';
import Edit from 'theme/assets/Edit';
import Remove from 'theme/assets/Remove';

import Styles from "./styles.m.css";


export class Task extends Component {

    constructor () {
        super();
        this.toggleFavorite = ::this._toggleFavorite;
        this.toggleTaskComplete = ::this._toggleTaskComplete;
        this.statusEdit = ::this._statusEdit;
        this.onDescriptionChange = ::this._onDescriptionChange;
        this.onKeyPress = ::this._onKeyPress;
        this.onRemoveTask = ::this._onRemoveTask;
    }

    state = {
        isEditable:  false,
        description: '',
    };

    _toggleTaskComplete () {
        const {
            id,
            completed,
            toggleTaskComplete,
        } = this.props;

        toggleTaskComplete(id, completed);
    }

    _statusEdit (keyCode = '') {
        const {
            id,
            message,
            updateTaskDescription,
        } = this.props;
        const { isEditable, description } = this.state;

        if (keyCode !== 27) {
            if (isEditable) {
                updateTaskDescription(id, description);
                this.setState(() => ({
                    isEditable: !isEditable,
                }));
            } else {
                this.setState(() => ({
                    isEditable:  !isEditable,
                    description: message,
                }));
            }
        } else {
            this.setState(() => ({
                isEditable:  !isEditable,
                description: message,
            }));
        }
    }

    _onDescriptionChange (e) {
        const { value } = e.target;

        this.setState(() => ({
            description: value.slice(0, 50),
        }));
    }

    _onKeyPress ({ keyCode }) {
        const {
            id,
            updateTaskDescription,
        } = this.props;
        const {
            description,
        } = this.state;

        if (keyCode === 13) {
            updateTaskDescription(id, description);
            this.setState({
                isEditable: false,
            });
        } else if (keyCode === 27) {
            this.statusEdit(27);
        }
    }

    _onRemoveTask () {
        const {
            id,
            removeTask,
        } = this.props;

        removeTask(id);
    }

    _toggleFavorite () {
        const { id, favorite, toggleFavorite } = this.props;

        toggleFavorite(id, favorite);
    }

    render () {
        const {
            message,
            completed,
            favorite,
        } = this.props;
        const {
            isEditable,
            description,
        } = this.state;
        const taskStyle = cx(Styles.task, {
            [Styles.completed]: completed,
        });

        return (
            <li className = { taskStyle }>
                <div className = { Styles.content } >
                    <Checkbox
                        inlineBlock
                        checked = { completed }
                        className = { Styles.complete }
                        color1 = '#3b8ef3'
                        color2 = '#fff'
                        onClick = { this.toggleTaskComplete }
                    />
                    {
                        isEditable
                            ? (
                                <input
                                    autoFocus
                                    maxLength = { 50 }
                                    type = 'text'
                                    value = { description }
                                    onChange = { this.onDescriptionChange }
                                    onKeyUp = { this.onKeyPress }
                                />
                            )
                            : <span>{ message }</span>
                    }

                </div>
                <div className = { Styles.actions }>
                    <Star
                        inlineBlock
                        checked = { favorite }
                        className = { Styles.setPriority }
                        color1 = '#3B8EF3'
                        color2 = '#000'
                        onClick = { this.toggleFavorite }
                    />
                    <Edit
                        inlineBlock
                        className = { Styles.edit }
                        color1 = '#3B8EF3'
                        color2 = '#000'
                        onClick = { this.statusEdit }
                    />
                    <Remove
                        inlineBlock
                        color1 = '#3B8EF3'
                        color2 = '#000'
                        onClick = { this.onRemoveTask }
                    />
                </div>
            </li>
        );
    }
}
