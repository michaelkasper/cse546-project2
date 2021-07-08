module.exports = ( image, position, index ) => `[${index}] (${ position[ 0 ] },${ position[ 1 ] }) ${ image }`
    .replace( /\.jpeg$/, ".png" )
    .replace( /\.jpg$/, ".png" );
