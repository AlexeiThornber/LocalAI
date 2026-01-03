export async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    // Convert buffer to hex string
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

//DEBUGGING puporses only
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//! Old handle message function (see if keep or not)
//? This handle message will guarantee that the chatID is not null but message takes longer
//? To send, don't know what is better
// function handleMessage(): void{
//     const payload: string = userInput.value;

//     New chat
//     if(chatWindow.innerHTML.trim().length == 0){
//         getTitle(payload, "hi", (title) => {
//             TODO make this more readable
//             chatID = title;
//             clearActiveClass();
//             addNewChat(title);

//             createUserMessage(payload);
//             const botSpan = createBotMessage();

//             sendPayload(payload, "hi",
//             (content) => {
//                 botSpan.textContent += content;
//                 scrollChatToBottom();
//             },
//             () => {
//                 saveMessages(userID, title, document.querySelectorAll('.message'));
//             });
//             clear();
//         });
//     }else{
//         createUserMessage(payload);
//         const botSpan = createBotMessage();
//         TODO, implement model choice in the payload
//         sendPayload(payload, "hi",
//             (content) => {
//                 botSpan.textContent += content;
//                 scrollChatToBottom();
//             },
//             () => {
//                 saveMessages(userID, chatID, document.querySelectorAll('.message'));
//             });
//         clear();

//     }
// }