export class FirstRender {
    mark = false;
    once(callback: () => void): () => void {
        return () => {
            if (this.mark) {
                this.mark = false;
                return;
            }
            this.mark = true;
            callback();
        };
    }
}

export class FirstRenderByData {
    private comparer: (t1: any[], t2: any[]) => boolean = (t1: any[], t2: any[]) => {
        if (t1 === t2) return true;
        if (t1.length !== t2.length) return false;
        for (let i = 0; i < t1.length; i++) {
            if (JSON.stringify(t1[i]) !== JSON.stringify(t2[i])) return false;
        }
        return true;
    };
    private data: any[] | undefined;

    constructor(comparer?: (t1: any[], t2: any[]) => boolean, data?: any[], error?: string) {
        if (comparer !== undefined) this.comparer = comparer;
        this.data = data;
        if (error) console.error('new FirstRenderByData()', error);
    }

    once(data: any[] | undefined, callback: () => void, empty?: () => void) {
        if (data === undefined) {
            this.data = undefined;
            empty && empty();
            return;
        }
        if (this.data !== undefined && this.comparer(this.data, data)) {
            return;
        }
        this.data = [...data];
        callback();
    }

    // clean() {
    //     this.data = undefined;
    // }
}

export class FirstRenderWithData<T> {
    data: T;
    constructor(data: T) {
        this.data = data;
    }
    set(data: T) {
        this.data = data;
    }
    execute(condition: (d: T) => boolean, callback: () => void) {
        const execute = condition(this.data);
        if (execute) callback();
    }
}
