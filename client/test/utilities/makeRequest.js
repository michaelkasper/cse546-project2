const buildResultName = require( './buildResultName' );
const delay           = require( './delay' );
const qrCodes         = require( '../qr-codes.json' );

module.exports = async ( page, imageDir, image, position, message ) => {
    const messageIndex = qrCodes.indexOf( message );

    await page.waitForSelector( '.btn-choose' );

    const inputUploadHandle = await page.$( 'input[type=file]' );
    await inputUploadHandle.uploadFile( imageDir + image );

    await page.waitForSelector( '#request-form' );

    await delay( 500 );

    const previewWrapper = await page.$( '#preview-image' );
    const bounding_box   = await previewWrapper.boundingBox();

    await page.mouse.move( bounding_box.x + bounding_box.width - 30, bounding_box.y + bounding_box.height - 30 );
    await page.mouse.down();
    await page.mouse.move( bounding_box.x + position[ 0 ], bounding_box.y + position[ 1 ] );
    await page.mouse.up();

    await page.type( "#qr-code-message", message );
    await page.click( "#submit-request" );

    await delay( 100 );

    const resultName = buildResultName( image, position, messageIndex );
    await page.$eval( `.download-btn[data-download-name="${ image }"]`, ( e, resultName ) => {
        e.setAttribute( "data-download-name", resultName )
    }, resultName )
}
