import { sendPayload } from './requestHandler.js';
/*
    This javascript file will handle the UI.
    This includes
    - Changing the content of the website
    - Changing the apperance of website
*/
const userInput = document.getElementById('userInput');
const buttonInput = document.getElementById('enterButton');
const chatWindow = document.getElementById('chatWindow');
if (userInput) {
    userInput.addEventListener('keydown', function (event) {
        if (event.key == "Enter") {
            handleMessage();
            // const payload: string = userInput.value;
            // addText(payload);
            // const botSpan = createBotMessage();
            // sendPayload(payload, "hi", (content) => {
            //     botSpan.textContent += content;
            //     scrollChatToBottom();
            // });
            // clear();
        }
    });
}
else {
    console.log("Element with id 'userInput' has not been found");
}
if (buttonInput) {
    buttonInput.addEventListener('click', function () {
        handleMessage();
    });
}
else {
    console.log("Element with id 'buttonInput' has not been found");
}
function handleMessage() {
    const payload = userInput.value;
    addText(payload);
    const botSpan = createBotMessage();
    sendPayload(payload, "hi", (content) => {
        botSpan.textContent += content;
    });
    clear();
}
function createBotMessage() {
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
function addText(content) {
    if (content == "") {
        return;
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
function clear() {
    userInput.value = "";
}
function scrollChatToBottom() {
    if (chatWindow) {
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }
}
