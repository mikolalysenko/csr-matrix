"use strict"

function CSRMatrix(rows, row_ptrs, columns, column_ptrs, data) {
  this.rows = rows
  this.row_ptrs = row_ptrs
  this.columns = columns
  this.column_ptrs = column_ptrs
  this.data = data
}

function applyImpl(rows, row_ptrs, columns, column_ptrs, data, vector, result) {
  var cptr = 0, dptr = 0, last_r = 0
  for(var i=0, rlen=rows.length+1; i<rlen; ++i) {
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
    result[last_r] = 0
  }
}

CSRMatrix.prototype.apply = function(vector, result) {
  if(!result) {
    result = new Float64Array(this.rows[this.rows.length-1]+1)
  }
  applyImpl(this.rows, this.row_ptrs, this.columns, this.column_ptrs, this.data, vector, result)
  return result
}

function compareKey(a, b) {
  var d = a[0] - b[0]
  if(d) { return d }
  return a[1] - b[1]
}

function removeDuplicates(items) {
  var i=0, ptr=0
  items.sort(compareKey)
  while(i < items.length) {
    var it = items[i++]
    while(i < items.length && compareKey(items[i], it) === 0) {
      it[2] += items[i++][2]
    }
    if(Math.abs(it[2]) > 1e-15) {
      items[ptr++] = it
    }
  }
  items.length = ptr
  return items
}

function fromList(items, nrows) {
  items = removeDuplicates(items)
  var rows = []
    , row_ptrs = []
    , cols = []
    , col_ptrs = []
    , data = new Float64Array(items.length)
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
    data[i] = item[2]
  }
  if(nrows && rows.lengt > 0 && rows[rows.length-1] < nrows) {
    row_ptrs.push(nrows)
    row_ptrs.push(cols.length)
  }
  row_ptrs.push(cols.length)
  col_ptrs.push(data.length)
  return new CSRMatrix(
    new Uint32Array(rows),
    new Uint32Array(row_ptrs),
    new Uint32Array(cols),
    new Uint32Array(col_ptrs),
    data)
}

function fromDictionary(dict, nrows) {
  var keys = Object.keys(dict)
    , items = new Array(keys.length)
    , i=0, v, k
  for(i=keys.length-1; i>=0; --i) {
    k = keys[i]
    v = k.split(',')
    items[i] = [parseInt(v[0]), parseInt(v[1]), dict[k]]
  }
  return fromList(items, nrows)
}

var getComponents = require("cwise")({
  args: ["array", "index"],
  pre: function() {
    this.items = []
    this.abs = Math.abs
  },
  body: function(a, i) {
    if(this.abs(a) > 1e-12) {
      this.items.push([i[0], i[1], a])
    }
  },
  post: function() {
    return this.items
  }
})

function fromNDArray(ndarr) {
  return fromList(getComponents(ndarr), ndarr.shape[0])
}

function fromDense(mat) {
  var items = []
  for(var i=0, ilen=mat.length; i<ilen; ++i) {
    var r = mat[i]
    for(var j=0, jlen=r.length; j<len; ++j) {
      if(Math.abs(r[j]) > 1e-12) {
        items.push([i,j,r[j]])
      }
    }
  }
  return fromList(items, mat.length)
}

CSRMatrix.fromList = fromList
CSRMatrix.fromDictionary = fromDictionary
CSRMatrix.fromNDArray = fromNDArray
CSRMatrix.fromDense = fromDense
module.exports = CSRMatrix

