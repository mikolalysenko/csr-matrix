var csr = require("../csr.js")

require("tap").test("csr", function(t) {

  var dok = {}
  dok[[0,1]] = 1
  dok[[2,0]] = 1
  dok[[5,3]] = 2.0
  
  var mat = csr.fromDictionary(dok)
  //console.log(mat)
  console.log(mat.apply([1,2,3,4]))

  t.end()
})