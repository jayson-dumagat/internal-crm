import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { useEffect } from "react";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { $getRoot, FORMAT_TEXT_COMMAND, type TextFormatType } from "lexical";

type LexicalNoteEditorProps = {
  onChange: (plainText: string, html: string) => void;
  initialContentHtml?: string | null;
  readOnly?: boolean;
};

const editorConfig = {
  namespace: "CDEXNoteEditor",
  theme: {
    paragraph: "mb-2 last:mb-0",
    text: {
      bold: "font-semibold",
      italic: "italic",
      underline: "underline",
      strikethrough: "line-through",
    },
  },
  onError(error: Error) {
    throw error;
  },
};

export default function LexicalNoteEditor({
  onChange,
  initialContentHtml,
  readOnly = false,
}: LexicalNoteEditorProps) {
  return (
    <LexicalComposer initialConfig={{ ...editorConfig, editable: !readOnly }}>
      <div className="overflow-hidden rounded-lg border border-gray-300 bg-white shadow-theme-xs transition focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:focus-within:border-brand-800">
        {!readOnly && <Toolbar />}
        <InitialContentPlugin html={initialContentHtml} />
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                aria-label="Note content"
                contentEditable={!readOnly}
                className="custom-scrollbar min-h-40 max-h-72 overflow-y-auto px-4 py-3 text-sm leading-6 text-gray-800 outline-none dark:text-white/90"
              />
            }
            placeholder={
              <div className="pointer-events-none absolute top-3 left-4 text-sm text-gray-400 dark:text-white/30">
                Write your note...
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <OnChangePlugin
            onChange={(editorState, editor) => {
              editorState.read(() => {
                onChange(
                  $getRoot().getTextContent(),
                  $generateHtmlFromNodes(editor),
                );
              });
            }}
          />
        </div>
      </div>
    </LexicalComposer>
  );
}

function InitialContentPlugin({ html }: { html?: string | null }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!html) return;
    editor.update(() => {
      const dom = new DOMParser().parseFromString(html, "text/html");
      const nodes = $generateNodesFromDOM(editor, dom);
      const root = $getRoot();
      root.clear();
      root.append(...nodes);
    });
  }, [editor, html]);

  return null;
}

function Toolbar() {
  const [editor] = useLexicalComposerContext();

  const formatText = (format: TextFormatType) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  return (
    <div className="flex items-center gap-1 border-b border-gray-200 bg-gray-50 px-2 py-2 dark:border-gray-800 dark:bg-white/[0.03]">
      <ToolbarButton
        label="Bold"
        onClick={() => formatText("bold")}
        className="font-bold"
      >
        B
      </ToolbarButton>
      <ToolbarButton
        label="Italic"
        onClick={() => formatText("italic")}
        className="italic"
      >
        I
      </ToolbarButton>
      <ToolbarButton
        label="Underline"
        onClick={() => formatText("underline")}
        className="underline"
      >
        U
      </ToolbarButton>
      <ToolbarButton
        label="Strikethrough"
        onClick={() => formatText("strikethrough")}
        className="line-through"
      >
        S
      </ToolbarButton>
    </div>
  );
}

function ToolbarButton({
  label,
  onClick,
  className,
  children,
}: {
  label: string;
  onClick: () => void;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`inline-flex size-8 items-center justify-center rounded-md text-sm text-gray-600 transition hover:bg-white hover:text-gray-900 hover:shadow-theme-xs dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white ${className}`}
    >
      {children}
    </button>
  );
}
