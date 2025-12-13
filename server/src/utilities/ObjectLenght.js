export default (object, min, max) => {
    
    const length = Object.keys(object).length;
    
    if ( !max ) {
        if ( length != min ) {
            return -1;
        }
        return 0;
    }

    if (length < min ) {
        return -1;
    }
    if (length > max ) {
        return 1;
    }
    return 0;
}