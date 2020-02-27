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
// let validPath = [];
let adjSpaces = [];


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
          // validPath: [],
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
          // validPath: [],
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

  selectChess = (key,locationX, locationY, currentX, currentY) => (e) => {

    // indicate which chess is being selected
    const selectedChess = document.querySelector(`.selectedChess`);
    if (selectedChess) {
      selectedChess.classList.remove('selectedChess');
    }
    e.target.classList.add('selectedChess');

    // store the current location into global variable
    theOriginalX = locationX;
    theOriginalY = locationY;

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
  }

  selfCheck = (x,y) => {
    if(x>0 && x<9 && y>0 && y<9) {
      return true;
    }
  }
  // store the ajacent spaces into adjSpaces
  adjSpaceCheck = (x,y) => {
    adjSpaces = [];
    if(x-1>0) {
      adjSpaces.push(`(${x-1},${y})`);
      if(y+1<9){
        adjSpaces.push(`(${x-1},${y+1})`);
      }
      if(y-1>0){
        adjSpaces.push(`(${x-1},${y-1})`);
      }
    }

    if(x+1<9) {
      adjSpaces.push(`(${x+1},${y})`);
      if(y+1<9){
        adjSpaces.push(`(${x+1},${y+1})`);
      }
      if(y-1>0){
        adjSpaces.push(`(${x+1},${y-1})`);
      }
    }

    if(y-1>0) {
      adjSpaces.push(`(${x},${y-1})`);
    }

    if(y+1<9) {
      adjSpaces.push(`(${x},${y+1})`);
    }

    console.log(adjSpaces);

    
  }

  // occupiedCheck to see if the spaces is occupied or not, if not, than make the space valid, if it is occupied, then nothing happend
  occupiedCheck = (array) => {
    array.map((item) => {
      this.setState({
        spaces: this.state.spaces.map((space)=>{
            if(space.location === item){
              // console.log(space);
              if(space.isOccupied === false) {
                // validPath.push(space);
                space.isValidPath = true;
                space.className = `chess isValidPath`;
              }
            }
            return space
        })
      })
    })
  }

  nextPossbileMoveCheck = (array, x, y) => {
    let nextPossbileMove = [];
    array.map((item) => {
      if(item === `(${x-1},${y-1})`){
        nextPossbileMove.push(`(${x-2},${y-2})`)
      }else if(item === `(${x-1},${y})`){
        nextPossbileMove.push(`(${x-2},${y})`)
      }else if(item === `(${x-1},${y+1})`){
        nextPossbileMove.push(`(${x-2},${y+2})`)
      }else if(item === `(${x+1},${y})`){
        nextPossbileMove.push(`(${x+2},${y})`)
      }else if(item === `(${x+1},${y+1})`){
        nextPossbileMove.push(`(${x+2},${y+2})`)
      }else if(item === `(${x+1},${y-1})`){
        nextPossbileMove.push(`(${x+2},${y-2})`)
      }else if(item === `(${x},${y-1})`){
        nextPossbileMove.push(`(${x},${y-2})`)
      }else if(item === `(${x},${y+1})`){
        nextPossbileMove.push(`(${x},${y+2})`)
      }
    })

    console.log(`next possible move ${nextPossbileMove}`);
    this.nextValidPathCheck(nextPossbileMove);

  }

  nextValidPathCheck = (array) => {
    let nextValidPath = [];
    let adjOccupiedSpaces = [];

    array.map((item) => {
      this.setState({
        spaces: this.state.spaces.map((space)=>{
            if(space.location === item){
              // console.log(space);
              if(space.isOccupied === false) {
                nextValidPath.push(space);
                space.isValidPath = true;
                space.className = `chess isValidPath`;
              }
            }
            return space
        })
      })
    })

    nextValidPath.forEach((item)=> {
      this.adjSpaceCheck(item); /*this will return back a new array of adjSpaces[]*/
      // for the new check if the spaces in the ajacent spaces is occupied or not, if it's not occuppied, than make it valid, if it's occupied, position the next possible move
      adjSpaces.map((item) => {
        this.setState({
          spaces: this.state.spaces.map((space)=>{
              if(space.location === item){
                // console.log(space);
                if(space.isOccupied === true) {
                  adjOccupiedSpaces.push(item);
                }
              }
              return space
          })
        })
        this.nextPossbileMoveCheck(adjOccupiedSpaces,parseInt(item.slice(1,1)), parseInt(item.slice(3,1)));
      })
    })

    

  }

  
  validPathCheck = (x,y) => {
      
      let adjOccupiedSpaces = [];

      this.adjSpaceCheck (x, y);
      
      // check if the spaces in the ajacent spaces is occupied or not, if it's not occuppied, than make it valid, if it's occupied, position the next possible move
      adjSpaces.map((item) => {
          this.setState({
            spaces: this.state.spaces.map((space)=>{
                if(space.location === item){
                  // console.log(space);
                  if(space.isOccupied === false) {
                    // validPath.push(space);
                    space.isValidPath = true;
                    space.className = `chess isValidPath`;
                  }else{
                    adjOccupiedSpaces.push(item);
                  }
                }
                return space
            })
          })
      })

      console.log(adjOccupiedSpaces);

      this.nextPossbileMoveCheck(adjOccupiedSpaces,x,y);
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
