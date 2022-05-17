import { useCallback } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

export default function EditorInterface() {
    const QuillBoxRef = useCallback((QuillBox) => {
        if (QuillBox == null) return;
        QuillBox.innerHTML = "";
        const doc = document.createElement("div");
        QuillBox.append(doc);
        new Quill("#QuillBox", { theme: "snow" });
    }, []);
    return (<div id="QuillBox" ref={QuillBoxRef} > EditorInterface </div>);
}