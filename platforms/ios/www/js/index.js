/* Chomp
 * Daniel Altschuler
 * December 2014
 *
 */
var canvas;
var ctx; //context for drawing in canvas
var background = '255, 222, 35';
var msound, esound, vsound;

var alpha, start, intervalID, message, showgames, showgameswon, inplay, difficulty;
var transtime = 1000;
var dt = transtime/25;
var alphaincr = 1/25;
var games, gameswon;


var width = 588;
var height = 400;
var cellwidth = 588/7;
var cellheight = 400/5;
var columns = 7;
var rows = 5;

var position; //current position in the game: position[r]=x means x squares left in row r
var lastposition;

//P-positions:
var ppos = ['1',
    '1.1.1.1.5', 
    '1.1.1.2.4', 
    '1.1.1.3.6', 
    '1.1.1.4', 
    '1.1.1.4.7', 
    '1.1.2.2.6', 
    '1.1.2.3.3', 
    '1.1.2.5', 
    '1.1.3', 
    '1.1.3.3', 
    '1.1.3.3.7',
    '1.2', 
    '1.2.2', 
    '1.2.2.2', 
    '1.2.2.2.2', 
    '2.2.2.2.7', 
    '2.2.2.6', 
    '2.2.3.7', 
    '2.2.4', 
    '2.2.5.5', 
    '2.3', 
    '2.3.5', 
    '2.3.5.7', 
    '2.4.4.7', 
    '2.4.6',
    '2.5.7', 
    '3.3.6', 
    '3.3.7.7', 
    '3.4', 
    '3.4.5.7', 
    '3.4.7', 
    '3.5.5', 
    '4.5', 
    '4.5.5.7', 
    '4.7.7', 
    '5.6', 
    '6.7'];

document.addEventListener('deviceready', setup, false);

function setClassProperty(classname, property, value)
{
    var elements = document.getElementsByClassName(classname)
        for (var e=0; e<elements.length; e++)
        {
            elements[e].style[property] = value;
        }
}

function setup()
{
    var small = window.screen.availWidth < 700 ? 2 : 1;
    if (small!==1)
    {
        setClassProperty('score', 'fontSize', '20px');
        setClassProperty('explain', 'fontSize', '12px');
        document.getElementById('intro').style.fontSize = '14px';
        setClassProperty('out', 'padding', '2%');
    }

    canvas = document.getElementById('mycanvas');
    ctx = canvas.getContext('2d');
    msound = document.getElementById('monster');
    esound = document.getElementById('elaugh');
    vsound = document.getElementById('victory');
    
    canvas.addEventListener('touchstart', handleTouchStartEvent, false);
    
    /*
    document.getElementById('start').addEventListener('webkitTransitionEnd', startplaying, false);
    document.getElementById('start').addEventListener('transitionend', startplaying, false);
    document.getElementById('back').addEventListener('webkitTransitionEnd', intro, false);
    document.getElementById('back').addEventListener('transitionend', intro, false);
    */

    message = document.getElementById('message');
    showgames = document.getElementById('games');
    showgameswon = document.getElementById('gameswon');

    canvas.width = width/small;
    canvas.height = height/small;
    cellwidth /= small;
    cellheight /= small;

    if (localStorage.length === 0)
    {
        localStorage.games = '0';
        localStorage.gameswon = '0';
        localStorage.gametype = 'easy';
        localStorage.whichpage = 'intro';
        document.getElementById('geasy').checked = true;
    }
    else 
    {
        showgames.innerHTML = localStorage.games;
        showgameswon.innerHTML = localStorage.gameswon;
        document.getElementById('geasy').checked = localStorage.gametype === 'easy' ? true : false;
        document.getElementById('gexpert').checked = !document.getElementById('geasy').checked;
    }

    games = localStorage.games;
    gameswon = localStorage.gameswon;

    if (localStorage.whichpage !== 'intro') startplaying();
}

function startplaying()
{
    localStorage.whichpage = 'main';
    document.getElementById('main').style.display = 'block';
    document.getElementById('intro').style.display = 'none';

    var ad_units = {
        ios : {
            banner: 'ca-app-pub-2680383731932028/5568652392'        
        },
        android : {
            banner: 'ca-app-pub-2680383731932028/7184986390'
        }
    };
    // select the right Ad Id according to platform
    var admobid = ( /(android)/i.test(navigator.userAgent) ) ? ad_units.android : ad_units.ios;

    if(AdMob) AdMob.createBanner( {
        adId:admobid.banner, 
        adSize:'SMART_BANNER', 
        /*width:320,
        height:100,*/
        overlap:true, 
        position:AdMob.AD_POSITION.BOTTOM_CENTER, 
        isTesting:true,
        autoShow:true} );

    newgame();
}

function intro()
{
    localStorage.whichpage = 'intro';
    AdMob.removeBanner();
    document.getElementById('main').style.display = 'none';
    document.getElementById('intro').style.display = 'block';
}

function newgame()
{
    message.innerHTML = ' ';

    ctx.fillStyle = 'rgb(' + background + ')';
    ctx.fillRect(0, 0, width, height);

    var img = new Image();
    img.addEventListener("load", function()
    {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }, false);
    img.src = 'img/grillechoc.png';

    position = [];
    for (var r=0; r<rows; r++) position[r]=columns;

    lastposition = position;
    inplay = true;

    var gametype = document.getElementById('geasy').checked;

    if ((localStorage.gametype === 'easy') !== gametype)
    {
        localStorage.games = '0';
        localStorage.gameswon = '0';
        games = 0;
        gameswon = 0;
        showgames.innerHTML = localStorage.games;
        showgameswon.innerHTML = localStorage.gameswon;
    }

    localStorage.gametype = gametype ? 'easy' : 'expert';
    difficulty = gametype ? 12 : rows*columns;
}

function handleTouchStartEvent(e)
{
    var touchX = e.touches[0].pageX;
    var touchY = e.touches[0].pageY;

    var canvasRect = canvas.getBoundingClientRect();
    var canvastop = canvasRect.top;
    var canvasbottom = canvasRect.bottom;
    var canvasleft = canvasRect.left;
    var canvasright = canvasRect.right;

    if (touchX >= canvasleft && touchX <= canvasright && touchY >= canvastop && touchY <= canvasbottom)
    {
        var cellx = Math.floor((touchX - canvasleft)/cellwidth);
        var celly = Math.floor((touchY - canvastop)/cellheight);

        play(cellx, celly);

    }

function play(x, row)
//row is between 0 (top) and 4 (bottom)
//x is between 0 (left) and 6 (right)
{
    //user plays (chop the chocolate tablet)
    if (x < position[row] && inplay && (x!==0 || row!==4)) 
    //check that we are chopping where there is some chocolate left
    {
        for (var r=0; r <= row; r++) if (position[r]>x) position[r] = x;

        draw();
        var z;
        
        position = findmove();  //machine plays, update position
        for (z=0; z<rows && position[z]===0; z++) {};
        if (z===rows)
        {
            message.innerHTML = 'You won!';
            playAudio(vsound);
            inplay = false;
            games++;
            gameswon++;
            localStorage.games = games.toString();
            localStorage.gameswon = gameswon.toString();
            showgames.innerHTML = games;
            showgameswon.innerHTML = gameswon;
            lastposition = position;
        }
        else
        {
            if (z===rows-1 && position[rows-1]===1)
            {
                message.innerHTML = 'You lose!';
                playAudio(esound);
                inplay = false;
                games++;
                localStorage.games = games.toString();
                showgames.innerHTML = games;
            }
            else
            {
                playAudio(msound);
                draw(); //draw the new position
            }
        }
    }
}

function playAudio(audioElement) {
    //var audioElement = document.getElementById(id);
    var url = audioElement.getAttribute('src');
    if (window.navigator.userAgent.indexOf('Android')!==-1) {
        url = '/android_asset/www/' + url;
    }
    var my_media = new Media(url,
            // success callback
             function () {},
            // error callback
             function (err) {},
             //status change
             function (status)
             {
                if (status === Media.MEDIA_STOPPED)
                {
                    my_media.release();
                }
             }
    );
           // Play audio
    my_media.play();
    //my_media.release();
}

function draw() //erase the chopped chocolate
{
    var maxdiff = 1;
    for (var r=0; r<rows; r++)
    {
        ctx.fillStyle = 'rgb(' + background + ')';
        ctx.fillRect(lastposition[r]*cellwidth, r*cellheight, (columns - lastposition[r])*cellwidth, cellheight);
        var diff = lastposition[r] - position[r];
        if (diff>maxdiff) maxdiff = diff;
    }

    alpha = 0.0;
    intervalID = window.setInterval(alphadraw, maxdiff*dt);
    start = new Date();

}

function alphadraw()
{
    var time = new Date();
    if (time-start >= dt)
    {
        start = time;
        ctx.fillStyle = 'rgba(' + background + ',' + (alpha*alpha) + ')';

        ctx.beginPath();
        for (var r=0; r<rows; r++)
        {
            ctx.rect(position[r]*cellwidth-1, r*cellheight, (lastposition[r] - position[r])*cellwidth+1, cellheight);
        }
        ctx.fill();
        ctx.closePath();

        if (alpha >= 1.0)
        {
            window.clearInterval(intervalID);
            lastposition = position;
        }
        alpha += alphaincr;
    }
}

function findmove()
//returns the next position
{
    //first, generate all legal moves from current position
    var moves = [];
    for (var q=1; q <= rows; q++)
    {
        var tail = [];
        for (var i=q; i<rows; i++) tail.push(position[i]);

        for (var j=0; j<position[q-1]; j++)
        {
            var move = [];
            for (var p=0; p<q; p++)
            {
                if (j >= position[p]) move.push(position[p]); else move.push(j);
            }
            move = move.concat(tail);
            moves.push(move);
        }
    }

    //count how many squares are left
    var squares = 0;
    for (var r=0; r<rows; r++) squares += position[r];

    //look for the P-positions among the moves
    var wmoves = [];
    var zindex;
    for (var m=0; m<moves.length; m++)
    {
        var move = moves[m];
        var r;
        for (r=0; r<move.length && move[r]===0; r++) {};
        if (r<move.length)
        {
            var packedmove = move.slice(r, move.length).join('.');
            for (var p=0; p<ppos.length; p++)
                if (packedmove===ppos[p] && squares<=difficulty) wmoves.push(move);
        }
        else zindex = m; //store index of move to [0, 0, 0, 0, 0]
    }

    var selection, index;
    if (wmoves.length>0) //if there is a winning move,
        selection = wmoves[Math.floor(wmoves.length*Math.random())]; //take it,
    else
        if (moves.length>1) //else if there is more than one move,
        {
            do index = Math.floor(moves.length*Math.random()); while (index === zindex);
            selection = moves[index]; //choose one which is not the ending move
        }
        else selection = moves[zindex] //if there's just one move, user has won.

    return selection;
}
}

