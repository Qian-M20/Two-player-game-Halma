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
let nextValidPath = [];



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
          value:``,
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
          value:'green',
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
            top: `${(y-1)*10+0.5}vh`,
            left: `${(x-1)*10+0.5}vh`,
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
          value:`black`,
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

    // update the isValidPath state of spaces， 每次点击一颗棋子，都要把所有空格的isValidPath先统一改成false
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




  getAdjOccupiedSpaces = (array,x,y) => {
    let adjOccupiedSpaces =[];

    array.map((item) => {
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
    })

    this.nextPossbileMoveCheck(adjOccupiedSpaces,x,y);

  }

  // 传入一组墙内的有可能跳进去的目标点，检查这些目标点是否occupied，把空的格子放到一个数组中nextValidPath,对这个数组内的每个格子，设想他们都是棋子，对他们进行下一轮检测
  nextValidPathCheck = (array) => {
    

    array.map((item)=>{
        this.setState({
          spaces: this.state.spaces.map((space)=>{
              if(space.location === item){
                // console.log(space);
                // 如果空格上没有棋子并且这个空格不是当前已经跳过的路径，那么收入nextValidPath
                if(space.isOccupied === false && !nextValidPath.includes(item)) {
                  nextValidPath.push(item);
                  space.isValidPath = true;
                  space.className = `chess isValidPath`;
                  this.adjSpaceCheck(parseInt(item[1]), parseInt(item[3]));
                  this.getAdjOccupiedSpaces (adjSpaces, parseInt(item[1]), parseInt(item[3]));
                }
              }
              return space
          })
        })
    })

    // console.log(nextValidPath);

  }

  // 传入一组身边的occupied的格子，计算以这些格子为基点，分别怎么跳
  nextPossbileMoveCheck = (array, x, y) => {
    let nextPossbileMove0 = [];
    let nextPossbileMove = [];
    array.map((item) => {
      if(item === `(${x-1},${y-1})`){
        nextPossbileMove0.push(`(${x-2},${y-2})`)
      }else if(item === `(${x-1},${y})`){
        nextPossbileMove0.push(`(${x-2},${y})`)
      }else if(item === `(${x-1},${y+1})`){
        nextPossbileMove0.push(`(${x-2},${y+2})`)
      }else if(item === `(${x+1},${y})`){
        nextPossbileMove0.push(`(${x+2},${y})`)
      }else if(item === `(${x+1},${y+1})`){
        nextPossbileMove0.push(`(${x+2},${y+2})`)
      }else if(item === `(${x+1},${y-1})`){
        nextPossbileMove0.push(`(${x+2},${y-2})`)
      }else if(item === `(${x},${y-1})`){
        nextPossbileMove0.push(`(${x},${y-2})`)
      }else if(item === `(${x},${y+1})`){
        nextPossbileMove0.push(`(${x},${y+2})`)
      }
    })

    // console.log(`next possible move 0 ${nextPossbileMove0}`);

    // 把墙外的可能的点都淘汰，剩下的都是墙内的可能的点
    nextPossbileMove0.forEach((item)=>{
      if(this.selfCheck(parseInt(item[1]), parseInt(item[3]))===true){
        nextPossbileMove.push(item);
      }
    })

    // console.log(`next possible move 1 ${nextPossbileMove}`);

    // 对墙内可能的点，进行occupied排查
    if(nextPossbileMove.length>0) {
      this.nextValidPathCheck(nextPossbileMove)
    }else {
      return;
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

    // console.log(adjSpaces);

    // this.getAdjOccupiedSpaces (adjSpaces, x, y);
  }

  // 在点完棋子后立马运行，而且只运行一次
  validPathCheck = (x,y) => {
      
      let adjOccupiedSpaces = [];

      nextValidPath = [];

      this.adjSpaceCheck (x, y); /*返回adjSpaces[], 不可能是空值 */
      
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

      // console.log(adjOccupiedSpaces);
      // 把附近的occupied的格子储存放到一个数组中，然后计算这颗棋子要以这些格子作为基点分别怎么跳
      if(adjOccupiedSpaces.length>0){
        this.nextPossbileMoveCheck(adjOccupiedSpaces,x,y);
      }else{
        return;
      }
  }


 // check if the space is occupied or not
  checkIfOccupied = () => {
    occupiedSpaces = [];
    this.state.spaces.map((space)=> {
        this.state.chesses.map((chess)=>{
          if(space.locationX === chess.currentX && space.locationY === chess.currentY){
            occupiedSpaces.push(space);
            space.value = chess.value;
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

  // check if we have a winner
  checkIfWinner = () => {
    let blackBonusPoints = 0;
    let greenBonusPoints = 0;

    for (let y=1; y<5; y++) {
      for (let x=1; x<(6-y); x++){
          const theSpace = this.state.spaces.filter( space => space.locationX === x && space.locationY === y);
          // console.log(theSpace);
          if(theSpace[0].isOccupied && theSpace[0].value === 'black') {
            blackBonusPoints ++;
          }
      }
    }

    for (let y=5; y<9; y++) {
      for (let x=8; x>(12-y); x--){
          const theSpace = this.state.spaces.filter( space => space.locationX === x && space.locationY === y);
          // console.log(theSpace);
          if(theSpace[0].isOccupied && theSpace[0].value === 'green') {
            greenBonusPoints ++;
          }
      }
    }

    if(blackBonusPoints === 10){
        console.log('Black wins!');
        return;
    }

    if(greenBonusPoints === 10){
      console.log('Green wins!');
      return;
    }
    
  }

  componentDidMount() {
    this.setState({
      ...this.getSpaces(),
      ...this.getChesses(),
    });

    // update the isOccupied state of spaces constantly
    setInterval(this.checkIfOccupied, 100);

    // check winners constantly
    setInterval(this.checkIfWinner, 100);
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
          {/* {key} */}
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
