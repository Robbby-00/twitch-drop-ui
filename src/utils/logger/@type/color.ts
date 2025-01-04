/**
 * Represents various colors for console output
 */
export class Color {
    /**
     * ANSI code for red color
     */
    static RED: string = "\x1b[31m"
    /**
     * ANSI code for green color
     */
    static GREEN: string = "\x1b[32m"
    /**
     * ANSI code for yellow color
     */
    static YELLOW: string = "\x1b[33m"
    /**
     * ANSI code for blue color
     */
    static BLUE: string = "\x1b[34m"
    /**
     * ANSI code for magenta color
     */
    static MAGENTA: string = "\x1b[35m"
    /**
     * ANSI code for cyan color
     */
    static CYAN: string = "\x1b[36m"
    /**
     * ANSI code to reset color
     */
    static RESET: string = "\x1b[0m"
}