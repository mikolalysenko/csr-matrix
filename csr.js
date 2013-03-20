"use strict"

var numeric = require("numeric")
var ndarray = require("ndarray")
var cwise = require("cwise")

var EPSILON = 1e-8

function CSRMatrix(rows, row_ptrs, columns, column_ptrs, data) {
  this.rows = rows
  this.row_ptrs = row_ptrs
  this.columns = columns
  this.column_ptrs = column_ptrs
  this.data = data
}

Object.defineProperty(CSRMatrix.prototype, "rowCount", {
  get: function() {
    return this.rows[this.rows.length-1]
  }
})

Object.defineProperty(CSRMatrix.prototype, "columnCount", {
  get: function() {
    return this.columns[this.columns.length-1]
  }
})

function applyImpl(rows, row_ptrs, columns, column_ptrs, data, vector, result) {
  var cptr = 0, dptr = 0, last_r = 0
  for(var i=0, rlen=rows.length-1; i<rlen; ++i) {
    var r = rows[i]
    var next_c = row_ptrs[i+1]
    var s = 0.0
    while(++last_r < r) {
      result[last_r] = 0.0
    }
    while(cptr < next_c) {
      var c = columns[cptr]
      var next_d = column_ptrs[++cptr]
      while(dptr < next_d) {
        s += data[dptr++] * vector[c++]
      }
    }
    result[r] = s
  }
  var len = result.length
  while(++last_r < len) {
    result[last_r] = 0.0
  }
}

CSRMatrix.prototype.apply = function(vector, result) {
  if(!result) {
    result = new Float64Array(this.rowCount)
  } else if(result.length !== this.rowCount) {
    throw new Error("Result vector shape mismatch")
  }
  if(vector.length !== this.columnCount) {
    throw new Error("Input vector shape mismatch")
  }
  applyImpl(this.rows, this.row_ptrs, this.columns, this.column_ptrs, this.data, vector, result)
  return result
}

CSRMatrix.prototype.transpose = function() {
  var items = this.toList()
  for(var i=0; i<items.length; ++i) {
    var it = items[i]
    var tmp = it[0]
    it[0] = it[1]
    it[1] = tmp
  }
  return fromList(items, this.columnCount, this.rowCount)
}

CSRMatrix.prototype.toList = function() {
  var result = []
  for(var i=0, ilen=this.rows.length-1; i<ilen; ++i) {
    var r = this.rows[i];
    for(var j=this.row_ptrs[i], jlen=this.row_ptrs[i+1]; j<jlen; ++j) {
      var c = this.columns[j]
      for(var k=this.column_ptrs[j], klen=this.column_ptrs[j+1]; k<klen; ++k) {
        var d = this.data[k]
        result.push([r, c++, d])
      }
    }
  }
  return result
}

CSRMatrix.prototype.toDictionary = function() {
  var result = {}
  for(var i=0, ilen=this.rows.length-1; i<ilen; ++i) {
    var r = this.rows[i];
    for(var j=this.row_ptrs[i], jlen=this.row_ptrs[i+1]; j<jlen; ++j) {
      var c = this.columns[j]
      for(var k=this.column_ptrs[j], klen=this.column_ptrs[j+1]; k<klen; ++k) {
        var d = this.data[k]
        result[[r, c++]] = d
      }
    }
  }
  return result
}

CSRMatrix.prototype.toDense = function() {
  var result = numeric.rep([this.rowCount, this.columnCount], 0.0)
  for(var i=0, ilen=this.rows.length-1; i<ilen; ++i) {
    var r = this.rows[i];
    for(var j=this.row_ptrs[i], jlen=this.row_ptrs[i+1]; j<jlen; ++j) {
      var c = this.columns[j]
      for(var k=this.column_ptrs[j], klen=this.column_ptrs[j+1]; k<klen; ++k) {
        var d = this.data[k]
        result[r][c++] = d
      }
    }
  }
  return result
}

CSRMatrix.prototype.toNDArray = function() {
  var result = ndarray.zeros([this.rowCount, this.columnCount])
  for(var i=0, ilen=this.rows.length-1; i<ilen; ++i) {
    var r = this.rows[i];
    for(var j=this.row_ptrs[i], jlen=this.row_ptrs[i+1]; j<jlen; ++j) {
      var c = this.columns[j]
      for(var k=this.column_ptrs[j], klen=this.column_ptrs[j+1]; k<klen; ++k) {
        var d = this.data[k]
        result.set(r, c++, d)
      }
    }
  }
  return result
}

function compareKey(a, b) {
  var d = a[0] - b[0]
  if(d) { return d }
  return a[1] - b[1]
}

function removeDuplicates(items, nrows, ncols) {
  var i=0, ptr=0
  items.sort(compareKey)
  while(i < items.length) {
    var it = items[i++]
    if(it[0] >= nrows || it[1] >= ncols) {
      continue
    }
    while(i < items.length && compareKey(items[i], it) === 0) {
      it[2] += items[i++][2]
    }
    if(Math.abs(it[2]) > EPSILON) {
      items[ptr++] = it
    }
  }
  items.length = ptr
  return items
}

function fromList(items, nrows, ncols) {
  items = removeDuplicates(items, nrows || Infinity, ncols || Infinity)
  var rows = []
    , row_ptrs = []
    , cols = []
    , col_ptrs = []
    , data = new Float64Array(items.length)
  nrows = nrows || 0
  ncols = ncols || 0
  for(var i=0; i<items.length; ++i) {
    var item = items[i]
    if(i === 0 || item[0] !== items[i-1][0]) {
      rows.push(item[0])
      row_ptrs.push(cols.length)
      cols.push(item[1])
      col_ptrs.push(i)
    } else if(item[1] !== items[i-1][1]+1) {
      cols.push(item[1])
      col_ptrs.push(i)
    }
    nrows = Math.max(nrows, item[0]+1)
    ncols = Math.max(ncols, item[1]+1)
    data[i] = item[2]
  }
  rows.push(nrows)
  row_ptrs.push(cols.length)
  cols.push(ncols)
  col_ptrs.push(data.length)
  return new CSRMatrix(
    new Uint32Array(rows),
    new Uint32Array(row_ptrs),
    new Uint32Array(cols),
    new Uint32Array(col_ptrs),
    data)
}

function fromDictionary(dict, nrows, ncols) {
  var keys = Object.keys(dict)
    , items = new Array(keys.length)
    , i=0, v, k
  for(i=keys.length-1; i>=0; --i) {
    k = keys[i]
    v = k.split(',')
    items[i] = [parseInt(v[0]), parseInt(v[1]), dict[k]]
  }
  return fromList(items, nrows, ncols)
}

var getComponents = cwise({
  args: ["array", "index", "scalar"],
  pre: function() {
    this.items = []
    this.abs = Math.abs
  },
  body: function(a, i, EPSILON) {
    if(this.abs(a) > EPSILON) {
      this.items.push([i[0], i[1], a])
    }
  },
  post: function() {
    return this.items
  }
})

function fromNDArray(ndarr) {
  return fromList(getComponents(ndarr, EPSILON), ndarr.shape[0], ndarr.shape[1])
}

function fromDense(mat) {
  var items = []
  for(var i=0, ilen=mat.length; i<ilen; ++i) {
    var r = mat[i]
    for(var j=0, jlen=r.length; j<jlen; ++j) {
      if(Math.abs(r[j]) > EPSILON) {
        items.push([i,j,r[j]])
      }
    }
  }
  return fromList(items, mat.length, mat.length > 0 ? mat[0].length : 0)
}

CSRMatrix.fromList = fromList
CSRMatrix.fromDictionary = fromDictionary
CSRMatrix.fromNDArray = fromNDArray
CSRMatrix.fromDense = fromDense
module.exports = CSRMatrix

