const INDEXED_DB =
    window.indexedDB ||
    (window as any).mozIndexedDB ||
    (window as any).webkitIndexedDB ||
    (window as any).msIndexedDB ||
    (window as any).shimIndexedDB;

class IndexedDB {
    private db_name: string;
    private db_version: number;
    private store_name: string;
    constructor(db_name: string, db_version: number, store_name: string) {
        this.db_name = db_name;
        this.db_version = db_version;
        this.store_name = store_name;
    }

    private async getDB(): Promise<IDBDatabase> {
        return new Promise((resolve) => {
            const request = INDEXED_DB.open(this.db_name, this.db_version);
            request.onupgradeneeded = (event: any) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.store_name)) {
                    db.createObjectStore(this.store_name, { keyPath: 'name' });
                }
            };
            request.onsuccess = () => resolve(request.result);
        });
    }

    async getItem(name: string): Promise<string | null> {
        const db = await this.getDB();
        const transaction = db.transaction([this.store_name]);
        const store = transaction.objectStore(this.store_name);
        const request = store.get(name);

        return new Promise((resolve) => {
            request.onerror = () => {
                throw new Error(
                    `indexed db get item failed: ${name} from ${this.db_name}-${this.db_version}-${this.store_name}`,
                );
            };

            request.onsuccess = () => resolve(request.result ? request.result.value : null);
        });
    }

    async setItem(name: string, value: string): Promise<void> {
        const db = await this.getDB();
        const transaction = db.transaction([this.store_name], 'readwrite');
        const store = transaction.objectStore(this.store_name);
        const request = store.put({ name, value });

        return new Promise((resolve) => {
            request.onerror = () => {
                throw new Error(
                    `indexed db set item failed: ${name} from ${this.db_name}-${this.db_version}-${this.store_name}`,
                );
            };

            request.onsuccess = () => resolve();
        });
    }

    async removeItem(name: string): Promise<void> {
        const db = await this.getDB();
        const transaction = db.transaction([this.store_name], 'readwrite');
        const store = transaction.objectStore(this.store_name);
        const request = store.delete(name);

        return new Promise((resolve) => {
            request.onerror = () => {
                throw new Error(
                    `indexed db set item failed: ${name} from ${this.db_name}-${this.db_version}-${this.store_name}`,
                );
            };

            request.onsuccess = () => resolve();
        });
    }
}

export const INDEXED_DB_YUKU = INDEXED_DB ? new IndexedDB('yuku', 1, 'key_value') : undefined;
