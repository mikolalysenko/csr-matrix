var CSRMatrix = require("../csr.js")

require("tap").test("csr", function(t) {


  function checkGet(a) {
    var m = a.toDense()
    for(var i=0; i<m.length; ++i) {
      for(var j=0; j<m[i].length; ++j) {
        t.equals(a.get(i,j), m[i][j])
      }
    }
    t.equals(a.get(0,-1), 0)
    t.equals(a.get(-1, 0), 0)
    t.equals(a.get(-1, -1), 0)
    if(m.length > 0) {
      t.equals(a.get(m.length, 0), 0)
      t.equals(a.get(0, m[0].length), 0)
      t.equals(a.get(m.length, m[0].length), 0)
    }
  }

  function checkMatrix(a) {
    t.equals(a.rows.length, a.row_ptrs.length)
    t.equals(a.columns.length, a.column_ptrs.length)
    
    t.equals(a.row_ptrs[0], 0)
    for(var i=1; i<a.rows.length; ++i) {
      t.assert(a.rows[i-1] < a.rows[i])
      t.assert(a.row_ptrs[i-1] < a.row_ptrs[i])
    }
    t.equals(a.rowCount, a.rows[a.rows.length-1])
    
    t.equals(a.column_ptrs[0], 0)
    for(var i=1; i<a.columns.length; ++i) {
      t.assert(a.column_ptrs[i-1] < a.column_ptrs[i])
    }
    t.equals(a.columnCount, a.columns[a.columns.length-1])
    
    checkGet(a)
  }

  function checkEqual(a, b) {
    checkMatrix(a)
    checkMatrix(b)
    t.equals(a.rows.length, b.rows.length)
    t.equals(a.row_ptrs.length, b.row_ptrs.length)
    t.equals(a.columns.length, b.columns.length)
    t.equals(a.column_ptrs.length, b.column_ptrs.length)
    t.equals(a.data.length, b.data.length)
    for(var i=0; i<a.rows.length; ++i) {
      t.equals(a.rows[i], b.rows[i])
      t.equals(a.row_ptrs[i], b.row_ptrs[i])
    }
    for(var i=0; i<a.columns.length; ++i) {
      t.equals(a.columns[i], b.columns[i])
      t.equals(a.column_ptrs[i], b.column_ptrs[i])
    }
    for(var i=0; i<a.data.length; ++i) {
      t.equals(a.data[i], b.data[i])
    }
  }
  
  function checkConversions(a) {
    checkEqual(a, CSRMatrix.fromList(a.toList(), a.rowCount, a.columnCount))
    checkEqual(a, CSRMatrix.fromDictionary(a.toDictionary(), a.rowCount, a.columnCount))
    checkEqual(a, CSRMatrix.fromDense(a.toDense()))
    checkEqual(a, CSRMatrix.fromNDArray(a.toNDArray()))
  }
  
  function checkApply(m, v, expected) {
    var result = m.apply(v)
    t.equals(result.length, expected.length)
    for(var i=0; i<result.length; ++i) {
      t.equals(result[i], expected[i])
    }
  }

  var dok = {}
  dok[[0,1]] = 1
  dok[[2,0]] = 1
  dok[[5,3]] = 2.0
  
  var mat = CSRMatrix.fromDictionary(dok, 6, 4)
  checkConversions(mat)
  checkApply(mat, [1,2,3,4], [2, 0, 1, 0, 0, 8])
  checkEqual(mat.transpose(), CSRMatrix.fromList([[1,0,1],[0,2,1],[3,5,2]]))
  checkConversions(CSRMatrix.fromList([]))
  
  checkConversions(CSRMatrix.fromDense([[1,2,3,4,5,6,7,8]]))
  checkConversions(CSRMatrix.fromDense([[1],[2],[3],[4],[5],[6],[7],[8]]))
  checkConversions(CSRMatrix.fromDense([[1, 1, 0, 0, 2, 2, 0, 0, 3, 3]]))
  checkConversions(CSRMatrix.fromDense([[1,2,3],[4,5,6],[7,8,9]]))

  
  t.end()
})