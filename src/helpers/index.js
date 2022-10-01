/* eslint-disable no-extend-native */

// STRING METHODS

// capitalize()
// input no arguments
// output string with first character uppercased and other characters downcased
Object.defineProperty(String.prototype, "capitalize", {
  value: function () {
    return this.split("").map((l, i) => i === 0 ? l.toUpperCase() : l.toLowerCase()).join("")
  }
})

// uniq()
// input no arguments
// output an array with uniq characters ignoring capitalization
Object.defineProperty(String.prototype, "uniq", {
  value: function () {
    const chars = []
    this.toLowerCase().split("").forEach((el) => {
      if (!chars.some((char) => el.toLowerCase() === char.toLowerCase())) {
        chars.push(el.toLowerCase())
      }
    })
    return chars
  }
})

// occurence()
// input no arguments
// output an object with uniq characters as keys and number of occurences as keys (ignoring capitalization)
Object.defineProperty(String.prototype, "occurence", {
  value: function () {
    const obj = {}
    this.toLowerCase().uniq().forEach((char) => {
      obj[char] = this.toLowerCase().split("").select((el) => el === char).length
    })
    return obj
  }
})

// toUrl(queryParamsObject, queryStartSymbol = "?", queryValueAssignementSymbol = "=", querySeparatorSymbol = "&")
// input 1 object (with keys as params and values as values) as argument, optionnaly input 3 strings to change default URL builder symbols
// output a string 
Object.defineProperty(String.prototype, "toUrl", {
  value: function (paramsObj = {}, qStart = "?", qAssign = "=", qSplit = "&") {
    return this + paramsObj.toUrl("", qStart, qAssign, qSplit) 
  }
})

/* ________________________________________________________________________________________________ */

// NUMBER METHODS

// Random(minValue, maxValue) or Random(maxValue)
// input 1 or 2 integer; 1 integer will define the max value; 2 integer will define min and max
// output 1 random integer between the min and max value
export function Random(min, max = 0) {
  if (max === 0) {
    max = min
    min = 0
  }
  return Math.floor(Math.random() * (max - min)) + min
}


// even()
// input no arguments
// return true if number is even
Object.defineProperty(Number.prototype, "even", {
  value: function () {
    return this % 2 === 0
  }
})

// odd()
// input no arguments
// return true if number is odd
Object.defineProperty(Number.prototype, "odd", {
  value: function () {
    return this % 2 === 1
  }
})

// multipleOf(number)
// input 1 integer
// return true if number has no remainder when divided by number
Object.defineProperty(Number.prototype, "multipleOf", {
  value: function (num) {
    return this % num === 0
  }
})

/* ________________________________________________________________________________________________ */

// ARRAY METHODS

// select(arg = arrowFunction)
// input arrow function that returns a boolean as argument 
// output an array with the values that evaluate to true
Object.defineProperty(Array.prototype, "select", {
  value: function (arrowFunc = (el => el)) {
    return this.filter((el) => arrowFunc(el))
  }
})

// reject(arg = arrowFunction)
// input arrow function that returns a boolean as argument
// output an array without the values that evaluate to true
Object.defineProperty(Array.prototype, "reject", {
  value: function (arrowFunc = (el) => el) {
    return this.filter((el) => !arrowFunc(el))
  }
})

// uniq()
// input no arguments
// output an array of unique values
Object.defineProperty(Array.prototype, "uniq", {
  value: function () {
    const array = []
    this.forEach((el) => {
      if (array.every((uniqEl) => el !== uniqEl)) {
        array.push(el)
      }
    })
    return array   
  }
})

// occurence()
// input no arguments
// output an object with uniq values as keys and number of occurences has values
Object.defineProperty(Array.prototype, "occurence", {
  value: function () {
    const obj = {}
    this.uniq().forEach((value) => {
      obj[value] = this.select((el) => el === value).length
    })
    return obj
  }
})

// sample(qtyOfValues, allowRepeatValues = false)
// input 1 integer and 1 boolean value
// output a single value or an array of values of randomly selected values within array
Object.defineProperty(Array.prototype, "sample", {
  value: function (qty = 1, repeat = false) {
    const array = this.map(el => el)
    const values = []
    for (let n = 0; n < qty; n++) {
      const index = Random(array.length)
      values.push(array[index])
      if (!repeat) {
        array.splice(index, 1)
      }
    }
    return values.length === 1 ? values[0] : values
  }
})

/* ________________________________________________________________________________________________ */

// OBJECT METHODS

// map(arg = arrowFunction)
// input arrow function that uses key, value and index as arguments and returns any types of values
// output an array with all values returned from arrow function (return an array of [key, value] if no arguments are inputed)
Object.defineProperty(Object.prototype, "map", {
  value: function (arrowFunc = (key, value) => [key, value]) {
    return Object.entries(this).map(([key, value], index) => arrowFunc(key, value, index))
  }
})

// forEach(arg = arrowFunction)
// input arrow function that uses key, value, index as arguments and perform some actions
// output undefined
Object.defineProperty(Object.prototype, "forEach", {
  value: function (arrowFunc = () => null) {
    Object.entries(this).forEach(([key, value], index) => arrowFunc(key, value, index))
  }
})

// select(arg = arrowFunction)
// input arrow function that uses key, value and index as arguments and returns a boolean
// output an object with key: value pairs that evaluate to true 
Object.defineProperty(Object.prototype, "select", {
  value: function (arrowFunc = (key, value) => value) {
    const values = {}
    this.forEach((key, value, index) => {
      if (arrowFunc(key, value, index)) {
        values[key] = value
      }
    })
    return values
  }
})

// reject(arg = arrowFunction)
// input arrow function that uses key, value and index as arguments and returns a boolean
// output an object without the key: value pairs that evaluate to true
Object.defineProperty(Object.prototype, "reject", {
  value: function (arrowFunc = (_key, value) => value) {
    const values = {}
    this.forEach((key, value, index) => {
      if (!arrowFunc(key, value, index)) {
        values[key] = value
      }
    })
    return values
  }
})

// split()
// input no arguments
// output an array containing an array of keys and an array of values
Object.defineProperty(Object.prototype, "split", {
  value: function () {
    const keys = []
    const values = []
    this.forEach((key, value) => {
      keys.push(key)
      values.push(value)
    })
    return [keys, values]
  }
})


// toUrl(baseUrl, queryStartSymbol = "?", queryValueAssignementSymbol = "=", querySeparatorSymbol = "&")
// input 1 base URL (string) as argument, optionnaly input 3 strings to change default URL builder symbols
// output a string 
Object.defineProperty(Object.prototype, "toUrl", {
  value: function (baseUrl = "", qStart = "?", qAssign = "=", qSplit = "&") {
    return baseUrl + qStart + this.map((key, value) => [key, value].join(qAssign)).join(qSplit)
  }
})