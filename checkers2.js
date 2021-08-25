//הגדרת משבצות ממליכות
let redEnthroneSquares = [];
let blackEnthroneSquares = [];
for (let i=1; i<8; i+=2){
    redEnthroneSquares.push(i);
    blackEnthroneSquares.push(63-i);
}

//סידור ראשוני של הלוח
const board = document.getElementById('board');
let pieces = [];
let k=0;
for(let i = 0; i < 64; i++){
    let isDarkSquare = (i+k)%2===1 ? true : false;
    let square = document.createElement('div');
    board.appendChild(square);
    square.setAttribute('id',i);
    square.classList.add (isDarkSquare ? 'darkSquare' : 'brightSquare');
    if (isDarkSquare){
        let piece = document.createElement('div');
        if(i<24)
            insertPiece(square, piece, 'blackPiece', -1, false);
        else if(i>39)
            insertPiece(square, piece, 'redPiece', -1, false);
        else
            pieces.push({
                color: null,
                king: false
            });
    }
    else
        pieces.push(null);
    if ((1+i)%8===0) k++;
}

//הצבת כלי המשחק על משבצות הלוח ובבסיס הנתונים
function insertPiece(square, piece, type, destination, isKing) {
    square.appendChild(piece);
    piece.setAttribute('id',type);
    piece.className = type;
    for (let redEnthroneSquare of redEnthroneSquares){
        if(redEnthroneSquare===destination && type==='redPiece'){
            isKing = true;
            piece.className = 'redCrownhead';
        }
    }
    for (let blackEnthroneSquare of blackEnthroneSquares){
        if(blackEnthroneSquare===destination && type==='blackPiece'){
            isKing = true;
            piece.className = 'blackCrownhead';
        }
    }
    if(pieces.length<64){
        pieces.push({
            color: type,
            king: isKing
        })
    }
    else{
        pieces[destination].color = (redTurn ? 'redPiece' : 'blackPiece');
        pieces[destination].king = isKing;
    }
}

//מהלך המשחק
let redTurn = true;
let firstClick = true;
let multiJump = false;
let kingMove = false;
let chosenPiece = null;
let destination = null;
let outlinedPiece = null;
let outlinedPositions = [];

const darkSquares = document.querySelectorAll('.darkSquare');
for(let darkSquare of darkSquares){
    darkSquare.addEventListener('click', ()=>{
        play(parseInt(darkSquare.id))
    })
}

function play(chosenSquare){
    changeDecision(chosenSquare)
    choosePiece(chosenSquare)
    makeAMove(chosenSquare)
    if(firstClick && (pieces[chosenPiece].color===null || pieces[chosenPiece].color===(redTurn ? 'blackPiece' : 'redPiece')));
    else if(!multiJump)
        firstClick = firstClick ? false : true;
}

function choosePiece(chosenSquare){
    if(firstClick){
        chosenPiece = chosenSquare;
        let canEatList = [];
        if(pieces[chosenPiece]!==null && pieces[chosenPiece].color===(redTurn ? 'redPiece' : 'blackPiece')){
            capturingPossibilities(canEatList)
            //סמן את האבן הנבחרת
            document.getElementById(chosenPiece).children[0].classList.add('chosenPiece');
            outlinedPiece = chosenPiece;
            outlinePossibilities(canEatList)
        }
    }
}

//מתן אפשרות לשחקן להחליף בחירה אחרי הקליק הראשון
function changeDecision(chosenSquare) {
    if(!firstClick){
        destination = chosenSquare;
        if(pieces[destination]!==null && pieces[destination].color===(redTurn ? 'redPiece' : 'blackPiece')){
            firstClick = true;
            removeOutlines();
            if(multiJump){
                redTurn = redTurn ? false : true;
                multiJump = false;
            }
            kingMove = false;
        }
    }        
}

//חיפוש אחר אפשרויות אכילה
function capturingPossibilities(canEatList){
    let piecesOfKind = (redTurn ? collectDarkSquaresWithPiecesOfKind('redPiece') : collectDarkSquaresWithPiecesOfKind('blackPiece'));
    for(let piece of piecesOfKind){
        let result = (redTurn ? canEatIdentifire(getLeftUpperSquare(piece), -9) : canEatIdentifire(getLeftLowerSquare(piece), 7));
        if (result!==undefined)
            canEatList.push(result);
        result = (redTurn ? canEatIdentifire(getRightUpperSquare(piece), -7) : canEatIdentifire(getRightLowerSquare(piece), 9));
        if (result!==undefined)
            canEatList.push(result);
        if(pieces[piece].king===true){
            let result = (redTurn ? canEatIdentifire(getLeftLowerSquare(piece), 7) : canEatIdentifire(getLeftUpperSquare(piece), -9));
            if (result!==undefined)
                canEatList.push(result);
            result = (redTurn ? canEatIdentifire(getRightLowerSquare(piece), 9) : canEatIdentifire(getRightUpperSquare(piece), -7));
            if (result!==undefined)
                canEatList.push(result);
        }
    }
}

function outlinePossibilities(canEatList){    
    if(pieces[chosenPiece].king===true){//סמן את האפשרויות החוקיות למהלך של מלך
        kingMove = true;
        addOutline(getLeftUpperSquare(chosenPiece), -9, canEatList);
        addOutline(getLeftLowerSquare(chosenPiece), 7, canEatList);
        addOutline(getRightUpperSquare(chosenPiece), -7, canEatList);
        addOutline(getRightLowerSquare(chosenPiece), 9, canEatList);
    }
    else{//סמן את האפשרויות החוקיות למהלך של כלי רגיל
        redTurn ? addOutline(getLeftUpperSquare(chosenPiece), -9, canEatList) : addOutline(getLeftLowerSquare(chosenPiece), 7, canEatList);
        redTurn ? addOutline(getRightUpperSquare(chosenPiece), -7, canEatList) : addOutline(getRightLowerSquare(chosenPiece), 9, canEatList);
    }
}

//אפשרויות למהלך לאחר בחירת כלי
function makeAMove(chosenSquare){
    if(!firstClick){
        destination = chosenSquare;
        let isOutlined = false;
        for(let outline of outlinedPositions){
            if(outline===destination)
                isOutlined = true;
        }
        if(isOutlined){//במקרה בו נבחרה משבצת יעד עם מהלך חוקי
            let piece = document.createElement('div');//העברת הכלי למקומו החדש והסרת הדגשת המשבצות המודגשות
            insertPiece(document.getElementById(destination), piece, redTurn ? (kingMove ? 'redCrownhead' : 'redPiece') : (kingMove ? 'blackCrownhead' : 'blackPiece'), destination, kingMove)
            removePiece(chosenPiece)
            outlinedPiece = null;
            removeOutlines();
            removeCapturedPiece(piece);
            if(!multiJump){
                redTurn = redTurn ? false : true;
                kingMove = false;
            }
        }//במקרה בו נבחרה משבצת יעד עם מהלך לא חוקי
        else{
            removeOutlines();
            if(multiJump){
                redTurn = redTurn ? false : true;
                multiJump = false;
            }
            kingMove = false;
        }
    }
}

//הסרת כלי אכול
function removeCapturedPiece(piece){
    multiJump = false;
    let captured = false;
    captured = capturePiece(destination, chosenPiece, -9, captured);
    captured = capturePiece(destination, chosenPiece, -7, captured);
    captured = capturePiece(destination, chosenPiece, 9, captured);
    captured = capturePiece(destination, chosenPiece, 7, captured);
    captureAgain(captured, piece)
}

//פתיחת אפשרות לאכילה מרובה
function captureAgain(captured, piece){
    if(captured){
        if(kingMove){
            multiJumping(getLeftUpperSquare(destination), -9);
            multiJumping(getLeftLowerSquare(destination), 7);
            multiJumping(getRightUpperSquare(destination), -7);
            multiJumping(getRightLowerSquare(destination), 9);
        }
        else{
            redTurn ? multiJumping(getLeftUpperSquare(destination), -9) : multiJumping(getLeftLowerSquare(destination), 7);
            redTurn ? multiJumping(getRightUpperSquare(destination), -7) : multiJumping(getRightLowerSquare(destination), 9);
        }
        if(outlinedPositions.length>0){
            piece.classList.add('chosenPiece');
            outlinedPiece = destination;
            multiJump = true;
        }
        chosenPiece = destination;
    }
}

//זיהוי אפשרות אכילה
function canEatIdentifire(diagonalSquare, gap) {
    if(pieces[diagonalSquare]!==null && pieces[diagonalSquare].color===(redTurn ? 'blackPiece' : 'redPiece')){
        let eatOption = (diagonalSquare+gap>0 && diagonalSquare+gap<64) ? diagonalSquare+gap : 0;
        if(pieces[eatOption]!==null && pieces[eatOption].color===null)
            return eatOption;
    }
}

//סימון משבצות קרובות
function addOutline(diagonalSquare, gap, canEatList) {
    if(pieces[diagonalSquare]!==null){
        if(pieces[diagonalSquare].color===null && canEatList.length===0){
            document.getElementById(diagonalSquare).classList.add('outline');
            outlinedPositions.push(diagonalSquare);
        }
        else
            addDistantOutline(diagonalSquare, gap)
    }
}

//סימון משבצות רחוקות
function addDistantOutline(diagonalSquare, gap) {
    if(pieces[diagonalSquare]!==null){
        if(pieces[diagonalSquare].color===null);
        else if(pieces[diagonalSquare].color===(redTurn ? 'blackPiece' : 'redPiece')){
            diagonalSquare = (diagonalSquare+gap>0 && diagonalSquare+gap<64) ? diagonalSquare+gap : 0;
            if(pieces[diagonalSquare]!==null && pieces[diagonalSquare].color===null){
                document.getElementById(diagonalSquare).classList.add('outline');
                outlinedPositions.push(diagonalSquare);
            }
        }
    }
}

//הסרת חלק 
function removePiece(location) {
    document.getElementById(location).removeChild(document.getElementById(location).children[0]);
    pieces[location] = {
        color: null,
        king: false
    }
}

//הסרת חלק אכול
function capturePiece(chosenDestination, chosenPiece, gap, captured) {
    if(chosenPiece-chosenDestination===gap*2){
        removePiece(chosenDestination+gap)
        captured = true;
    }
    return captured;
}

//אפשרות אכילה ברצף
function multiJumping(diagonalSquare, gap) {
    if(pieces[diagonalSquare]!==null && pieces[diagonalSquare].color===redTurn ? 'blackPiece' : 'redPiece')
        addDistantOutline(diagonalSquare, gap);
}

//לחיצה על משבצת לבנה מבטלת בחירה
const brightSquares = document.querySelectorAll('.brightSquare');
for( let brightSquare of brightSquares){
    brightSquare.addEventListener('click', ()=>{
        removeOutlines()
        firstClick = true;
        kingMove = false;
        if(multiJump){
            redTurn = redTurn ? false : true;
            multiJump = false;
        }
    })
}

//מציאת המשבצות שבאלכסון למשבצת נבחרת
function getLeftUpperSquare(location) {
    return (location-9>0 ? location-9 : 0);
}
function getRightUpperSquare(location) {
    return (location-7>0 ? location-7 : 0);
}
function getLeftLowerSquare(location) {
    return (location+7<64 ? location+7 : 0);
}
function getRightLowerSquare(location) {
    return (location+9<64 ? location+9 : 0);
}

//יצירת מערך עם כלל המשבצות המכילות כלים מצבע נבחר
function collectDarkSquaresWithPiecesOfKind(kindOfPiece) {
    let piecesOfKind = [];
    for(let piece of pieces){
        if(piece!==null && piece.color===kindOfPiece)
            piecesOfKind.push(pieces.indexOf(piece));
    }
    return piecesOfKind;
}

//הסרת הדגשות מהחלק הנבחר והמשבצות המסמנות מהלך חוקי
function removeOutlines() {
    if(outlinedPiece!==null){
        document.getElementById(outlinedPiece).children[0].classList.remove('chosenPiece');
        outlinedPiece = null;
    }
    for(let outline of outlinedPositions){
        document.getElementById(outline).classList.remove('outline');
    }
    outlinedPositions = [];
}
