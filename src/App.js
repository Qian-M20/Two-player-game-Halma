import React, {Component, useEffect} from 'react';
import './App.css';
import io from 'socket.io-client';

// define variable for game playing process
let distanceX;
let distanceY;
let theOriginalX;
let theOriginalY;
let theMoveToX;
let theMoveToY;
let occupiedSpaces=[];
let adjSpaces = [];
let nextValidPath = [];
let greenWins = false;
let blackWins = false;
let activeChesses;
let nonActiveChesses;
let playerRole;
let socket; 
const endPoint = 'https://react-game-halma.herokuapp.com/';
socket= io(endPoint);




class App extends Component {

  constructor (props){
    super(props);
    this.state = {
      spaces:[],
      chesses:[],
      zones:[],
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
    let zones =[];
    for (let y=1; y<5; y++) {
      for (let x=1; x<(6-y); x++){

        // set up the zones for green area
        zones.push({
          key: `zone-${x}-${y}`,
          // the locationX and locationY needs to be dynamically changed
          className: `zone greenZone`,
          locationX: x,
          locationY: y,
          currentX: x,
          currentY: y,
          style:{
            width:`9vh`,
            height:`9vh`,
            margin: `0 auto`,
            backgroundColor: "#B2D977",
            zIndex:0,
            top: `${(y-1)*10+0.5}vh`,
            left: `${(x-1)*10+0.5}vh`,
            position:`absolute`,
          }
        });

        // set up the chesses for green area
        chesses.push({
          key: `chess-${x}-${y}`,
          // the locationX and locationY needs to be dynamically changed
          isSelected:false,
          isMoved:false,
          className: `chess Green`,
          value:'Green',
          OppoValue:'Black',
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
            zIndex:3,
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

        zones.push({
          key: `zone-${x}-${y}`,
          // the locationX and locationY needs to be dynamically changed
          className: `zone blackZone`,
          locationX: x,
          locationY: y,
          currentX: x,
          currentY: y,
          style:{
            width:`9vh`,
            height:`9vh`,
            margin: `0 auto`,
            backgroundColor: "#8C8C8C",
            zIndex:0,
            top: `${(y-1)*10+0.5}vh`,
            left: `${(x-1)*10+0.5}vh`,
            position:`absolute`,
          }
        });

        chesses.push({
          key: `chess-${x}-${y}`,
          // the locationX and locationY needs to be dynamically changed
          className: `chess Black`,
          isMoved:false,
          isSelected:false,
          value:`Black`,
          OppoValue:'Green',
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
            zIndex:3,
            top: `${(y-1)*10+0.5}vh`,
            left: `${(x-1)*10+0.5}vh`,
            position:`absolute`,
            // transformOrigin: `(${locationX}-1)vh ${(locationY-1)*10}vh`
            transformOrigin: `${(x-1)*10}vh ${(y-1)*10}vh`
          }
        })
      }
    }
    return {chesses,zones};
  }

  chessMoveTo = (locationX, locationY, isValidPath) => (e) => {
      // change the instruction text 
    const instruTitle = document.querySelector('.instruTitle');
    instruTitle.innerHTML = 
    `<p>Click the chess to see the valid path<p>`;

      // if the space is valid, get the x and y distance and file the animation event
      theMoveToX = locationX;
      theMoveToY = locationY;
      distanceX = (theMoveToX - theOriginalX)*10;
      distanceY = (theMoveToY - theOriginalY)*10;
      const selectedChess = document.querySelector(`.selectedChess`);
      if (selectedChess) {
        // find out if the clicked space is valid
        if (isValidPath === true) {
          socket.emit('chessMove', {
            id: selectedChess.id,
            distanceX:distanceX,
            distanceY:distanceY,
            newLocationX: theMoveToX,
            newLocationY: theMoveToY
          });

          selectedChess.classList.remove('selectedChess');
            // change the state of the selected Chess, so that the caculation of valid spaces points can be updated
          this.setState({
            chesses: this.state.chesses.map((chess)=>{
              chess.isMoved = false;
              if(chess.isSelected === true){
                chess.currentX = locationX;
                chess.currentY = locationY;
                chess.isMoved = true;
              }
              return chess;
            }) 
          });
          
        // update the instruction and disable chesses 
        const instruction = document.querySelector('.instruction');
          // find out the one that's being moved
          this.state.chesses.map((chess)=> {
            if(chess.isMoved === true) {
              instruction.innerHTML = `${chess.OppoValue}'s turn!`;
              activeChesses = `${chess.OppoValue}`;
              nonActiveChesses = `${chess.value}`;
            }
          })

        // update the isValidPath state of spaces
        this.setState({
          spaces: this.state.spaces.map((space)=>{
            space.isValidPath = false;
            space.className = `space`;
            return space;
          })
        });

        // if one chess is moved, disable its group of chess and enable its opponent chesses
        this.setState({
          chesses: this.state.chesses.map((chess) => {
            if(chess.OppoValue === activeChesses){
              chess.className = `chess ${nonActiveChesses} disabled`;
            }else {
              chess.className = `chess ${activeChesses}`;
            }
            return chess;
          })
        })
      }

    } 
    

  }

  selectChess = (key,locationX, locationY, currentX, currentY, value) => (e) => {
    // change the instruction text
    const instruction = document.querySelector('.instruction');
    instruction.innerHTML = `
                            <p>You can move to an adjacent space or jump over a single adjacent piece<p>
                            `;

    const instruTitle = document.querySelector('.instruTitle');
    instruTitle.innerHTML = "Click on the valid space to move your chess";

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
          if(theSpace[0].isOccupied && theSpace[0].value === 'Black') {
            blackBonusPoints ++;
            // console.log(`blackpionts: ${blackBonusPoints}`);

          }
      }
    }

    for (let y=5; y<9; y++) {
      for (let x=8; x>(12-y); x--){
          const theSpace = this.state.spaces.filter( space => space.locationX === x && space.locationY === y);
          // console.log(theSpace);
          if(theSpace[0].isOccupied && theSpace[0].value === 'Green') {
            greenBonusPoints ++;
            // console.log(`greenPoints: ${greenBonusPoints}`);
          }
      }
    }

    if(blackBonusPoints === 10){
        blackWins = true;
        this.gameOver();
        return;
    }

    if(greenBonusPoints === 10){
      greenWins = true;
      this.gameOver();
      return;
    }
    
  }
  
  displayRules() {
    const gameRuleDetail = document.querySelector('.gameRuleDetail');
    const ruleBtn = document.querySelector('.ruleBtn');
    if (gameRuleDetail.style.display === "none") {
      gameRuleDetail.style.display = "block";
      ruleBtn.value = "HIDE RULES";
    } else {
      gameRuleDetail.style.display = "none";
      ruleBtn.value = "GAME RULES";
    }

  }

  gameStart(e) {
    const wallPaper = document.querySelector('.wallPaper');
    const blackWinMsg = document.querySelector('.blackWins');
    const greenWinMsg = document.querySelector('.greenWins');
    const playerConncect = document.querySelector('.player-connect');
    
    blackWinMsg.style.display = 'none';
    greenWinMsg.style.display = 'none';
    playerConncect.style.display = 'none';
    greenWins = false;
    blackWins = false;

    // change the text in the instruction cards
    const instruTitle = document.querySelector('.instruTitle');
    // socket emmit 
    if(e.target.id === 'greenPlayer'){
      playerRole = 'Green';
      socket.emit('gameStart', {
        player: 'green'
      });
      instruTitle.innerHTML = `<p>Your Are Green Player<p>`;
      document.querySelectorAll('.start').forEach((e) => {
          e.style.display = 'none';
      }) 
      document.querySelector('.restart').style.display = 'none';
      // if it's a green player, freeze the black section
      document.querySelectorAll('.Black').forEach((e)=> {
        e.style.pointerEvents = 'none';
      })
    }else {
      playerRole = 'Black';
      socket.emit('gameStart', {
        player: 'black'
      });
      instruTitle.innerHTML = `<p>Your Are Black Player<p>`;
      document.querySelectorAll('.start').forEach((e) => {
          e.style.display = 'none';
      }) 
      document.querySelector('.restart').style.display = 'none';
      // if it's a black player, freeze the green section
      document.querySelectorAll('.Green').forEach((e)=> {
          e.style.pointerEvents = 'none';
      })
    }
    
  }

  gameOver() {
    const wallPaper = document.querySelector('.wallPaper');
    const blackWinMsg = document.querySelector('.blackWins');
    const greenWinMsg = document.querySelector('.greenWins');
    const restart = document.querySelector('.restart');

    wallPaper.style.display = 'flex';
    restart.style.display = 'block';

    document.querySelectorAll('.start').forEach((e) => {
      e.style.display = 'none';
    }) 

    if (blackWins) {
      blackWinMsg.style.display = 'block';
    }
    if (greenWins) {
      greenWinMsg.style.display = 'block';
    }

  }

  gameRestart() {
    window.location.reload(false);
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

    // initilize the content in instruction card
    const ruleBtn = document.querySelector('.ruleBtn');
    ruleBtn.value = "GAME RULES";

    const instruction = document.querySelector('.instruction');
    instruction.innerHTML = "";

    const instruTitle = document.querySelector('.instruTitle');
    instruTitle.innerHTML = 
    `<p>Let's Play Halma! <p>`;

    // listerning to socket events -- chess moving 
    socket.on('chessMove', this.handleMove);

    // listerning to socket events -- rival player enter
    socket.on('player-connect', this.playConnect);
    
    // listerning to socket events -- rival player left
    socket.on('player-disconnect', this.playDisconnect);

    // listerning to socket events -- freezeScreen
    socket.on('freezeScreen', this.freezeScreen);

    // listerning to socket events -- unfreezeScreen
    socket.on('unFreezeScreen', this.unFreezeScreen);

    // listerning to socket events -- informRole
    socket.on('informRole', this.informRole);
    
  }

/********************************* define socket events ********************************************************/
handleMove = (data) => {
  document.querySelectorAll(`.chess`).forEach((chess) => {
      chess.style.boxShadow = "none";
  })

  document.querySelector(`#${data.id}`).style.transform = "translate3d(" + data.distanceX + "vh, " + data.distanceY + "vh, 0)";
  document.querySelector(`#${data.id}`).style.boxShadow = "0px 0px 10px 10px orange";
  console.log('moved');
  this.setState({
        chesses: this.state.chesses.map((chess)=>{
          chess.isMoved = false;
          if(chess.key == data.id){
            chess.currentX = data.newLocationX;
            chess.currentY = data.newLocationY;
            chess.isMoved = true;
            const instruction = document.querySelector('.instruction');
            instruction.innerHTML = `${chess.OppoValue}'s turn!`;
            activeChesses = `${chess.OppoValue}`;
            nonActiveChesses = `${chess.value}`;
          }
          return chess;
        }) 
  });

  this.setState({
    chesses: this.state.chesses.map((chess) => {
      if(chess.OppoValue === activeChesses){
        chess.className = `chess ${nonActiveChesses} disabled`;
      }else {
        chess.className = `chess ${activeChesses}`;
      }
      return chess;
    })
  });

}

  playConnect = () => {
    document.querySelector('.player-connect').innerHTML = 'The room has two players, ready to start the game';
    document.querySelector('.blackPlayer').style.pointerEvents = 'auto';
    document.querySelector('.greenPlayer').style.pointerEvents = 'auto';
  }


  playDisconnect = () => {
    document.querySelector('.player-connect').style.display = 'block';
    document.querySelector('.player-connect').innerHTML = 'Your partner player left the room... game stopped';
    document.querySelector('.wallPaper').style.display = 'flex';
    document.querySelector('.greenPlayer').style.display = 'none';
    document.querySelector('.blackPlayer').style.display = 'none';
    document.querySelector('.restart').style.display = 'block';
  }

  freezeScreen = ()=> {
    document.querySelector('.wallPaper').style.display = 'flex';
    document.querySelectorAll('.start').forEach((e) => {
        e.style.display = 'none';
    }) 
    document.querySelector('.restart').style.display = 'none';
  }

  unFreezeScreen = ()=> {
    document.querySelector('.wallPaper').style.display = 'none';
    const instruction = document.querySelector('.instruction');
    instruction.style.display = 'block';
    instruction.innerHTML = `${playerRole}'s turn!`;
  }

  informRole = (data) => {
    
    // indicate the opponent user what player option left
    if(data.player == 'green'){
        document.querySelector('.greenPlayer').style.display = 'none';
    }else if (data.player === 'black') {
      document.querySelector('.blackPlayer').style.display = 'none';
    }
  }

  render() {
    let {spaces, chesses, zones} = this.state;
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
      let {key, style, locationX, locationY, currentX, currentY, className, value} = chess;
      let reactDom = <div
          value = {value}
          id = {key}
          key={key}
          className={className}
          onClick={this.selectChess(key,locationX,locationY, currentX, currentY)}
          style={{...style
          }}
        >
          {/* {key} */}
        </div >
      return reactDom;
    })

    let positionZones = zones.map((zone,index)=> { 
      let {key, style, className} = zone;
      let reactDom = <div
          key={key}
          className={className}
          style={{...style
          }}
        >
          {/* {key} */}
        </div >
      return reactDom;
    })

    return (
      <div className="App">
        <div className="wallPaper">
          <h1 className="greenWins">Congrats! Green Wins!</h1>
          <h1 className="blackWins">Congrats! Black Wins!</h1>
          <button id="blackPlayer" className="start blackPlayer" onClick={this.gameStart}>Play As Black</button>
          <button id="greenPlayer" className="start greenPlayer" onClick={this.gameStart}>Play As Green</button>
          <button className="restart wallBtn" onClick={this.gameRestart}>RESTART</button>
        </div>

        <div className="boardWrapper">
          <div className="board">
              {positionSpaces}
              {positionChesses}
              {positionZones}
          </div>
        </div>

        <div className="rule">
            <h1 className="gameTitle">Halma</h1>
            <h3 className="player-connect">Waiting Another Player...</h3>
            <h1 className="instruTitle"></h1>
            <div className="instruction"></div>
            <div className="gameRules">
              <input className="ruleBtn" type="button" onClick={this.displayRules}></input>
            </div>
            <ul className="gameRuleDetail">
              <li>(i) A piece may be moved to an adjacent square, horizontally, vertically or diagonally;</li>
              <li>(ii) A piece may jump over a single adjacent piece of any colour, horizontally, vertically or diagonally, into the empty square beyond. Multiple jump over is allowable, as long as it is consistent.</li>
              <li>(iii) The game is over when a player has moved all of his pieces into his opponent's marked starting positions</li>
            </ul>
        </div>

        
      </div>
    );
  }
  
}

export default App;
