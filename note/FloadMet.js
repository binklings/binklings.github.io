toast_text = ''
function toast1(text){
 toast_text = text
 setTimeout('showToast()',10)
}

toastNow = false
function showToast() {
if(toastNow==false){
toastNow = true
toast = document.createElement('div');
toast.style.width = '22rem';
toast.style.height = '1.2rem';
toast.style.fontSize = "1.06rem";
toast.style.backgroundColor = '#EEE8F4';
toast.style.borderRadius = '0.6rem';
toast.style.position = 'fixed';
toast.style.bottom = '1.66rem';
toast.style.left = '50%';
toast.style.transform = 'translate(-50%, -50%)';
toast.style.opacity = 0;
toast.innerHTML = toast_text
toast.align = 'center'
toast.style.padding = '10px'
toast.style.color = 'black'

setTimeout(function(){
 document.body.appendChild(toast)
 fadeIn(toast, 10);
},10)

function fadeIn(elem, speed) {
let op = 0.01;
elem.style.opacity = op;

let timer = setInterval(function () {
if (op >= 1) {
clearInterval(timer);
setTimeout(function(){
 desToast()
},1500)
}
elem.style.opacity = op;
op = op + 0.02;
}, 1);
}
}else{
desToastNow()
}
return true
}

function desToast(){
 let op = 1;
 let timer = setInterval(function () {
 if (op <= 0) {
 clearInterval(timer);
 document.body.removeChild(toast)
 toastNow = false
 }
 toast.style.opacity = op;
 op = op - 0.02;
 }, 1);
 return true
}

function desToastNow(){
 let op = 1;
 let timer = setInterval(function () {
 if (op <= 0) {
 clearInterval(timer);
 document.body.removeChild(toast)
 toastNow = false
 showToast()
 }
 toast.style.opacity = op;
 op = op - 0.05;
 }, 1);
 return true
}





function showAlert(mode,href) {
fullScreenDiv = document.createElement('div');
fullScreenDiv.style.position = 'fixed';
fullScreenDiv.style.zIndex = '3';
fullScreenDiv.style.top = 0;
fullScreenDiv.style.left = 0;
fullScreenDiv.style.width = '100%';
fullScreenDiv.style.height = '100%';
fullScreenDiv.style.background = 'rgba(0, 0, 0, 0.5)';
fullScreenDiv.style.display = 'none';

var whiteDiv = document.createElement('div');
whiteDiv.style.width = '300px';
whiteDiv.style.height = '200px';
whiteDiv.style.backgroundColor = '#EEE8F4';
whiteDiv.style.borderRadius = '10px';
whiteDiv.style.position = 'absolute';
whiteDiv.style.top = '50%';
whiteDiv.style.left = '50%';
whiteDiv.style.transform = 'translate(-50%, -50%)';
whiteDiv.style.opacity = 0;
whiteDiv.style.fontSize = '20px'
whiteDiv.align = 'center'
fullScreenDiv.appendChild(whiteDiv);

var iframe = document.createElement('iframe');
iframe.src = href
iframe.style.width = '100%';
iframe.style.height = '100%';
iframe.style.border = 'none'
iframe.style.borderRadius = '10px';
var iitv = setInterval(()=>{
  if(iframe.contentWindow.location.href.includes('#deleted')){
    var articleBtnTs = document.getElementsByClassName('articleBtnT');
    for(i=0;i<articleBtnTs.length;i++){
      if(articleBtnTs[i].textContent==href.split('?name=')[1]){
        articleBtnTs[i].parentElement.remove();
      }
    }
    desAlert()
  }else if(iframe.contentWindow.location.href.includes('#ren')){
    var articleBtnTs = document.getElementsByClassName('articleBtnT');
    for(i=0;i<articleBtnTs.length;i++){
      if(articleBtnTs[i].textContent==href.split('?name=')[1]){
        articleBtnTs[i].parentElement.remove();
      }
    }
    document.getElementById('noteList').innerHTML += `<div class="articleBtn"><h3 onclick="loadNewPage('`+iframe.contentWindow.location.href.split('#ren')[1]+`', 'Edit')" style="display: inline-block; padding: 0.3em; width: 100%" class="articleBtnT">`+iframe.contentWindow.location.href.split('#ren')[1]+`</h3><div onclick="setNote('`+iframe.contentWindow.location.href.split('#ren')[1]+`')" class="set" align="center"><h3>&#9776;</h3></div></div>`;
    setTimeout(desAlert, 100);
    clearInterval(iitv);
  }
}, 200)

var close = document.createElement('button');
close.style.position = 'absolute';
close.style.backgroundColor = 'rgba(24, 36, 80, 0.9)';
close.style.color = 'white';
close.style.top = '0px'
close.style.left = '250px'
close.style.width = '50px'
close.style.height = '35px'
close.style.border = 'none'
close.style.borderRadius = '5px';
close.innerHTML = '<b>X</b>'
close.onclick = function(){
  desAlert();
}

if(mode==0){
whiteDiv.appendChild(iframe)
}else{
whiteDiv.innerHTML = '</br>'+href
}
whiteDiv.appendChild(close)

setTimeout(function(){
 document.body.appendChild(fullScreenDiv)
 fadeIn(whiteDiv, fullScreenDiv, 10);
 fullScreenDiv.style.display = 'block';
},10)

function fadeIn(elem, elem2, speed) {
let op = 0.01;
elem.style.opacity = op;
elem2.style.opacity = op;

let timer = setInterval(function () {
if (op >= 1) {
clearInterval(timer);
}
elem.style.opacity = op;
elem2.style.opacity = op;
op = op + 0.02;
}, 1);
}
return whiteDiv
}

function desAlert(){
  let op = 1;
  let timer = setInterval(function () {
    if (op <= 0) {
      clearInterval(timer);
      document.body.removeChild(fullScreenDiv)
    }
    fullScreenDiv.style.opacity = op;
    op = op - 0.02;
  }, 1);
  return true
}