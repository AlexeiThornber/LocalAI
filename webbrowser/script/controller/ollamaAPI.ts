/*
    This file handles the request between the client and the ollama API.
    It will receive the text inputted by the user as arguements
    and send and http request to the running instance of ollama.
    It will then parse the request and send it back to the UI.ts file as a response.
*/
export async function sendPayload(
    payload: string,
    model: string,
    onStream: (text:string) => void,
    onComplete: () => void
):Promise<void>{
    // Prepare request data
    const requestData = {
        model: model,
        prompt: payload,
        stream: true
    };

    const response = await fetch('ollama/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
    });

    parsePayload(response, onStream, onComplete);
}

export async function getTitle(
    payload: string,
    model: string,
    callback: (title: string) => void
):Promise<void>{
    const requestData ={
        model: model,
        prompt: "Create a title of at most 5 words: " + payload,
        stream: false
    };

    const response = await fetch('ollama/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
    });

    const reply = await response.text();
    const result = JSON.parse(reply);

    model == 'mistral' ? 
        callback(result.response.slice(1).replace(/^"+|"+$/g, '')) : callback(result.response);
}

async function parsePayload(
    response: Response,
    onStream: (text:string) => void,
    onComplete: () => void
):Promise<void> {
    if(!response.body) return;

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let buffer = '';

    while(true){
        const {value, done} = await reader.read();
        if (done) {
            onComplete();
            break;
        }
        buffer += decoder.decode(value, {stream: true});

        let lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for( const line  of lines){
            if(line.trim() === '') continue;
            try{
                const data = JSON.parse(line);
                if(data.response){
                    onStream(data.response);
                }
            }catch(e){
                //Ignore parse errors for incomplete lines
            }
        }
    }
}
