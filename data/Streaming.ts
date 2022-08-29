
export type StreamingUploadEvents = {
    phaseAuth: () => string,
    phaseUploadDone: () => void,
    phaseFinalizationResponse: (data: string) => void,
    onUploadTick: (percentage: number) => Promise<void>,
};

/**
 * a streaming file uploader with backpressure.
 *
 * phases:
 * 1: Auth          => (When the WebSocket Opens)
 * 2: File          <= (Backend sends a "file" request)
 * 3: File Metadata => (Uploader sends a 'file { filename: "", type: ""}' request)
 * 4: Next          <= (Backend Waits for binary data)
 * 5: *binary*      => (Sends a Chunk of the File to the backend)
 * [...]               (Drains the Buffer to the end)
 * 6: End           => (Uploader sends "end" Request)
 * 7: *response*    => (Backend sends a finial Response: Should often be a json with an id in it)
 *
 * Note: In the Future most of the stuff could be reduced to WebSocketStream as it also allows backpressure.
 */
export function UploadFileWithCredentials(path: URL, file: File, events: StreamingUploadEvents) {
    try {
        const ws = new WebSocket(path);
        let bytesUploaded = 0;
        const stream = file
            .stream()
            .pipeThrough(new TransformStream({
                async transform(chunk, controller) {
                    bytesUploaded += chunk.length;
                    const percentage = (bytesUploaded / file.size) * 100;
                    await events.onUploadTick(percentage);
                    controller.enqueue(chunk);
                }
            }));
        ws.onopen = () => {
            ws.send(events.phaseAuth());
        };
        const reader = stream.getReader();

        ws.onmessage = async ({ data }) => {
            if (data == "file") {
                ws.send("file " + JSON.stringify({ filename: file.name, type: file.type }));
            } else if (data == "next") {
                const read = await reader.read();
                console.log(read.value);
                if (read.value)
                    ws.send(read.value);
                if (read.done) {
                    ws.send("end");
                    events.phaseUploadDone();
                }
            } else {
                reader.releaseLock();
                events.phaseFinalizationResponse(data);
            }
        };
    } catch (error) {
        console.error(error);
        alert("There was an Error Uploading your files...\n\nPlease try again later");
    }
}