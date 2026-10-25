import './create-news.module.scss';
import React, { ChangeEvent } from 'react';
import { environment } from '../../environments/environment';

/* eslint-disable-next-line */
export interface CreateNewsProps {}
export interface CreateNewsState {
  title: string,
  description: string,
}

class CreateNews extends React.Component<CreateNewsProps, Partial<CreateNewsState>>{
  constructor(props: CreateNewsProps) {
    super(props);
    this.state = {
      title: '',
      description: ''
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    fetch(`${environment.apiUrl}/news`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(this.state),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        alert(this.state.title + ' успешно создана!');
        this.setState({
          title: '',
          description: ''
        });
      })
      .catch((error) => {
        alert('Ошибка :-(');
      });
  }

  override render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <h1>Создание новости</h1>
        <div>
          <label>
            <strong>Заголовок</strong>
            <input required name="title" type="text" value={this.state.title} onChange={this.handleChange} />
          </label>
        </div>
        <div>
          <label>
            <strong>Текст</strong>
            <textarea required name="description" value={this.state.description} onChange={this.handleChange} />
          </label>
        </div>
        <input type="submit" value="Добавить" />
      </form>
    );
  }
}

export default CreateNews;
