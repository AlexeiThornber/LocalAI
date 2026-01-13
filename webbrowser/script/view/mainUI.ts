// Function imoprts
import {sendPayload, getTitle} from '../controller/ollamaAPI.js';
import { saveMessages, loadAllTitles, fetchChat, deleteChat, deleteAccount } from '../controller/dbAPI.js';

// declare var marked: any;
/*
    This javascript file will handle the UI.
    This includes
    - Changing the content of the website
    - Changing the apperance of website
*/

const Theme = {
    Ligth: true,
    Dark: false
} as const;

const userInput = document.getElementById('userInput') as HTMLInputElement | null;
const buttonInput = document.getElementById('enterButton');
const chatWindow = document.getElementById('chatWindow');
const newChat = document.getElementById('newChatButton');
const h1title = document.getElementById('title');
const chatHistory = document.getElementById('chatHistory');
const deleteChatBtn = document.getElementById('delete');
const themeButton = document.getElementById('theme');
const sunSvg = document.getElementById('bi-sun');
const moonSvg = document.getElementById('bi-moon');
const modelSelector = document.getElementById("modelSelect");
const settingsButton = document.getElementById('settingsButton');
const settingsOverlay = document.getElementById('settingsOverlay');
const logoutBtn = document.getElementById('logoutBtn');
const deleteAccountBtn = document.getElementById('deleteAccount');

const userID = localStorage.getItem('username');

var chatID: string = ""; //TODO any better way than to have a global variable
var theme: boolean = Theme.Ligth;
var messages: string[] =  [];
var newChatBool: boolean = true;

declare let marked: any;

/*
===================================================================================================================
The following code loads the history of chats of the designated user
===================================================================================================================
*/ 

//* Refreshes the entire page
onLoad()

function onLoad(){
    if(userID == null){
        window.location.href = "index.html"
    }

    clearActiveClass();
    clearMainChat();
    clearTitle();
    clearChatHistory();
    h1title.textContent = "New Chat";

    deleteChatBtn.style.display = "none";
    loadAllTitles(userID, (chats) => {

        const sortedChats = chats.sort((a,b) => (b.timestamp - a.timestamp))

        for(let i = 0; i < sortedChats.length; i++ ){
            loadChatHistory(sortedChats[i]['chatID'], sortedChats[i]['title'])
        }
    });
}

function loadChatHistory(chatID: string, title: string): void{
    refreshChats(chatID, title);
    chatHistory.appendChild(refreshChats(chatID, title, true));
}

function displayChat(content: any){
    clearMainChat();
    clearTitle();

    content.history.forEach((element: any) =>{
        messages.push(element.user);
        messages.push(element.bot);
        createUserMessage(element.user);
        createBotMessage(marked.parse(element.bot));
        addTitle(content.title);
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
        newChatBool = true;
        h1title.innerHTML = 'New chat';
        chatWindow.innerHTML = '';
        clearMessages();
        clearActiveClass();
        deleteChatBtn.style.display = "none";
    });
}else{
    console.log("Element with id 'newChatButton' has not been found");
}

if(themeButton){
    themeButton.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');

        if(theme == Theme.Ligth){
            sunSvg.style.display = "";
            moonSvg.style.display = "none";
            theme = Theme.Dark
        }else{
            sunSvg.style.display = "none";
            moonSvg.style.display = "";
            theme = Theme.Ligth
        }

    })
}else{
    console.log("Element with id 'theme' has not beef found");
}

if(deleteChatBtn){
    deleteChatBtn.addEventListener('click', () => {
        deleteChat(userID, chatID,
            () => {
                console.log("Chat succefully deleted");
            },
            () => {
                console.log("Something went wrong");
            }
        );
        onLoad();
    });
}else{
    console.log("Element with id 'delete' has not been found");
}

if(settingsButton){
    settingsButton.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsOverlay.style.display = settingsOverlay.style.display === 'none' ? 'block' : 'none';
    });
}else{
    console.log("Element with id 'settingsButton' has not been found");
}

if(settingsOverlay){
    // Prevent overlay from closing when clicking inside
    settingsOverlay.addEventListener('click', (e) => {
        e.stopPropagation();
    });   
}else{
    console.log("Element with id 'settingsOverlay' not found");
}

if(logoutBtn){
    logoutBtn.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'index.html';
    });  
}else{
    console.log("Element with id 'logoutBtn' not found");
}

if(deleteAccountBtn){
    deleteAccountBtn.addEventListener('click', () => {
        deleteAccount(userID,
            () => {
                console.log("Account succefully deleted");
                localStorage.clear();
                window.location.href = "index.html";
            },
            () => {
                console.log("Something went wrong");
            }
        );
    })
}else{
    console.log("Element with id 'deleteAccount' not found");
}


// Hide overlay when clicking outside
document.addEventListener('click', () => {
    settingsOverlay.style.display = 'none';
});

/*
===================================================================================================================
Main function that handles the send and received messages via API calls
===================================================================================================================
*/ 

function handleMessage(): void{
    const payload: string = userInput.value;

    const selectedModel = (modelSelector as HTMLSelectElement).value;
    createUserMessage(payload);

    if(newChatBool){
        getTitle(payload, selectedModel, (title) => {
            chatID = crypto.randomUUID();
            clearActiveClass();
            addTitle(title);
            chatHistory.insertBefore(refreshChats(chatID, title), chatHistory.firstChild);
            deleteChatBtn.style.display = "";
            
            getContent(payload, selectedModel, title);
            newChatBool = false;

        });
    }else{
        getContent(payload, selectedModel);
    }

    clearUserInput();
}

function getContent(payload: string, selectedModel: string, title: string = ""): void{
    const botSpan = createBotMessage();
    var stringBuilder: string = "";

    messages.push(payload);

    sendPayload(payload, selectedModel,
        (content) => {
            stringBuilder += content
            botSpan.innerHTML = marked.parse(stringBuilder);
            scrollChatToBottom();
        },
        () => {
            messages.push(stringBuilder);

            saveMessages(userID, chatID, Date.now(), messages, title);
        },
    );
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

function clearChatHistory(){
    chatHistory.innerHTML = "";
}

function clearMessages(): void{
    messages.length = 0;
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

function refreshChats(selectedChatID: string, title: string, onLoad: boolean = false): HTMLElement {
    const titleLi = document.createElement('li');
    titleLi.id = selectedChatID;
    titleLi.innerHTML = title;
    titleLi.className = onLoad ? "" : "active";
    titleLi.addEventListener('click', () => {
        if(messages.length > 0) clearMessages();

        fetchChat(
            userID,
            selectedChatID,
            displayChat
        )
        clearActiveClass();
        titleLi.className = "active";
        deleteChatBtn.style.display = "";
        newChatBool = false;
        chatID = selectedChatID;
    });
    return titleLi;
}

function scrollChatToBottom(): void {
    if (chatWindow) {
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }
}