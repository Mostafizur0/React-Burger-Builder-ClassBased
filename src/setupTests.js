import '@testing-library/jest-dom';

// The Firebase SDK needs a CSPRNG for session nonce generation. jsdom does not
// provide crypto.getRandomValues, so a deterministic stub is installed here.
const { crypto } = window;

if ( crypto && ! crypto.getRandomValues ) {
    Object.defineProperty( window, 'crypto', {
        value: {
            getRandomValues: ( arr ) => {
                for ( let i = 0; i < arr.length; i++ ) {
                    arr[i] = Math.floor( Math.random() * 256 );
                }
                return arr;
            },
            randomUUID: () => '00000000-0000-4000-8000-000000000000'
        },
        configurable: true,
        writable: true
    });
}
