export class cUtils {
    static complexSqrt(c: any): {
        re: number;
        im: number;
    };
    static getFixedPoints(c: any): {
        root: {
            re: number;
            im: number;
        };
        stable: boolean;
    }[];
    static complexToString(c: any, digits?: number): string;
    static complexListToString(complexList: any, decimals: any): string;
    static tryClipBoardCopy(textExpected: any): void;
} /** cUtils */
//# sourceMappingURL=utils.d.ts.map