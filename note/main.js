function convertCodeBlocksToTextarea(markdownString) {
  const codeBlockRegex = /```(\w+)\n([\s\S]*?)\n```/g;
  let match;
  let result = markdownString;

  while ((match = codeBlockRegex.exec(markdownString)) !== null) {
    const language = match[1];
    const code = match[2];

    const textarea = '\`\`\`' + language + `<textarea data-language="${language}" class="codeEditor">${code}</textarea>\`\`\``;
    result = result.replace(match[0], textarea);
  }

  return result;
}


function markdownToHtmlWithOriginal(markdown) {
    // Escape HTML characters
    let html = markdown.replace(/&/g, "&amp;")
                       .replace(/</g, "&lt;")
                       .replace(/>/g, "&gt;");

    // Convert headers
    html = html.replace(/^###### (.*$)/gim, '<h6>###### $1</h6>')
               .replace(/^##### (.*$)/gim, '<h5>##### $1</h5>')
               .replace(/^#### (.*$)/gim, '<h4>#### $1</h4>')
               .replace(/^### (.*$)/gim, '<h3>### $1</h3>')
               .replace(/^## (.*$)/gim, '<h2>## $1</h2>')
               .replace(/^# (.*$)/gim, '<h1># $1</h1>');

    // Convert bold and italic
    html = html.replace(/\*\*\*(.*?)\*\*\*/gim, '<b><i>***$1***</i></b>') // bold and italic
               .replace(/\*\*(.*?)\*\*/gim, '<b>**$1**</b>') // bold
               .replace(/\*(.*?)\*/gim, '<i>*$1*</i>'); // italic

    // Convert strikethrough
    html = html.replace(/~~(.*?)~~/gim, '<del>~~$1~~</del>');

    // Convert underline
    html = html.replace(/__(.*?)__/gim, '<u>__$1__</u>');

    // Convert background highlight
    html = html.replace(/==(.*?)==/gim, '<mark style="border-radius: 0.5em">==$1==</mark>');

    // Convert images
    html = html.replace(/(!\[.*?\]\((.*?)\))(?!\s*<img\s*src="\2"\s*\/>)/g, '<img style="width: 95%; border-radius: 1rem" src="$2"/>$1');

    // Convert links
    html = html.replace(/\[(.*?)\]\((.*?)\)/gim, '<a style="color: skyblue; padding-bottom: 0.01rem; border-bottom: 0.1rem solid deepskyblue; text-decoration: none" href="$2">[$1]($2)</a>');

    // Convert blockquotes
    html = html.replace(/^\> (.*)$/gim, '<blockquote>> $1</blockquote>');

    // Convert horizontal rules
    html = html.replace(/^\s*[-*_]{3,}\s*$/gim, '<hr />');
    
    //code
    html = convertCodeBlocksToTextarea(html);

    // Line breaks
    html = html.replace(/<(?!textarea)[^>]*>\n|[^<]\n(?!\/textarea>)/g, function(match) {
      return match === '\n' ? '<br>' : match;
    });
    html += '<!--==::BINKLINGS?-?Note?-?System?-?Loaded;;==-->';

    return html;
}



var cursorPos;
var clickx;
var clicky;

function getCaretPosition(editableDiv) {
    let caretPos = 0;
    let sel = window.getSelection();
    if (sel.rangeCount) {
        let range = sel.getRangeAt(0);
        let preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(editableDiv);
        preCaretRange.setEnd(range.startContainer, range.startOffset);
        caretPos = preCaretRange.toString().length;
    }
    return caretPos;
}

function setCaretPosition(editableDiv, position) {
    let range = document.createRange();
    let sel = window.getSelection();

    let charCount = 0, nodeStack = [editableDiv], node, foundStart = false;

    while (nodeStack.length > 0 && !foundStart) {
        node = nodeStack.pop();

        if (node.nodeType === 3) { // Text node
            let nextCharCount = charCount + node.length;
            if (position >= charCount && position <= nextCharCount) {
                range.setStart(node, position - charCount);
                foundStart = true;
            }
            charCount = nextCharCount;
        } else {
            let i = node.childNodes.length;
            while (i--) {
                nodeStack.push(node.childNodes[i]);
            }
        }
    }

    if (foundStart) {
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
    }
}

function moveCursorToNextLine() {
    var range = document.createRange();
    range.selectNodeContents(editor);

    var selection = window.getSelection();

    range.setStart(selection.focusNode, selection.focusOffset);
    range.setEnd(selection.focusNode, selection.focusOffset);
    
    lastBrTag = selection.getRangeAt(0).startContainer.nextSibling;
    range.setStartAfter(lastBrTag);
    range.setEndAfter(lastBrTag);

    selection.removeAllRanges();
    selection.addRange(range);
}




let db;
let request = indexedDB.open("fileSystem", 1);
request.onerror = function(event) {
  console.error(event);
};
request.onsuccess = function(event) {
  db = request.result;
};
request.onupgradeneeded = function(event) {
  let db = event.target.result;
  db.createObjectStore("files", { keyPath: "name" });
};

function createFile(name, content) {
  let transaction = db.transaction(["files"], "readwrite");
  let store = transaction.objectStore("files");
  let file = {
    name: name,
    content: content
  };
  store.add(file);
}

function deleteFile(name) {
  let transaction = db.transaction(["files"], "readwrite");
  let store = transaction.objectStore("files");
  store.delete(name);
}

function updateFile(name, content) {
  let transaction = db.transaction(["files"], "readwrite");
  let store = transaction.objectStore("files");
  let request = store.get(name);
  request.onsuccess = function(event) {
    let file = event.target.result;
    file.content = content;
    store.put(file);
  };
}

function readFile(name, todo) {
  let transaction = db.transaction(["files"]);
  let store = transaction.objectStore("files");
  let request = store.get(name);
  request.onsuccess = function(event) {
    if(todo=='show'){
      editor.innerText = request.result.content;
      parsing();
    }else if(todo.includes("checkSave?")){
      if(editor.innerText == request.result.content){
        loadNewPage(todo.split('?')[1], todo.split('?')[2], true);
      }else{
        if(confirm('Are you sure to leave the editor? Your changes have not been saved and will be lost.')){
          loadNewPage(todo.split('?')[1], todo.split('?')[2], true);
        }
      }
    }
  };
}

function listFiles() {
  let transaction = db.transaction(["files"]);
  let store = transaction.objectStore("files");
  let request = store.openCursor();
  request.onsuccess = function(event) {
    let cursor = event.target.result;
    if (cursor) {
      console.log('found: '+cursor.key);
      document.getElementById('noteList').innerHTML += `<div class="articleBtn"><h3 onclick="loadNewPage('`+cursor.key+`', 'Edit')" style="display: inline-block; padding: 0.3em; width: 100%" class="articleBtnT">`+cursor.key+`</h3><div onclick="setNote('`+cursor.key+`')" class="set" align="center"><h3>&#9776;</h3></div></div>`;
      cursor.continue();
    }
  };
}



function setNote(name){
  showAlert(0, './window/setFile.html?name='+name);
}

function newNote(promptName){
  var name = prompt("Title", promptName);
  if (name!==null && name!==""){
    if(name.includes(' ') || name.includes('?') || name.includes('=') || name.includes('#')){
      alert("Sorry, but you can't insert spaces(or ? = #) in the title");
      newNote(name);
    }else{
      var exist = false;
      var articleBtnTs = document.getElementsByClassName('articleBtnT');
      for(i=0;i<articleBtnTs.length;i++){
        if(articleBtnTs[i].textContent==name){
          exist = true;
        }
      }
      if(exist){
        alert("A file with the same name already exists");
        newNote(name);
      }else{
        createFile(name, '');
        alert(name + ' has been created successfully');
        document.getElementById('noteList').innerHTML += `<div class="articleBtn"><h3 onclick="loadNewPage('`+name+`', 'Edit')" style="display: inline-block; padding: 0.3em; width: 100%" class="articleBtnT">`+name+`</h3><div onclick="setNote('`+name+`')" class="set" align="center"><h3>&#9776;</h3></div></div>`;
      }
    }
  }
}