import {
  allComponents,
  provideVSCodeDesignSystem,
  Button,
  Tag,
  TextArea,
  TextField,
  vsCodeButton,
  vsCodeTag,
  vsCodeTextArea,
  vsCodeTextField,
  vsCodeDropdown,
  vsCodeOption,
  vsCodeDataGrid,
  vsCodeDataGridCell,
  vsCodeDataGridRow,
  vsCodeDivider,
  vsCodeRadioGroup,
  vsCodeRadio,
} from "@vscode/webview-ui-toolkit";

// In order to use the Webview UI Toolkit web components they
// must be registered with the browser (i.e. webview) using the
// syntax below.

provideVSCodeDesignSystem().register(
  allComponents
);

// Get access to the VS Code API from within the webview context
const vscode = acquireVsCodeApi();
const format = require('./sql-styler');
import * as monaco from 'monaco-editor';

// Just like a regular webpage we need to wait for the webview
// DOM to load before we can reference any of the HTML elements
// or toolkit components
window.addEventListener("load", main);
let editor;

function main() {
  // Monaco Editor 생성
  // const overrides = {
  //   '.monaco-editor': {
  //     'font-size': '14px',
  //   },
  // };
  
  // editor = monaco.editor.create(document.getElementById("editor-container") as TextArea, {
  //   value: 'Hello, world!',
  //   language: 'sql'
  //   },overrides,
  // );  

  setVSCodeMessageListener();

  vscode.postMessage({ command: "requestNoteData" });

  // To get improved type annotations/IntelliSense the associated class for
  // a given toolkit component can be imported and used to type cast a reference
  // to the element (i.e. the `as Button` syntax)
 
  // const saveButton = document.getElementById("submit-button") as Button;
  // saveButton.addEventListener("click", () => saveNote());
  // const dropdown1 = document.getElementById("type-dropdown") as Dropdown;
  // dropdown1.addEventListener("click", (event) => {
  //   console.log(event);
  // });

  // const dropdown2 = document.getElementById("use-dropdown") as Dropdown;
  

  const sqlButton1 = document.getElementById("submit-button1") as Button;
  sqlButton1.addEventListener("click", () => refresh());

  const sqlButton2 = document.getElementById("submit-button2") as Button;
  sqlButton2.addEventListener("click", () => queryTest());

  const sqlButton3 = document.getElementById("submit-button3") as Button;
  sqlButton3.addEventListener("click", () => querySave());

  
}

// 초기 설정된 테마를 가져와서 적용합니다.
// const currentTheme = vscode.getState().theme || 'light';
// setTheme(currentTheme);

// Stores the currently opened note info so we know the ID when we update it on save
let openedNote;

function setVSCodeMessageListener() {
  window.addEventListener("message", (event) => {    
    const command = event.data.command;
    const noteData = JSON.parse(event.data.payload);
    vscode.postMessage({command: 'info',text: '🐛  on line '});
    switch (command) {
      case "receiveDataInWebview":
        openedNote = noteData;
        //renderTags(openedNote.tags);
        break;
    }
  });
}

function queryTest() {
}

function querySave() {
}

function refresh() {
  const noteInput = document.getElementById("editor") as TextArea;
  console.log("noteInput");
  const formatted = format(noteInput.value);
  noteInput.value = formatted;
  console.log(formatted);
  
  let inputCounter = 0;
  const container = document.getElementById("paramContainer");
  clearBox(container);
  const row = document.createElement('div');
  //row.className = 'row';
  for (let i = 0; i < 3; i++) {
    const inputBox = document.createElement("vscode-text-field") as TextField;
    inputBox.setAttribute('type', 'text');
    inputBox.setAttribute('id', 'input-' + inputCounter);
    inputBox.setAttribute('placeholder', 'Input ' + inputCounter);    
    inputBox.setAttribute('readonly', '');    
    addInputBox(inputBox, row);
    inputCounter++;
  }  
  markBox(row,container);    
  // console.log(editor.getValue());
}

function markBox(row, tagsContainer){
  tagsContainer.appendChild(row);
}

function addInputBox(inputElement, parent) {
    parent.appendChild(inputElement);
}

function clearBox(tagsContainer) {
  while (tagsContainer.firstChild) {
    tagsContainer.removeChild(tagsContainer.lastChild);
  }
}


function saveNote() {
  const titleInput = document.getElementById("title") as TextField;
  const noteInput = document.getElementById("content") as TextArea;
  const tagsInput = document.getElementById("tags-input") as TextField;

  const titleInputValue = titleInput?.value;
  const noteInputValue = noteInput?.value;
  const tagsInputValue = tagsInput?.value;

  const noteToUpdate = {
    id: openedNote.id,
    title: titleInputValue,
    content: noteInputValue,
    tags: tagsInputValue.length > 0 ? tagsInputValue.split(",").map((tag) => tag.trim()) : [],
  };

  vscode.postMessage({ command: "updateNote", note: noteToUpdate });
}

function renderTags(tags) {
  const tagsContainer = document.getElementById("tags-container");
  clearTagGroup(tagsContainer);
  if (tags.length > 0) {
    addTagsToTagGroup(tags, tagsContainer);
    if (tagsContainer) {
      tagsContainer.style.marginBottom = "2rem";
    }
  } else {
    // Remove tag container bottom margin if there are no tags
    if (tagsContainer) {
      tagsContainer.style.marginBottom = "0";
    }
  }
}



function clearTagGroup(tagsContainer) {
  while (tagsContainer.firstChild) {
    tagsContainer.removeChild(tagsContainer.lastChild);
  }
}

function addTagsToTagGroup(tags, tagsContainer) {
  for (const tagString of tags) {
    const vscodeTag = document.createElement("vscode-tag") as Tag;
    vscodeTag.textContent = tagString;
    tagsContainer.appendChild(vscodeTag);
  }
}

// VS Code API를 사용하여 WebView에서 상태를 저장합니다.
function saveState(state) {
  vscode.setState(state);
}

// WebView에서 초기 설정된 상태를 가져옵니다.
function getState() {
  return vscode.getState();
}

// HTML 엘리먼트에 테마를 적용합니다.
function setTheme(theme) {
  // const body = document.body;
  // const newThemeClass = `vscode-theme-${theme}`;
  // const oldThemeClass = body.getAttribute('data-vscode-theme');
  // body.setAttribute('data-vscode-theme', newThemeClass);
  // body.classList.remove(oldThemeClass);
  // body.classList.add(newThemeClass);
}

// 현재 설정된 테마를 가져와서 WebView에 메시지를 보냅니다.
// function updateTheme() {
//   const currentTheme = vscode.getState().theme || 'light';
//   vscode.postMessage({
//     type: 'theme',
//     theme: currentTheme
//   });
// }
