csr-matrix
===========
A very minimal [incremental compressed sparse row](http://en.wikipedia.org/wiki/Sparse_matrix#Compressed_sparse_row_.28CSR_or_CRS.29) matrix library for JavaScript.

Usage
=====
First install using npm:

    npm install csr-matrix

Then you can create a matrix and apply it to a vector like this:

```javascript
var dict = {}
dict[[1,2]] = 1
dict[[0,0]] = 2.5
dict[[3,4]] = 5

var CSRMatrix = require("csr-matrix")

var M = CSRMatrix.fromDictionary(dict)
console.log(M.apply([1,2,3,4,5]))
```

## Matrix-Vector Product
CSRMatrices are optimized for exactly one thing:  fast matrix-vector multiplies.  The way you do this is by calling the following method:

### `matrix.apply(vector[, result])`
This computes the normal matrix-vector product, but is often much faster than a dense multiply since the matrix is stored in a compressed sparse format.

* `vector` is the vector to be multiplied
* `result` is an optional array which gets the result.  If not specified, a new vector gets allocated

Returns the resulting product

## Constructors
There are several ways to create csr-matrices.  The most direct way to do this is to just call the constructor yourself:

### `CSRMatrix(rows, row_ptrs, columns, column_ptrs, data)`
Where:

* `rows` is an array of row indices
* `row_ptrs` is an array of pointers to the start of each row
* `columns` is an array of column names
* `column_data` is a pointer to the start of each column's run
* `data` is an array of all the entries of the matrix stored left-to-right and top-to-bottom

Calling this method directly is not advised.  Instead, you should use one of the more user-friendly constructors:

### `CSRMatrix.fromList(items[, nrows])`
Turns an array of entries of the form `[row, column, value]` into a sparse matrix.  Note that if there are some zero rows at the end of the matrix, you need to specify the number of rows in the nrows optional argument.

### `CSRMatrix.fromDictionary(dict[, nrows])`
Converts a JavaScript object with entries for the form `"row,column"` into a sparse matrix.

### `CSRMatrix.fromDense(mat)`
Turns an array-of-arrays into a csr matrix

### `CSRMatrix.fromNDArray(ndarr)`
Turns a 2D dimensional [ndarray](https://github.com/mikolalysenko/ndarray) into a csr matrix

Credits
=======
(c) 2013 Mikola Lysenko. BSD
