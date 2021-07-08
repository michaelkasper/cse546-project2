const config      = require( '../src/services/config' );
const puppeteer   = require( 'puppeteer' );
const fs          = require( 'fs' ).promises;
const fsSync      = require( 'fs' );
const delay       = require( './utilities/delay' );
const makeRequest = require( './utilities/makeRequest' );
const getQRCode   = require( './utilities/getQRCode' );
const qrCodes     = require( './qr-codes.json' );


describe( 'Test UI', () => {

    const imageDir           = __dirname + '/../../images/';
    const resultsDir         = __dirname + '/images/results/';
    const expectedResultsDir = __dirname + '/images/expected-results/';

    console.log( imageDir );

    const images = ( fsSync.readdirSync( imageDir ) ).filter( str => /(\.jpg|\.jpeg|\.png)$/.test( str ) ).slice( 0, 5 );

    const positions = [
        [ 100, 100 ], [ 20, 50 ], [ 300, 200 ]
    ];

    beforeAll( async () => {
        let browser = await puppeteer.launch( {
            defaultViewport: null,
            headless       : false,
            devtools       : true,
            // slowMo         : 150
        } );
        let page    = await browser.newPage();

        await page._client.send( 'Page.setDownloadBehavior', {
            behavior    : 'allow',
            downloadPath: resultsDir
        } );

        if ( fsSync.existsSync( resultsDir ) ) {
            await fs.rmdir( resultsDir, { recursive: true } );
        }

        await page.goto( config.WEB );

        for ( let i = 0; i < positions.length; i++ ) {
            const position = positions[ i ];
            for ( let ii = 0; ii < images.length; ii++ ) {
                await makeRequest( page, imageDir, images[ ii ], position, qrCodes[ ii ] );
            }
        }

        await delay( 2000 );

        await page.waitForFunction( () => document.getElementsByClassName( 'download-btn' ).length > 0 && document.querySelectorAll( '.download-btn.hide' ).length === 0 );

        await page.$$eval( '.download-btn', elHandles => elHandles.forEach( el => {
            el.click();
        } ) );

        await delay( 2000 );
    }, 900000 );


    const expectedResults = ( fsSync.readdirSync( expectedResultsDir ) ).filter( str => /(\.png)$/.test( str ) ).slice( 0, 1 );

    expectedResults.forEach( expectedResult => {
        test( 'Testing Image: ' + expectedResult, async () => {
            if ( fsSync.existsSync( resultsDir + expectedResult ) ) {

                expect( fsSync.readFileSync( expectedResultsDir + expectedResult ) )
                    .toEqual( fsSync.readFileSync( resultsDir + expectedResult ) );

            } else {
                fail( `missing ${ expectedResult } result` );
            }

        } )
    } );


    expectedResults.forEach( expectedResult => {
        const messageIndex = /^\[(?<messageIndex>[\-0-9]*)\]/.exec( expectedResult )?.groups?.messageIndex;
        const message      = qrCodes[ messageIndex ];
        test( 'Testing Code: ' + expectedResult + ' -> ' + message, async () => {
            const qrCode = await getQRCode( resultsDir + expectedResult );
            expect( qrCode.data ).toEqual( message );
        } )
    } );

} );
