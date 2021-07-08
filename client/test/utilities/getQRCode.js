const png  = require( "upng-js" );
const jsQR = require( 'jsqr' );
const fs   = require( 'fs' ).promises;

const loadPng = async ( path ) => {
    const data = png.decode( await fs.readFile( path ) );
    const out  = {
        data  : png.toRGBA8( data ),
        height: data.height,
        width : data.width,
    };
    return out;
}


module.exports = async ( imagePath ) => {
    const inputImage = await loadPng( imagePath );
    return jsQR( inputImage.data, inputImage.width, inputImage.height );
}
