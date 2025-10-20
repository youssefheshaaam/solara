(function() {
    const DB_NAME = 'solaraDB';
    const DB_VERSION = 1;
    const STORE_USERS = 'users';

    let dbPromise = null;

    function openDb() {
        if (dbPromise) return dbPromise;
        dbPromise = new Promise((resolve, reject) => {
            const req = indexedDB.open(DB_NAME, DB_VERSION);
            req.onupgradeneeded = (e) => {
                const db = req.result;
                if (!db.objectStoreNames.contains(STORE_USERS)) {
                    const store = db.createObjectStore(STORE_USERS, { keyPath: 'id', autoIncrement: true });
                    store.createIndex('email', 'email', { unique: true });
                }
            };
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
        return dbPromise;
    }

    function tx(storeName, mode) {
        return openDb().then(db => db.transaction(storeName, mode).objectStore(storeName));
    }

    function getByIndex(store, indexName, key) {
        return new Promise((resolve, reject) => {
            const idx = store.index(indexName);
            const rq = idx.get(key);
            rq.onsuccess = () => resolve(rq.result || null);
            rq.onerror = () => reject(rq.error);
        });
    }

    function getByKey(store, key) {
        return new Promise((resolve, reject) => {
            const rq = store.get(key);
            rq.onsuccess = () => resolve(rq.result || null);
            rq.onerror = () => reject(rq.error);
        });
    }

    function getAll(store) {
        return new Promise((resolve, reject) => {
            const rq = store.getAll();
            rq.onsuccess = () => resolve(rq.result || []);
            rq.onerror = () => reject(rq.error);
        });
    }

    function put(store, value) {
        return new Promise((resolve, reject) => {
            const rq = store.put(value);
            rq.onsuccess = () => resolve(rq.result);
            rq.onerror = () => reject(rq.error);
        });
    }

    function toHex(buffer) {
        const bytes = new Uint8Array(buffer);
        const hex = [];
        for (let i = 0; i < bytes.length; i++) hex.push(bytes[i].toString(16).padStart(2, '0'));
        return hex.join('');
    }

    function fromHex(hex) {
        const bytes = new Uint8Array(hex.length / 2);
        for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
        return bytes.buffer;
    }

    function randomSalt(len = 16) {
        const arr = new Uint8Array(len);
        crypto.getRandomValues(arr);
        return toHex(arr.buffer);
    }

    async function hashPassword(password, saltHex) {
        const enc = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveBits']);
        const salt = fromHex(saltHex);
        const bits = await crypto.subtle.deriveBits(
            { name: 'PBKDF2', salt, iterations: 120000, hash: 'SHA-256' },
            keyMaterial,
            256
        );
        return toHex(bits);
    }

    function publicUser(u) {
        return u ? { id: u.id, firstName: u.firstName, lastName: u.lastName, email: u.email, phone: u.phone, createdAt: u.createdAt } : null;
    }

    async function addUser(user) {
        // unique email check (separate, short-lived tx)
        const existing = await getUserByEmail(user.email);
        if (existing) throw new Error('Email already exists');
        // compute hash outside of transactions
        const salt = randomSalt();
        const passwordHash = await hashPassword(user.password, salt);
        const toSave = {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone || '',
            passwordHash,
            salt,
            createdAt: new Date().toISOString()
        };
        // write using a fresh write tx
        const writeStore = await tx(STORE_USERS, 'readwrite');
        const id = await put(writeStore, toSave);
        return publicUser({ id, ...toSave });
    }

    async function getUserByEmail(email) {
        const store = await tx(STORE_USERS, 'readonly');
        return getByIndex(store, 'email', email);
    }

    async function getUserById(id) {
        const store = await tx(STORE_USERS, 'readonly');
        return getByKey(store, Number(id));
    }

    async function verifyUser(email, password) {
        const u = await getUserByEmail(email);
        if (!u) return null;
        const computed = await hashPassword(password, u.salt);
        if (computed !== u.passwordHash) return null;
        return publicUser(u);
    }

    async function listUsers() {
        const store = await tx(STORE_USERS, 'readonly');
        const rows = await getAll(store);
        return rows.map(publicUser);
    }

    window.solaraDB = {
        open: openDb,
        addUser,
        getUserByEmail,
        getUserById,
        verifyUser,
        listUsers
    };
})();


