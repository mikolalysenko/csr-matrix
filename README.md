csr-matrix
===========
A very minimal [incremental compressed sparse row](http://en.wikipedia.org/wiki/Sparse_matrix#Compressed_sparse_row_.28CSR_or_CRS.29) matrix library for JavaScript.


# Install

```
npm i csr-matrix
```

# Example

```javascript
var dict = {}
dict[[1,2]] = 1
dict[[0,0]] = 2.5
dict[[3,4]] = 5

var CSRMatrix = require("csr-matrix")

var M = CSRMatrix.fromDictionary(dict, 4, 5)
console.log(M.apply([1,2,3,4,5], []))
```

# API
CSRMatrices are optimized for exactly one thing:  fast matrix-vector multiplies.  The way you do this is by calling the following method:

## Constructors
There are several ways to create csr-matrices.  The most direct way to do this is to just call the constructor yourself:

#### `CSRMatrix.fromList(items[, nrows, ncols])`
Turns an array of entries of the form `[row, column, value]` into a sparse matrix.  Note that if there are some zero rows or columns at the end of the matrix, you need to specify the number of rows/columns in the optional nrows/ncols arguments.

#### `CSRMatrix.fromDictionary(dict[, nrows, ncols])`
Converts a JavaScript object with entries for the form `"row,column"` into a sparse matrix.

#### `CSRMatrix.fromDense(mat)`
Turns an array-of-arrays into a csr matrix

#### `CSRMatrix.fromNDArray(ndarr)`
Turns a 2D dimensional [ndarray](https://github.com/scijs/ndarray) into a csr matrix

## Method

#### `matrix.apply(vector[, result])`
This computes the normal matrix-vector product, but is often much faster than a dense multiply since the matrix is stored in a compressed sparse format.

* `vector` is the vector to be multiplied
* `result` is an optional array which gets the result.  If not specified, a new vector gets allocated

Returns the resulting product

#### `matrix.transpose()`
Returns the transpose of the matrix

#### `matrix.rowCount`
Returns the number of rows

#### `matrix.columnCount`
Returns the number of columns

#### `matrix.toList()`
Converts matrix into a list format

#### `matrix.toDictionary()`
Converts matrix into hash table

#### `matrix.toDense()`
Converts matrix into array of arrays

#### `matrix.toNDArray(out)`
Converts matrix into ndarray

* `out` is the output ndarray

# Credits
(c) 2013-2015 Mikola Lysenko. BSD
