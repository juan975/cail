/**
 * Value Object: UserId
 * Representa un identificador único de usuario validado
 */
export class UserId {
    private readonly value: string;

    constructor(id: string) {
        if (!id || id.trim().length === 0) {
            throw new Error('UserId cannot be empty');
        }
        this.value = id;
    }

    getValue(): string {
        return this.value;
    }

    equals(other: UserId): boolean {
        return this.value === other.value;
    }

    toString(): string {
        return this.value;
    }
}
