import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';

jest.mock('firebase/app', () => ({ initializeApp: jest.fn() }));
jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(),
    connectAuthEmulator: jest.fn()
}));
jest.mock('firebase/database', () => ({
    getDatabase: jest.fn(),
    connectDatabaseEmulator: jest.fn()
}));

const CONFIG = {
    REACT_APP_FIREBASE_API_KEY: 'api-key',
    REACT_APP_FIREBASE_AUTH_DOMAIN: 'project.firebaseapp.com',
    REACT_APP_FIREBASE_PROJECT_ID: 'project',
    REACT_APP_FIREBASE_DATABASE_URL: 'https://project.firebaseio.com',
    REACT_APP_FIREBASE_STORAGE_BUCKET: 'project.appspot.com',
    REACT_APP_FIREBASE_APP_ID: 'app-id'
};

const loadModule = (env = CONFIG) => {
    let firebaseService;

    jest.isolateModules(() => {
        firebaseService = require('./firebase');
    });

    return firebaseService;
};

describe('firebase service', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        process.env = { ...originalEnv, ...CONFIG };
        initializeApp.mockReset();
        getAuth.mockReset();
        getDatabase.mockReset();
        connectAuthEmulator.mockReset();
        connectDatabaseEmulator.mockReset();
        initializeApp.mockReturnValue({ name: 'app' });
        getAuth.mockReturnValue({ name: 'auth' });
        getDatabase.mockReturnValue({ name: 'database' });
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it('should expose the auth and database handles when configured', () => {
        const service = loadModule();

        expect(service.isFirebaseConfigured).toBe(true);
        expect(service.auth).toEqual({ name: 'auth' });
        expect(service.database).toEqual({ name: 'database' });
        expect(initializeApp).toHaveBeenCalledTimes(1);
    });

    it('should report the app as unconfigured when a required key is missing', () => {
        process.env = { ...originalEnv, ...CONFIG, REACT_APP_FIREBASE_API_KEY: '' };
        const service = loadModule();

        expect(service.isFirebaseConfigured).toBe(false);
        expect(service.auth).toBeNull();
        expect(service.database).toBeNull();
        expect(initializeApp).not.toHaveBeenCalled();
    });

    it('should degrade gracefully when initialization throws', () => {
        initializeApp.mockImplementation(() => {
            throw new Error('invalid api key');
        });

        const service = loadModule();

        expect(service.auth).toBeNull();
        expect(service.database).toBeNull();
    });

    it('should initialize the app with the resolved configuration', () => {
        loadModule();

        expect(initializeApp).toHaveBeenCalledWith({
            apiKey: 'api-key',
            authDomain: 'project.firebaseapp.com',
            projectId: 'project',
            databaseURL: 'https://project.firebaseio.com',
            storageBucket: 'project.appspot.com',
            appId: 'app-id'
        });
    });

    it('should not connect to the emulators when no emulator host is set', () => {
        const service = loadModule();

        expect(service.isFirebaseConfigured).toBe(true);
        expect(connectAuthEmulator).not.toHaveBeenCalled();
        expect(connectDatabaseEmulator).not.toHaveBeenCalled();
    });

    it('should connect to the auth and database emulators when the hosts are set', () => {
        process.env = {
            ...originalEnv,
            ...CONFIG,
            REACT_APP_FIREBASE_AUTH_EMULATOR_HOST: '127.0.0.1:9099',
            REACT_APP_FIREBASE_DATABASE_EMULATOR_HOST: '127.0.0.1:9000'
        };

        const service = loadModule();

        expect(service.isFirebaseConfigured).toBe(true);
        expect(connectAuthEmulator).toHaveBeenCalledWith(
            { name: 'auth' },
            'http://127.0.0.1:9099',
            { disableWarnings: true }
        );
        expect(connectDatabaseEmulator).toHaveBeenCalledWith(
            { name: 'database' },
            '127.0.0.1',
            9000
        );
    });
});
