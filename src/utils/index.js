
// Search through an array of objects and return the first object with a matching key and value.
function search(value, propery, arr) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i][propery] === value) {
            return arr[i];
        }
    }
}

export { search };