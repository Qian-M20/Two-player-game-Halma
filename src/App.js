import React, {Component} from 'react';
import './App.css';
// import logo from './logo.svg'


let distanceX;
let distanceY;
let theOriginalX;
let theOriginalY;
let theMoveToX;
let theMoveToY;
let occupiedSpaces=[];
let validPath = [];


class App extends Component {

  constructor (props){
    super(props);
    this.state = {
      spaces:[],
      chesses:[],
    }
  }

  // all methods of the app component go in this section
  getSpaces = () => {
    let spaces = [];
    for (let y=1; y<9; y++) {
      for (let x=1; x<9; x++){
        spaces.push({
          className: `space`,
          key: `space-${x}-${y}`,
          location: `(${x},${y})`,
          locationX: x,
          locationY: y,
          isOccupied: false,
          isValidPath:false,
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
          isSelected:false,
          locationX: x,
          locationY: y,
          currentX: x,
          currentY: y,
          validPath: [],
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
            position:`absolute`,
            transformOrigin: `${(x-1)*10}vh ${(x-1)*10}vh`
          }
        })
      }
    }

    for (let y=5; y<9; y++) {
      for (let x=8; x>(12-y); x--){
        chesses.push({
          key: `chess-${x}-${y}`,
          // the locationX and locationY needs to be dynamically changed
          isSelected:false,
          locationX: x,
          locationY: y,
          currentX: x,
          currentY: y,
          validPath: [],
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
            position:`absolute`,
            // transformOrigin: `(${locationX}-1)vh ${(locationY-1)*10}vh`
            transformOrigin: `${(x-1)*10}vh ${(y-1)*10}vh`
          }
        })
      }
    }
    return {chesses};
  }

  // when click on any space, file the following event
  chessMoveTo = (locationX, locationY, isValidPath) => (e) => {
    

      // if the space is valid, get the x and y distance and file the animation event
      theMoveToX = locationX;
      theMoveToY = locationY;
      distanceX = (theMoveToX - theOriginalX)*10;
      distanceY = (theMoveToY - theOriginalY)*10;
      console.log(`${distanceX}`, `${distanceY}`);
      const selectedChess = document.querySelector(`.selectedChess`);
      if (selectedChess) {
        // find out if the clicked space is valid
        if (isValidPath === true) {
          selectedChess.style.transform = "translate3d(" + distanceX + "vh, " + distanceY + "vh, 0)";
          selectedChess.classList.remove('selectedChess');
            // change the state of the selected Chess, so that the caculation of valid spaces points can be updated
          this.setState({
            chesses: this.state.chesses.map((chess)=>{
              if(chess.isSelected === true){
                chess.currentX = locationX;
                chess.currentY = locationY;
              }
              return chess;
            }) 
          })
  
        // update the isValidPath state of spaces
        this.setState({
          spaces: this.state.spaces.map((space)=>{
            space.isValidPath = false;
            space.className = `space`;
            return space;
          })
        });
      }else {
        alert('this is not a valid move!');
      }
    } else {
      alert('Please select the chess first!');
    }
    

  }

  // when click on any chess, file the following event
  selectChess = (key,locationX, locationY, currentX, currentY) => (e) => {

    // indicate which chess is being selected
    const selectedChess = document.querySelector(`.selectedChess`);
    if (selectedChess) {
      selectedChess.classList.remove('selectedChess');
      // selectedChess.style.boxShadow = 'none';
    }
    // e.target.style.boxShadow = "0px 0px 10px 5px gray";
    e.target.classList.add('selectedChess');

    // store the current location into global variable
    theOriginalX = locationX;
    theOriginalY = locationY;
    console.log(`${locationX} , ${locationY} , chess selected`);

    // change the state of the chess to indicate this is the one that's being selected
    this.setState({
      chesses: this.state.chesses.map((chess)=>{
        chess.isSelected = false;
        if(chess.key === key){
          chess.isSelected = true;
        }
        return chess;
      })
    });

    // update the isValidPath state of spaces
    this.setState({
      spaces: this.state.spaces.map((space)=>{
        space.isValidPath = false;
        space.className = `space`;
        return space;
      })
    });

    // find out the valid destination spaces
    this.validPathCheck(currentX, currentY);
      // first check
  }

  validPathCheck = (x,y) => {
      // round 1 check
      let firstRoundCheck = [];
      if(x-1>0) {
        firstRoundCheck.push(`(${x-1},${y})`);
        if(y+1<9){
          firstRoundCheck.push(`(${x-1},${y+1})`);
        }
        if(y-1>0){
          firstRoundCheck.push(`(${x-1},${y-1})`);
        }
      }

      if(x+1<9) {
        firstRoundCheck.push(`(${x+1},${y})`);
        if(y+1<9){
          firstRoundCheck.push(`(${x+1},${y+1})`);
        }
        if(y-1>0){
          firstRoundCheck.push(`(${x+1},${y-1})`);
        }
      }

      if(y-1>0) {
        firstRoundCheck.push(`(${x},${y-1})`);
      }

      if(y+1<9) {
        firstRoundCheck.push(`(${x},${y+1})`);
      }

      console.log(firstRoundCheck);

      firstRoundCheck.map((item) => {
          this.setState({
            spaces: this.state.spaces.map((space)=>{
                if(space.location === item){
                  console.log(space);
                  if(space.isOccupied === false) {
                    validPath.push(space);
                    space.isValidPath = true;
                    space.className = `chess isValidPath`;
                  }
                }
                return space
            })
          })
      })

      console.log(validPath);
  }


 // check if the space is occupied or not
  checkIfOccupied = () => {
    occupiedSpaces = [];
    this.state.spaces.map((space)=> {
        this.state.chesses.map((chess)=>{
          if(space.locationX === chess.currentX && space.locationY === chess.currentY){
            occupiedSpaces.push(space);
          }
        })
    });

    this.setState({
      spaces: this.state.spaces.map((space) => {
          if (occupiedSpaces.includes(space)) {
            space.isOccupied = true;
          } else {
            space.isOccupied = false;
          }
          return space
      })
    })

    return occupiedSpaces;
  }

  componentDidMount() {
    this.setState({
      ...this.getSpaces(),
      ...this.getChesses(),
    });

    // update the isOccupied state of spaces constantly
    setInterval(this.checkIfOccupied, 500);
  }

  render() {
    let {spaces, chesses} = this.state;
    let positionSpaces = spaces.map((space,index)=> { 
      let {key, style, locationX, locationY, className, isValidPath} = space;
      let reactDom = <div
          key={key}
          className={className}
          onClick={this.chessMoveTo(locationX,locationY, isValidPath)}
          style={{...style
          }}
        >
        </div >
      return reactDom;
    });

    let positionChesses = chesses.map((chess,index)=> { 
      let {key, style, locationX, locationY, currentX, currentY} = chess;
      let reactDom = <div
          key={key}
          className="chess"
          onClick={this.selectChess(key,locationX,locationY, currentX, currentY)}
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
