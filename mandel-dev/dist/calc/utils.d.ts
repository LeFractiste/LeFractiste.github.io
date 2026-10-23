import { ComplexPoint } from "../fractTypes.js";
export declare class cUtils {
    complexToString(c: ComplexPoint, digits?: number): string;
    static complexSqrt(c: ComplexPoint): {
        re: number;
        im: number;
    };
    static getFixedPoints(c: ComplexPoint): {
        root: {
            re: number;
            im: number;
        };
        stable: boolean;
    }[];
    static complexToString(c: ComplexPoint, digits?: number): string;
    static complexListToString(complexList: ComplexPoint[], decimals: number): string;
    static tryClipBoardCopy(text: string): void;
} /** cUtils */
//# sourceMappingURL=utils.d.ts.map