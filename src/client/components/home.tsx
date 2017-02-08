import { Component, React } from 'chen-react';

export interface HomeProps {}

export interface HomeState {}

export class Home extends Component<HomeProps, HomeState> {

  public render() {
    return <h1>Welcome to Chen React</h1>;
  }
}
