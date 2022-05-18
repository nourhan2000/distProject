import { useCallback, useEffect, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { io } from "socket.io-client"

export default function EditorInterface() {

    const [serverSocket, setServer] = useState();
    const [editor, setEditor] = useState();

    useEffect(() => {
        const server = io('http://localhost:3001');//connect to server 
        setServer(server);
        return () => {
            server.disconnect();//disconnect from server
        }
    }, []);

    useEffect(() => {
        if (serverSocket == null || editor == null) return;
        const changeHandler = (delta) => {
            editor.updateContents(delta);
        };
        serverSocket.on('recieve-text-change', changeHandler);
        return () => {
            serverSocket.off('recieve-text-change', changeHandler);
        };
    }, [serverSocket, editor]);

    useEffect(() => {
        if (serverSocket == null || editor == null) return;

        const changeHandler = (delta, oldDelta, source) => {
            if (source !== "user") return;
            serverSocket.emit("change-in-text", delta);
        };
        editor.on('text-change', changeHandler);
        return () => {
            editor.off('text-change', changeHandler);
        };
    }, [serverSocket, editor]);

    const QuillBoxRef = useCallback(QuillBox => {
        if (QuillBox == null) return;
        QuillBox.innerHTML = "";
        const doc = document.createElement("div");
        QuillBox.append(doc);
        const e = new Quill(doc, {
            theme: "snow", modules: {
                toolbar: [
                    [{ header: [1, 2, 3, 4, 5, 6, false] }],
                    [{ font: [] }],
                    [{ list: "ordered" }, { list: "bullet" }],
                    ["bold", "italic", "underline"],
                    [{ color: [] }, { background: [] }],
                    [{ script: "sub" }, { script: "super" }],
                    [{ align: [] }],
                    ["image", "blockquote", "code-block"],
                    ["clean"],
                ]
            },
        });
        setEditor(e);
    }, []);
    return (<div id="QuillBox" ref={QuillBoxRef} > EditorInterface </div>);
}