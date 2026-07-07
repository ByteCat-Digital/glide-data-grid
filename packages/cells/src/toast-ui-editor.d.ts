declare module "@toast-ui/editor" {
    export interface ViewerOptions {
        readonly el: HTMLElement;
        readonly initialValue?: string;
        readonly usageStatistics?: boolean;
    }

    export class Viewer {
        constructor(options: ViewerOptions);

        destroy(): void;
    }

    export type EditorType = "markdown" | "wysiwyg";

    export interface EditorOptions {
        readonly el: HTMLElement;
        readonly autofocus?: boolean;
        readonly height?: string;
        readonly hideModeSwitch?: boolean;
        readonly initialEditType?: EditorType;
        readonly initialValue?: string;
        readonly toolbarItems?: string[][];
        readonly usageStatistics?: boolean;
        readonly events?: {
            readonly change?: () => void;
        };
    }

    export class Editor {
        constructor(options: EditorOptions);

        destroy(): void;

        getMarkdown(): string;
    }
}
