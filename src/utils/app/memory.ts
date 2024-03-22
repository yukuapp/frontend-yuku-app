export class AsyncMemoryCache<T> {
    private key_value: Record<string, T> = {};

    async getItem(name: string): Promise<T | null> {
        return this.key_value[name] ?? null;
    }

    async setItem(name: string, value: T): Promise<void> {
        this.key_value[name] = value;
    }

    async removeItem(name: string): Promise<void> {
        delete this.key_value[name];
    }
}

export class MemoryCache<T> {
    private key_value: Record<string, T> = {};

    getItem(name: string): T | null {
        return this.key_value[name] ?? null;
    }

    setItem(name: string, value: T): void {
        this.key_value[name] = value;
    }

    removeItem(name: string): void {
        delete this.key_value[name];
    }

    getAllItems(): { key: string; value: T }[] {
        return Object.keys(this.key_value).map((key) => ({ key, value: this.key_value[key] }));
    }

    clean(): string[] {
        const keys = Object.keys(this.key_value);
        this.key_value = {};
        return keys;
    }
}
