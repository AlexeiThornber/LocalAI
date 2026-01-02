import {sendPayload} from '../controller/ollamaAPI.js';
/*
    This javascript file will handle the UI.
    This includes
    - Changing the content of the website
    - Changing the apperance of website
*/

const userInput = document.getElementById('userInput') as HTMLInputElement | null;
const buttonInput = document.getElementById('enterButton');
const chatWindow = document.getElementById('chatWindow');
const userID = sessionStorage.getItem('username');

/*
===================================================================================================================
The following code loads the history of chats of the designated user
===================================================================================================================
*/ 




/*
===================================================================================================================
The following code manages action handlers of the UI elements such as buttons and input fields
===================================================================================================================
*/ 
if(userInput){
    userInput.addEventListener('keydown', function(event) {
        if(event.key == "Enter"){
            handleMessage();
        }
    });
}else{
    console.log("Element with id 'userInput' has not been found")
}

if(buttonInput){
    buttonInput.addEventListener('click', function() {
        handleMessage();
    });
}else{
    console.log("Element with id 'buttonInput' has not been found")
}

function handleMessage(): void{
    const payload: string = userInput.value;
    createUserMessage(payload);
    const botSpan = createBotMessage();
    //TODO, implement model choice in the payload
    sendPayload(payload, "hi", (content) => {
        botSpan.textContent += content;
        scrollChatToBottom();
    });
    clear();
}

function createBotMessage(): HTMLSpanElement {
    const messageDiv = document.createElement('div');
    messageDiv.className = "message bot-message";
    const bubbleSpan = document.createElement('span');
    bubbleSpan.className = "bubble";
    bubbleSpan.textContent = "";
    messageDiv.appendChild(bubbleSpan);
    chatWindow.appendChild(messageDiv);
    scrollChatToBottom();
    return bubbleSpan;
}

function createUserMessage(content: string):void{
    if(content == ""){
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


/*
===================================================================================================================
Helper functions
===================================================================================================================
*/ 
function clear():void {
    userInput.value = "";
}

function scrollChatToBottom(): void {
    if (chatWindow) {
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }
}