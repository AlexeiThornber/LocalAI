//TODO should add a onSuccess and onFailure callback to all of these to be honest

const URL = 'https://localai.tailbaa1e6.ts.net'

export async function login(
    username: string,
    passwordHash: string,
    type: string, //Type can be login or create-account
    ){
    const response = await fetch(`${URL}/api/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({username: username, password: passwordHash})
    });
        
    const text = await response.text(); 
    let result: { success: any; error: any; };

    try {
        result = JSON.parse(text);
        console.log("Parsed JSON:", result);
    } catch (e) {
        console.error("JSON parse error:", e);
    }

    if(result.success){
        localStorage.setItem('username', username);
        window.location.href = `main.html`;
    }else{
        alert(`Error: ${result.error}`);   
    }
}

export async function loadAllTitles(
    uid: string,
    callback:(chats: {chatID: string, title: string, timestamp: number}[]) => void
): Promise<void>{
    const response = await fetch(`${URL}/api/loadAll`,{
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({username: uid})
    });

    const text = await response.text();
    let result: { success: any; chats: {chatID: string, title: string, timestamp: number}[]; error: any; };
    
    try {
        result = JSON.parse(text);
        console.log("Parsed JSON:", result);
    } catch (e) {
        console.error("JSON parse error:", e);
    }

    callback(result.chats);
}

export async function fetchChat(
    uid: string,
    chatId: string,
    callback: (content: any) => void
): Promise<void>{

    const response = await fetch(`${URL}/api/loadChat`,{
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({username: uid, chatID: chatId})
    })

    const text = await response.text();
    let result: { success: any; chatID: string; content: string; error: any; };

    try {
        result = JSON.parse(text);
        console.log("Parsed JSON:", result);
    } catch (e) {
        console.error("JSON parse error:", e);
    }

    callback(JSON.parse(result.content))
}

export async function deleteChat(
    uid: string,
    chatId: string,
    onSuccess: () => void,
    onFailure: () => void
): Promise<void>{

    const response = await fetch(`${URL}/api/deleteChat`,{
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({username: uid, chatID: chatId})
    });

    const text = await response.text();
    const result = JSON.parse(text);
    if(result.success){
        onSuccess;
    }else{
        onFailure;
    }
}

export async function deleteAccount(
    uid: string,
    onSuccess: () => void,
    onFailure: () => void
): Promise<void> {
    const response = await fetch(`${URL}/api/deleteAccount`, {
        method: 'POST',
        headers: {'Content-Type' : 'application/json'},
        body : JSON.stringify({username: uid})
    });

    const text = await response.text();
    const result = JSON.parse(text);
    if(result.success){
        onSuccess();
    }else{
        onFailure();
    }
}

export async function saveMessages(
    uid: string,
    chatId: string,
    timestamp: number,
    messages: string[],
    title: string = ""
    ){
    const conversationHistory: Array<{user:string, bot:string}> = [];

    for(let i = 0; i < messages.length; i += 2){
        const userMsg = messages[i];
        const botMsg = messages[i + 1];
        conversationHistory.push({
            user: userMsg,
            bot: botMsg
        });
    }

    // let payload: { username: string; chatID: string; timestamp: number; history: { user: string; bot: string; }[]; title?: string; };
    const payload = {
        username: uid,
        chatID: chatId,
        timestamp: timestamp,
        title: title,
        history: conversationHistory
    }

    console.log(payload);

    const response = await fetch(`${URL}/api/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
}