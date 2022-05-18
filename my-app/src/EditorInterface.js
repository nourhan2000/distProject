import { useCallback } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";


export default function EditorInterface() {
    const QuillBoxRef = useCallback(QuillBox => {
        if (QuillBox == null) return;
        QuillBox.innerHTML = "";
        const doc = document.createElement("div");
        QuillBox.append(doc);
        new Quill(doc, {
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
    }, []);
    return (<div id="QuillBox" ref={QuillBoxRef} > EditorInterface </div>);
}