export interface CodeFileData {
    code: string;
    lang: string;
    lineNumbers: boolean;
    lineStart: number;
    name: string;
    highlightLines?: number[];
    focusedLines?: number[];
    diffAddLines?: number[];
    diffReduceLines?: number[];
    warningLines?: number[];
    errorLines?: number[];
}
