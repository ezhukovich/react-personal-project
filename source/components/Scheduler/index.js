import React, { Component } from "react";

import Checkbox from 'theme/assets/Checkbox';
import { Task } from 'components/Task';
import { Spinner } from 'components/Spinner';

import { url, token } from 'config/api';
import Styles from "./styles.m.css";


export class Scheduler extends Component {
    constructor () {
        super();
        this.onAddTask = ::this._onAddTask;
        this.createNewTask = ::this._createNewTask;
        this.sortTasks = ::this._sortTasks;
        this.toggleTaskComplete = ::this._toggleTaskComplete;
        this.updateTaskDescription = ::this._updateTaskDescription;
        this.onCheckAllDone = ::this._onCheckAllDone;
        this.searchTasks = ::this._searchTasks;
        this.showSpinner = ::this._showSpinner;
        this.toggleFavorite = ::this._toggleFavorite;
        this.fetchTasks = ::this._fetchTasks;
        this.createTask = ::this._createTask;
        this.removeTask = ::this._removeTask;
        this.updateTask = ::this._updateTask;
    }

    state = {
        isLoading:       false,
        tasks:           [],
        tasksFilter:     '',
        taskDescription: '',
        completedAll:    false,
    };

    componentDidMount () {
        this.fetchTasks();
        this.sortTasks();
    }

    _onAddTask (event) {
        const {
            taskDescription,
        } = this.state;

        event.preventDefault();
        if (taskDescription) {
            this.createTask(taskDescription);
            this.sortTasks();
        }
    }

    _createNewTask (e) {
        const { value } = e.target;

        this.setState({
            taskDescription: value.slice(0, 50),
        });
    }

    _toggleTaskComplete (id, completed) {
        const { tasks } = this.state;
        const array = tasks;

        if (completed) {
            array.map((task) => {
                return task.id !== id ? task : task.completed = false;
            });
        } else {
            array.map((task) => {
                return task.id !== id ? task : task.completed = true;
            });
        }

        this.setState(() => ({
            tasks: array,
        }), () => {
            this.sortTasks();
        });

        this.updateTask(tasks.filter((task) => task.id === id)[0]);
    }

    _toggleFavorite (id, favorite) {
        const { tasks } = this.state;
        const array = tasks;

        if (favorite) {
            array.map((task) => task.id !== id ? task : task.favorite = false);
        } else {
            array.map((task) => task.id !== id ? task : task.favorite = true);
        }

        this.setState(() => ({
            tasks: array,
        }), () => {
            this.sortTasks();
        });

        this.updateTask(tasks.filter((task) => task.id === id)[0]);
    }

    _searchTasks (e) {
        const { value } = e.target;

        this.setState({
            tasksFilter: value,
        });
    }

    _sortTasks () {
        const {
            tasks,
        } = this.state;
        const sortedTasks = {
            favorite:  [],
            regular:   [],
            completed: [],
        };

        sortedTasks.favorite = tasks.filter((task) => task.favorite && !task.completed);
        sortedTasks.regular = tasks.filter((task) => !task.completed && !task.favorite);
        sortedTasks.completed = tasks.filter((task) => task.completed);

        this.setState({
            tasks: [
                ...sortedTasks.favorite,
                ...sortedTasks.regular,
                ...sortedTasks.completed
            ],
        });
    }

    _updateTaskDescription (id, description) {
        const { tasks } = this.state;
        const array = tasks;

        array.map((task) => {
            return task.id !== id ? task : task.message = description;
        });

        this.setState(() => ({
            tasks: array,
        }));
        this.updateTask(tasks.filter((task) => task.id === id)[0]);
    }

    _onCheckAllDone () {
        const { tasks, completedAll } = this.state;
        const array = tasks;

        array.map((task) => completedAll ? task.completed = false : task.completed = true);
        this.setState(() => ({
            completedAll: !completedAll,
            tasks:        array,
        }));

        array.map((task) => this.updateTask(task));
    }

    _showSpinner (state) {
        this.setState({
            isLoading: state,
        });
    }

    async _fetchTasks () {
        this.showSpinner(true);
        try {
            const response = await fetch(url, {
                method:  'GET',
                headers: {
                    Authorization:  token,
                    "Content-Type": "application/json",
                },
            });

            if (response.status !== 200) {
                throw new Error("Fetch tasks failed");
            }
            const { data } = await response.json();

            this.setState(({ tasks }) => ({
                tasks: [...data, ...tasks],
            }), () => {
                this.sortTasks();
            });
        } catch ({ message }) {
            console.error(message);
        } finally {
            this.showSpinner(false);
        }
    }

    async _createTask (message) {
        this.showSpinner(true);
        try {
            const response = await fetch(url, {
                method:  'POST',
                headers: {
                    Authorization:  token,
                    'Content-Type': "application/json",
                },
                body: JSON.stringify({ message }),
            });

            if (response.status !== 200) {
                throw new Error("Create task failed");
            }
            const { data } = await response.json();

            this.setState(({ tasks }) => ({
                tasks:           [data, ...tasks],
                taskDescription: '',
            }));
        } catch ({ message: errMessage }) {
            console.error(errMessage);
        } finally {
            this.showSpinner(false);
        }
    }

    async _updateTask ({ id, message, completed, favorite }) {
        this.showSpinner(true);
        try {
            const response = await fetch(url, {
                method:  'PUT',
                headers: {
                    Authorization:  token,
                    'Content-Type': "application/json",
                },
                body: JSON.stringify([{
                    id,
                    message,
                    completed,
                    favorite,
                }]),
            });

            const { data } = await response.json();

            if (response.status !== 200) {
                throw new Error("Edit task failed");
            }

            this.setState(({ tasks }) => ({
                tasks: tasks.map(
                    (task) => task.id === data[0].id
                        ? {
                            ...data[0],
                        }
                        : task
                ),
            }));
        } catch ({ message: errMessage }) {
            console.error(errMessage);
        } finally {
            this.showSpinner(false);
        }
    }

    async _removeTask (id) {
        this.showSpinner(true);
        try {
            const response = await fetch(`${url}/${id}`, {
                method:  'DELETE',
                headers: {
                    Authorization: token,
                },
            });

            if (response.status !== 204) {
                throw new Error("Remove task failed");
            }

            this.setState(({ tasks }) => ({
                tasks: tasks.filter((task) => task.id !== id),
            }));
        } catch ({ message: errMessage }) {
            console.error(errMessage);
        } finally {
            this.showSpinner(false);
        }
    }

    render () {
        const {
            isLoading,
            tasks,
            tasksFilter,
            taskDescription,
        } = this.state;

        const renderTasks = tasks
            .filter(({ message }) => message.includes(tasksFilter))
            .map((task) => (<Task
                key = { task.id }
                removeTask = { this.removeTask }
                toggleFavorite = { this.toggleFavorite }
                toggleTaskComplete = { this.toggleTaskComplete }
                updateTask = { this.updateTask }
                updateTaskDescription = { this.updateTaskDescription }
                { ...task }
            />));

        return (
            <section className = { Styles.scheduler }>
                <Spinner isLoading = { isLoading } />
                <main>
                    <header>
                        <h1>Планировщик задач</h1>
                        <input
                            placeholder = 'Поиск'
                            type = 'text'
                            value = { tasksFilter }
                            onChange = { this.searchTasks }
                        />
                    </header>
                    <section>
                        <form>
                            <input
                                autoFocus
                                maxLength = { 50 }
                                placeholder = 'Описание задачи'
                                type = 'text' value = { taskDescription }
                                onChange = { this.createNewTask }
                            />
                            <button onClick = { this.onAddTask }>Добавить задачу</button>
                        </form>
                        <div className = { Styles.overlay } >
                            <ul>
                                {renderTasks}
                            </ul>
                        </div>
                    </section>
                    <footer onClick = { this.onCheckAllDone }>
                        <Checkbox
                            inlineBlock
                            color1 = '#363636'
                            color2 = '#fff'
                        />
                        <span className = { Styles.completeAllTasks } >Все задачи выполнены</span>
                    </footer>
                </main>
            </section>
        );
    }
}
