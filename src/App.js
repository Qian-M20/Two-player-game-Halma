import React, {Component} from 'react';
import './App.css';
// import logo from './logo.svg'

class App extends Component {

  constructor (props){
    super(props);
    this.state = {
      spaces:[],
      chesses:[]
    }
  }

  // all methods of the app component go in this section
  getSpaces = () => {
    let spaces = [];
    for (let y=1; y<9; y++) {
      for (let x=1; x<9; x++){
        spaces.push({
          key: `space-${x}-${y}`,
          locationX: x,
          locationY: y,
          style:{
            width:`9vh`,
            height:`9vh`,
            margin: `0 auto`,
            borderRadius: `50%`,
            // border: "1px solid black",
            backgroundColor: "#F2F2F2",
            zIndex:1
          }
        })
      }
    }
    return {spaces};
  }

  getChesses = () => {
    let chesses = [];
    for (let y=1; y<5; y++) {
      for (let x=1; x<(6-y); x++){
        chesses.push({
          key: `chess-${x}-${y}`,
          // the locationX and locationY needs to be dynamically changed
          
          locationX: x,
          locationY: y,
          style:{
            width:`9vh`,
            height:`9vh`,
            margin: `0 auto`,
            borderRadius: `50%`,
            // border: "1px solid black",
            backgroundColor: "green",
            zIndex:2,
            top: `${(y-1)*10}vh`,
            left: `${(x-1)*10}vh`,
            position:`absolute`
          }
        })
      }
    }

    for (let y=5; y<9; y++) {
      for (let x=8; x>(12-y); x--){
        chesses.push({
          key: `chess-${x}-${y}`,
          // the locationX and locationY needs to be dynamically changed
          
          locationX: x,
          locationY: y,
          style:{
            width:`9vh`,
            height:`9vh`,
            margin: `0 auto`,
            borderRadius: `50%`,
            // border: "1px solid black",
            backgroundColor: "black",
            zIndex:2,
            top: `${(y-1)*10}vh`,
            left: `${(x-1)*10}vh`,
            position:`absolute`
          }
        })
      }
    }
    return {chesses};
  }


  // when click on any space, file the following event
  chessMoveTo = (locationX, locationY) => (e) => {
    console.log(`${locationX}`, `${locationY}`);
  }

  componentDidMount() {
    this.setState({
      ...this.getSpaces(),
      ...this.getChesses(),
    });
  }

  render() {
    let {spaces, chesses} = this.state;
    let positionSpaces = spaces.map((space,index)=> { 
      let {key, style, locationX, locationY} = space;
      let reactDom = <div
          key={key}
          className="space"
          onClick={this.chessMoveTo(locationX,locationY)}
          style={{...style
          }}
        >
        </div >
      return reactDom;
    });

    let positionChesses = chesses.map((chess,index)=> { 
      let {key, style, locationX, locationY} = chess;
      let reactDom = <div
          key={key}
          className="chess"
          // onClick={this.chessMoveTo(locationX,locationY)}
          style={{...style
          }}
        >
          {key}
        </div >
      return reactDom;
    })

    return (
      <div className="App">
        <div className="boardWrapper">
          <div className="board">
              {positionSpaces}
              {positionChesses}
          </div>
        </div>
      </div>
    );
  }
  
}

export default App;
