interface CaptchaSession {
    userId: string;
    guildId: string;
    correctAnswer: string;
    attempts: number;
    messageId?: string;
    timeout?: NodeJS.Timeout;
}

class CaptchaManager {
    private sessions: Map<string, CaptchaSession> = new Map();

    createSession(userId: string, guildId: string, correctAnswer: string): void {
        const sessionId = `${userId}-${guildId}`;
        
        // Clear existing session if any
        this.clearSession(sessionId);

        const session: CaptchaSession = {
            userId,
            guildId,
            correctAnswer,
            attempts: 0,
            timeout: setTimeout(() => {
                this.clearSession(sessionId);
            }, 10 * 60 * 1000) // 10 minutes
        };

        this.sessions.set(sessionId, session);
    }

    getSession(userId: string, guildId: string): CaptchaSession | undefined {
        return this.sessions.get(`${userId}-${guildId}`);
    }

    incrementAttempts(userId: string, guildId: string): number {
        const session = this.getSession(userId, guildId);
        if (session) {
            session.attempts++;
            return session.attempts;
        }
        return 0;
    }

    setMessageId(userId: string, guildId: string, messageId: string): void {
        const session = this.getSession(userId, guildId);
        if (session) {
            session.messageId = messageId;
        }
    }

    clearSession(sessionId: string): void {
        const session = this.sessions.get(sessionId);
        if (session?.timeout) {
            clearTimeout(session.timeout);
        }
        this.sessions.delete(sessionId);
    }

    clearUserSession(userId: string, guildId: string): void {
        this.clearSession(`${userId}-${guildId}`);
    }

    isValidAnswer(userId: string, guildId: string, answer: string): boolean {
        const session = this.getSession(userId, guildId);
        return session ? session.correctAnswer.toLowerCase() === answer.toLowerCase() : false;
    }
}

export const captchaManager = new CaptchaManager();