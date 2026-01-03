import {sendPayload, getTitle} from '../controller/ollamaAPI.js';
import { saveMessages, loadAllTitles, loadChat as fetchChat } from '../controller/dbAPI.js';
/*
    This javascript file will handle the UI.
    This includes
    - Changing the content of the website
    - Changing the apperance of website
*/

const userInput = document.getElementById('userInput') as HTMLInputElement | null;
const buttonInput = document.getElementById('enterButton');
const chatWindow = document.getElementById('chatWindow');
const newChat = document.getElementById('newChatButton');
const h1title = document.getElementById('title');
const chatHistory = document.getElementById('chatHistory');
const userID = sessionStorage.getItem('username');

var chatID: string = ""; //TODO any better way than to have a global variable

/*
===================================================================================================================
The following code loads the history of chats of the designated user
===================================================================================================================
*/ 

onLoad()

function onLoad(){
    loadAllTitles(userID, (titles) => {
        titles.forEach(title => {
            loadChatHistory(title);
        })
    });
}

function loadChatHistory(title: string): void{
    const titleLi = document.createElement('li');
    titleLi.id = title;
    titleLi.innerHTML = title;
    titleLi.className = "";
    titleLi.addEventListener('click', () => {
        fetchChat(
            userID,
            title,
            displayChat
        )
        clearActiveClass();
        titleLi.className = "active";
    });
    chatHistory.appendChild(titleLi);
}

function displayChat(title:string, content: any){
    clearMainChat();
    clearTitle();

    content.history.forEach((element: any) =>{
        createUserMessage(element.user);
        createBotMessage(element.bot);
        addTitle(title);
    })
}


/*
===================================================================================================================
The following code manages action handlers of the UI elements such as buttons and input fields
===================================================================================================================
*/ 
if(userInput){
    userInput.addEventListener('keydown', (event) => {
        if(event.key == "Enter"){
            handleMessage();
        }
    });
}else{
    console.log("Element with id 'userInput' has not been found");
}

if(buttonInput){
    buttonInput.addEventListener('click', () => {
        handleMessage();
    });
}else{
    console.log("Element with id 'buttonInput' has not been found");
}

if(newChat){
    newChat.addEventListener('click', () => {
        h1title.innerHTML = '';
        chatWindow.innerHTML = '';
    });
}else{
    console.log("Element with id 'newChatButton' has not been found");
}

/*
===================================================================================================================
Main function that handles the send and received messages via API calls
===================================================================================================================
*/ 

function handleMessage(): void{
    const payload: string = userInput.value;

    if(chatWindow.innerHTML.trim().length == 0){
        getTitle(payload, "hi", (title) => {
            chatID = title;
            clearActiveClass();
            addNewChat(chatID);
        });
    }


    createUserMessage(payload);
    const botSpan = createBotMessage();

    //TODO, implement model choice in the payload
    sendPayload(payload, "hi",
        (content) => {
            botSpan.textContent += content;
            scrollChatToBottom();
        },
        () => {
            //TODO first chatID is null as the above callback might have not finished :/
            saveMessages(userID, chatID, document.querySelectorAll('.message'));
        },
    );

    clearUserInput();
}

/*
===================================================================================================================
Helper functions
===================================================================================================================
*/ 
function clearUserInput():void {
    userInput.value = "";
}

function clearMainChat(): void{
    chatWindow.innerHTML = "";
}

function clearTitle(): void{
    h1title.innerHTML = "";
}

function addTitle(title: string):void {
    h1title.innerHTML = title;
}

function clearActiveClass(): void{
    const active = document.querySelectorAll('.active');

    active.forEach(element => {
        element.className = "";
    });
}

function createBotMessage(content: string = ""): HTMLSpanElement {
    const messageDiv = document.createElement('div');
    messageDiv.className = "message bot-message";
    const bubbleSpan = document.createElement('span');
    bubbleSpan.className = "bubble";
    bubbleSpan.textContent = "";
    bubbleSpan.innerHTML = content;
    messageDiv.appendChild(bubbleSpan);
    chatWindow.appendChild(messageDiv);
    scrollChatToBottom();
    return bubbleSpan;
}

function createUserMessage(content: string):void{
    if(content.trim() == ""){
        return
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = "message user-message";
    messageDiv.id = "message";

    const bubbleSpan = document.createElement('span');
    bubbleSpan.className = "bubble";
    bubbleSpan.textContent = content;

    messageDiv.appendChild(bubbleSpan);
    chatWindow.appendChild(messageDiv);
    scrollChatToBottom();
}

function addNewChat(title: string):void {
    h1title.innerHTML = title;
    const li = document.createElement('li');
    li.id = title;
    li.className = "active";
    li.innerHTML = title;
    chatHistory.insertBefore(li, chatHistory.firstChild);
}

function scrollChatToBottom(): void {
    if (chatWindow) {
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }
}