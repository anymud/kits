import * as Ops from '../utils'

export function _<T, Args extends readonly unknown[], R>(fn: (value: T, ...args: Args) => R) {
    return (...args: Args) => {
        return (value: T) => {
        return fn(value, ...args)
        }
    }
}

export const getLast = _(Ops.getLast)
export const resolveLast = _(Ops.resolveLast)
export const reduce = _(Ops.reduce);
export const filter = _(Ops.filter);
export const firstOrThrow = _(Ops.firstOrThrow);
export const flatMap = _(Ops.flatMap);
export const groupBy = _(Ops.groupBy);
export const map = _(Ops.map);
export const mapValues = _(Ops.mapValues);
export const orderWith = _(Ops.orderWith);
export const values = _(Ops.values);
export const split = _(Ops.split);
export const take = _(Ops.take);
export const join = _(Ops.join);
export const keys = _(Ops.keys);
export const entries = _(Ops.entries);
export const fromEntries = _(Ops.fromEntries);
export const pickBy = _(Ops.pickBy);
export const uniq = _(Ops.uniq);
export const keyBy = _(Ops.keyBy);
export const merge = _(Ops.merge);
export const skip = _(Ops.skip);
export const cursor = _(Ops.cursor);
export const page = _(Ops.page);
export const chunk = _(Ops.chunk);
export const first = _(Ops.first);
export const last = _(Ops.last);
export const lastOrThrow = _(Ops.lastOrThrow);
export const sample = _(Ops.sample);
export const shuffle = _(Ops.shuffle);
export const withData = _(Ops.withData);
export const sampleSize = _(Ops.sampleSize);
export const orderBy = _(Ops.orderBy);
export const words = _(Ops.words);
export const camelCase = _(Ops.camelCase);
export const snakeCase = _(Ops.snakeCase);
export const kebabCase = _(Ops.kebabCase);
export const toUpper = _(Ops.toUpper);
export const toLower = _(Ops.toLower);
export const upperFirst = _(Ops.upperFirst);
export const lowerFirst = _(Ops.lowerFirst);
export const compact = _(Ops.compact);

// A generic pipe function with improved typing
export function pipe<A>(a: A): A;
export function pipe<A, B>(a: A, ab: (a: A) => B): B;
export function pipe<A, B, C>(a: A, ab: (a: A) => B, bc: (b: B) => C): C;
export function pipe<A, B, C, D>(a: A, ab: (a: A) => B, bc: (b: B) => C, cd: (c: C) => D): D;
export function pipe<A, B, C, D, E>(a: A, ab: (a: A) => B, bc: (b: B) => C, cd: (c: C) => D, de: (d: D) => E): E;
export function pipe<A, B, C, D, E, F>(a: A, ab: (a: A) => B, bc: (b: B) => C, cd: (c: C) => D, de: (d: D) => E, ef: (e: E) => F): F;
export function pipe<A, B, C, D, E, F, G>(a: A, ab: (a: A) => B, bc: (b: B) => C, cd: (c: C) => D, de: (d: D) => E, ef: (e: E) => F, fg: (f: F) => G): G;
export function pipe<A, B, C, D, E, F, G, H>(a: A, ab: (a: A) => B, bc: (b: B) => C, cd: (c: C) => D, de: (d: D) => E, ef: (e: E) => F, fg: (f: F) => G, gh: (g: G) => H): H;
export function pipe<A, B, C, D, E, F, G, H, I>(a: A, ab: (a: A) => B, bc: (b: B) => C, cd: (c: C) => D, de: (d: D) => E, ef: (e: E) => F, fg: (f: F) => G, gh: (g: G) => H, hi: (h: H) => I): I;
export function pipe<A, B, C, D, E, F, G, H, I, J>(a: A, ab: (a: A) => B, bc: (b: B) => C, cd: (c: C) => D, de: (d: D) => E, ef: (e: E) => F, fg: (f: F) => G, gh: (g: G) => H, hi: (h: H) => I, ij: (i: I) => J): J;
export function pipe<A, B, C, D, E, F, G, H, I, J, K>(a: A, ab: (a: A) => B, bc: (b: B) => C, cd: (c: C) => D, de: (d: D) => E, ef: (e: E) => F, fg: (f: F) => G, gh: (g: G) => H, hi: (h: H) => I, ij: (i: I) => J, jk: (j: J) => K): K;
export function pipe<A, B, C, D, E, F, G, H, I, J, K, L>(a: A, ab: (a: A) => B, bc: (b: B) => C, cd: (c: C) => D, de: (d: D) => E, ef: (e: E) => F, fg: (f: F) => G, gh: (g: G) => H, hi: (h: H) => I, ij: (i: I) => J, jk: (j: J) => K, kl: (k: K) => L): L;
export function pipe<A, B, C, D, E, F, G, H, I, J, K, L, M>(a: A, ab: (a: A) => B, bc: (b: B) => C, cd: (c: C) => D, de: (d: D) => E, ef: (e: E) => F, fg: (f: F) => G, gh: (g: G) => H, hi: (h: H) => I, ij: (i: I) => J, jk: (j: J) => K, kl: (k: K) => L, lm: (l: L) => M): M;
export function pipe<A, B, C, D, E, F, G, H, I, J, K, L, M, N>(a: A, ab: (a: A) => B, bc: (b: B) => C, cd: (c: C) => D, de: (d: D) => E, ef: (e: E) => F, fg: (f: F) => G, gh: (g: G) => H, hi: (h: H) => I, ij: (i: I) => J, jk: (j: J) => K, kl: (k: K) => L, lm: (l: L) => M, mn: (m: M) => N): N;
export function pipe<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O>(a: A, ab: (a: A) => B, bc: (b: B) => C, cd: (c: C) => D, de: (d: D) => E, ef: (e: E) => F, fg: (f: F) => G, gh: (g: G) => H, hi: (h: H) => I, ij: (i: I) => J, jk: (j: J) => K, kl: (k: K) => L, lm: (l: L) => M, mn: (m: M) => N, no: (n: N) => O): O;
export function pipe<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P>(a: A, ab: (a: A) => B, bc: (b: B) => C, cd: (c: C) => D, de: (d: D) => E, ef: (e: E) => F, fg: (f: F) => G, gh: (g: G) => H, hi: (h: H) => I, ij: (i: I) => J, jk: (j: J) => K, kl: (k: K) => L, lm: (l: L) => M, mn: (m: M) => N, no: (n: N) => O, op: (o: O) => P): P;
export function pipe<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q>(a: A, ab: (a: A) => B, bc: (b: B) => C, cd: (c: C) => D, de: (d: D) => E, ef: (e: E) => F, fg: (f: F) => G, gh: (g: G) => H, hi: (h: H) => I, ij: (i: I) => J, jk: (j: J) => K, kl: (k: K) => L, lm: (l: L) => M, mn: (m: M) => N, no: (n: N) => O, op: (o: O) => P, pq: (p: P) => Q): Q;
export function pipe<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R>(a: A, ab: (a: A) => B, bc: (b: B) => C, cd: (c: C) => D, de: (d: D) => E, ef: (e: E) => F, fg: (f: F) => G, gh: (g: G) => H, hi: (h: H) => I, ij: (i: I) => J, jk: (j: J) => K, kl: (k: K) => L, lm: (l: L) => M, mn: (m: M) => N, no: (n: N) => O, op: (o: O) => P, pq: (p: P) => Q, qr: (q: Q) => R): R;
export function pipe<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S>(a: A, ab: (a: A) => B, bc: (b: B) => C, cd: (c: C) => D, de: (d: D) => E, ef: (e: E) => F, fg: (f: F) => G, gh: (g: G) => H, hi: (h: H) => I, ij: (i: I) => J, jk: (j: J) => K, kl: (k: K) => L, lm: (l: L) => M, mn: (m: M) => N, no: (n: N) => O, op: (o: O) => P, pq: (p: P) => Q, qr: (q: Q) => R, rs: (r: R) => S): S;
export function pipe<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T>(a: A, ab: (a: A) => B, bc: (b: B) => C, cd: (c: C) => D, de: (d: D) => E, ef: (e: E) => F, fg: (f: F) => G, gh: (g: G) => H, hi: (h: H) => I, ij: (i: I) => J, jk: (j: J) => K, kl: (k: K) => L, lm: (l: L) => M, mn: (m: M) => N, no: (n: N) => O, op: (o: O) => P, pq: (p: P) => Q, qr: (q: Q) => R, rs: (r: R) => S, st: (s: S) => T): T;
export function pipe<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U>(a: A, ab: (a: A) => B, bc: (b: B) => C, cd: (c: C) => D, de: (d: D) => E, ef: (e: E) => F, fg: (f: F) => G, gh: (g: G) => H, hi: (h: H) => I, ij: (i: I) => J, jk: (j: J) => K, kl: (k: K) => L, lm: (l: L) => M, mn: (m: M) => N, no: (n: N) => O, op: (o: O) => P, pq: (p: P) => Q, qr: (q: Q) => R, rs: (r: R) => S, st: (s: S) => T, tu: (t: T) => U): U;
// Extend as needed
export function pipe(a: any, ...ops: ((arg: any) => any)[]): any {
  return ops.reduce((acc, op) => op(acc), a);
}


export function pipeAsync<A, B>(a: A, ab: (a: A) => Promise<B>): Promise<B>;
export function pipeAsync<A, B, C>(a: A, ab: (a: A) => Promise<B>, bc: (b: B) => Promise<C>): Promise<C>;
export function pipeAsync<A, B, C, D>(a: A, ab: (a: A) => Promise<B>, bc: (b: B) => Promise<C>, cd: (c: C) => Promise<D>): Promise<D>;
export function pipeAsync<A, B, C, D, E>(a: A, ab: (a: A) => Promise<B>, bc: (b: B) => Promise<C>, cd: (c: C) => Promise<D>, de: (d: D) => Promise<E>): Promise<E>;
export function pipeAsync<A, B, C, D, E, F>(a: A, ab: (a: A) => Promise<B>, bc: (b: B) => Promise<C>, cd: (c: C) => Promise<D>, de: (d: D) => Promise<E>, ef: (e: E) => Promise<F>): Promise<F>;
export function pipeAsync<A, B, C, D, E, F, G>(a: A, ab: (a: A) => Promise<B>, bc: (b: B) => Promise<C>, cd: (c: C) => Promise<D>, de: (d: D) => Promise<E>, ef: (e: E) => Promise<F>, fg: (f: F) => Promise<G>): Promise<G>;
export function pipeAsync<A, B, C, D, E, F, G, H>(a: A, ab: (a: A) => Promise<B>, bc: (b: B) => Promise<C>, cd: (c: C) => Promise<D>, de: (d: D) => Promise<E>, ef: (e: E) => Promise<F>, fg: (f: F) => Promise<G>, gh: (g: G) => Promise<H>): Promise<H>;
export function pipeAsync(a: any, ...ops: ((arg: any) => Promise<any>)[]): Promise<any> {
  return ops.reduce((acc, op) => op(acc), a);
}