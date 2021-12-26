declare module 'net-ping' {
    export type Session = {
        pingHost: (target: string, callback: (error: string, target: string) => void) => Session
    }
    export function createSession(): Session
}