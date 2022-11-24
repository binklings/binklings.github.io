 let user = sessionStorage.getItem("name");
 const btn = document.querySelector('[value="write"]');
 let str = '', time;
 let index = 0;
 btn.addEventListener('click', function () {
     let arr1 = JSON.parse(localStorage.getItem('comment'));
     if (arr1 instanceof Array && arr1.length) {
         index = arr1[arr1.length - 1].id + 1;
     } else {
         arr1=[];
         index = 1;
     }
     str = txt.value;
     if (str) {
         time = date();
         let obj = {
             id: index,
             "time": time,
             "name": user,
             "content": str
         }
         arr1.push(obj);
         localStorage.setItem('comment', JSON.stringify(arr1));
         render();
         txt.value = '';
     }
 })
 message.addEventListener('click', function (event) {
     if (event.target.innerText == '删除') {
         let id = event.target.dataset.id;
         let arr1 = JSON.parse(localStorage.getItem('comment'));
         let result = arr1.filter(item => item.id != id);
         localStorage.setItem('comment', JSON.stringify(result));
         render() 
     }
 })
 function render() {
     message.innerHTML='';
     let arr1 = JSON.parse(localStorage.getItem('comment'));
     for (let item of arr1) {
         let div = document.createElement(`div`);
         div.innerHTML = ` <div class='top'><span>${item.name}</span> <span>${item.time}</span></div>`;
         div.innerHTML += ` <div class='top'><span>${item.content}</span> <button data-id=${item.id} >删除</button></div>`; 
         message.appendChild(div);
     }
 }
 render();
 function date() {
     let myDate = new Date()
     return `${myDate.toLocaleDateString()} ${mytime = myDate.toLocaleTimeString()}`
 }