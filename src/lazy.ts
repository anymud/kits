type HealthCheckParams<T> = [
    value: T,
    info: {
        createdAt?: Date;
    }
];
type LazyOptions<T> = {
    healthCheck?: (...args: HealthCheckParams<T>) => boolean;
}

export function useLazy<Args extends unknown[], T>(generator: (...args: Args) => T) {
    let value: T;
    let hasValue: boolean;
    return (...args: Args) => {
        if (!hasValue) {
            hasValue = true;
            value = generator(...args);
        }
        return value;
    }
}

export function useLazyMany<Args extends unknown[], T, K = Args>(generator: (...args: Args) => T, { healthCheck, key }: LazyOptions<T> & {
    key?: (...args: Args) => K;
} = {}) {
    const cache = new Map<K, {
        value: T;
        createdAt: Date;
    }>();
    return (...args: Args) => {
        const k = key?.(...args);
        if (!k) {
            throw new Error('key is required');
        }
        let entry = cache.get(k);
        if (!entry || (healthCheck && !healthCheck(entry.value, { createdAt: entry.createdAt }))) {
            entry = {
                createdAt: new Date(),
                value: generator(...args)
            };
            cache.set(k, entry);
        }
        return entry.value;
    };
}
