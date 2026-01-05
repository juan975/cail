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
}
